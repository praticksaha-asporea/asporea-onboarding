"use client";

import React from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { useTacHeadDashboard } from "./useTacHeadDashboard";
import { formatDistanceToNow } from "date-fns";
import { CamelCase } from "@/Utils/common";
import { useRouter } from "next/navigation";
import { TacHeadDashData, teamOverview } from "@/Types/ApiResponse/tacHeaddashboard.types";
import { technicalRequestedLeadRecord } from "@/Types/ApiResponse/technicalRes.types";
import { transferRecord } from "@/Types/ApiResponse/transferRes.types";

// ---- Mock data — TODO: replace with API calls ----


const transferStatusColor: Record<string, "success" | "warning" | "error"> = {
  approved: "success",
  requested: "warning",
  rejected: "error",
};

const TacHeadDashboard: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  // escalations,
  const { kpiCards, technicalReviews, teamOverview, resolveFileSrc } = useTacHeadDashboard();
  return (
    <Box>
      <Typography className="text-2xl md:text-3xl font-semibold mb-1 text-[var(--mui-paletter-text-primary)]">
        Dashboard
      </Typography>
      <Typography className="text-sm text-gray-500 mb-6">
        Escalations, document sign-offs, and technical reviews across your team.
      </Typography>

      <>
        <Typography className="text-[16px] md:text-[19px] font-semibold mb-4">
          Key Performance Indicators
        </Typography>
        <Box className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8">
          {kpiCards?.map((item, i) => {
            const mainColor = theme.palette[item.color].main;

            return (
              <Card
                key={i}
                elevation={0}
                sx={{
                  borderLeft: `4px solid ${mainColor}`,
                  "&:hover": {
                    boxShadow: theme.shadows[6],
                    transform: "translateY(-2px)",
                  },
                }}
                className="rounded-2xl border border-gray-100 h-full transition-all duration-300"
              >
                <CardContent sx={{ minHeight: 176 }} className="flex flex-col h-full p-5">
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Box
                      sx={{
                        bgcolor: alpha(mainColor, 0.12),
                        color: mainColor,
                      }}
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    >
                      <i className={item.icon} style={{ fontSize: 22, lineHeight: 1 }} />
                    </Box>

                    <Typography
                      className="font-semibold leading-6 text-[var(--mui-palette-secondary-main)]"
                      sx={{ pt: 0.5 }}
                    >
                      {item.title}
                    </Typography>
                  </Stack>

                  <Typography className="text-4xl md:text-5xl font-bold text-[var(--mui-palette-secondary-dark)] mt-5 leading-none">
                    {item.value}
                  </Typography>

                  <Typography className="text-sm text-gray-500 mt-auto leading-6" sx={{ pt: 2 }}>
                    {item.desc}
                  </Typography>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </>

      <Box className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6">
        {/* <Card
          elevation={0}
          className="lg:col-span-2 rounded-2xl border border-gray-100 shadow-md h-full"
        >
          <CardContent className="p-5">
            <Stack direction="row" alignItems="center" justifyContent="space-between" className="mb-4">
              <Typography className="text-[16px] font-semibold">Recent Escalations</Typography>
              <Button size="small" href="/tac-head/escalations">
                View all
              </Button>
            </Stack>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell className="!text-gray-400 !font-semibold">Candidate</TableCell>
                  <TableCell className="!text-gray-400 !font-semibold">From → To</TableCell>
                  <TableCell className="!text-gray-400 !font-semibold">Status</TableCell>
                  <TableCell className="!text-gray-400 !font-semibold">Date</TableCell>
                  <TableCell className="!text-gray-400 !font-semibold" align="right">
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {escalations?.map((e: transferRecord) => (
                  <TableRow key={e._id}>
                    <TableCell>
                      <Typography className="text-sm font-medium text-gray-700">{e.leadId?.fullName}</Typography>
                      <Typography className="text-xs text-gray-400">{e.leadId?.inqNo}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography className="text-sm text-gray-500">
                        {e.fromId?.firstName} {e.fromId?.lastName} → {e.toId?.firstName} {e.toId?.lastName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={CamelCase(e.status)}
                        size="small"
                        color={transferStatusColor[e.status] ?? "default"}
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography className="text-sm text-gray-400">{formatDistanceToNow(new Date(e.createdAt), { addSuffix: true })}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant={e.status === "requested" ? "contained" : "outlined"}
                        disabled={e.status !== "requested"}
                        onClick={() => { router.push('/tac-head/escalations') }}
                      >
                        {e.status === "requested" ? "Review" : "Reviewed"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card> */}

        {/* Right column */}
        <Stack spacing={3}>
          {/* Technical Reviews Pending */}
          <Card elevation={0} className="rounded-2xl border border-gray-100 shadow-md">
            <CardContent className="p-5">
              <Typography className="text-[16px] font-semibold mb-4">Technical Reviews Pending</Typography>
              {technicalReviews?.length === 0 ? (
                <Typography className="text-sm text-gray-400">Nothing referred for review.</Typography>
              ) : (
                <Stack spacing={2}>
                  {technicalReviews?.map((t: technicalRequestedLeadRecord) => (
                    <Stack
                      key={t._id}
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      className="border border-gray-100 rounded-xl p-3"
                    >
                      <Box>
                        <Typography className="text-sm font-medium text-gray-700">{t.fullName}</Typography>
                        <Typography className="text-xs text-gray-400">
                          {t.inqNo} &middot; {t.preferences?.consultantId?.firstName} {t.preferences?.consultantId?.lastName}
                        </Typography>
                      </Box>
                      <Chip label={CamelCase(t?.technical?.status as keyof technicalRequestedLeadRecord)} size="small" color="warning" sx={{ fontWeight: 600 }} />
                    </Stack>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>

          {/* Team Overview */}
          <Card elevation={0} className="rounded-2xl border border-gray-100 shadow-md">
            <CardContent className="p-5">
              <Typography className="text-[16px] font-semibold mb-1">Team Overview</Typography>
              <Typography className="text-sm text-gray-400 mb-4">Active cases per TAC</Typography>

              <Stack spacing={3}>
                {teamOverview?.map((t: teamOverview) => {
                  return (
                    <Box key={t.assignedTo}>
                      <Stack direction="row" alignItems="center" spacing={1.5} className="mb-1.5">
                        <Avatar
                          src={resolveFileSrc(t?.profilePic)}
                          sx={{ width: 28, height: 28 }}
                          className="shadow-sm"
                        />
                        <Typography className="text-sm font-medium text-gray-700 flex-1">
                          {t.firstName} {t.lastName}
                        </Typography>
                        <Typography className="text-sm font-semibold text-gray-600">
                          {t.totalAssignments}
                        </Typography>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Box>
  );
};

export default TacHeadDashboard;