import React from "react";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
export type { Branch } from "../../Module/Candidate_Dashboard/Pre-Counselling/Sub-hooks/useBranchSelection";
import { SectionHeader } from "./SectionHeader";
import { sectionCardClass } from "./HeaderCard";
import { Branch } from "../../Module/Candidate_Dashboard/Pre-Counselling/Sub-hooks/useBranchSelection";

interface Step1BranchSelectionProps {
  locationDenied: boolean;
  loadingBranches: boolean;
  branches: Branch[];
  selectedBranchId: string;
  handleBranchSelect: (branchId: string) => void;
}

export const Step1BranchSelection: React.FC<Step1BranchSelectionProps> = ({
  locationDenied,
  loadingBranches,
  branches,
  selectedBranchId,
  handleBranchSelect,
}) => {
  return (
    <Card className={sectionCardClass}>
      <SectionHeader
        icon="ri-map-pin-2-line"
        step="Step 1"
        title="Choose Your Branch"
        description="Branches near you, based on your current location."
        accent="var(--mui-palette-secondary-main)"
      />

      {locationDenied && (
        <Box className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-[color-mix(in_srgb,#f59e0b_10%,transparent)]">
          <i className="ri-map-pin-off-line text-amber-600" />
          <Typography variant="caption" className="text-amber-700">
            Couldn't access your location — showing default branches.
          </Typography>
        </Box>
      )}

      {loadingBranches ? (
        <Box className="flex gap-3 overflow-x-auto pb-1">
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              variant="rounded"
              width={200}
              height={84}
              className="rounded-2xl shrink-0"
            />
          ))}
        </Box>
      ) : branches.length === 0 ? (
        <Typography
          variant="body2"
          className="text-[var(--mui-palette-text-secondary)]"
        >
          No branches found near your location.
        </Typography>
      ) : (
        <Box className="flex gap-3 overflow-x-auto pb-1">
          {branches.map((branch: Branch) => {
            const isSelected = selectedBranchId === branch._id;
            return (
              <Box
                key={branch._id}
                onClick={() => handleBranchSelect(branch._id)}
                className={`flex flex-col gap-1 p-4 rounded-2xl cursor-pointer shrink-0 transition-all duration-200 ${
                  isSelected
                    ? "border-[var(--mui-palette-primary-main)] bg-[color-mix(in_srgb,var(--mui-palette-primary-main)_19%,transparent)]"
                    : "border-[var(--mui-palette-divider)] hover:border-[var(--mui-palette-primary-main)]/40"
                }`}
                style={{ minWidth: 200 }}
              >
                <Box className="flex items-center gap-2">
                  <i
                    className={
                      isSelected
                        ? "ri-checkbox-circle-fill text-[var(--mui-palette-primary-main)]"
                        : "ri-building-4-line text-[var(--mui-palette-text-secondary)]"
                    }
                  />
                  <Typography
                    variant="subtitle2"
                    className="font-medium tracking-wide text-[var(--mui-palette-primary)]"
                  >
                    {branch.title}
                  </Typography>
                </Box>
                {branch.city && (
                  <Typography
                    variant="caption"
                    className="text-[var(--mui-palette-text-secondary)]"
                  >
                    {branch.city}
                  </Typography>
                )}
                {typeof branch.distanceKm === "number" && (
                  <Typography
                    variant="caption"
                    className="mt-1 text-[var(--mui-palette-info-main)]"
                  >
                    {branch.distanceKm.toFixed(1)} km away
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>
      )}
    </Card>
  );
};
