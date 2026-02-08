import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import logger from "../utils/logger.js";

dotenv.config();

let supabase = null; // singleton instance

export const getSupabase = () => {

  if (supabase) {
    return supabase; // return existing instance
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    logger.error("Missing Supabase environment variables");
    process.exit(1);
  }

  logger.info("Creating Supabase singleton client");

  supabase = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabase;
};
