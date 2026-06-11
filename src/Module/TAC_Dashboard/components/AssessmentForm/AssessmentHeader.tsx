import React from "react";
import { Box, Button, Typography } from "@mui/material";

interface AssessmentHeaderProps {
  onBack: () => void;
}

const AssessmentHeader: React.FC<AssessmentHeaderProps> = ({ onBack }) => {
  return (
    <Box className="flex items-center gap-4 mb-8">
      <Button
        onClick={onBack}
        variant="outlined"
        className="min-w-0 p-2 bg-white border border-gray-200 rounded-lg shadow-sm"
      >
        <i className="mdi--arrow-back text-gray-600" />
      </Button>
      <Typography className="text-[22px] font-bold">
        Assessment Form
      </Typography>
    </Box>
  );
};

export default AssessmentHeader;