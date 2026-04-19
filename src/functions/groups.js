const { app } = require("@azure/functions");
const { ensureTable, TABLES } = require("../lib/storage");

const PARTITION_KEY = "EVENT";

app.http("groups", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  route: "groups",
  handler: async (request, context) => {
    const client = await ensureTable(TABLES.groups);

    if (request.method === "GET") {
      const groups = [];

      for await (const entity of client.listEntities()) {
        groups.push({
          id: entity.rowKey,
          name: entity.name,
          active: entity.active === true || entity.active === "true"
        });
      }

      groups.sort((a, b) => a.name.localeCompare(b.name, "de"));

      return {
        status: 200,
        jsonBody: {
          items: groups
        }
      };
    }

    if (request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return {
          status: 400,
          jsonBody: { message: "Ungültiger JSON-Body." }
        };
      }

      const name = String(body?.name || "").trim();
      const active = body?.active !== false;

      if (!name) {
        return {
          status: 400,
          jsonBody: { message: "Name fehlt." }
        };
      }

      const rowKey = crypto.randomUUID();

      const entity = {
        partitionKey: PARTITION_KEY,
        rowKey,
        name,
        active
      };

      await client.createEntity(entity);

      return {
        status: 201,
        jsonBody: {
          id: rowKey,
          name,
          active
        }
      };
    }

    return {
      status: 405,
      jsonBody: { message: "Methode nicht erlaubt." }
    };
  }
});
