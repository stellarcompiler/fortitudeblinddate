import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { generateNickname } from "../utils/generateNickName";
import { useNavigate } from 'react-router-dom';
import { Camera, Check } from "lucide-react";

const templates = [
  { id: "minimal", name: "Quiet Reveal", vibe: "Minimal · Elegant" },
  { id: "cinematic", name: "Soft Cinematic", vibe: "Romantic · Emotional" },
  { id: "expressive", name: "Expressive", vibe: "Creative · Bold" },
];

const GENDER_OPTIONS = ["Man", "Woman", "Non-binary"];
const YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Postgrad"]; // ⭐ Added Year Options

export default function BasicInfo() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [autoNickname] = useState(() => generateNickname());

  const [selectedTemplate, setSelectedTemplate] = useState("minimal");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    age: "",
    nickname: "",
    gender: "",
    year: "", // ⭐ Added to state
    phoneno: "",
  });

  // ⭐ Validation updated to include "year"
  const isFormValid = 
    form.firstName.trim() !== "" &&
    form.lastName.trim() !== "" &&
    form.age !== "" &&
    form.gender !== "" &&
    form.year !== "" && 
    form.phoneno.trim() !== "";

  useEffect(() => {
    if (!user?.user_metadata?.full_name) return;
    const parts = user.user_metadata.full_name.split(" ");
    setForm((prev) => ({
      ...prev,
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || "",
      nickname: autoNickname || "",
    }));
  }, [user, autoNickname]);

  const handleContinue = async () => {
    if (!user || saving || !isFormValid) return;

    setSaving(true);
    let profileUrl = null;

    try {
      if (imageFile) {
        const filePath = `${user.id}/${Date.now()}-${imageFile.name}`;
        await supabase.storage.from("user-profile").upload(filePath, imageFile);
        const { data } = supabase.storage.from("user-profile").getPublicUrl(filePath);
        profileUrl = data.publicUrl;
      }

      const { error } = await supabase
        .from("users")
        .upsert({
          id: user.id,
          firstName: form.firstName,
          lastName: form.lastName,
          nickname: form.nickname,
          age: Number(form.age),
          gender: form.gender,
          year: form.year, // ⭐ Saving the year
          phoneno: form.phoneno,
          email: user.email,
          reveal_theme: selectedTemplate,
          profile_url: profileUrl || null,
          onboarding_step: "preferences",
        });

      if (error) throw error;
      navigate('/preferences');
    } catch (err) {
      console.error("Save failed:", err);
      alert("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen text-white px-6 py-24 bg-[#0b0b0c]">
      <div className="mx-auto max-w-4xl">
        
        {/* TITLE */}
        <div className="mb-16 text-center animate-slide-up">
          <h1 className="text-4xl font-bold mb-3">Set up your presence</h1>
          <p className="text-white/40 italic">"Everything else is hidden; your words come first."</p>
        </div>

        {/* PHOTO */}
        <div className="mb-20 flex flex-col items-center animate-slide-up delay-1">
          <label className="group relative flex h-48 w-48 cursor-pointer items-center justify-center rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl transition hover:bg-white/10 overflow-hidden">
            {imagePreview ? (
              <img src={imagePreview} className="h-full w-full object-cover" />
            ) : (
              <div className="text-center text-white/30 group-hover:text-[#D8A7B1] transition-colors">
                <Camera className="mx-auto mb-2" size={32} />
                <span className="text-xs uppercase tracking-widest font-bold">Add Photo</span>
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
              }
            }} />
          </label>
        </div>

        {/* INPUTS GRID */}
        <div className="mb-16 grid grid-cols-1 md:grid-cols-2 gap-8 animate-slide-up delay-2">
          <Input label="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          <Input label="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          <Input label="Age" type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
          <Input label="Phone Number" value={form.phoneno} onChange={(e) => setForm({ ...form, phoneno: e.target.value })} />

          {/* GENDER */}
          <div className="flex flex-col gap-3">
            <label className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold ml-1">Gender</label>
            <div className="flex gap-2">
              {GENDER_OPTIONS.map((opt) => (
                <button key={opt} onClick={() => setForm({ ...form, gender: opt })}
                  className={`flex-1 rounded-xl py-3 text-sm transition-all border ${
                    form.gender === opt ? "bg-[#D8A7B1] text-black border-[#D8A7B1] font-bold" : "bg-white/5 border-white/10 text-white/50"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* ⭐ YEAR SELECTOR */}
          <div className="flex flex-col gap-3">
            <label className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold ml-1">Year / Class</label>
            <div className="flex flex-wrap gap-2">
              {YEAR_OPTIONS.map((opt) => (
                <button key={opt} onClick={() => setForm({ ...form, year: opt })}
                  className={`px-4 py-2.5 rounded-xl text-[11px] transition-all border ${
                    form.year === opt ? "bg-[#D8A7B1] text-black border-[#D8A7B1] font-bold" : "bg-white/5 border-white/10 text-white/40"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CONTINUE BUTTON */}
        <div className="text-center mt-12 animate-slide-up delay-3">
          <button
            onClick={handleContinue}
            disabled={saving || !isFormValid}
            className={`group relative rounded-full px-16 py-5 font-bold transition-all duration-500
              ${!isFormValid || saving 
                ? "bg-white/5 text-white/20 border border-white/10 cursor-not-allowed opacity-50" 
                : "bg-[#D8A7B1] text-black hover:scale-105 hover:shadow-[0_0_40px_rgba(216,167,177,0.4)]"}
            `}
          >
            {saving ? "Saving..." : "Continue →"}
          </button>
          {!isFormValid && !saving && (
             <p className="mt-4 text-[10px] uppercase tracking-widest text-[#D8A7B1] opacity-50">All fields required to proceed</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="flex flex-col gap-2 group">
      <label className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold ml-1 group-focus-within:text-[#D8A7B1] transition-colors">{label}</label>
      <input
        {...props}
        className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none backdrop-blur-md transition focus:border-[#D8A7B1]/50 focus:bg-white/10"
      />
    </div>
  );
}