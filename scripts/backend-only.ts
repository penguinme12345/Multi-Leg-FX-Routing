import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { createRouteErrorBody, handleRoutesRequest } from "../src/controllers/routesController";

const host = process.env.BACKEND_HOST ?? "127.0.0.1";
const port = Number(process.env.BACKEND_PORT ?? process.env.PORT ?? 4000);
const maxBodyBytes = 1_000_000;

const server = createServer(async (request, response) => {
  setCorsHeaders(response);

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? `${host}:${port}`}`);

  if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/api/routes")) {
    sendJson(response, 200, {
      service: "FX Route Optimizer backend",
      endpoints: {
        routes: "POST /api/routes"
      },
      example: {
        source: "GBP",
        target: "JPY",
        amount: 1000,
        maxLegs: 3,
        railFilter: "all",
        complexityFilter: "all",
        disabledProviders: []
      }
    });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/routes") {
    const body = await readJsonBody(request);

    if (!body.ok) {
      sendJson(response, 400, createRouteErrorBody(body.error, 400));
      return;
    }

    const result = await handleRoutesRequest(body.value);
    sendJson(response, result.status, result.body);
    return;
  }

  sendJson(response, 404, {
    error: "Not found. Use POST /api/routes."
  });
});

server.listen(port, host, () => {
  console.log(`FX Route Optimizer backend running at http://${host}:${port}`);
  console.log(`Routes endpoint: POST http://${host}:${port}/api/routes`);
});

function setCorsHeaders(response: ServerResponse) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "content-type");
}

function sendJson(response: ServerResponse, status: number, payload: unknown) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8"
  });
  response.end(JSON.stringify(payload, null, 2));
}

async function readJsonBody(
  request: IncomingMessage
): Promise<{ ok: true; value: unknown } | { ok: false; error: string }> {
  let rawBody = "";

  for await (const chunk of request) {
    rawBody += chunk;

    if (Buffer.byteLength(rawBody) > maxBodyBytes) {
      return {
        ok: false,
        error: "Request body is too large."
      };
    }
  }

  try {
    return {
      ok: true,
      value: rawBody ? JSON.parse(rawBody) : {}
    };
  } catch {
    return {
      ok: false,
      error: "Request body must be valid JSON."
    };
  }
}
