import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { kpiTypes } from "./useDashboardView";

interface DashboardKpiCardsProps {
  kpis: kpiTypes;
  total: number;
}

const DashboardKpiCards: React.FC<DashboardKpiCardsProps> = ({ kpis, total }) => {
  const kpiCards = [
    { title: "Open Cases", value: kpis?.openCases ?? "—", desc: "Candidates actively managed" },
    { title: "Pending Pre-Counselling", value: kpis?.pendingCounselling ?? "—", desc: "Currently undergoing pre-counselling" },
    { title: "Pending Assessments", value: kpis?.pendingAssessment ?? "—", desc: "Documents or experience checks" },
    { title: "Total Assigned", value: total, desc: "All assigned candidates" },
  ];

  return (
    <>
      <Typography className="text-[16px] md:text-[19px] font-semibold mb-4">
        Key Performance Indicators
      </Typography>
      <Box className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8">
        {kpiCards.map((item, i) => (
          <Card key={i} className="rounded-xl  bg-[var(--mui-palette-primary)] shadow-2xl">
            <CardContent className="p-3 md:p-5">
              <Typography className="text-[11px] md:text-[13px] font-semibold mb-1 md:mb-3 leading-tight">
                {item.title}
              </Typography>
              <Typography className="text-[26px] md:text-[36px] font-bold leading-none mb-1">
                {item.value}
              </Typography>
              <Typography className="text-[10px] md:text-[12px] text-gray-500 hidden sm:block">
                {item.desc}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </>
  );
};

export default DashboardKpiCards;