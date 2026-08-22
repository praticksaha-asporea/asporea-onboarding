"use client";

import React from "react";
import { Box, Card, CircularProgress, Typography, Chip } from "@mui/material";
import dayjs from "dayjs";
import { useLeadLogsCard } from "./useLeadLogsCard";
import { ILeadLogItem } from "@/Types/ApiResponse/leadLogRes.types";

const getActionTypeConfig = (type: string) => {
  switch (type) {
    case "STATUS_CHANGE":
      return { icon: "ri-pulse-line", color: "info" as const };
    case "RESCHEDULE_REQUEST":
      return { icon: "ri-calendar-event-line", color: "warning" as const };
    case "TRANSFER":
    case "TRANSFER_REQUESTED":
    case "TRANSFER_APPROVED":
      return { icon: "ri-user-shared-line", color: "secondary" as const };
    case "DOCUMENT_UPLOAD":
      return { icon: "ri-file-upload-line", color: "success" as const };
    case "FOLLOWUP_OVERDUE":
      return { icon: "ri-alarm-warning-line", color: "error" as const };
    default:
      return { icon: "ri-history-line", color: "default" as const };
  }
};

interface LeadLogsCardProps {
  leadId: string;
}

const LeadLogsCard: React.FC<LeadLogsCardProps> = ({ leadId }) => {
  const { logs, loading } = useLeadLogsCard(leadId);

  return (
    
    <Card className="p-5 rounded-xl shadow-2xl relative overflow-hidden bg-[var(--mui-palette-background)]">
      <Typography className="text-[16px] font-medium tracking-wide mb-4 flex text-[var(--mui-palette-primary)]
 items-center gap-2">
        <i className="ri-history-line text-[var(--mui-palette-primary-main)]" />
        Activity Logs
      </Typography>

     
      <Box className="max-h-[350px] overflow-y-auto overflow-x-hidden pr-2">
        {loading ? (
          <Box className="flex justify-center p-4">
            <CircularProgress size={24} />
          </Box>
        ) : logs.length === 0 ? (
          <Typography className="text-center text-[13px] text-[var(--mui-palette-text-secondary)] italic">
            No activity logs recorded yet.
          </Typography>
        ) : (
          <Box className="space-y-4 relative border-l-2 border-[var(--mui-palette-divider)] ml-3 pl-4">
            {logs.map((log: ILeadLogItem) => {
              const config = getActionTypeConfig(log.actionType);
              const actorName =
                log.triggeredBy === "USER" && log.actionBy
                  ? `${log.actionBy.firstName || ""} ${log.actionBy.lastName || ""}`.trim()
                  : "SYSTEM";

              return (
                <Box key={log._id} className="relative">
                
                  <Box className="absolute -left-[23px] top-2 w-3 h-3 rounded-full bg-[var(--mui-palette-primary-main)] shadow-xl " />

                  <Box className="bg-[var(--mui-palette-background-default)] p-6 rounded-lg  ">
                 <Box className="flex flex-col items-start gap-1 mb-2">
                      <Chip
                        icon={<i className={`${config.icon} text-[14px]`} />}
                        label={log.actionType.replace(/_/g, " ")}
                        size="small"
                        color={config.color}
                        className="text-[10px] font-bold h-[20px]"
                      />
                      <Typography className="text-[10px] mt-2 text-[var(--mui-palette-text-secondary)]">
                        {dayjs(log.createdAt).format("DD MMM YYYY, hh:mm A")}
                      </Typography>
                    </Box>
                    <Typography className="text-[13px] text-[var(--mui-palette-text-primary)] mt-1 font-medium">
                      {log.actionNote}
                    </Typography>

                    <Box className="flex items-center justify-between mt-2 pt-2  text-[11px] text-[var(--mui-palette-text-secondary)]">
                      <span>
                        By: <strong className="font-semibold">{actorName}</strong>
                      </span>

                      {log.eventDate && (
                        <span className="text-[var(--mui-palette-warning-main)] font-medium">
                          Scheduled: {dayjs(log.eventDate).format("DD MMM YYYY, hh:mm A")}
                        </span>
                      )}
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Card>
  );
};

export default LeadLogsCard;