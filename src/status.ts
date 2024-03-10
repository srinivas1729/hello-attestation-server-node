import express, { Request, Response } from 'express';

export const statusRouter = express.Router();

statusRouter.get('/status', (req: Request, resp: Response) => {
  resp.json({
    status: 'running',
  });
});
