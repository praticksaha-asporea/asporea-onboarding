"use client";

import { useState } from "react";

import clsx from "clsx";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

const Experience = () => {
  const [selectedExperience, setSelectedExperience] = useState<string | null>(
    null,
  );

  const experienceTypes = [
    {
      id: "fresher",
      title: "Fresher",
      description:
        "Starting your career journey. No prior work experience needed.",
      icon: "ri-graduation-cap-line",
    },
    {
      id: "domestic",
      title: "Domestic Experience",
      description: "Professional experience gained within your home country.",
      icon: "ri-briefcase-line",
    },
    {
      id: "abroad",
      title: "Abroad Experience",
      description:
        "Valuable work experience acquired in international settings.",
      icon: "ri-trophy-line",
    },
    {
      id: "freelancer",
      title: "Freelancer",
      description: "Self-employed or contract-based professional work history.",
      icon: "ri-clipboard-line",
    },
  ];

  return (
    <Box className="w-full flex justify-center">
      <Card className="w-full max-w-[1000px] p-6 md:p-12 rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#f3f4f6]">
        <Box className="text-left mb-12">
          <Typography
            variant="subtitle2"
            className="mb-3 tracking-[0.5px]"
          >
            Step 4 of 5: Experience Selection
          </Typography>
          <Typography variant="h4" className="mb-2">
            Select Your Experience Type
          </Typography>
          <Typography
            variant="body1"
            className="text-[13px] font-medium leading-[1.2] max-w-[900px]"
          >
            Please select the option that best describes your professional
            background. This helps us tailor your application process.
          </Typography>
        </Box>

        <Grid container spacing={4} className="mb-6">
          {experienceTypes.map((type) => {
            const isSelected = selectedExperience === type.id;

            return (
              <Grid size={{ xs: 12, sm: 6 }} key={type.id}>
                <Card
                  onClick={() => setSelectedExperience(type.id)}
                  className={clsx(
                    "h-full pt-12 px-8 pb-[104px] cursor-pointer rounded-[16px] border-2 transition-all duration-200 ease-in-out flex flex-col items-center text-center",
                    isSelected
                      ? "border-[#1976d2] border-[5px] bg-transparent shadow-[0_10px_25px_-5px_rgba(25,118,210,0.1),_0_8px_10px_-6px_rgba(25,118,210,0.1)]"
                      : "border-[#e5e7eb] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),_0_2px_4px_-2px_rgba(0,0,0,0.05)] hover:border-[#d1d5db] hover:-translate-y-0.5",
                  )}
                >
                  <Box
                    onClick={() => setSelectedExperience(type.id)}
                    className={clsx(
                      "w-16 h-16 rounded-full flex items-center justify-center mb-6",
                      isSelected
                        ? "bg-white shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
                        : "bg-[#f0f7ff] shadow-none",
                    )}
                  >
                    <i
                      className={`${type.icon} text-[#1976d2] text-[28px]`}
                    ></i>
                  </Box>
                  <Typography
                    variant="h6"
                    className="font-extrabold mb-3"
                  >
                    {type.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    className="leading-6"
                  >
                    {type.description}
                  </Typography>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Action Buttons */}
        <Box className="flex justify-end gap-4 pt-8">
          <Button
            variant="outlined"
            className="rounded-xl normal-case border border-[#d1d5db] hover:shadow-lg hover:border-[#9ca3af] text-inherit"
            href='/document-upload'
          >
            Back to Document Upload
          </Button>
          <Button
            variant="contained"
            disabled={!selectedExperience}
                                      
            className="rounded-xl normal-case text-sm shadow-md hover:bg-blue-700 hover:shadow-lg disabled:text-white disabled:shadow-none disabled:cursor-not-allowed"
            href="/applicationtracking"
          >
            Continue to Assessment
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default Experience;
