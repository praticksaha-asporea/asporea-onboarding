import React from "react";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import { preTACData } from "@/Types/object.types";
import { CamelCase } from "@/Utils/common";
import { SectionHeader } from "./SectionHeader";
import { sectionCardClass } from "./HeaderCard";

interface Step4TacSelectionProps {
  selectedBranchId: string;
  loadingTacs: boolean;
  tacs: preTACData[];
  selectedTacId: string;
  setSelectedTacId: React.Dispatch<React.SetStateAction<string>>;
  setProfileTac: (tac: preTACData | null) => void;
}

export const Step4TacSelection: React.FC<Step4TacSelectionProps> = ({
  selectedBranchId,
  loadingTacs,
  tacs,
  selectedTacId,
  setSelectedTacId,
  setProfileTac,
}) => {
  return (
    <Card className={sectionCardClass}>
      <SectionHeader
        icon="ri-user-star-line"
        step="Step 4"
        title="Choose Your Preferred TAC"
        description="Your dedicated point of contact for this session."
      />

      {!selectedBranchId ? (
        <Box className="flex flex-col items-center text-center gap-2 py-8">
          <i className="ri-map-pin-line text-3xl text-[var(--mui-palette-text-secondary)]" />
          <Typography
            variant="body2"
            className="text-[var(--mui-palette-text-secondary)]"
          >
            Select a branch above to see available TACs.
          </Typography>
        </Box>
      ) : loadingTacs ? (
        <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2].map((i) => (
            <Box
              key={i}
              className="relative flex flex-col items-center text-center p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200"
            >
              <Skeleton variant="circular" width={52} height={52} />
              <Box className="flex-1">
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="text" width="60%" />
              </Box>
            </Box>
          ))}
        </Box>
      ) : tacs.length === 0 ? (
        <Typography
          variant="body2"
          className="text-[var(--mui-palette-text-secondary)]"
        >
          No TAC available for this branch and mode yet.
        </Typography>
      ) : (
        <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tacs?.map((tac: preTACData) => {
            const tacId = tac._id.toString();
            const isSelected = selectedTacId === tacId;
            const rating = tac?.tacProfile?.rating;

            return (
              <Box
                key={tacId}
                onClick={() =>
                  setSelectedTacId((prev) => (prev === tacId ? "" : tacId))
                }
                className={`relative flex flex-col items-center text-center shadow-2xl p-5 rounded-2xl cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "bg-[color-mix(in_srgb,var(--mui-palette-primary-main)_16%,transparent)] shadow-2xl"
                    : "border-[var(--mui-palette-divider)] hover:border-[var(--mui-palette-primary-main)]/40 hover:shadow-sm"
                }`}
              >
                {isSelected && (
                  <i className="ri-checkbox-circle-fill absolute top-3 right-3 text-xl text-[var(--mui-palette-primary-main)]" />
                )}

                <Avatar
                  src={tac.profilePic as unknown as string}
                  sx={{ width: 72, height: 72, mb: 2 }}
                >
                  {tac.firstName?.charAt(0)}
                </Avatar>

                <Typography
                  variant="subtitle1"
                  className="font-bold leading-tight"
                >
                  {tac.firstName} {tac.lastName}
                </Typography>

                {typeof rating === "number" && (
                  <Box className="flex items-center justify-center gap-0.5 text-amber-500 mt-1.5">
                    {Array.from({ length: 5 }, (_, index) => {
                      const starValue = index + 1;
                      let icon = "ri-star-line";
                      if (rating >= starValue) {
                        icon = "ri-star-fill";
                      } else if (rating >= starValue - 0.5) {
                        icon = "ri-star-half-fill";
                      }
                      return (
                        <i
                          key={index}
                          className={icon}
                          style={{ fontSize: 14 }}
                        />
                      );
                    })}
                    <Typography
                      variant="caption"
                      className="font-semibold ml-1"
                    >
                      {rating.toFixed(1)}
                    </Typography>
                  </Box>
                )}

                <Typography
                  variant="body2"
                  className="text-[var(--mui-palette-text-secondary)] mt-2"
                >
                  {CamelCase(tac?.tacProfile?.designation as string)}
                </Typography>

                {tac?.experienceInMonths ? (
                  <Typography
                    variant="caption"
                    className="text-[var(--mui-palette-text-secondary)] mt-1"
                  >
                    {Number((tac.experienceInMonths / 12).toFixed(2))} yrs
                    experience
                  </Typography>
                ) : null}

                <Button
                  variant="contained"
                  size="small"
                  fullWidth
                  startIcon={<i className="ri-user-line" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setProfileTac(tac);
                  }}
                  sx={{
                    mt: 3,
                    borderRadius: 2,
                    textTransform: "none",
                  }}
                >
                  View Profile
                </Button>
              </Box>
            );
          })}
        </Box>
      )}
    </Card>
  );
};
