"use client";

import React from "react";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { Position } from "@/Types/Frontend_Payload/document.types";
import { useDocumentUpload } from "@/Module/Candidate_Dashboard/DocumentUpload/useDocumentUpload";

interface PositionSelectorProps {
  positions: Position[];
  selected: string;
  onSelect: (id: string) => void;
  loading: boolean;
}

export const PositionSelector: React.FC<PositionSelectorProps> = ({ positions, selected, onSelect, loading }) => {
  const { positionInquired, positionOffered } = useDocumentUpload();
  return (
    <Card className="mt-6 rounded-2xl shadow-sm">
      <Box className="p-4 sm:p-6">

        {/* Position Information */}
        {(positionInquired || positionOffered) && (
          <Box className="mb-7">
            <Typography
              variant="subtitle1"
              className="font-bold mb-3"
            >
              Position Information
            </Typography>

            <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {positionInquired && (
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    className="block mb-1"
                  >
                    Position Inquired
                  </Typography>

                  <Box className="px-3 py-2.5 rounded-lg border border-gray-200">
                    <Typography variant="body2" className="font-medium">
                      {positionInquired}
                    </Typography>
                  </Box>
                </Box>
              )}

              {positionOffered && (
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    className="block mb-1"
                  >
                    Position Offered
                  </Typography>

                  <Box className="px-3 py-2.5 rounded-lg border border-gray-200">
                    <Typography variant="body2" className="font-medium">
                      {positionOffered}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* Position Applying For */}
        <Box>
          <Typography
            variant="subtitle1"
            className="font-bold"
          >
            Position Applying For
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            className="mt-1 mb-4"
          >
            Please select the position you would like to apply for.
          </Typography>

          {loading ? (
            <Box className="flex justify-center py-5">
              <CircularProgress size={28} />
            </Box>
          ) : positions.length > 0 ? (
            <Box className="flex flex-wrap gap-2">
              {positions.map((pos) => {
                const isSelected = selected === pos._id;

                return (
                  <Button
                    key={pos._id}
                    variant={isSelected ? "contained" : "outlined"}
                    onClick={() =>
                      onSelect(isSelected ? "" : pos._id)
                    }
                    startIcon={
                      isSelected ? (
                        <i className="ri-check-line" />
                      ) : undefined
                    }
                    className="rounded-lg normal-case px-4"
                  >
                    {pos.title}
                  </Button>
                );
              })}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No positions available.
            </Typography>
          )}
        </Box>

      </Box>
    </Card>
  );
};