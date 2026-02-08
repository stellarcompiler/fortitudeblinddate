import { getSupabase } from "../lib/supabaseClient.js";
import logger from "../utils/logger.js";
import findMatches from "../services/matchmaking/matcher.js";

const supabase = getSupabase()
export const matchUsers = async (req, res) => {
  try {
    logger.info("Matchmaking started");

    /* 1️⃣ Fetch profiles */
    const { data: profiles, error: profileError } = await supabase
      .from("test")
      .select("*");
    logger.info(profiles)
    if (profileError) {
      logger.error("Failed to fetch profiles", { error: profileError.message });
      return res.status(500).json({ error: "Profiles fetch failed" });
    }

    /* 2️⃣ Fetch preferences */
    const { data: prefs, error: prefError } = await supabase
      .from("user_preferences")
      .select("*");

    if (prefError) {
      logger.error("Failed to fetch preferences", { error: prefError.message });
      return res.status(500).json({ error: "Preferences fetch failed" });
    }

    /* 3️⃣ Fetch answers */
    const { data: answers, error: answerError } = await supabase
      .from("user_answers")
      .select("*");

    if (answerError) {
      logger.error("Failed to fetch answers", { error: answerError.message });
      return res.status(500).json({ error: "Answers fetch failed" });
    }

    /* 4️⃣ Build users[] for algorithm */
    const users = profiles.map(profile => {

      const pref = prefs.find(p => p.user_id === profile.id);

      const interests = answers
        .filter(a => a.user_id === profile.id)
        .map(a => a.answer_value);

      return {
        id: profile.id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        age: profile.age,
        gender: profile.gender,

        gender_preference: pref?.preferred_gender || null,
        age_preference: "any",

        interests,
        approved: true,
        ismatched: false
      };
    });

    logger.info(`Prepared ${users.length} users for matching`);

    /* 5️⃣ Run Algorithm */
    const result = findMatches(users);

    logger.info("Matchmaking algorithm completed", {
      pairs: result.matchedPairs.length,
    });

    /* 6️⃣ Insert Sessions */
    if (result.matchedPairs.length > 0) {
      const sessions = result.matchedPairs.map(pair => ({
        user_a: pair.user1_id,
        user_b: pair.user2_id,
        status: "scheduled",
        created_at: new Date().toISOString()
      }));

      const { error: insertError } = await supabase
        .from("sessions")
        .insert(sessions);

      if (insertError) {
        logger.error("Failed to create sessions", { error: insertError.message });
        return res.status(500).json({ error: "Session insert failed" });
      }
    }

    logger.info("Matchmaking finished successfully");

    res.json({
      success: true,
      matchedPairs: result.matchedPairs.length
    });

  } catch (err) {
    logger.error("Matchmaking crashed", { error: err.message });
    res.status(500).json({ error: "Internal server error" });
  }
};
