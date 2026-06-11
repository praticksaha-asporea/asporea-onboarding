import React from "react";
import { Box, MenuItem, Select, TextField, Typography } from "@mui/material";

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

      <Box className="flex flex-col  gap-3 mb-5">
        <TextField
          fullWidth
          size="small"
          placeholder="Search by name, inquiry ID, email or phone..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          slotProps={{ input: { className: "rounded-lg text-[14px]" } }}
        />
        <Box className="flex gap-2 flex-wrap">
          <Select
            displayEmpty
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 min-w-[140px] text-[12px]"
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="inquiry_submitted">Inquiry Submitted</MenuItem>
            <MenuItem value="pre_scheduled">Pre-Counselling Scheduled</MenuItem>
            <MenuItem value="doc_submitted">Documents Submitted</MenuItem>
            <MenuItem value="exp_submitted">Experience Submitted</MenuItem>
            <MenuItem value="pre_not_responded">Pre Not Responded</MenuItem>
            <MenuItem value="assessment_submitted">Assessment Submitted</MenuItem>
          </Select>
          <Select
            displayEmpty
            size="small"
            value={experienceFilter}
            onChange={(e) => setExperienceFilter(e.target.value)}
            className="flex-1 min-w-[130px] text-[12px]"
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