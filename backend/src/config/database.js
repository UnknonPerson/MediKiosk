import mongoose from "mongoose";

import env from "./env.js";

mongoose.set("strictQuery", true);

mongoose.connection.on("error", (error) => {
  console.error(
    JSON.stringify({
      level: "error",
      event: "database.connection_error",
      errorName: error.name,
      message: error.message,
    })
  );
});

mongoose.connection.on("disconnected", () => {
  console.warn(
    JSON.stringify({
      level: "warn",
      event: "database.disconnected",
    })
  );
});

export async function connectDatabase() {
  const connection = await mongoose.connect(env.mongoUri);

  console.log(
    JSON.stringify({
      level: "info",
      event: "database.connected",
      host: connection.connection.host,
      database: connection.connection.name,
    })
  );
}