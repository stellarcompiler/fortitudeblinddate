import { getSupabase } from "../lib/supabaseClient.js";
import logger from "../utils/logger.js";
import findMatches from "../services/matchmaking/mapper.js";

const supabase = getSupabase()

const normalizeInterests = (interestsObj) => {
  if (!interestsObj || typeof interestsObj !== "object") return [];

  return Object.keys(interestsObj)
    .sort((a, b) => Number(a) - Number(b)) // ensure deterministic order
    .map(key => interestsObj[key]);
};

const prepareUser = (profile) => {
  return {
    id: profile.id,
    firstName: profile.firstName,
    lastName: profile.lastName,
    nickname: profile.nickname ?? null,

    age: profile.age,
    gender: profile.gender,
    gender_preference: profile.gender_preference ?? null,
    age_preference: profile.age_preference ?? "any",

    approved: Boolean(profile.approved),
    ismatched: Boolean(profile.ismatched),

    interests: normalizeInterests(profile.interests)
  };
};


export const matchUsers = async (req, res) => {
  try {
    logger.info("Matchmaking started");

    /* 1️⃣ Fetch profiles */
    const { data: profiles, error: profileError } = await supabase
      .from("test")
      .select("*");
    logger.info(profiles);
    if (profileError) {
      logger.error("Failed to fetch profiles", { error: profileError.message });
      return res.status(500).json({ error: "Profiles fetch failed" });
    }


    const users = profiles.map(prepareUser);

    console.log("Profile:", users);

    logger.info(`Prepared ${users.length} users for matching`);

    /* 5️⃣ Run Algorithm */
    const result = findMatches(users);

    logger.info("Matchmaking algorithm completed", {
       pairs: result.matchedPairs.length,
    });

    console.log("Algo Result:",result);

    //  /* 6️⃣ Insert Sessions */
    //  if (result.matchedPairs.length  > 0) {
    //  const sessions = result.matchedPairs.map(pair => ({
    //      user_a: pair.user1_id,
    //      user_b: pair.user2_id,
    //      status: "scheduled",
    //      created_at: new Date().toISOString()
    //    }));

    //   const { error: insertError } = await supabase
    //     .from("sessions")
    //      .insert(sessions);

    //    if (insertError) {
    //      logger.error("Failed to create sessions", { error: insertError.message });
    //     return res.status(500).json({ error: "Session insert failed" });
    //   }
    //  }

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
