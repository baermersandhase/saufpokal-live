const { TableClient } = require("@azure/data-tables");

const connectionString = process.env.SAUFPOKAL_STORAGE_CONNECTION;

if (!connectionString) {
  throw new Error("SAUFPOKAL_STORAGE_CONNECTION ist nicht gesetzt.");
}

const TABLES = {
  groups: "groups",
  settings: "settings",
  bookings: "bookings"
};

function getTableClient(tableName) {
  return TableClient.fromConnectionString(connectionString, tableName);
}

async function ensureTable(tableName) {
  const client = getTableClient(tableName);
  try {
    await client.createTable();
  } catch (error) {
    if (error.statusCode !== 409) {
      throw error;
    }
  }
  return client;
}

async function ensureBaseTables() {
  await ensureTable(TABLES.groups);
  await ensureTable(TABLES.settings);
  await ensureTable(TABLES.bookings);
}

module.exports = {
  TABLES,
  getTableClient,
  ensureTable,
  ensureBaseTables
};
