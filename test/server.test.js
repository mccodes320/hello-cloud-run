"use strict";

const assert = require("node:assert/strict");
const http = require("node:http");
const test = require("node:test");
const { createServer } = require("../server");

function request(server, path) {
  const { port } = server.address();
  return new Promise((resolve, reject) => {
    const client = http.get({ host: "127.0.0.1", port, path }, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => { body += chunk; });
      response.on("end", () => resolve({ response, body }));
    });
    client.on("error", reject);
  });
}

test("GET / responds with Hello World and security headers", async (context) => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  context.after(() => server.close());

  const { response, body } = await request(server, "/");
  assert.equal(response.statusCode, 200);
  assert.equal(body, "Hello, World!\n");
  assert.equal(response.headers["x-content-type-options"], "nosniff");
  assert.equal(response.headers["x-frame-options"], "DENY");
});

test("GET /healthz reports service health", async (context) => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  context.after(() => server.close());

  const { response, body } = await request(server, "/healthz");
  assert.equal(response.statusCode, 200);
  assert.equal(body, "ok\n");
});
