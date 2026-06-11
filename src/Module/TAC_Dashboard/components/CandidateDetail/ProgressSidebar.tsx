import React from "react";
import { Box, Button, Card, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import { CamelCase } from "@/Utils/common";

interface ProgressSidebarProps {
  candidate: any;
  isFoe: boolean;
  branchId: any;
  consultantId: any;
  tacList: any[];
  escalateTo: string;
  setEscalateTo: (val: string) => void;
  currentUser: any;
}

const ProgressSidebar: React.FC<ProgressSidebarProps> = ({
  candidate: c, isFoe, branchId, consultantId, tacList, escalateTo, setEscalateTo,currentUser
}) => {
  return (
    <Card className="p-5 sticky top-6 rounded-xl  shadow-2xl">
      <Typography className="text-[16px] font-semibold mb-4">Progress</Typography>
      {isFoe ? (
        <Box className="mb-4 space-y-2">
          <Typography className="text-[12px] text-[var(--mui-palette-text-primary)]">
            Branch: <span className="font-semibold text-[var(--mui-palette-text-primary)]">{branchId.title ?? "—"}</span>
          </Typography>
          <Typography className="text-[12px] text-[var(--mui-palette-text-primary)]">
            Consultant:{" "}
            <span className="font-semibold text-[var(--mui-palette-text-primary)]">
              {consultantId.firstName ? `${consultantId.firstName} ${consultantId.lastName ?? ""}`.trim() : "—"}
            </span>
          </Typography>
          <Typography className="text-[12px] text-[var(--mui-palette-text-primary)]">
            Status: <span className="font-semibold text-[var(--mui-palette-text-primary)]">{CamelCase(c.status ?? "")}</span>
          </Typography>
          <Typography className="text-[12px] text-[var(--mui-palette-text-primary)]">
            Experience:{" "}
            <span className="font-semibold text-[var(--mui-palette-text-primary)]">
              {CamelCase(c.experience?.type ?? "Not set")}
            </span>
          </Typography>
        </Box>
      ) : (
        <>
          <Box className="mb-4 space-y-2">
            <Typography className="text-[12px] text-gray-500">
              Branch: <span className="font-semibold text-[var(--mui-palette-text-primary)]">{branchId.title ?? "—"}</span>
            </Typography>
            <Typography className="text-[12px] text-[var(--mui-palette-text-primary)]">
              Consultant: <span className="font-semibold text-[var(--mui-palette-text-primary)]">{consultantId?._id === currentUser?.id ? "You" : consultantId.firstName ? `${consultantId.firstName} ${consultantId.lastName ?? ""}`.trim() : "—"}</span>
            </Typography>
            <Typography className="text-[12px] text-[var(--mui-palette-text-primary)]">
              Status: <span className="font-semibold text-[var(--mui-palette-text-primary)]">{CamelCase(c.status ?? "")}</span>
            </Typography>
            <Typography className="text-[12px] text-gray-500">
              Experience: <span className="font-semibold text-gray-800">{CamelCase(c.experience?.type ?? "Not set")}</span>
            </Typography>
          </Box>
          <FormControl fullWidth className="mb-4">
            <InputLabel>Escalate</InputLabel>
            <Select label="Escalate" value={escalateTo} onChange={(e) => setEscalateTo(e.target.value as string)}>
              <MenuItem value="">-- Select TAC --</MenuItem>
              {tacList.map((tac) => (
                <MenuItem key={tac._id} value={tac._id}>{`${tac.firstName} ${tac.lastName ?? ""}`.trim()}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField fullWidth multiline rows={3} label="Reason *" placeholder="Enter reason for escalation..." className="mb-4" slotProps={{ input: { className: "text-[14px]" } }} />
          <Typography className="text-[12px] text-[var(--mui-palette-error-light)] mb-4">NOTE: This will need approval of your manager.</Typography>
          <Box className="flex justify-center"><Button disabled variant="contained">Submit</Button></Box>
        </>
      )}
    </Card>
  );
};

export default ProgressSidebar;