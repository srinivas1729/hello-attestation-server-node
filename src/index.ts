import express, { Request, Response } from 'express';

const PORT = 1729;
const app = express();

app.get('/', (_req: Request, resp: Response) => {
  resp.send('Hello, world!');
});

app.listen(PORT, () => {
  console.log(`server listening on ${PORT}`);
});
