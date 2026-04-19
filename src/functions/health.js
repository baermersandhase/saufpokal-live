const { app } = require("@azure/functions");
const { ensureBaseTables } = require("../lib/storage");

app.http("health", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "health",
  handler: async (request, context) => {
    try {
      await ensureBaseTables();

      return {
        status: 200,
        jsonBody: {
          ok: true,
          message: "Saufpokal API läuft.",
          tablesReady: true,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      context.error(error);

      return {
        status: 500,
        jsonBody: {
          ok: false,
          message: "Healthcheck fehlgeschlagen.",
          error: error.message
        }
      };
    }
  }
});
