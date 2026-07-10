"use client";

import { Box, Typography, Chip, Grid, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useTokenQueue } from "./useTokenQueue";
import { Mode } from "@/@core/types";
import Image from "next/image";

const TokenQueueDisplay = ({ mode }: { mode: Mode }) => {
  const { counters, currentTime, branches, tokenBranch, handleBranchChange, getMeta, fallbackMeta } = useTokenQueue({ mode });
  return (
    <Box
      className="min-h-screen w-full flex flex-col"
      sx={{
        background:
          "linear-gradient(160deg, #0f172a 0%, #1e1b4b 40%, #0f172a 100%)",
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <Box
        className="w-full py-4 px-6 flex items-center justify-between"
        sx={{
          background: "rgba(255,255,255,.04)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,.08)",
        }}
      >
        <Image
          src={`/images/static/logo-dark.svg`}
          alt="Logo"
          width={270}
          height={75}
          priority
        />
        <Typography
          className="tracking-wide"
          sx={{
            fontSize: { xs: "18px", md: "24px" },
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "0.04em",
          }}
        >
          Token Queue
        </Typography>
        <Box className="flex items-center gap-3">
          <Chip
            label="● LIVE"
            size="small"
            sx={{
              bgcolor: "rgba(34,197,94,.15)",
              color: "#22c55e",
              fontWeight: 700,
              fontSize: "12px",
              animation: "pulse 2s ease-in-out infinite",
              "@keyframes pulse": {
                "0%, 100%": { opacity: 1 },
                "50%": { opacity: 0.5 },
              },
            }}
          />
          <Typography
            sx={{
              color: "rgba(255,255,255,.6)",
              fontSize: { xs: "14px", md: "18px" },
              fontFamily: "'Roboto Mono', monospace",
              fontWeight: 500,
            }}
          >
            {currentTime}
          </Typography>
        </Box>
      </Box>

      {/* ── Scrolling announcement bar ─────────────────────────────────── */}
      <Box
        className="w-full py-2 overflow-hidden"
        sx={{
          background: "linear-gradient(90deg, #6366f1, #8b5cf6, #6366f1)",
        }}
      >
        <Typography
          component="div"
          sx={{
            color: "#fff",
            fontWeight: 600,
            fontSize: "14px",
            whiteSpace: "nowrap",
            animation: "marquee 20s linear infinite",
            "@keyframes marquee": {
              "0%": { transform: "translateX(100%)" },
              "100%": { transform: "translateX(-100%)" },
            },
          }}
        >
          📢 Please keep your token ready • Wait for your token number to appear
          on the display • Kindly proceed to the assigned counter when called •
          Thank you for your patience
        </Typography>
      </Box>

      <Box className="flex-1 p-4 md:p-8">
        <Box
          className="grid gap-4 md:gap-6"
        >
          <Grid size={{ xs: 6, md: 6, lg: 6, xl: 6 }}>
            <FormControl fullWidth color="primary">
              <InputLabel color="primary">For Branch</InputLabel>

              <Select
                label="For Branch"
                value={tokenBranch}
                onChange={(e) => handleBranchChange(e.target.value)}
                color="primary"
              >
                {branches.map((branch: any) => (
                  <MenuItem key={branch._id} value={branch._id}>
                    {branch.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Box>
      </Box>
      {/* ── Counter grid ───────────────────────────────────────────────── */}
      <Box className="flex-1 p-4 md:p-8">
        <Box
          className="grid gap-4 md:gap-6"
          sx={{
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(3, 1fr)",
              md: `repeat(${Math.min(counters.length, 4)}, 1fr)`,
              lg: `repeat(${Math.min(counters.length, 5)}, 1fr)`,
            },
          }}
        >
          {counters.map((counter: any) => {
            const meta = counter.currentToken
              ? getMeta(counter.currentToken)
              : fallbackMeta;

            return (
              <Box
                key={counter.counterNo}
                sx={{
                  borderRadius: "20px",
                  overflow: "hidden",
                  background: "rgba(255,255,255,.05)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(255,255,255,.08)",
                  transition: "transform .25s, box-shadow .25s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: `0 12px 40px ${meta.glow}`,
                  },
                }}
              >
                {/* counter header */}
                <Box
                  className="py-3 px-4 text-center"
                  sx={{ background: meta.gradient }}
                >
                  <Typography
                    sx={{
                      color: "rgba(255,255,255,.7)",
                      fontSize: { xs: "11px", md: "13px" },
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                    }}
                  >
                    Counter
                  </Typography>
                  <Typography
                    sx={{
                      color: "#fff",
                      fontSize: { xs: "28px", md: "40px" },
                      fontWeight: 800,
                      lineHeight: 1.1,
                    }}
                  >
                    {counter?.role === "tac"
                      ? "A"
                      : counter?.role === "coordinator"
                        ? "C"
                        : "B"}{counter.counterNo}
                  </Typography>
                </Box>

                {/* token body */}
                <Box className="p-4 md:p-5 text-center">
                  <Typography
                    sx={{
                      color: "rgba(255,255,255,.45)",
                      fontSize: "11px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      mb: 1,
                    }}
                  >
                    Now Serving
                  </Typography>

                  {counter.currentToken ? (
                    <Box>
                      <Typography
                        sx={{
                          color: "#fff",
                          fontSize: { xs: "32px", md: "48px" },
                          fontWeight: 800,
                          fontFamily: "'Roboto Mono', monospace",
                          lineHeight: 1.1,
                          animation: counter.isActive
                            ? "tokenPulse 1.5s ease-in-out infinite"
                            : "none",
                          "@keyframes tokenPulse": {
                            "0%, 100%": { opacity: 1, transform: "scale(1)" },
                            "50%": { opacity: 0.8, transform: "scale(1.03)" },
                          },
                        }}
                      >
                        {counter.currentToken}
                      </Typography>
                      <Chip
                        label={meta.label}
                        size="small"
                        sx={{
                          mt: 1.5,
                          background: "rgba(255,255,255,.08)",
                          color: "rgba(255,255,255,.7)",
                          fontSize: "11px",
                          fontWeight: 600,
                          height: "24px",
                        }}
                      />
                    </Box>
                  ) : (
                    <Typography
                      sx={{
                        color: "rgba(255,255,255,.2)",
                        fontSize: { xs: "20px", md: "28px" },
                        fontWeight: 600,
                        fontStyle: "italic",
                      }}
                    >
                      —
                    </Typography>
                  )}

                  {/* upcoming tokens */}
                  {counter?.upcomingTokens && counter?.upcomingTokens?.length > 0 && (
                    <Box className="mt-4">
                      <Typography
                        sx={{
                          color: "rgba(255,255,255,.3)",
                          fontSize: "10px",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          mb: 1,
                        }}
                      >
                        Up Next
                      </Typography>
                      <Box className="flex flex-wrap justify-center gap-1.5">
                        {counter?.upcomingTokens.map((t: any, idx: any) => (
                          <Chip
                            key={idx}
                            label={t}
                            size="small"
                            sx={{
                              background: "rgba(255,255,255,.06)",
                              color: "rgba(255,255,255,.5)",
                              fontSize: "12px",
                              fontWeight: 600,
                              fontFamily: "'Roboto Mono', monospace",
                              height: "26px",
                              border: "1px solid rgba(255,255,255,.08)",
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>

                {/* status indicator */}
                <Box
                  className="py-2 text-center"
                  sx={{
                    borderTop: "1px solid rgba(255,255,255,.06)",
                    background: counter.isActive
                      ? "rgba(34,197,94,.08)"
                      : "rgba(239,68,68,.06)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: counter.currentToken || counter?.upcomingTokens?.length > 0 ? "#22c55e" : "#ef4444",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {counter.currentToken || counter?.upcomingTokens?.length > 0 ? "● Active" : "○ Inactive"}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* ── Footer stats bar ──────────────────────────────────────────── */}
      <Box
        className="w-full py-3 px-6 flex items-center justify-center gap-8 flex-wrap"
        sx={{
          background: "rgba(255,255,255,.03)",
          borderTop: "1px solid rgba(255,255,255,.06)",
        }}
      >
        {[
          {
            label: "Active Counters",
            value: counters.filter((c) => c.currentToken).length,
            color: "#22c55e",
          },
          {
            label: "Tokens Serving",
            value: counters.filter((c) => c.currentToken).length,
            color: "#6366f1",
          },
          {
            label: "In Queue",
            value: counters.reduce(
              (sum, c) => sum + (c.upcomingTokens?.length ?? 0),
              0
            ),
            color: "#f59e0b",
          },
        ].map((stat) => (
          <Box key={stat.label} className="flex items-center gap-2">
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: stat.color,
              }}
            />
            <Typography
              sx={{
                color: "rgba(255,255,255,.5)",
                fontSize: "13px",
                fontWeight: 500,
              }}
            >
              {stat.label}:{" "}
              <span style={{ color: "#fff", fontWeight: 700 }}>
                {stat.value}
              </span>
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default TokenQueueDisplay;
