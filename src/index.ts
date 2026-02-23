import app from "./app";
import { PORT } from "./configs";
import { connectDatabase } from "./database/mongodb";

// Start server
async function startServer() {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
