"use client";

import React, { useState } from "react";
import clsx from "clsx";
import { useRouter } from "next/navigation";

// MUI Imports

import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

const Stepper = () => {
  const steps = [
    { label: "Inquiry", status: "completed", icon: "ri-question-line" },
    {
      label: "Counselling",
      status: "completed",
      icon: "ri-checkbox-circle-line",
    },
    { label: "Documents", status: "completed", icon: "ri-upload-cloud-2-line" },
    { label: "Experience", status: "completed", icon: "ri-briefcase-line" },
    { label: "Assessment", status: "active", icon: "ri-trophy-line" },
    {
      label: "Technical Round",
      status: "pending",
      icon: "ri-file-list-3-line",
    },
  ];

  return (
    <Box className="flex items-center justify-between w-full mb-16 overflow-x-auto pb-4">
      {steps.map((step, index) => (
        <Box
          key={index}
          className="flex flex-col items-center gap-3 flex-shrink-0 min-w-[100px]"
        >
          <Box
            className={clsx(
              "w-10 h-10 rounded-full flex items-center justify-center text-[20px] transition-all duration-300",
              step.label === "Assessment"
                ? "bg-[#ccfbf1] text-[#14b8a6] border-none shadow-none"
                : step.status === "completed"
                  ? "bg-[#1976d2] text-white border-none shadow-none"
                  : "bg-[#f3f4f6] text-[#9ca3af] border-none shadow-none",
              step.status === "active" &&
                step.label !== "Assessment" &&
                "border-2 border-[#1976d2] shadow-[0_0_15px_rgba(0,0,0,0.05)]",
            )}
          >
            <i className={step.icon}></i>
          </Box>
          <Typography
            className={clsx(
              "text-[13px] font-semibold text-center",
              step.status === "active"
                ? "text-[#1976d2]"
                : step.status === "completed"
                  ? "text-[#1f2937]"
                  : "text-[#9ca3af]",
            )}
          >
            {step.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

// Custom Status Badge
const StatusBadge = ({ status }: { status: string }) => {
  const isCompleted = status === "Completed";
  return (
    <Box className="text-[12px] font-medium bg-transparent border-none p-0 capitalize tracking-[0.2px]">
      {status}
    </Box>
  );
};

const JourneyCard = ({
  title,
  status,
  dateLabel,
  date,
  description,
  buttonLabel,
  disabledButton,
  onClick,
  secondaryButtonLabel,
  onSecondaryClick,
}: any) => {
  return (
    <Card
      variant="outlined"
      className="mb-6 p-6 sm:p-8 rounded-[16px] border border-[#e5e7eb] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
    >
      <Box className="flex justify-between items-start mb-6">
        <Typography variant="h6" className="text-[0.9rem] mt-1">
          {title} 
        </Typography>

        <Box className="flex flex-col items-end gap-2">
          <StatusBadge status={status} />

          {dateLabel && date && (
            <Typography
              variant="caption"
              className="font-normal text-[#6b7280] whitespace-nowrap"
            >
              {dateLabel}:{" "}
              <span style={{ fontWeight: 400, color: "#6b7280" }}>{date}</span>
            </Typography>
          )}
        </Box>
      </Box>

      {/* Description */}
      <Typography variant="body2" className="text-[#4b5563] leading-[1.6] mb-6">
        {description}
      </Typography>

      <Box className="flex justify-end items-center pt-5  gap-4">
        {/* NAYA: View Result Button */}
        {secondaryButtonLabel && (
          <Button
            variant="outlined"
            onClick={onSecondaryClick}
            className="rounded-[8px] px-6 py-2 normal-case font-extrabold text-[#374151] border border-[#d1d5db] hover:border-[#9ca3af] hover:bg-[#f9fafb] transition-colors duration-150"
          >
            {secondaryButtonLabel}
          </Button>
        )}
        {buttonLabel && (
          <Button
            variant="contained"
            disabled={disabledButton}
            onClick={onClick}
            className="rounded-[8px] px-6 py-2 normal-case font-extrabold text-white bg-[#1976d2] shadow-none hover:bg-[#1565c0] hover:shadow-none transition-colors duration-150 disabled:bg-[#e3f2fd] disabled:text-[#93c5fd] disabled:cursor-not-allowed"
          >
            {buttonLabel}
          </Button>
        )}
      </Box>
    </Card>
  );
};

// Main Page Component
const ApplicationTracking = () => {
  const router = useRouter();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  return (
    <Box className="w-full flex justify-center">
      <Card className="w-full max-w-[900px] p-6 md:p-12 rounded-[24px] border border-[#f3f4f6] shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        <Typography variant="h4" className="mb-6">
          Application Status Tracking
        </Typography>

        <Stepper />

        <Box className="mt-5">
          <Typography variant="h5" className="font-medium mb-4">
            Your Application Journey
          </Typography>

          <JourneyCard
            title="Inquiry Submission"
            status="Completed"
            dateLabel="Completed"
            date="Feb 27, 2026"
            description="A Talent Acquisition Consultant will be assigned to you shortly to guide you through the next stages."
          />

          <JourneyCard
            title="Pre-Counselling Readiness"
            status="Completed"
            dateLabel="Completed"
            date="Feb 27, 2026"
            description="Please confirm your readiness for pre-counselling sessions. This is a crucial step."
          />

          <JourneyCard
            title="Document Verification"
            status="Pending"
            dateLabel="Uploaded"
            date="Feb 28, 2026"
            description="All uploaded documents (ID, Resume, Certificates) have been verified and approved. Good job!"
          />

          <JourneyCard
            title="Experience Verification"
            status="Pending"
            dateLabel="Filled"
            date="Feb 28, 2026"
            description="Your experience type has been confirmed as 'Domestic Professional'."
          />

          <JourneyCard
            title="Assessment"
            status="Pending"
            description="Your initial online assessment is currently in progress. Please complete it by the deadline."
            buttonLabel="Schedule Assessment"
            disabledButton={false}
            onClick={() => setIsPopupOpen(true)}
            secondaryButtonLabel="View Result"
            onSecondaryClick={() => router.push("/assessment?view=result")}
          />

          <JourneyCard
            title="Technical Round"
            status="Pending"
            dateLabel="Scheduled"
            date="Feb 01, 2024"
            description="Assessor will decide if you will need to clear this round or no need. We will notify you of the result after assessment."
            buttonLabel="View Result"
            disabledButton={false}
            onClick={() => router.push("/assessment?view=technical")}
          />
        </Box>
      </Card>
      {isPopupOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] w-full max-w-[480px] shadow-2xl relative overflow-hidden flex flex-col pt-12 pb-10 px-8">
            <button
              onClick={() => setIsPopupOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i
                className="material-symbols--close-rounded"
                style={{ fontSize: "28px" }}
              />
            </button>

            <h2 className="text-[36px] font-bold text-center text-gray-900 mb-6 tracking-tight">
              Assessment
            </h2>

            <div className="text-center mb-6">
              <p className="text-[#111827] text-[15px] leading-[1.6] mb-5">
                You are assigned to a Talent Acquisition
                <br />
                Consultant(TAC).
                <br />
                Be ready for e-Assessment with Original Documents
              </p>
              <button
                onClick={() => {
                  setIsPopupOpen(false);
                  router.push("/assessment");
                }}
                className="bg-[#1877F2] hover:bg-[#166fe5] text-white  py-3 px-10 rounded-full text-[16px] transition-colors w-auto min-w-[260px]"
              >
                Request e-Assessment
              </button>
            </div>

            <hr className="border-gray-200 mb-5 w-full" />

            <div className="text-center mb-6">
              <p className="text-[#A32A29] text-[15px] leading-[1.6] mb-5">
                As you are now inside our{" "}
                <span className="font-bold">Siliguri</span> Branch .<br />
                Be ready For Assessment with Original Documents
              </p>
              <button className="bg-[#111111] hover:bg-black text-white  py-3 px-10 rounded-full text-[16px] transition-colors w-auto min-w-[260px]">
                Generate Token
              </button>
            </div>

            <hr className="border-gray-200 mb-5 w-full" />

            <div className="text-center">
              <p className="text-[#A32A29] text-[15px] leading-[1.6]">
                As you're in <span className="font-bold">Siliguri</span> Branch.
                <br />
                For Assessment, Please reach to Reception Counter.
                <br />
                Receptionist will Generate a Token behalf of you.
                <br />
                Be ready For Assessment with Original Documents.
              </p>
            </div>
          </div>
        </div>
      )}
    </Box>
  );
};

export default ApplicationTracking;
