import React from "react";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import { SectionHeader } from "./SectionHeader";
import { sectionCardClass } from "./HeaderCard";
import { CounsellingMode } from "@/Module/Candidate_Dashboard/Pre-Counselling/usePreCounselling";

interface Step2SessionModeProps {
  mode: CounsellingMode;
  setMode: (mode: CounsellingMode) => void;
}

export const Step2SessionMode: React.FC<Step2SessionModeProps> = ({
  mode,
  setMode,
}) => {
  return (
    <Card className={sectionCardClass}>
      <SectionHeader
        icon="ri-route-line"
        step="Step 2"
        title="Session Mode"
        description="How you'd like to connect with your TAC."
        accent="var(--mui-palette-secondary-main)"
      />
<Box className="flex gap-2 p-1.5 rounded-2xl  bg-[var(--mui-overlays-1,_rgba(0,0,0,0.03))] w-fit">        {(["online", "offline"] as const).map((opt) => {
          const isActive = mode === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => setMode(opt)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl tracking-wide text-sm font-semibold cursor-pointer transform select-none
          /* 🚀 3D Cubic Spring Transition */
          transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          ${
            isActive
              ? "bg-[var(--mui-palette-primary-main)] text-white scale-105 -translate-y-0.5   hover:scale-110 hover:-translate-y-1.5 hover:shadow-[0px_18px_36px_-6px_rgba(0,0,0,0.45)] active:scale-95"
              : "text-[var(--mui-palette-text-primary)] bg-[var(--mui-palette-primary)] hover:bg-[var(--mui-palette-primary-main)] hover:text-white hover:scale-108 hover:-translate-y-1.5 hover:shadow-[0px_16px_32px_-6px_rgba(0,0,0,0.25)] active:scale-95"
          }`}
            >
              <i
                className={
                  opt === "online" ? "ri-vidicon-line" : "ri-building-4-line"
                }
                style={{ fontSize: 17 }}
              />
              {opt === "online" ? "Online" : "In-Person"}
            </button>
          );
        })}
      </Box>
    </Card>
  );
};
