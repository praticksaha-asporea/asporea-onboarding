"use client";

import { Suspense } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import AllCandidatesView from "./AllCandidatesView";

const AllCandidatesPage = () => {
  return (
    <Suspense
      fallback={
        <Box className="p-10 flex justify-center w-full">
          <CircularProgress size={32} />
        </Box>
      }
    >
      <AllCandidatesView />
    </Suspense>
  );
};

export default AllCandidatesPage;
