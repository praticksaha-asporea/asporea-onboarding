import React from "react";
import { Box, IconButton, Typography, Chip } from "@mui/material";
import { CamelCase } from "@/Utils/common";

interface CandidateHeaderProps {
  candidate: any;
  onBack: () => void;
}

const CandidateHeader: React.FC<CandidateHeaderProps> = ({ candidate, onBack }) => {
  return (
    <Box className="flex items-center gap-4 mb-6">
      <IconButton
        onClick={onBack}
        className="bg-white border border-gray-200 rounded-lg shadow-sm"
      >
        <i className="mdi--arrow-back text-gray-600" />
      </IconButton>
      <Box>
        <Typography className="text-[22px] font-bold leading-tight">
          {candidate?.name ?? candidate.fullName ?? "Candidate Details"}
        </Typography>
        <Typography className="text-[13px] text-gray-500">{candidate.inqNo}</Typography>
      </Box>
      {candidate.status && (
        <Chip
          label={CamelCase(candidate.status)}
          size="small"
          className="ml-2"
          sx={{ fontWeight: 600, fontSize: 12 }}
        />
      )}
    </Box>
  );
};

export default CandidateHeader;