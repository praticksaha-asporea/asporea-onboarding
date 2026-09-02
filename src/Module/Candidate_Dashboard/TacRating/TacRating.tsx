"use client";

import React from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Avatar,
  CircularProgress,
  Skeleton,
  useTheme,
  lighten
} from "@mui/material";
import type { Mode } from "@core/types";
import { useTacRating } from "./useTacRating";

const EmojiVeryBad = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full emoji-angry">
    <circle cx="12" cy="12" r="10" fill="#FFCA28" />
    <path d="M7 15.5C8.5 14 11.5 14 13 15.5" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="8.5" cy="10.5" r="1.5" fill="#333333" />
    <circle cx="15.5" cy="10.5" r="1.5" fill="#333333" />
    <path d="M6 9L9.5 10.5" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M18 9L14.5 10.5" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const EmojiBad = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full emoji-sad">
    <circle cx="12" cy="12" r="10" fill="#FFCA28" />
    <path d="M8 15.5C9.5 14 12.5 14 14 15.5" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="8.5" cy="9.5" r="1.5" fill="#333333" />
    <circle cx="15.5" cy="9.5" r="1.5" fill="#333333" />
  </svg>
);

const EmojiNeutral = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full emoji-neutral">
    <circle cx="12" cy="12" r="10" fill="#FFCA28" />
    <path d="M8 15H16" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="8.5" cy="9.5" r="1.5" fill="#333333" />
    <circle cx="15.5" cy="9.5" r="1.5" fill="#333333" />
  </svg>
);

const EmojiGood = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full emoji-happy">
    <circle cx="12" cy="12" r="10" fill="#FFCA28" />
    <path d="M8 14C9.5 16 12.5 16 14 14" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="8.5" cy="9.5" r="1.5" fill="#333333" />
    <circle cx="15.5" cy="9.5" r="1.5" fill="#333333" />
  </svg>
);

const EmojiExcellent = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full emoji-heart">
    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="#EF4444" />
  </svg>
);

const REACTIONS = [
  { value: 1, label: "Very Bad", Icon: EmojiVeryBad },
  { value: 2, label: "Bad", Icon: EmojiBad },
  { value: 3, label: "Neutral", Icon: EmojiNeutral },
  { value: 4, label: "Good", Icon: EmojiGood },
  { value: 5, label: "Excellent", Icon: EmojiExcellent },
];

const TacRating = ({ mode }: { mode: Mode }) => {
  const theme = useTheme();
  const headerGradient = `linear-gradient(270deg, var(--mui-palette-primary-main), ${lighten(theme.palette.primary.main, 0.5)} 100%)`;

  const {
    rating,
    setRating,
    hover,
    setHover,
    review,
    setReview,
    handleSubmit,
    loading,
    tacDetails
  } = useTacRating();

  const currentLabel = REACTIONS.find(r => r.value === (hover || rating))?.label || "";

  return (
    <Box className="flex flex-col justify-center items-center min-h-[100dvh] relative p-4 md:p-6 bg-[var(--mui-palette-primary)]">
      <Card className="flex flex-col w-full max-w-[600px] bg-[var(--mui-palette-primary)] shadow-2xl rounded-[24px] overflow-hidden">
        
        {/* 🌟 GRADIENT HEADER */}
        <Box 
          className="px-6 py-4 flex justify-center items-center"
          style={{ background: headerGradient }}
        >
          <Typography variant="h5" fontWeight="600" className="text-white text-[20px]">
            Feedback
          </Typography>
        </Box>

        <CardContent className="p-8 sm:!p-10 flex flex-col gap-8">
          {/* TAC Info Card with Skeleton */}
          <Box className="flex items-center gap-4 p-4 bg-[var(--mui-palette-primary)] rounded-[16px]">
            {!tacDetails?.assignedTo ? (
              <>
                <Skeleton variant="circular" width={56} height={56} />
                <Box className="flex-1 flex flex-col gap-1">
                  <Skeleton variant="text" width={160} height={28} />
                  <Skeleton variant="text" width={120} height={20} />
                </Box>
              </>
            ) : (
              <>
                <Avatar
                  src="/images/avatars/avatar.png"
                  alt={tacDetails?.assignedTo?.firstName}
                  sx={{ bgcolor: 'var(--mui-palette-primary-main)', width: 56, height: 56, fontSize: '1.25rem', fontWeight: 'bold' }}
                >
                  {(tacDetails?.assignedTo?.firstName?.charAt(0) || '') + (tacDetails?.assignedTo?.lastName?.charAt(0) || '')}
                </Avatar>
                <Box className="text-left flex-1">
                  <Typography variant="subtitle1" fontWeight="700" className="text-[var(--mui-palette-text-primary)] text-lg">
                    {(tacDetails?.assignedTo?.firstName || '') + ' ' + (tacDetails?.assignedTo?.lastName || '')}
                  </Typography>
                  <Typography variant="caption" fontWeight="600" className="text-[var(--mui-palette-text-secondary)] uppercase tracking-wider">
                    Consultant • {tacDetails?.phase === 'pre'
                      ? "Pre-Counselling" :
                      tacDetails?.phase === 'assess'
                        ? "Assessment"
                        : ""} Phase
                  </Typography>
                </Box>
              </>
            )}
          </Box>

          <form noValidate autoComplete="off" onSubmit={handleSubmit} className="flex flex-col gap-10">
            {/* 1. Emoji Rating Section */}
            <Box className="flex flex-col gap-5">
              <Box className="flex justify-between items-end">
                {!tacDetails ? (
                  <Skeleton variant="text" width={220} height={24} />
                ) : (
                  <Typography variant="subtitle1" fontWeight="600" className="text-[var(--mui-palette-text-primary)]">
                    What do you think of our {tacDetails?.phase === 'pre'
                      ? "Pre-Counselling" :
                      tacDetails?.phase === 'assess'
                        ? "Assessment"
                        : ""} phase?
                  </Typography>
                )}
                <Typography variant="caption" className="text-[var(--mui-palette-error-main)] font-semibold mb-0.5">
                  Required *
                </Typography>
              </Box>

              <Box className="flex flex-col items-center gap-3 bg-[var(--mui-palette-primary)] p-6 rounded-[20px]">
                <Box className="flex justify-between w-full max-w-[400px]">
                  {REACTIONS.map((reaction) => {
                    const isActive = rating === reaction.value;
                    const isHovered = hover === reaction.value;
                    const isMuted = (hover || rating) && !isActive && !isHovered;

                    return (
                      <button
                        type="button"
                        key={reaction.value}
                        className="relative bg-transparent mt-5 border-none p-0 cursor-pointer focus:outline-none flex justify-center items-center"
                        onClick={() => setRating(reaction.value)}
                        onMouseEnter={() => setHover(reaction.value)}
                        onMouseLeave={() => setHover(0)}
                        style={{
                          width: '68px',
                          height: '68px',
                          transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1), opacity 200ms ease',
                          transform: (isActive || isHovered) ? 'scale(1.2)' : 'scale(1)',
                          opacity: isMuted ? 0.4 : 1,
                        }}
                      >
                        <Box
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: isActive ? 'var(--mui-palette-primary-main)' : 'transparent',
                            opacity: isActive ? 0.1 : 0,
                            transform: 'scale(1.3)',
                            transition: 'all 200ms ease',
                          }}
                        />
                        <Box className="relative w-12 h-12 z-10">
                          <reaction.Icon />
                        </Box>
                      </button>
                    );
                  })}
                </Box>

                <Box className="h-6 mt-2 flex items-center justify-center">
                  <Typography
                    variant="caption"
                    fontWeight="700"
                    className="uppercase tracking-widest text-[var(--mui-palette-text-secondary)] transition-opacity duration-200"
                    style={{ opacity: currentLabel ? 1 : 0 }}
                  >
                    {currentLabel || "Select a rating"}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* 2. Review Textarea Section */}
            <Box className="flex flex-col gap-4">
              <Box className="flex justify-between items-end">
                <Typography variant="subtitle1" fontWeight="500" className="text-[var(--mui-palette-text-primary)]">
                  What would you like to share with us?
                </Typography>
                <Typography variant="caption" className="text-[var(--mui-palette-text-primary)] font-medium mb-0.5">
                  Optional
                </Typography>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={4}
                id="review"
                name="review"
                label="Share details of your experience..."
                variant="outlined"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '16px',
                    backgroundColor: 'var(--mui-palette-action-hover)',
                    transition: 'background-color 200ms ease',
                    '&:hover, &.Mui-focused': {
                      backgroundColor: 'var(--mui-palette-background-paper)',
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: 'var(--mui-palette-text-secondary)',
                  }
                }}
              />
            </Box>

            {/* Submit Button */}
            <Box className="flex justify-end">
              <Button
                variant="contained"
                type="submit"
                size="large"
                disabled={rating === 0 || loading}
                className="rounded-[12px] px-8 py-3 font-bold text-base shadow-none hover:shadow-lg transition-shadow bg-[var(--mui-palette-primary-main)] text-[var(--mui-palette-primary-contrastText)] disabled:bg-[var(--mui-palette-action-disabledBackground)] disabled:text-[var(--mui-palette-text-disabled)]"
                disableElevation
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Submit Feedback"}
              </Button>
            </Box>

          </form>
        </CardContent>
      </Card>

      {/* 🟢 LIVE ANIMATION CSS KEYFRAMES */}
      <style jsx global>{`
        /* EMOJI ANIMATIONS */
        .emoji-angry { animation: shake 3s infinite ease-in-out; }
        .emoji-sad { animation: sway 4s infinite ease-in-out; }
        .emoji-neutral { animation: float 4s infinite ease-in-out; }
        .emoji-happy { animation: bounce-slight 3s infinite ease-in-out; }
        .emoji-heart { animation: heartbeat 1.5s infinite ease-in-out; }

        /* KEYFRAMES */
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          10%, 30%, 50%, 70%, 90% { transform: rotate(-3deg); }
          20%, 40%, 60%, 80% { transform: rotate(3deg); }
        }
        @keyframes sway {
          0%, 100% { transform: rotate(0deg) translateY(0); }
          25% { transform: rotate(-3deg) translateY(1px); }
          75% { transform: rotate(3deg) translateY(-1px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes bounce-slight {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          15% { transform: scale(1.1); }
          30% { transform: scale(1); }
          45% { transform: scale(1.1); }
          60% { transform: scale(1); }
        }

        /* CUSTOM SCROLLBAR */
        .custom-scrollbar::-webkit-scrollbar { height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: var(--mui-palette-divider);
          border-radius: 4px;
        }
      `}</style>
    </Box>
  );
};

export default TacRating;