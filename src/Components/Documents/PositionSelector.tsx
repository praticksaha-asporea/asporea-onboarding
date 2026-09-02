"use client";

import React from "react";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { Position } from "@/Types/Frontend_Payload/document.types";

interface PositionSelectorProps {
  positions: Position[];
  selected: string;
  onSelect: (id: string) => void;
  loading: boolean;
}

export const PositionSelector: React.FC<PositionSelectorProps> = ({ positions, selected, onSelect, loading }) => {
  return (
    <Card className="p-2 sm:p-6 rounded-xl shadow-md mt-6">
      <Box className="mb-6">
        <Typography variant="h5" className="font-bold tracking-wide block mb-5">
          Position applying for
        </Typography>

        <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Box className="p-3 rounded-xl bg-gray-50 border border-gray-200">
            <Typography variant="caption" color="text.secondary">
              Position Inquired
            </Typography>
            <Typography variant="body1" className="font-semibold">
              {positionInquired || "Not specified"}
            </Typography>
          </Box>

          <Box className="p-3 rounded-xl bg-gray-50 border border-gray-200">
            <Typography variant="caption" color="text.secondary">
              Position Offered
            </Typography>
            <Typography variant="body1" className="font-semibold">
              {positionOffered || "Not specified"}
            </Typography>
          </Box>
        </Box>

        {loading ? (
          <CircularProgress size={30} />
        ) : (
          <Box className="flex flex-wrap gap-1.5 mb-4">
            {positions.map((pos) => (
              <Button
                key={pos._id}
                variant={selected === pos._id ? "contained" : "outlined"}
                onClick={() => onSelect(selected === pos._id ? "" : pos._id)}
                className="rounded-full normal-case px-3"
              >
                {pos.title}
              </Button>
            ))}
          </Box>
        )}

        <Box className="flex items-center gap-2">
          <Box className="w-4 h-4 rounded bg-blue-600" />
          <Typography variant="body2">Selected</Typography>

          <Box className="w-4 h-4 rounded border border-gray-300" />
          <Typography variant="body2">Available</Typography>
        </Box>
      </Box>
    </Card>
  );
};