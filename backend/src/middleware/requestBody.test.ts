import assert from 'node:assert/strict';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import express from 'express';
import {
  REQUEST_BODY_LIMIT_BYTES,
  REQUEST_BODY_MALFORMED_JSON_ERROR,
  REQUEST_BODY_TOO_LARGE_ERROR,
} from '../constants/requestBody';
import { jsonBodyErrorHandler, jsonBodyParser } from './requestBody';

interface JsonResponse {
  statusCode: number;
  body: unknown;
}

interface TestServer {
  server: http.Server;
  port: number;
}

const main = async () => {
  const app = express();

  app.use(jsonBodyParser);
  app.use(jsonBodyErrorHandler);
  app.post('/echo', (req, res) => {
    res.json({ received: req.body });
  });
  app.use((_error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(500).json({ error: 'Unexpected request body parser error' });
  });

  const { server, port } = await listen(app);
  const postJson = createPostJson(port);

  try {
    const malformed = await postJson('{"broken":');
    assert.equal(malformed.statusCode, 400);
    assert.deepEqual(malformed.body, { error: REQUEST_BODY_MALFORMED_JSON_ERROR });

    const tooLarge = await postJson(JSON.stringify({ content: 'x'.repeat(REQUEST_BODY_LIMIT_BYTES + 1) }));
    assert.equal(tooLarge.statusCode, 413);
    assert.deepEqual(tooLarge.body, { error: REQUEST_BODY_TOO_LARGE_ERROR });

    const valid = await postJson(JSON.stringify({ ok: true }));
    assert.equal(valid.statusCode, 200);
    assert.deepEqual(valid.body, { received: { ok: true } });
  } finally {
    await close(server);
  }

  console.log('Request body middleware tests passed');
};

const listen = (app: express.Express) =>
  new Promise<TestServer>((resolve, reject) => {
    const server = app.listen(0, () => {
      const address = server.address() as AddressInfo;
      resolve({ server, port: address.port });
    });

    server.on('error', reject);
  });

const close = (server: http.Server) =>
  new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

const createPostJson = (port: number) =>
  (body: string) =>
    new Promise<JsonResponse>((resolve, reject) => {
      const request = http.request(
        {
          hostname: '127.0.0.1',
          port,
          path: '/echo',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
          },
        },
        (response) => {
          let responseBody = '';
          response.setEncoding('utf8');
          response.on('data', (chunk) => {
            responseBody += chunk;
          });
          response.on('end', () => {
            resolve({
              statusCode: response.statusCode ?? 0,
              body: responseBody.length > 0 ? JSON.parse(responseBody) : null,
            });
          });
        },
      );

      request.on('error', reject);
      request.end(body);
    });

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
