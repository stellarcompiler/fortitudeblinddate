import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { generateNickname } from "../utils/generateNickName";
import { useNavigate } from "react-router-dom";

const templates = [
  { id: "minimal", name: "Quiet Reveal", vibe: "Minimal · Elegant" },
  { id: "cinematic", name: "Soft Cinematic", vibe: "Romantic · Emotional" },
  { id: "expressive", name: "Expressive", vibe: "Creative · Bold" },
];

const GENDER_OPTIONS = ["male", "female", "non-binary", "prefer-not-to-say"];
const YEAR_OPTIONS = ["1st year", "2nd year", "3rd year", "4th year"];

export default function BasicInfo() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [autoNickname] = useState(() => generateNickname());
  const [selectedTemplate, setSelectedTemplate] = useState("minimal");

  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    age: "",
    nickname: "",
    gender: "",
    year: "", 
    phoneno: "",
  });

  /* Autofill from OAuth */
  useEffect(() => {
    if (!user?.user_metadata?.full_name) return;
    const parts = user.user_metadata.full_name.split(" ");
    setForm((prev) => ({
      ...prev,
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || "",
      nickname: autoNickname,
    }));
  }, [user, autoNickname]);

  /* Handle Image Change */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  /* Validation Logic */
  const validateForm = () => {
    if (!form.firstName.trim()) return "First name is required";
    if (!form.lastName.trim()) return "Last name is required";
    if (!form.age || Number(form.age) < 17) return "Age must be 17+";
    if (!form.gender) return "Please select a gender";
    if (!form.year) return "Please select your year";
    if (!/^\d{10,}$/.test(form.phoneno)) return "Enter a valid phone number";
    return null;
  };

  const isFormValid = validateForm() === null;

  /* Save Function */
  const handleContinue = async () => {
    if (!user || saving || !isFormValid) return;
    setError(null);
    setSaving(true);

    let profileUrl;

    try {
      if (imageFile) {
        const filePath = `${user.id}/${Date.now()}-${imageFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("user-profile")
          .upload(filePath, imageFile);

        if (uploadError) throw new Error("Image upload failed");

        const { data } = supabase.storage.from("user-profile").getPublicUrl(filePath);
        profileUrl = data?.publicUrl;
      }

      const { error: dbError } = await supabase.from("users").upsert({
        id: user.id,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        nickname: (form.nickname || autoNickname).trim(),
        age: Number(form.age),
        gender: form.gender,
        year: form.year,
        phoneno: form.phoneno.trim(),
        email: user.email,
        reveal_theme: selectedTemplate,
        onboarding_step: "preferences",
        ...(profileUrl ? { profile_url: profileUrl } : {}),
      });

      if (dbError) throw new Error("Failed to save profile");
      navigate("/preferences");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen px-6 py-24 bg-black text-white">
      <div className="mx-auto max-w-4xl">
        
        {/* PROFILE IMAGE UPLOAD */}
        <div className="flex flex-col items-center mb-12">
          <label className="relative cursor-pointer group">
            <div className="w-32 h-32 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden group-hover:border-[#D8A7B1] transition-colors">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-white/40">Add Photo</span>
              )}
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
          </label>
          <p className="mt-4 text-[10px] uppercase tracking-widest text-white/40">Profile Picture (Optional)</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* INPUT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <Input label="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          <Input label="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          <Input label="Age" type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
          
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold ml-1">Gender</label>
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[#D8A7B1]">
              <option value="" className="bg-zinc-900">Select Gender</option>
              {GENDER_OPTIONS.map(g => <option key={g} value={g} className="bg-zinc-900">{g}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold ml-1">Academic Year</label>
            <select value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[#D8A7B1]">
              <option value="" className="bg-zinc-900">Select Year</option>
              {YEAR_OPTIONS.map(y => <option key={y} value={y} className="bg-zinc-900">{y}</option>)}
            </select>
          </div>

          <Input label="Phone Number" value={form.phoneno} onChange={(e) => setForm({ ...form, phoneno: e.target.value })} />
        </div>

        {/* REVEAL TEMPLATES */}
        <div className="mb-16">
          <label className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold ml-1 block mb-4">Choose Reveal Vibe</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplate(t.id)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  selectedTemplate === t.id ? "border-[#D8A7B1] bg-[#D8A7B1]/10" : "border-white/10 bg-white/5 hover:border-white/30"
                }`}
              >
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-[10px] text-white/40">{t.vibe}</p>
              </button>
            ))}
          </div>
        </div>

        {/* CONTINUE BUTTON */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={saving || !isFormValid}
            className={`rounded-full px-12 py-4 font-semibold text-white transition-all
              ${(saving || !isFormValid) ? "bg-gray-500/50 cursor-not-allowed" : "bg-[#D8A7B1] hover:scale-105"}`}
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
      <input {...props} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[#D8A7B1]" />
    </div>
  );
}