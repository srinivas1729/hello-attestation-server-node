import { config as dotEnvConfig } from 'dotenv';
import express, { Request, Response } from 'express';

import { ensureConfigSuccess, getEnvValue } from './utils';

ensureConfigSuccess(dotEnvConfig());

const port = getEnvValue('PORT', 1729);
const app = express();

app.get('/', (_req: Request, resp: Response) => {
  resp.send('Hello, world!');
});

app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
