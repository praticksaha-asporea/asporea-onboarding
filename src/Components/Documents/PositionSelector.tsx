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

        {loading ? (
          <CircularProgress size={30} />
        ) : (
          <Box className="flex flex-wrap gap-1.5 mb-4">
            {positions.map((pos) => (
              <Button
                key={pos._id}
                variant={selected === pos._id ? "contained" : "outlined"}
                onClick={() => onSelect(selected === pos._id ? "" : pos._id)}
                className={`rounded-full normal-case px-3 border
                ${
                  selected === pos._id
                    ? " border-[var(--mui-palette-primary-main)] text-white hover:border-[var(--mui-palette-primary-main)]"
                    : "bg-[var(--variant-outlinedBg)] border-[#e0e0e0] text-[var(--mui-palette-text-primary)] hover:border-[#e0e0e0]"
                }
                disabled:bg-[#f5f5f5] disabled:text-[#bdbdbd] disabled:border-[#e0e0e0]
              `}
              >
                {pos.title}
              </Button>
            ))}
          </Box>
        )}
        <Box className="flex items-center gap-2">
          <Box className="w-4 h-4 rounded bg-blue-600" />
          <Typography variant="body2">Selected</Typography>
          <Box className="w-4 h-4 rounded border border-gray-300 bg-transparent" />
          <Typography variant="body2">Available</Typography>
        </Box>
      </Box>
    </Card>
  );
};