"use client";

import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { TechData } from "@/Types/Frontend_Payload/assessment.types";
import { useSelector } from "react-redux";

export const TechnicalResult = ({
  techData,
  loadingTech,
}: {
  techData: TechData | null;
  loadingTech: boolean;
}) => {

  const reduxUser = useSelector(
    (state: any) => state.userSlice?.userData || state.user?.userData,
  );
  const calculateScorePercentage = (achieved: number, total: number) =>
    total ? Math.round((achieved / total) * 100) : 0;
  const calculateAccuracyRate = (
    achieved: number,
    total: number,
    questions: number,
    answered: number,
  ) => {
    if (!answered || !questions || !total) return 0;
    const accuracyRate = Math.round(
      (achieved * questions * 100) / (total * answered)
    ); return accuracyRate;
  };

  if (loadingTech || !techData)
    return (
      <Box className="flex justify-center p-10">
        <CircularProgress />
      </Box>
    );

  const passed = techData.status === "passed";

  return (
    <Box className="flex flex-col gap-6 w-full">
      <Card className="p-5 rounded-xl shadow-sm">
        <Box className="flex items-center gap-4">
          <i
            className={`text-[28px] ${passed ? "material-symbols-light--check-circle-outline text-[var(--mui-palette-text-primary)]" : "material-symbols-light--cancel-outline text-red-500"}`}
          />
          <Box>
            <Typography className="text-[22px] font-extrabold tracking-tight leading-tight">
              {passed ? "Congratulations!" : "Assessment Reviewed"}
            </Typography>
            <Typography className="text-[15px] mt-2">
              Your technical round evaluation is complete.
            </Typography>
          </Box>
        </Box>
      </Card>
      <Card className="p-7 rounded-xl shadow-sm">
        <Typography className="text-[18px] font-bold mb-8">
          Score Summary
        </Typography>
        <Box className="grid grid-cols-2 gap-y-8 gap-x-6">
          <Box>
            <Typography className="text-[13px] font-medium mb-1.5">
              Overall Score
            </Typography>
            <Typography className="text-[32px] font-semibold leading-none text-[var(--mui-palette-text-primary)]">
              {calculateScorePercentage(
                techData.achievedScore,
                techData.totalScore,
              )}
              %
            </Typography>
          </Box>
          <Box>
            <Typography className="text-[13px] font-medium mb-1.5">
              Questions Answered
            </Typography>
            <Typography className="text-[16px] font-medium">
              {techData.answered} / {techData.questions}
            </Typography>
          </Box>
          <Box>
            <Typography className="text-[13px] font-medium mb-1.5">
              Time Taken
            </Typography>
            <Typography className="text-[16px] font-medium">
              {techData.timeTaken}
            </Typography>
          </Box>
          <Box>
            <Typography className="text-[13px] font-medium mb-1.5">
              Accuracy Rate
            </Typography>
            <Typography className="text-[16px] font-medium text-[var(--mui-palette-text-primary)]">
              {calculateAccuracyRate(
                techData.achievedScore,
                techData.totalScore,
                techData.questions,
                techData.answered,
              )}
              %
            </Typography>
          </Box>
        </Box>
        <Divider className="my-7" />
        {techData?.breakdownPdf?.path ?
          <Button
            fullWidth
            disableElevation
            variant="contained"
            className="py-[10px] text-[14px] font-bold rounded-lg normal-case hover:bg-blue-500 bg-[#1877F2]"
            href={techData?.breakdownPdf?.path}
            target="_blank"
            download={`Result Technical Round - ${reduxUser?.firstName} ${reduxUser?.lastName}`}
          >
            View Detailed Breakdown
          </Button>
          :
          <Typography className="text-[--mui-palette-error-main] font-bold text-center">
            The result file is not available yet.
          </Typography>
        }
      </Card>
    </Box>
  );
};
