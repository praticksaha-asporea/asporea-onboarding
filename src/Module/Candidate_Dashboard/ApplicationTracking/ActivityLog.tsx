"use client";

import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import ButtonBase from "@mui/material/ButtonBase";
import CircularProgress from "@mui/material/CircularProgress";
import { useActivityLog } from "./useActivityLog";
import { IActivityLog } from "@/Types/Frontend_Payload/leadLog.types";
import { capitalize } from "@mui/material";


interface ActivityLogProps {
    logs?: IActivityLog[];
    leadId?: string;
    loading?: boolean;
}

const formatDate = (date?: string | Date) => {
    if (!date) return "";

    return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const ActivityLog = ({ leadId }: ActivityLogProps) => {
    const { logs, loading, loadingMore, hasMore, loadMore, currentUserId } =
        useActivityLog(leadId);
    console.log(logs, 47111);


    if (loading) {
        return (
            <Card className="w-full max-w-[900px] p-6 md:p-8 rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] mt-6">
                <Typography variant="h5" className="font-medium mb-4">
                    Activity Log
                </Typography>
                <Typography variant="body2" className="text-gray-400">
                    Loading activity...
                </Typography>
            </Card>
        );
    }

    if (!logs || logs.length === 0) {
        return null;
    }

    return (
        <Card className="w-full max-w-[900px] p-6 md:p-8 rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] mt-6">
            <Typography variant="h5" className="font-medium mb-5">
                Activity Log
            </Typography>

            <Box className="relative pl-6">
                {logs?.map((log, index) => (
                    <Box
                        key={log._id ?? `${log.actionType}-${index}`}
                        className="relative pb-6 last:pb-0"
                    >
                        {index !== logs.length - 1 && (
                            <Box className="absolute left-[-17px] top-[18px] bottom-0 w-[2px] bg-gray-200" />
                        )}

                        <Box
                            className="absolute left-[-22px] top-1 w-3 h-3 rounded-full border-2 bg-white"
                            style={{
                                borderColor:
                                    log.triggeredBy === "SYSTEM" ? "#9155FD" : "#28C76F",
                            }}
                        />

                        <Box className="flex flex-wrap items-center gap-2 mb-1">
                            <Typography variant="subtitle1" className="font-medium">
                                {/* {log.actionType} */}
                                {log.actionType.replace(/_/g, " ")}
                            </Typography>
                            <Chip
                                size="small"
                                label={log.triggeredBy === "USER" && log.actionBy
                                    ? Boolean(
                                        currentUserId === log.actionBy._id
                                    )
                                        ? "You"
                                        : `${capitalize(log?.actionBy?.role) || ""} : ${log?.actionBy?.firstName || ""} ${log?.actionBy?.lastName || ""}`.trim()
                                    : "SYSTEM"}
                                className={
                                    log.triggeredBy === "SYSTEM"
                                        ? "bg-[#9155FD1A] text-[#9155FD]"
                                        : "bg-[#28C76F1A] text-[#28C76F]"
                                }
                            />
                        </Box>

                        {log.actionNote && (
                            <Typography variant="body2" className="text-gray-600 mb-1">
                                {log.actionNote}
                            </Typography>
                        )}

                        <Typography variant="caption" className="text-gray-400">
                            {formatDate(log.eventDate || log.createdAt)}
                            {log.actionByName ? ` • ${log.actionByName}` : ""}
                        </Typography>
                    </Box>
                ))}
            </Box>

            {hasMore && (
                <>
                    <Divider className="my-2" />
                    <Box className="flex justify-center">
                        <ButtonBase
                            onClick={loadMore}
                            disabled={loadingMore}
                            className="px-3 py-1.5 rounded-lg flex items-center gap-2 disabled:opacity-60"
                        >
                            {loadingMore && <CircularProgress size={14} />}
                            <Typography
                                variant="body2"
                                className="text-[var(--mui-palette-primary-main)] font-medium"
                            >
                                {loadingMore ? "Loading..." : "Load More"}
                            </Typography>
                        </ButtonBase>
                    </Box>
                </>
            )}
        </Card>
    );
};

export default ActivityLog;