import {
  AppInfo,
  verifyAssertion,
  verifyAttestation,
} from 'appattest-checker-node';
import express, { NextFunction, Request, Response } from 'express';
import stringify from 'json-stable-stringify';
import { randomUUID } from 'crypto';

import { RequestWithIds } from './request_ids';
import { getAppDao } from './dao';
import { getSHA256, parseUUIDV4 } from './utils';

export const attestationRouter = express.Router();

attestationRouter.post(
  '/newAttestationNonce',
  async (req: Request, resp: Response) => {
    const reqWithIds = req as RequestWithIds;

    const { forRequestId } = req.body;
    if (typeof forRequestId !== 'string') {
      console.warn('forRequestId not provided!');
      resp
        .status(400)
        .json({ error: 'forRequestId not provided in body json' });
      return;
    }

    try {
      const nonce = randomUUID();
      await getAppDao().putAttestationNonce(
        reqWithIds.clientId,
        forRequestId,
        nonce,
      );
      console.log(
        `Generated and returning nonce for ${reqWithIds.clientId}/${forRequestId}`,
      );
      resp.json({
        nonce: nonce,
      });
    } catch (error) {
      console.error('Unexpected error', error);
      resp.status(500);
    }
  },
);

attestationRouter.post(
  '/registerAppAttestKey',
  async (req: Request, resp: Response) => {
    const reqWithIds = req as RequestWithIds;
    // TODO: move to env var
    const appInfo: AppInfo = {
      appId: '979F6L8R8M.org.reactjs.native.example.RNHelloAttestationClient',
      developmentEnv: true,
    };

    const { keyId, attestationBase64 } = req.body;
    if (typeof keyId !== 'string' || typeof attestationBase64 !== 'string') {
      console.warn('keyId or attestationBase64 not provided!');
      resp
        .status(400)
        .json({ error: 'Missing keyId or attestationBase64 in body' });
      return;
    }

    try {
      const nonce = await getAppDao().getAttestationNonce(
        reqWithIds.clientId,
        reqWithIds.requestId,
      );
      if (!nonce) {
        console.warn('No nonce found for clientId/reqiuestId');
        resp.status(400).json({ error: 'Nonce not found for request' });
        return;
      }

      const result = await verifyAttestation(
        appInfo,
        keyId,
        parseUUIDV4(nonce),
        Buffer.from(attestationBase64, 'base64'),
      );
      if ('verifyError' in result) {
        console.warn(
          `verifyAttestation returned error: ${JSON.stringify(result)}`,
        );
        resp.status(400).json({ error: 'Unable to verify attestation' });
        return;
      }
      await getAppDao().putAppAttestKey(
        reqWithIds.clientId,
        result.publicKeyPem,
        result.receipt,
        0,
      );
      console.log(`Saved appAttestKey for ${reqWithIds.clientId}`);
      resp.status(200).json({});
    } catch (error) {
      console.error('Unexpected error', error);
      resp.status(500);
    }
  },
);

export async function attestationChecker(
  req: Request,
  resp: Response,
  next: NextFunction,
) {
  console.log(`Checking request: ${req.query}`);

  const clientAttestationBase64 = req.header('x-client-attestation');
  if (!clientAttestationBase64) {
    resp.status(400).json({
      error: 'Missing client-attestation',
    });
    return;
  }

  const reqWithIds = req as RequestWithIds;
  const nonceCheckPass = await performNonceChecks(reqWithIds, resp);
  if (!nonceCheckPass) {
    return;
  }

  const appAttestKey = await getAppDao().getAppAttestKey(reqWithIds.clientId);
  if (!appAttestKey) {
    resp.status(400).json({
      error: 'Unknown clientId (no appAttestKey found) !',
    });
    return;
  }

  const clientDataHash = await getSHA256(Buffer.from(stringify(req.body)));
  const verifyResult = await verifyAssertion(
    clientDataHash,
    appAttestKey.publicKeyPem,
    '979F6L8R8M.org.reactjs.native.example.RNHelloAttestationClient', // TODO: move to env var
    Buffer.from(clientAttestationBase64, 'base64'),
  );
  if ('verifyError' in verifyResult) {
    resp.status(400).json({
      error: `Could not verify request (${verifyResult.verifyError}) !`,
    });
    return;
  }
  if (verifyResult.signCount <= appAttestKey.attestCount) {
    resp.status(400).json({
      error: `Could not verify request (signCount issues) !`,
    });
    return;
  }
  appAttestKey.attestCount = verifyResult.signCount;
  await getAppDao().putAppAttestKey(
    reqWithIds.clientId,
    appAttestKey.publicKeyPem,
    appAttestKey.receipt,
    appAttestKey.attestCount,
  );
  console.log('Successfully verified client-attestation');

  next();
}

async function performNonceChecks(
  reqWithIds: RequestWithIds,
  resp: Response,
): Promise<boolean> {
  const nonce = await getAppDao().getAttestationNonce(
    reqWithIds.clientId,
    reqWithIds.requestId,
  );
  if (!nonce) {
    console.warn('No nonce found for clientId/reqiuestId');
    resp.status(400).json({ error: 'Nonce not found for request' });
    return false;
  }

  const { attestationNonce: clientNonce } = reqWithIds.body;
  if (typeof clientNonce !== 'string') {
    console.warn('No challenge provided in request body!');
    resp.status(400).json({ error: 'Challenge not included in request body' });
    return false;
  }
  if (clientNonce !== nonce) {
    console.warn('Client provided nonce does not match!');
    resp.status(400).json({ error: 'Client provided nonce does not match!' });
    return false;
  }
  return true;
}

export const testApiRouter = express.Router();

testApiRouter.post(
  '/testPutAttestationNonce',
  async (req: Request, resp: Response) => {
    const reqWithIds = req as RequestWithIds;

    const { forRequestId, nonce } = req.body;
    if (typeof forRequestId !== 'string' || typeof nonce !== 'string') {
      console.warn('forRequestId/nonce not provided!');
      resp
        .status(400)
        .json({ error: 'forRequestId not provided in body json' });
      return;
    }

    try {
      await getAppDao().putAttestationNonce(
        reqWithIds.clientId,
        forRequestId,
        nonce,
      );

      console.log(
        `Saved test nonce for ${reqWithIds.clientId}/${forRequestId}`,
      );
      resp.json({
        nonce: nonce,
      });
    } catch (error) {
      console.error('Unexpected error', error);
      resp.status(500);
    }
  },
);
