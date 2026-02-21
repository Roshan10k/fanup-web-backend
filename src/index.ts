import app from "./app";
import { PORT } from "./configs";
import { connectDatabase } from "./database/mongodb";
import { liveContestStreamService } from "./services/live-contest-stream.service";

// Start server
async function startServer() {
  await connectDatabase();
  liveContestStreamService.start();
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
