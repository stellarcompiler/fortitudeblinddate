import { getSupabase } from "../../lib/supabaseClient.js";
const supabase = getSupabase()
import findMatches from "./mapper.js";

export default async function handler(req, res) {

  // 1️⃣ Get users from matchmaking pool
  const { data: pool } = await supabase
    .from("matchmaking_pool")
    .select("user_id");

  if (!pool || pool.length === 0) {
    return new Response("No users in pool");
  }

  const userIds = pool.map(p => p.user_id);

  // 2️⃣ Fetch profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .in("id", userIds);

  // 3️⃣ Fetch preferences
  const { data: prefs } = await supabase
    .from("user_preferences")
    .select("*")
    .in("user_id", userIds);

  // 4️⃣ Fetch answers
  const { data: answers } = await supabase
    .from("user_answers")
    .select("*")
    .in("user_id", userIds);

  // 5️⃣ Build users array for matcher.js
  const users = profiles.map(profile => {

    const pref = prefs.find(p => p.user_id === profile.id);

    const interests = answers
      .filter(a => a.user_id === profile.id)
      .sort((a,b)=> a.question_id.localeCompare(b.question_id))
      .map(a => a.answer_value);

    return {
      id: profile.id,
      interests,
      gender: profile.gender,
      age: profile.age,
      gender_preference: pref?.preferred_gender,
      age_preference: "any",
      approved: true,
      ismatched: false,
      firstName: profile.first_name,
      lastName: profile.last_name
    };
  });

  // 🔥 RUN YOUR MATCHMAKING ALGORITHM
  const result = findMatches(users);

  console.log("Matched pairs:", result.matchedPairs);

  // 6️⃣ Create sessions
  for (const pair of result.matchedPairs) {

    await supabase.from("sessions").insert({
      user_a: pair.user1_id,
      user_b: pair.user2_id,
      status: "active",
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 24*60*60*1000).toISOString()
    });

    await supabase
      .from("matchmaking_pool")
      .delete()
      .in("user_id", [pair.user1_id, pair.user2_id]);
  }

  return new Response("Matchmaking completed");
}
