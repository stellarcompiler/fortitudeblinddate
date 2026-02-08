import express from "express";
import dotenv from "dotenv";
import logger from "./utils/logger.js";

import { matchUsers } from "./controllers/matchController.js"; 
import { getSupabase } from "./lib/supabaseClient.js";

const supabase = getSupabase();

dotenv.config();

const app = express();

app.use(express.json());

/* HEALTH CHECK */
app.get("/", (req, res) => {
  logger.info("Health check hit");
  res.send("Backend running 👍");
});

/* MANUAL MATCHMAKING ENDPOINT */
app.get("/run-matchmaking", matchUsers
    );

/* START SERVER */
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
});
