import { config as dotEnvConfig } from 'dotenv';
import express from 'express';

import { ensureConfigSuccess, getEnvValue } from './utils';
import { attestationRouter, testApiRouter } from './attestation';
import { ensureAndIncludeIds } from './request_ids';
import { setAppDao } from './dao';
import { InMemoryDao } from './in_memory_dao';
import { statusRouter } from './status';
import { highValueApiRouter } from './api';

ensureConfigSuccess(dotEnvConfig());

const port = getEnvValue('PORT', 1729);
const app = express();

console.log('Server starting...');
console.log('Using InMemory DAO');
setAppDao(new InMemoryDao());

app.use(express.json());
app.use(ensureAndIncludeIds);

app.use(statusRouter);
app.use(attestationRouter);
app.use(highValueApiRouter);
// TODO: This should only be registered in test env.
app.use(testApiRouter);

const server = app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});

process.on('SIGTERM', () => {
  console.log('Handling terminate signal!');
  server.close(() => {
    console.log('Server stopped');
  });
});
