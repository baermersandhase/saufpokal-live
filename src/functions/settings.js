const { app } = require("@azure/functions");
const { ensureTable, TABLES } = require("../lib/storage");

const PARTITION_KEY = "EVENT";
const ROW_KEY = "CURRENT";

app.http("settings", {
  methods: ["GET", "PUT"],
  authLevel: "anonymous",
  route: "settings",
  handler: async (request, context) => {
    const client = await ensureTable(TABLES.settings);

    if (request.method === "GET") {
      try {
        const entity = await client.getEntity(PARTITION_KEY, ROW_KEY);

        return {
          status: 200,
          jsonBody: {
            eventName: entity.eventName || "BIB Dance Night – Saufpokal",
            eventDate: entity.eventDate || "2026-11-21",
            endTime: entity.endTime || "23:30",
            status: entity.status || "open",
            note: entity.note || "",
            points: {
              fullCard: Number(entity.fullCard || 20),
              halfCard: Number(entity.halfCard || 10),
              perMark: Number(entity.perMark || 1),
              perPitter: Number(entity.perPitter || 20)
            }
          }
        };
      } catch (error) {
        if (error.statusCode === 404) {
          return {
            status: 200,
            jsonBody: {
              eventName: "BIB Dance Night – Saufpokal",
              eventDate: "2026-11-21",
              endTime: "23:30",
              status: "open",
              note: "",
              points: {
                fullCard: 20,
                halfCard: 10,
                perMark: 1,
                perPitter: 20
              }
            }
          };
        }

        throw error;
      }
    }

    if (request.method === "PUT") {
      let body;
      try {
        body = await request.json();
      } catch {
        return {
          status: 400,
          jsonBody: { message: "Ungültiger JSON-Body." }
        };
      }

      const entity = {
        partitionKey: PARTITION_KEY,
        rowKey: ROW_KEY,
        eventName: String(body?.eventName || "BIB Dance Night – Saufpokal"),
        eventDate: String(body?.eventDate || "2026-11-21"),
        endTime: String(body?.endTime || "23:30"),
        status: String(body?.status || "open"),
        note: String(body?.note || ""),
        fullCard: Number(body?.points?.fullCard ?? 20),
        halfCard: Number(body?.points?.halfCard ?? 10),
        perMark: Number(body?.points?.perMark ?? 1),
        perPitter: Number(body?.points?.perPitter ?? 20)
      };

      await client.upsertEntity(entity, "Replace");

      return {
        status: 200,
        jsonBody: {
          message: "Settings gespeichert."
        }
      };
    }

    return {
      status: 405,
      jsonBody: { message: "Methode nicht erlaubt." }
    };
  }
});
