import React from "react";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import { CounsellingMode } from "@/Module/Candidate_Dashboard/Pre-Counselling/usePreCounselling";

export const sectionCardClass =
  "p-5 sm:p-7 rounded-3xl shadow-2xl bg-[var(--mui-palette-primary)] mb-6";

interface HeaderCardProps {
  displayInqNo: string;
  mode: CounsellingMode;
}

export const HeaderCard: React.FC<HeaderCardProps> = ({
  displayInqNo,
  mode,
}) => {
  return (
    <Card className={sectionCardClass}>
      <Box className="flex items-start justify-between gap-3">
        <Box className="flex items-center gap-2.5 mb-1 flex-wrap">
          <Typography variant="h4">
            Confirm Pre-Counselling Readiness
          </Typography>
          <Chip
            label={`Inquiry #${displayInqNo}`}
            size="small"
            className="shadow-2xl text-[var(--mui-palette-primary-main)]"
          />
        </Box>
        <Chip
          label={mode === "online" ? "🌐 Online" : "🏢 In-Person"}
          className="font-bold text-white text-[13px] shrink-0"
          sx={{
            bgcolor:
              mode === "online"
                ? "var(--mui-palette-primary-main)"
                : "var(--mui-palette-secondary-main)",
          }}
        />
      </Box>
    </Card>
  );
};
