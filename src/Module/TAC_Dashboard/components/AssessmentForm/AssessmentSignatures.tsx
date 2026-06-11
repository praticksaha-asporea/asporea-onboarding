import React from "react";
import { Box, Button, Typography } from "@mui/material";

interface AssessmentSignaturesProps {
  signatureFields: any[];
}

const AssessmentSignatures: React.FC<AssessmentSignaturesProps> = ({ signatureFields }) => {
  return (
    <Box className="flex flex-col md:flex-row justify-between items-end gap-10">
      <Box className="flex w-full md:w-[60%] gap-6">
        {signatureFields.map(({ label, file, setFile }) => (
          <Box
            key={label}
            component="label"
            className="flex-1 border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <input
              type="file"
              hidden
              accept=".pdf, .jpg, .jpeg, .png"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setFile(e.target.files[0]);
                }
              }}
            />
            {file ? (
              <Box className="flex flex-col items-center text-center">
                <i className="mdi--check-circle-outline text-green-500 mb-2 text-2xl" />
                <Typography className="text-[13px] font-bold text-gray-800">
                  {file.name}
                </Typography>
                <Typography className="text-[11px] text-gray-500">
                  Click to change file
                </Typography>
                <Typography className="text-[10px] text-gray-400 uppercase mt-4">
                  {label}
                </Typography>
              </Box>
            ) : (
              <Box className="flex flex-col items-center text-center">
                <Box className="w-10 h-10 bg-[var(--mui-overlays-1)] border border-gray-200 rounded-full flex items-center justify-center mb-2 shadow-sm">
                  <i className="ri-upload-cloud-2-line text-xl text-[var(--mui-palette-primary-main)]"></i>
                </Box>
                <Typography className="text-xs font-semibold mb-1">
                  Drop file here or{" "}
                  <span className="text-[var(--mui-palette-primary-main)] font-extrabold">browse</span>
                </Typography>
                <Typography className="text-[10px] text-gray-400 uppercase mt-2">
                  {label}
                </Typography>
              </Box>
            )}
          </Box>
        ))}
      </Box>

      <Button variant="contained" className="bg-green-500 hover:bg-green-600 px-10 py-3 font-bold tracking-widest">
        SUBMIT
      </Button>
    </Box>
  );
};

export default AssessmentSignatures;