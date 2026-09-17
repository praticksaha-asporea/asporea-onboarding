import React, { useState } from "react";
import { Box, Button, Card, CircularProgress, FormControl, FormHelperText, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import { CamelCase } from "@/Utils/common";
import { useProgressSidebar } from "./useProgressSidebar";
import { CandidateLead } from "@/Types/Frontend_Payload/Candidate.types";
import { IBranch } from "@/lib/models/Branch.model";
import { IUser } from "@/lib/models/User.model";
import { UserData } from "@/Redux/Auth/user.slice";
import dayjs from "dayjs";

interface ProgressSidebarProps {
  candidate: CandidateLead; isFoe: boolean; branchId: IBranch; consultantId: IUser;
  tacList: IUser[]; transferTo: string; setTransferTo: (val: string) => void; currentUser: UserData;
}

const ProgressSidebar: React.FC<ProgressSidebarProps> = ({ candidate, isFoe, branchId, consultantId, tacList, transferTo, setTransferTo, currentUser }) => {
  const { transferForm, fe, fh, escalateReasons } = useProgressSidebar(candidate, transferTo, setTransferTo);
  const [showTransfer, setShowTransfer] = useState(false);

  return (
    <Card className="p-5 sticky top-6 rounded-xl shadow-2xl">
      <Typography className="text-[16px] font-semibold mb-4">Progress</Typography>
      <Box className="mb-4 space-y-2">
        <Typography className="text-[12px] text-[var(--mui-palette-text-primary)]">Branch: <span className="font-semibold">{(branchId as any)?.title ?? "—"}</span></Typography>
        <Typography className="text-[12px] text-[var(--mui-palette-text-primary)]">Consultant: <span className="font-semibold">{!isFoe && consultantId?._id.toString() === currentUser?.id ? "You" : consultantId?.firstName ? `${consultantId.firstName} ${consultantId.lastName ?? ""}`.trim() : "—"}</span></Typography>
        <Typography className="text-[12px] text-[var(--mui-palette-text-primary)]">Status: <span className="font-semibold">{CamelCase(candidate?.status ?? "")}</span></Typography>
        <Typography className="text-[12px] text-[var(--mui-palette-text-primary)]">Experience: <span className="font-semibold">{CamelCase(candidate?.experience?.type ?? "Not set")}</span></Typography>
        <Typography className="text-[12px] text-[var(--mui-palette-text-primary)]">Escalated: <span className="font-semibold">{CamelCase(candidate?.escalated === true ? "Yes" : "No")}</span></Typography>

        {/* Escalation */}
        {/* Escalation */}
        {candidate?.escalated && (escalateReasons?.length ?? 0) > 0 && (
          <Box className="mt-4 pt-3 border-t border-[var(--mui-palette-divider)]">
            <Box className="flex items-center gap-1.5 mb-2.5">
              <i className="ri-arrow-up-circle-line text-[15px] text-amber-600" />
              <Typography
                variant="caption"
                className="font-semibold text-[11px] text-[var(--mui-palette-text-secondary)] uppercase tracking-wide"
              >
                Escalation History
              </Typography>
            </Box>

            <Box className="space-y-2">
              {(escalateReasons ?? []).map((escalate: any, index: number) => (
                <Box
                  key={escalate._id ?? index}
                  className="pl-3 py-1.5 border-l-2 border-amber-400"
                >
                  <Typography className="text-[12.5px] text-[var(--mui-palette-text-primary)]">
                    <span className="font-semibold">
                      {escalate.fromId?.firstName} {escalate.fromId?.lastName ?? ""}
                    </span>{" "}
                    <span className="text-[var(--mui-palette-text-secondary)]">requested escalation for this inquiry
                      {escalate.status !== "requested" ? `, Action taken on  ${dayjs(escalate.createdAt).format("DD MMM YYYY, hh:mm A")}` : null}

                    </span>
                  </Typography>
                  <Typography className="text-[12px] text-[var(--mui-palette-text-secondary)] mt-0.5">
                    {escalate.reason || "—"}
                  </Typography>
                  {escalate.createdAt && (
                    <Typography className="text-[11px] text-[var(--mui-palette-text-disabled)] mt-0.5">
                      {dayjs(escalate.createdAt).format("DD MMM YYYY, hh:mm A")}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {!isFoe && (
        <Box className="mt-2">
          <Button
            size="small"
            variant="text"
            onClick={() => setShowTransfer((prev) => !prev)}
            className="p-0 text-[13px] font-semibold text-[var(--mui-palette-primary-main)] normal-case hover:bg-transparent min-w-0 mb-3 flex items-center gap-1"
          >
            {showTransfer ? "Hide Transfer Form" : "Transfer Candidate"}
            <i className={showTransfer ? "ri-arrow-up-s-line text-lg" : "ri-arrow-down-s-line text-lg"} />
          </Button>


          {showTransfer && (
            <form onSubmit={transferForm.handleSubmit}>
              <FormControl fullWidth className="mb-4" error={fe("toId")}>
                <InputLabel>Transfer</InputLabel>
                <Select label="Transfer" name="toId" value={transferForm.values.toId} onChange={(e) => { transferForm.handleChange(e); setTransferTo(e.target.value as string); }} onBlur={transferForm.handleBlur}>
                  <MenuItem value="">-- Select TAC --</MenuItem>
                  {tacList.map((tac) => (<MenuItem key={tac._id.toString()}
                    value={tac._id.toString()}>{`${tac.firstName} ${tac.lastName ?? ""}`.trim()}</MenuItem>))}
                </Select>
                {fh("toId") && <FormHelperText>{fh("toId")}</FormHelperText>}
              </FormControl>
              <TextField fullWidth multiline rows={3} label="Reason *" name="reason" placeholder="Enter reason for transfer..." className="mb-4" slotProps={{ input: { className: "text-[14px]" } }} value={transferForm.values.reason} onChange={transferForm.handleChange} onBlur={transferForm.handleBlur} error={fe("reason")} helperText={fh("reason")} />
              <Typography className="text-[12px] text-[var(--mui-palette-error-light)] mb-4 font-medium">NOTE: This will need approval.</Typography>
              <Box className="flex justify-center">
                <Button variant="contained" type="submit" disabled={transferForm.isSubmitting} className="w-full normal-case rounded-xl shadow-md">
                  {transferForm.isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Submit"}
                </Button>
              </Box>
            </form>
          )}
        </Box>
      )}
    </Card>
  );
};
export default ProgressSidebar;