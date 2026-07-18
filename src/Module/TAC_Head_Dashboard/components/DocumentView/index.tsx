"use client";

import  { Suspense } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import DocumentApprovalView from "./DocumentApprovalView";

const DocumentApprovalIndex = () => {
  return (
    <Suspense
      fallback={
        <Box className="p-10 flex justify-center w-full">
          <CircularProgress size={32} />
        </Box>
      }
    >
      <DocumentApprovalView />
    </Suspense>
  );
};

export default DocumentApprovalIndex;
