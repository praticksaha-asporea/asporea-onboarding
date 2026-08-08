import React from "react";
import { Box, Card, CardContent, Stack, Typography, alpha, useTheme } from "@mui/material";
import type { kpiTypes } from "./useDashboardView";

type KpiColor = "primary" | "info" | "warning" | "error" | "success" | "secondary";

interface KpiCardConfig {
  title: string;
  value: number | string;
  desc: string;
  icon: string;
  color: KpiColor;
}

interface DashboardKpiCardsProps {
  kpis: kpiTypes;
  /** "tac" shows Escalations Raised, "foe" shows Unassigned Inquiries */
  variant?: "tac" | "foe";
}

const DashboardKpiCards: React.FC<DashboardKpiCardsProps> = ({ kpis, variant = "tac" }) => {
  const theme = useTheme();

  const sharedCards: KpiCardConfig[] = [
    {
      title: "Pending Pre-Counselling",
      value: kpis?.pendingCounselling ?? "—",
      desc: "Currently undergoing pre-counselling",
      icon: "ri-customer-service-2-line",
      color: "info",
    },
    {
      title: "Pending Assessments",
      value: kpis?.pendingAssessment ?? "—",
      desc: "Documents or experience checks",
      icon: "ri-file-list-3-line",
      color: "warning",
    },
    {
      title: "Open Cases",
      value: kpis?.openCases ?? "—",
      desc: "Candidates actively managed",
      icon: "ri-team-line",
      color: "primary",
    },
  ];

  const roleCard: KpiCardConfig =
    variant === "foe"
      ? {
        title: "Unassigned Inquiries",
        value: kpis?.unassignedInquiries ?? "—",
        desc: "Awaiting TAC assignment",
        icon: "ri-inbox-line",
        color: "secondary",
      }
      :
      {
        title: "Transfers Raised",
        value: "—",//kpis?.escalationsRaised
        desc: "Awaiting manager approval",
        icon: "ri-alarm-warning-line",
        color: "error",
      };

  const kpiCards: KpiCardConfig[] = [...sharedCards, roleCard];

  return (
    <>
      <Typography className="text-[16px] md:text-[19px] font-semibold mb-4">
        Key Performance Indicators
      </Typography>
      <Box className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8">
        {kpiCards.map((item, i) => {
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
              className="rounded-2xl h-full transition-all duration-300" //border border-gray-100 
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

                <Typography className="text-4xl md:text-5xl font-bold  text-[var(--mui-palette-dark-main)] mt-5 leading-none">
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
  );
};

export default DashboardKpiCards;