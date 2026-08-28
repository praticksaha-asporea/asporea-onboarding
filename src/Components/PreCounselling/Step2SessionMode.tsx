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
      <Box className="flex gap-2 p-1 rounded-2xl bg-[var(--mui-overlays-1,_rgba(0,0,0,0.03))] w-fit">
        {(["online", "offline"] as const).map((opt) => {
          const isActive = mode === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => setMode(opt)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl tracking-wide text-sm font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-[var(--mui-palette-primary-main)] shadow-[0px_4px_14px_-4px_rgba(15,23,42,0.25)] text-white"
                  : "text-[var(--mui-palette-text-primary)] hover:text-[var(--mui-palette-text-primary)]"
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
