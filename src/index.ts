import express from 'express';

import { attestationRouter, testApiRouter } from './attestation';
import { ensureAndIncludeIds } from './request_ids';
import { setAppDao } from './dao';
import { InMemoryDao } from './in_memory_dao';
import { statusRouter } from './status';
import { highValueApiRouter } from './api';
import { getConfig, initConfig } from './config';

initConfig();
const config = getConfig();

const app = express();

console.log('Server starting...');
console.log('Using InMemory DAO');
setAppDao(new InMemoryDao());

app.use(express.json());
app.use(ensureAndIncludeIds);

app.use(statusRouter);
app.use(attestationRouter);
if (config.supportTestApis) {
  console.log('Supporting Test APIs');
  app.use(testApiRouter);
}

app.use(highValueApiRouter);

const server = app.listen(config.port, () => {
  console.log(`Server listening on ${config.port}`);
});

process.on('SIGTERM', () => {
  console.log('Handling terminate signal!');
  server.close(() => {
    console.log('Server stopped');
  });
});
