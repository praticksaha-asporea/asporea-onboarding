"use client";

import React from "react";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  IconButton,
  TextField,
  Typography,
  Avatar,
  Divider,
} from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useLeadNotesCard } from "./useLeadNotesCard";

dayjs.extend(relativeTime);
const resolveFileSrc = (path?: string) => {
  if (!path || path.trim() === "") return undefined;
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:")
  )
    return path;

  const BACKEND_BASE =
    process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://localhost:3000";
  return `${BACKEND_BASE}${path.startsWith("/") ? path : `/${path}`}`;
};
interface LeadNotesCardProps {
  leadId: string;
}

const LeadNotesCard: React.FC<LeadNotesCardProps> = ({ leadId }) => {
  const {
    notes,
    loading,
    newNote,
    setNewNote,
    submitting,
    currentUserId,
    handleAddNote,
    handleDeleteNote,
  } = useLeadNotesCard(leadId);

  return (
    <Card className="p-5 mt-6 rounded-xl shadow-2xl bg-[var(--mui-palette-background-default)] sticky top-6 max-h-[calc(110vh-120px)] overflow-y-auto">
      <Typography
        className="text-[17px] font-medium text-[var(--mui-palette-primary)]
 mb-4 flex items-center gap-2"
      >
        <i className="ri-sticky-note-line text-[var(--mui-palette-primary-main)]" />
        Notes
      </Typography>

      <Box className="mb-4">
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Add a new note..."
          variant="outlined"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          size="small"
          InputProps={{ className: "text-[14px]" }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
            },
          }}
        />
        <Box className="flex justify-end mt-3">
          <Button
            variant="contained"
            size="small"
            disabled={submitting || !newNote.trim()}
            onClick={handleAddNote}
            className="normal-case rounded-lg shadow-md"
          >
            {submitting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Save Note"
            )}
          </Button>
        </Box>
      </Box>

     

   <Box
  className="w-fit max-w-full max-h-[300px] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden bg-[var(--mui-palette-background-default)] rounded-xl shadow-2xl divide-y divide-[var(--mui-palette-divider)]"
  sx={{
    '&::-webkit-scrollbar': { display: 'none' },
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
  }}
>
  {loading ? (
    <Box className="flex justify-center p-4">
      <CircularProgress size={24} />
    </Box>
  ) : notes.length === 0 ? (
    <Typography className="text-center text-[13px] text-[var(--mui-palette-text-secondary)] italic p-4">
      No notes added yet.
    </Typography>
  ) : (
    notes.map((note) => {
      const authorId = note.authorId?._id || note.authorId;
      const isAuthor = String(currentUserId) === String(authorId);
      const avatarSrc = resolveFileSrc(note.authorId?.profilePic?.path);
      return (
        <Box
          key={note._id}
          className="p-3.5 relative group hover:bg-[var(--mui-palette-action-hover)] transition-colors"
        >
          <Box className="flex justify-between items-start mb-1 gap-4">
            <Box className="flex items-center gap-2">
              <Avatar
                sx={{ width: 24, height: 24, fontSize: 11 }}
                className="bg-[var(--mui-palette-primary-main)]"
                src={avatarSrc}
              >
                {note.authorId?.firstName?.charAt(0) || "U"}
              </Avatar>
              <Box>
                <Typography className="text-[13px] font-semibold whitespace-nowrap">
                  {note.authorId?.firstName || "User"}{" "}
                  {note.authorId?.lastName || ""}
                </Typography>
                <Typography className="text-[10px] text-[var(--mui-palette-text-secondary)] whitespace-nowrap">
                  {dayjs(note.createdAt).format("DD MMM YYYY, hh:mm A")}
                </Typography>
              </Box>
            </Box>
            {isAuthor && (
              <IconButton
                size="small"
                onClick={() => handleDeleteNote(note._id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-red-500"
              >
                <i className="ri-delete-bin-line text-[14px]" />
              </IconButton>
            )}
          </Box>
          <Typography className="text-[13px] text-[var(--mui-palette-text-primary)] whitespace-pre-wrap mt-2">
            {note.note}
          </Typography>
        </Box>
      );
    })
  )}
</Box>
    </Card>
  );
};

export default LeadNotesCard;
