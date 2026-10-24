"use strict";

const http = require("node:http");

const securityHeaders = {
  "Content-Security-Policy": "default-src 'none'",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY"
};

function createServer() {
  return http.createServer((request, response) => {
    for (const [name, value] of Object.entries(securityHeaders)) {
      response.setHeader(name, value);
    }
    response.setHeader("Content-Type", "text/plain; charset=utf-8");

    if (request.method === "GET" && request.url === "/healthz") {
      response.writeHead(200);
      response.end("ok\n");
      return;
    }

    if (request.method === "GET" && request.url === "/") {
      response.writeHead(200);
      response.end("Hello, World!\n");
      return;
    }

    response.writeHead(404);
    response.end("Not Found\n");
  });
}

function start() {
  const port = Number.parseInt(process.env.PORT || "8080", 10);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535.");
  }

  const server = createServer();
  server.listen(port, "0.0.0.0", () => {
    console.log(`Hello World service listening on port ${port}`);
  });

  const shutDown = (signal) => {
    console.log(`Received ${signal}; closing server.`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on("SIGTERM", () => shutDown("SIGTERM"));
  process.on("SIGINT", () => shutDown("SIGINT"));
}

if (require.main === module) {
  start();
}

module.exports = { createServer };
