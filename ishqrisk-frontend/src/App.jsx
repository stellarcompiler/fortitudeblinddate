import { useAuth } from "./context/AuthContext";
import Landing from "./pages/Landing";
import BasicInfo from "./pages/BasicInfo";
import Preferences from "./pages/Preferences";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

export default function App() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data);
    };

    fetchProfile();

    // ⭐ REALTIME AUTO PAGE SWITCH
    const channel = supabase
      .channel("users-change")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          setProfile(payload.new);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Landing />;
  if (!profile) return null;

  if (profile.onboarding_step === "basic") return <BasicInfo />;
  if (profile.onboarding_step === "preferences") return <Preferences />;

  return <div>Done</div>;
}
