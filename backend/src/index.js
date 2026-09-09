import app from "./app.js";
import env from "./config/env.js";
import { connectDatabase } from "./config/database.js";

async function startServer() {
  try {
    await connectDatabase();

    app.listen(env.port, () => {
      console.log(
        JSON.stringify({
          level: "info",
          event: "server.started",
          port: env.port,
          environment: env.nodeEnv,
        })
      );
    });
  } catch (error) {
    console.error(
      JSON.stringify({
        level: "error",
        event: "server.startup_failed",
        message: error.message,
        stack: error.stack,
      })
    );

    process.exit(1);
  }
}

startServer();