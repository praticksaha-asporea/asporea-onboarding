"use client";

import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import RemindersView from "./RemindersView"; 
import ReminderHistoryTable from "./ReminderHistoryTable";
import { useSelector } from "react-redux";
import type { RootState } from "@/Redux/store";
const ReminderContainer = () => {
  const [viewMode, setViewMode] = useState<"list" | "create">("list");
const currentUser = useSelector((state: RootState) => state.user.userData);
const currentUserId = currentUser?._id || currentUser?.id;
  return (
    <Box className="w-full p-4 md:p-6">
      <Box className="flex justify-between items-center mb-6">
        <Box>
          <Typography className="text-2xl font-medium text-[var(--mui-palette-text-primary)]">
            {viewMode === "list" ? "Sent Reminders History" : "Create Bulk Reminders"}
          </Typography>
          <Typography className="text-sm text-[var(--mui-palette-text-secondary)]">
            {viewMode === "list"
              ? "View, filter, inspect details, or delete sent reminder logs."
              : "Select candidates/TACs by status and broadcast instant notifications."}
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => setViewMode((prev) => (prev === "list" ? "create" : "list"))}
          startIcon={<i className={viewMode === "list" ? "ri-add-line" : "ri-history-line"} />}
          className="rounded-xl px-5 py-2.5 font-medium text-white bg-[var(--mui-palette-primary-main)] hover:bg-[var(--mui-palette-primary-dark)]"
        >
          {viewMode === "list" ? "Send Reminder" : "View Sent History"}
        </Button>
      </Box>


     {viewMode === "list" ? (
        <ReminderHistoryTable currentUserId={currentUserId} />
      ) : (
        <RemindersView />
      )}

    </Box>
  );
};

export default ReminderContainer;