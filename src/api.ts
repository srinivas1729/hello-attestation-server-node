import express, { Request, Response } from 'express';
import { attestationChecker } from './attestation';

// This file sets up a sample High value request that is guarded using
// attestationChecker middleware.

export const highValueApiRouter = express.Router();

// Sets up attestationChecker to check the integrity of client requests.
highValueApiRouter.use(attestationChecker);

// Sample high value request. It actually doesn't do anything other than
// check arguments and log the request. Ideally this would be doing something
// sensitive.
highValueApiRouter.post(
  '/highValueRequest',
  async (req: Request, resp: Response) => {
    const { action, levelId } = req.body;
    if (typeof action !== 'string' || typeof levelId !== 'number') {
      console.warn('action/levelId/challenge not provided!');
      resp
        .status(400)
        .json({ error: 'action/levelId/challenge not provided in body!' });
      return;
    }

    try {
      console.log(
        `Handling highValueRequest, action: ${action}, levelId: ${levelId}`,
      );
      resp.status(200).json({});
    } catch (error) {
      console.error('Unexpected error', error);
      resp.status(500);
    }
  },
);
