import React from "react";
import { Box, Button, Card, CircularProgress, FormControl, FormHelperText, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import { CamelCase } from "@/Utils/common";
import { useProgressSidebar } from "./useProgressSidebar";
import { CandidateLead } from "@/Types/Frontend_Payload/Candidate.types";
import { IBranch } from "@/lib/models/Branch.model";
import { IUser } from "@/lib/models/User.model";
import { UserData } from "@/Redux/Auth/user.slice";

interface ProgressSidebarProps {
  candidate: CandidateLead; isFoe: boolean; branchId: IBranch; consultantId: IUser;
  tacList: IUser[]; transferTo: string; setTransferTo: (val: string) => void; currentUser: UserData;
}

const ProgressSidebar: React.FC<ProgressSidebarProps> = ({ candidate, isFoe, branchId, consultantId, tacList, transferTo, setTransferTo, currentUser }) => {
  const { transferForm, fe, fh } = useProgressSidebar(candidate, transferTo, setTransferTo);

  return (
    <Card className="p-5 sticky top-6 rounded-xl shadow-2xl">
      <Typography className="text-[16px] font-semibold mb-4">Progress</Typography>
      <Box className="mb-4 space-y-2">
        <Typography className="text-[12px] text-[var(--mui-palette-text-primary)]">Branch: <span className="font-semibold">{(branchId as any)?.title ?? "—"}</span></Typography>
        <Typography className="text-[12px] text-[var(--mui-palette-text-primary)]">Consultant: <span className="font-semibold">{!isFoe && consultantId?._id.toString() === currentUser?.id ? "You" : consultantId?.firstName ? `${consultantId.firstName} ${consultantId.lastName ?? ""}`.trim() : "—"}</span></Typography>
        <Typography className="text-[12px] text-[var(--mui-palette-text-primary)]">Status: <span className="font-semibold">{CamelCase(candidate?.status ?? "")}</span></Typography>
        <Typography className="text-[12px] text-[var(--mui-palette-text-primary)]">Experience: <span className="font-semibold">{CamelCase(candidate?.experience?.type ?? "Not set")}</span></Typography>
      </Box>

      {!isFoe && (
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
    </Card>
  );
};
export default ProgressSidebar;