import React from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Typography } from "@mui/material";

interface InquiryDisabledBannerProps {
  userData: any;
}

export const InquiryDisabledBanner: React.FC<InquiryDisabledBannerProps> = ({
  userData,
}) => {
  const router = useRouter();

  return (
    <Box
      className="mb-6 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4"
      style={{
        backgroundColor: "rgba(25, 118, 210, 0.08)",
        borderColor: "rgba(25, 118, 210, 0.3)",
      }}
    >
      <Box className="flex items-center gap-3 text-left">
        <Box className="w-14 h-14 rounded-full bg-[var(--mui-palette-primary-main)] flex items-center justify-center text-white shrink-0 shadow-sm">
          <i className="ri-information-line text-xl" />
        </Box>
        <Box>
          <Typography
            variant="h6"
            className="font-bold leading-tight"
          >
            Inquiry already submitted
          </Typography>
          <Typography variant="body2" className="mt-2 font-medium">
            Please proceed to the pre-counselling section.
          </Typography>
        </Box>
      </Box>

      <Button
        variant="contained"
        onClick={() => {
          const existingLeadId =
            userData?.leadId || userData?.candidateProfile?.leadId;
          const existingVisitOption = userData?.visitOption;
          const existingConsultant = userData?.prefferedConsultant;
          const method = existingVisitOption === 2 ? "on" : "off";
          router.push(
            `/pre-counselling?leadId=${existingLeadId}&consultantId=${existingConsultant || ""}&method=${method}`,
          );
        }}
        className="rounded-xl normal-case font-semibold px-5 py-2 shrink-0 shadow-none text-xs sm:text-sm"
      >
        Go to pre-counselling
      </Button>
    </Box>
  );
};