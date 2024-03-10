import { AppInfo, verifyAttestation } from 'appattest-checker-node';
import express, { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

import { RequestWithIds } from './request_ids';
import { getAppDao } from './dao';
import { parseUUIDV4 } from './utils';

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
    const appInfo: AppInfo = {
      appId: '979F6L8R8M.org.reactjs.native.example.RNClientAttest',
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
      resp.status(200);
    } catch (error) {
      console.error('Unexpected error', error);
      resp.status(500);
    }
  },
);

export function attestationChecker(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // TODO: actual impl
  res.send(`req size: ${req.body.size}`);
  next();
}
