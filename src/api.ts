import express, { Request, Response } from 'express';
import { attestationChecker } from './attestation';

export const highValueApiRouter = express.Router();

// Middleware to check Client attestation/integrity on requests.
highValueApiRouter.use(attestationChecker);

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
