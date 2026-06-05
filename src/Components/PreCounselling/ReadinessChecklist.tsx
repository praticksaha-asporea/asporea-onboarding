"use client";

import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { ChecklistState, ExistingBooking } from "@/Types/Frontend_Payload/precounselling.types";

interface ReadinessChecklistProps {
  checklist: ChecklistState;
  setChecklist: (val: ChecklistState) => void;
  method: string;
  existingBooking: ExistingBooking | null;
}

export const ReadinessChecklist: React.FC<ReadinessChecklistProps> = ({ checklist, setChecklist, method, existingBooking }) => {
  return (
    <Card className={`rounded-[15px] mb-12 shadow-[0_4px_24px_rgba(0,0,0,0.04)] ${existingBooking ? "opacity-60 pointer-events-none" : ""}`}>
      <CardContent className="p-6">
        <Typography variant="h5" fontWeight="bold" className="mb-4">
          Readiness Checklist
        </Typography>
        <Box className="flex flex-col gap-4">
          <FormControlLabel
            control={<Checkbox checked={checklist.materials} onChange={(e) => setChecklist({ ...checklist, materials: e.target.checked })} />}
            label="I have reviewed the pre-counselling materials."
          />
          <FormControlLabel
            control={<Checkbox checked={checklist.environment} onChange={(e) => setChecklist({ ...checklist, environment: e.target.checked })} />}
            label={method === "on" ? "I will ensure a quiet environment free from distractions." : "I will reach the branch on time."}
          />
          <FormControlLabel
            control={<Checkbox checked={checklist.questions} onChange={(e) => setChecklist({ ...checklist, questions: e.target.checked })} />}
            label="I am prepared to discuss my career aspirations and questions."
          />
        </Box>
      </CardContent>
    </Card>
  );
};