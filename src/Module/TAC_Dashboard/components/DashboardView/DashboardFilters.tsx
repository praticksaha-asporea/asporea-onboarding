import React from "react";
import { Box, InputAdornment, MenuItem, Select, TextField, Typography } from "@mui/material";

interface DashboardFiltersProps {
  searchInput: string;
  setSearchInput: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  experienceFilter: string;
  setExperienceFilter: (val: string) => void;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  searchInput, setSearchInput, statusFilter, setStatusFilter, experienceFilter, setExperienceFilter
}) => {
  return (
    <>
      <Typography className="text-[16px] md:text-[19px] font-bold mb-4">
        Assigned Candidates
      </Typography>
<Box className="flex flex-col md:flex-row items-center gap-3 mb-6 w-full">
        {/* 1. Google-Style Borderless Search Bar */}
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
    </>
  );
};

export default DashboardFilters;