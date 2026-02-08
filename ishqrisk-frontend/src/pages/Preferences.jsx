import { useState } from "react";

export default function Preferences() {
  const [matchType, setMatchType] = useState("");
  const [ageRange, setAgeRange] = useState([18, 22]);
  const [preferredGender, setPreferredGender] = useState([]);
  const [preferredYear, setPreferredYear] = useState([]);

  const toggle = (value, setFn, state) => {
    setFn(
      state.includes(value)
        ? state.filter((v) => v !== value)
        : [...state, value]
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-6 py-24 text-foreground">

      {/* BASE GRADIENT */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-basic-gradient" />

      {/* ROSE AMBIENT */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[15%] left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#f3b6c0]/10 blur-[220px]" />
        <div className="absolute bottom-[20%] right-[10%] h-[380px] w-[380px] rounded-full bg-[#d8a0aa]/8 blur-[200px]" />
      </div>

      <div className="relative mx-auto max-w-3xl">

        {/* TITLE */}
        <div className="mb-16 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold mb-3">
            Your preferences
          </h1>
          <p className="text-muted-foreground">
            This helps us match you better — nothing is shown to others.
          </p>
        </div>

        {/* MATCH TYPE */}
        <section className="mb-20">
          <h2 className="mb-6 text-lg font-medium">What are you here for?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["Friendship", "Dating", "Open to either"].map((item) => (
              <button
                key={item}
                onClick={() => setMatchType(item)}
                className={`rounded-2xl border px-6 py-5 text-left transition-all
                  ${
                    matchType === item
                      ? "border-primary bg-primary/15 shadow-lg shadow-primary/25"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }
                `}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* AGE RANGE */}
        <section className="mb-20">
          <h2 className="mb-4 text-lg font-medium">
            Preferred age range
          </h2>

          <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
            <div className="flex justify-between text-sm mb-4">
              <span>{ageRange[0]}</span>
              <span>{ageRange[1]}</span>
            </div>

            <input
              type="range"
              min="18"
              max="30"
              value={ageRange[0]}
              onChange={(e) =>
                setAgeRange([+e.target.value, ageRange[1]])
              }
              className="w-full accent-[#f3b6c0]"
            />
            <input
              type="range"
              min="18"
              max="30"
              value={ageRange[1]}
              onChange={(e) =>
                setAgeRange([ageRange[0], +e.target.value])
              }
              className="w-full mt-2 accent-[#f3b6c0]"
            />
          </div>
        </section>

        {/* GENDER */}
        <section className="mb-20">
          <h2 className="mb-6 text-lg font-medium">
            Preferred gender
          </h2>

          <div className="flex flex-wrap gap-3">
            {["Male", "Female", "Non-binary", "Open to all"].map((item) => (
              <button
                key={item}
                onClick={() =>
                  toggle(item, setPreferredGender, preferredGender)
                }
                className={`rounded-full px-5 py-2 text-sm transition-all
                  ${
                    preferredGender.includes(item)
                      ? "bg-primary/20 text-primary shadow shadow-primary/30"
                      : "bg-white/5 text-muted-foreground hover:bg-white/10"
                  }
                `}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* YEAR */}
        <section className="mb-24">
          <h2 className="mb-6 text-lg font-medium">
            Preferred year / class
          </h2>

          <div className="flex flex-wrap gap-3">
            {[
              "1st year",
              "2nd year",
              "3rd year",
              "4th year",
              "Any year",
            ].map((item) => (
              <button
                key={item}
                onClick={() =>
                  toggle(item, setPreferredYear, preferredYear)
                }
                className={`rounded-full px-5 py-2 text-sm transition-all
                  ${
                    preferredYear.includes(item)
                      ? "bg-primary/20 text-primary shadow shadow-primary/30"
                      : "bg-white/5 text-muted-foreground hover:bg-white/10"
                  }
                `}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* CONTINUE */}
        <div className="text-center">
          <button className="rounded-full bg-primary px-12 py-3 font-semibold text-black transition
            hover:scale-[1.04] hover:shadow-xl hover:shadow-primary/30">
            Continue →
          </button>
        </div>

      </div>
    </div>
  );
}
