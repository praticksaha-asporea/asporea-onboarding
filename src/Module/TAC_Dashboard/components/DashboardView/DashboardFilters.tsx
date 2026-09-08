"use client";
import React from "react";
import {
  Box,
  Button,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme,
  lighten,
} from "@mui/material";

interface DashboardFiltersProps {
  searchInput: string;
  setSearchInput: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  experienceFilter: string;
  setExperienceFilter: (val: string) => void;
  isFoe?: boolean;
  showCreateForm?: boolean;
  setShowCreateForm?: (val: boolean) => void;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  searchInput,
  setSearchInput,
  isFoe,
  statusFilter,
  setStatusFilter,
  experienceFilter,
  setExperienceFilter,
  showCreateForm,
  setShowCreateForm,
}) => {
  const theme = useTheme();
  const bgGradient = `linear-gradient(270deg, var(--mui-palette-primary-main), ${lighten(
    theme.palette.primary.main,
    0.5
  )} 100%)`;

  return (
    <>
      <Box className="flex justify-between items-center mb-4">
        <Typography className="text-[16px] md:text-[19px] font-bold">
          {showCreateForm ? "Create New Inquiry" : "Assigned Candidates"}
        </Typography>

        {isFoe && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowCreateForm?.(!showCreateForm)}
            startIcon={
              <i
                className={
                  showCreateForm ? "ri-dashboard-line" : "ri-user-add-line"
                }
              />
            }
            className="rounded-full px-6 normal-case font-medium shadow-md"
            style={{ background: bgGradient }}
          >
            {showCreateForm ? "Dashboard View" : "Create Inquiry"}
          </Button>
        )}
      </Box>

      {/* Form active hone par search aur filters clean hide ho jayenge */}
      {!showCreateForm && (
        <Box className="flex flex-col md:flex-row items-center gap-3 mb-6 w-full">
          <TextField
            fullWidth
            size="small"
            placeholder="Search by name, inquiry ID, email or phone..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "99px",
                boxShadow: "0 1px 6px rgba(32,33,36,0.12)",
                backgroundColor: "var(--mui-palette-background-paper)",
                transition: "all 0.2s ease-in-out",
                "& fieldset": {
                  border: "none",
                },
                "&:hover fieldset": {
                  border: "none",
                },
                "&.Mui-focused fieldset": {
                  border: "none",
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <i className="ri-search-line text-[var(--mui-palette-text-secondary)] ml-1 text-[17px]" />
                </InputAdornment>
              ),
            }}
          />
          <Box className="flex gap-3 w-full md:w-auto min-w-[320px]">
            {/* Status Filter */}
            <Select
              displayEmpty
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 text-[13px] font-medium"
              sx={{
                borderRadius: "99px",
                backgroundColor: "var(--mui-palette-background-paper)",
                boxShadow: "0 1px 6px rgba(32,33,36,0.12)",
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
              }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="inquiry_submitted">Inquiry Submitted</MenuItem>
              <MenuItem value="pre_scheduled">Pre-Counselling Scheduled</MenuItem>
              <MenuItem value="pre_completed">Pre-Counselling Completed</MenuItem>
              <MenuItem value="doc_submitted">Documents Submitted</MenuItem>
              <MenuItem value="exp_submitted">Experience Submitted</MenuItem>
              <MenuItem value="pre_not_responded">Pre Not Responded</MenuItem>
              <MenuItem value="assess_scheduled">Assessment Scheduled</MenuItem>
            </Select>

            {/* Experience Filter */}
            <Select
              displayEmpty
              size="small"
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
              className="flex-1 min-w-[130px] text-[12px]"
              sx={{
                borderRadius: "99px",
                backgroundColor: "var(--mui-palette-background-paper)",
                boxShadow: "0 1px 6px rgba(32,33,36,0.12)",
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
              }}
            >
              <MenuItem value="">All Experience</MenuItem>
              <MenuItem value="fresher">Fresher</MenuItem>
              <MenuItem value="domestic">Domestic</MenuItem>
              <MenuItem value="abroad">Abroad</MenuItem>
              <MenuItem value="free">Freelance</MenuItem>
            </Select>
          </Box>
        </Box>
      )}
    </>
  );
};

export default DashboardFilters;