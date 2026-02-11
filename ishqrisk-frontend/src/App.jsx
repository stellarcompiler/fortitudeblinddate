import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useEffect } from "react";

import Landing from "./pages/Landing";
import BasicInfo from "./pages/BasicInfo";
import Preferences from "./pages/Preferences";
import Questionnaire from "./pages/Questionaire";
import Waiting from "./pages/Waiting";
import Chat from "./pages/Chat";

/* ⭐ Pure path resolver */
const getOnboardingRoute = (profile) => {
  if (!profile) return "/basic"; // NEW USERS → basic

  switch (profile.onboarding_step) {
    case "basic":
      return "/basic";
    case "preferences":
      return "/preferences";
    case "qna":
      return "/qna";
    case "waiting":
      return "/waiting";
    case "matched":
      return "/chat";
    default:
      return "/basic";
  }
};

export default function App() {
  const { user, profile, authLoading, profileLoading } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  /* 🔁 Redirect logic */
  useEffect(() => {
    if (!user) return;

    const route = getOnboardingRoute(profile);

    if (location.pathname !== route) {
      navigate(route, { replace: true });
    }
  }, [user, profile?.onboarding_step]);

  /* 🌌 ONLY block while hydrating */
  if (authLoading || profileLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0c111f] text-[#ed9e6f]">
        ✦ Restoring connection...
      </div>
    );
  }

  /* 🚪 Not logged in */
  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Landing />} />
      </Routes>
    );
  }

  /* 🚀 Logged-in routes */
  return (
    <Routes>
      <Route path="/" element={<Navigate to={getOnboardingRoute(profile)} replace />} />
      <Route path="/basic" element={<BasicInfo />} />
      <Route path="/preferences" element={<Preferences />} />
      <Route path="/qna" element={<Questionnaire />} />
      <Route path="/waiting" element={<Waiting />} />

      <Route
        path="/chat"
        element={
          profile?.onboarding_step === "matched"
            ? <Chat />
            : <Navigate to={getOnboardingRoute(profile)} replace />
        }
      />

      <Route path="*" element={<Navigate to={getOnboardingRoute(profile)} replace />} />
    </Routes>
  );
}
