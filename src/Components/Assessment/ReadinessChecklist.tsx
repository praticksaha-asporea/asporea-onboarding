"use client";

import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { Checklist } from "@/Types/Frontend_Payload/assessment.types";

interface ReadinessChecklistProps {
  checklist: Checklist;
  setChecklist: (val: Checklist) => void;
  visitMethod: "on" | "off";
}

export const ReadinessChecklist: React.FC<ReadinessChecklistProps> = ({
  checklist,
  setChecklist,
  visitMethod,
}) => {
  return (
    <Card className="rounded-[15px] mb-12 border border-[#e0e0e0] shadow-none">
      <CardContent className="p-6">
        <Typography variant="h5" fontWeight="bold" className="mb-4">
          Readiness Checklist
        </Typography>
        <Box className="flex flex-col gap-4">
          <FormControlLabel
            control={
              <Checkbox
                checked={checklist.documents}
                onChange={(e) =>
                  setChecklist({ ...checklist, documents: e.target.checked })
                }
              />
            }
            label="I have uploaded all necessary documents (i.e. id, academic, experience, resume)."
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={checklist.environment}
                onChange={(e) =>
                  setChecklist({ ...checklist, environment: e.target.checked })
                }
              />
            }
            label={
              visitMethod === "off"
                ? "I will reach the branch on time."
                : "I will ensure a quiet environment free from distractions."
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={checklist.aspirations}
                onChange={(e) =>
                  setChecklist({ ...checklist, aspirations: e.target.checked })
                }
              />
            }
            label="I am prepared to discuss my career aspirations and questions."
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={checklist.lighting}
                onChange={(e) =>
                  setChecklist({ ...checklist, lighting: e.target.checked })
                }
              />
            }
            label="I will prepare my video call background area with bright light."
          />
        </Box>
      </CardContent>
    </Card>
  );
};
