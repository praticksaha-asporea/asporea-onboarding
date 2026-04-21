import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

interface DashboardProps {
  setCurrentView: (view: "dashboard" | "detail" | "assessment") => void;
  setSelectedCandidate: (candidate: any) => void;
}

const DashboardView: React.FC<DashboardProps> = ({
  setCurrentView,
  setSelectedCandidate,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const candidates = [
    {
      name: "Alina Smith",
      id: "ASP-INQ-2154",
      stage: "Inquired",
      token: "Yes",
      status: "Waiting For Pre-Counselling",
      time: "2 hours ago",
    },
    {
      name: "John Smith",
      id: "ASP-INQ-2155",
      stage: "Inquired",
      token: "No",
      status: "Pre-Counselling Scheduled",
      time: "1 day ago",
    },
    {
      name: "David Jackson",
      id: "ASP-INQ-2156",
      stage: "Inquired",
      token: "No",
      status: "Counselled",
      time: "3 days ago",
    },
    {
      name: "Brian Taylor",
      id: "ASP-INQ-2157",
      stage: "Document Upload",
      token: "No",
      status: "Counselled",
      time: "5 days ago",
    },
    {
      name: "Jacob Martinez",
      id: "ASP-INQ-2158",
      stage: "Experience",
      token: "No",
      status: "Counselled",
      time: "1 week ago",
    },
    {
      name: "Anthony Moore",
      id: "ASP-INQ-2159",
      stage: "Assessment",
      token: "Yes",
      status: "Waiting For Assessment",
      time: "2 days ago",
    },
  ];

  const filteredCandidates = candidates.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getBadgeStyle = (status: string) => {
    switch (status) {
      case "Waiting For Pre-Counselling":
        return "bg-blue-100 text-blue-600";
      case "Pre-Counselling Scheduled":
        return "bg-blue-200 text-blue-700";
      case "Counselled":
        return "bg-green-500 text-white";
      case "Waiting For Assessment":
        return "bg-blue-100 text-blue-600";
      case "Document Verified":
        return "bg-green-500 text-white";
      case "Experience Verified":
        return "bg-orange-400 text-white";
      case "Assessed":
        return "bg-green-500 text-white";
      case "Technical Round":
        return "bg-gray-800 text-white";
      case "Documents Rejected":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <Box className="w-full rounded-[20px] shadow-[0px_4px_18px_rgba(0,0,0,0.04)] border border-gray-200 p-6 md:p-8 font-sans text-gray-900">
      {/* HEADER */}
      <Box className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <Typography className="text-[28px] font-medium tracking-tight">
          TAC Assignment Dashboard
        </Typography>
      </Box>

      {/* KPI */}
      <Typography className="text-[19px] font-semibold mb-5">
        Key Performance Indicators
      </Typography>

      <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          {
            title: "Open Cases",
            value: 7,
            desc: "Candidates actively managed",
          },
          {
            title: "Pending Pre-Counselling",
            value: 4,
            desc: "Currently undergoing pre-counselling",
          },
          {
            title: "Pending Assessments",
            value: 3,
            desc: "Documents or experience checks",
          },
          {
            title: "Upcoming Counselling",
            value: 1,
            desc: "Scheduled sessions this week",
          },
        ].map((item, i) => (
          <Card key={i} className="rounded-xl border border-gray-200 shadow-sm">
            <CardContent className="p-5 flex flex-col justify-between">
              <Typography className="text-[13px] font-semibold mb-3">
                {item.title}
              </Typography>
              <Typography className="text-[36px] font-bold leading-none mb-2">
                {item.value}
              </Typography>
              <Typography className="text-[12px]">{item.desc}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* TITLE */}
      <Typography className="text-[19px] font-bold mb-5">
        Assigned Candidates
      </Typography>

      {/* SEARCH + FILTER */}
      <Box className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <TextField
          fullWidth
          placeholder="Search candidate by name/ inquiry id..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:w-[400px]"
          InputProps={{ className: "rounded-lg text-[14px]" }}
        />

        <Box className="flex gap-3 w-full md:w-auto">
          <Select
            displayEmpty
            className="w-full md:w-auto text-[12px] rounded-lg"
          >
            <MenuItem value="">Filter by Stage</MenuItem>
          </Select>
          <Select
            displayEmpty
            className="w-full md:w-auto text-[12px] rounded-lg"
          >
            <MenuItem value="">Filter by Experience</MenuItem>
          </Select>
        </Box>
      </Box>

      {/* TABLE */}
      <Box className="overflow-x-auto w-full border-gray-200 pt-2">
        <TableContainer
          component={Paper}
          className="mt-2 shadow-none border border-gray-200"
        >
          <Table size="small">
            <TableHead>
              <TableRow className="">
                {[
                  "Candidate Name",
                  "Application Stage",
                  "Token",
                  "Status",
                  "Last Activity",
                  "Actions",
                ].map((head, i) => (
                  <TableCell
                    key={i}
                    className={`py-4 px-4 font-semibold border-b border-gray-200 text-[var(--mui-palette-secondary-main)] ${
                      head === "Status" ? "text-center" : ""
                    } ${head === "Actions" ? "text-right" : ""}`}
                  >
                    {head}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredCandidates.map((candidate, index) => (
                <TableRow
                  key={index}
                  hover
                  onClick={() => {
                    setSelectedCandidate(candidate);
                    setCurrentView("detail");
                  }}
                  className="cursor-pointer"
                >
                  <TableCell className="!py-3 !px-4">
                    <Typography className="font-semibold text-[13px]">
                      {candidate.name}
                    </Typography>
                    <Typography className="text-[12px] text-gray-500">
                      {candidate.id}
                    </Typography>
                  </TableCell>
                  <TableCell className="!py-3 !px-4">
                    {candidate.stage}
                  </TableCell>
                  <TableCell className="!py-3 !px-4">
                    {candidate.token}
                  </TableCell>
                  <TableCell className="!py-3 !px-4 text-center">
                    <Box
                      className={`inline-block px-3 py-1.5 rounded-full text-[12px] font-semibold ${getBadgeStyle(candidate.status)}`}
                    >
                      {candidate.status}
                    </Box>
                  </TableCell>
                  <TableCell className="!py-3 !px-4 text-[13px]">
                    {candidate.time}
                  </TableCell>
                  <TableCell className="!py-3 !px-4">
                    <Box className="flex justify-end gap-2">
                      <IconButton size="small">
                        <i className="material-symbols-light--chat-bubble-outline" />
                      </IconButton>
                      <IconButton size="small">
                        <i className="material-symbols-light--mail-outline" />
                      </IconButton>
                      <IconButton size="small">
                        <i className="mdi--user" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default DashboardView;
