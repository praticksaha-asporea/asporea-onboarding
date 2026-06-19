import React from "react";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { CamelCase } from "@/Utils/common";
import { escalateLeadAction } from "@/Services/APIs/tac/tac.actions";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import * as Yup from "yup";

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
  candidate: c,
  isFoe,
  branchId,
  consultantId,
  tacList,
  escalateTo,
  setEscalateTo,
  currentUser,
}) => {
  const escalationForm = useFormik({
    initialValues: {
      toId: escalateTo || "",
      reason: "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      toId: Yup.string().required("Please select a TAC to escalate to."),
      reason: Yup.string()
        .trim()
        .required("Reason is required for escalation."),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const payload = {
          leadId: c._id,
          toId: values.toId,
          reason: values.reason,
        };

        await escalateLeadAction(payload);
toast.success("Escalation request submitted successfully!", { id: "escalation-submit-toast" });
        resetForm();
        setEscalateTo("");
      } catch (err: any) {
        // toast.error(
        //   err?.response?.data?.message || "Failed to submit escalation.",
        // );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const fe = (field: string) =>
    !!(
      escalationForm.touched[field as keyof typeof escalationForm.touched] &&
      escalationForm.errors[field as keyof typeof escalationForm.errors]
    );
  const fh = (field: string) =>
    escalationForm.touched[field as keyof typeof escalationForm.touched]
      ? (escalationForm.errors[
          field as keyof typeof escalationForm.errors
        ] as string)
      : undefined;
  return (
    <Card className="p-5 sticky top-6 rounded-xl shadow-2xl">
      <Typography className="text-[16px] font-semibold mb-4">
        Progress
      </Typography>

      {isFoe ? (
        <Box className="mb-4 space-y-2">
          <Typography className="text-[12px] text-[var(--mui-palette-text-primary)]">
            Branch:{" "}
            <span className="font-semibold text-[var(--mui-palette-text-primary)]">
              {branchId.title ?? "—"}
            </span>
          </Typography>
          <Typography className="text-[12px] text-[var(--mui-palette-text-primary)]">
            Consultant:{" "}
            <span className="font-semibold text-[var(--mui-palette-text-primary)]">
              {consultantId.firstName
                ? `${consultantId.firstName} ${consultantId.lastName ?? ""}`.trim()
                : "—"}
            </span>
          </Typography>
          <Typography className="text-[12px] text-[var(--mui-palette-text-primary)]">
            Status:{" "}
            <span className="font-semibold text-[var(--mui-palette-text-primary)]">
              {CamelCase(c.status ?? "")}
            </span>
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
              Branch:{" "}
              <span className="font-semibold text-[var(--mui-palette-text-primary)]">
                {branchId.title ?? "—"}
              </span>
            </Typography>
            <Typography className="text-[12px] text-[var(--mui-palette-text-primary)]">
              Consultant:{" "}
              <span className="font-semibold text-[var(--mui-palette-text-primary)]">
                {consultantId?._id === currentUser?.id
                  ? "You"
                  : consultantId.firstName
                    ? `${consultantId.firstName} ${consultantId.lastName ?? ""}`.trim()
                    : "—"}
              </span>
            </Typography>
            <Typography className="text-[12px] text-[var(--mui-palette-text-primary)]">
              Status:{" "}
              <span className="font-semibold text-[var(--mui-palette-text-primary)]">
                {CamelCase(c.status ?? "")}
              </span>
            </Typography>
            <Typography className="text-[12px] text-gray-500">
              Experience:{" "}
              <span className="font-semibold">
                {CamelCase(c.experience?.type ?? "Not set")}
              </span>
            </Typography>
          </Box>

          <form onSubmit={escalationForm.handleSubmit}>
            <FormControl fullWidth className="mb-4" error={fe("toId")}>
              <InputLabel>Escalate</InputLabel>
              <Select
                label="Escalate"
                name="toId"
                value={escalationForm.values.toId}
                onChange={(e) => {
                  escalationForm.handleChange(e);
                  setEscalateTo(e.target.value as string);
                }}
                onBlur={escalationForm.handleBlur}
              >
                <MenuItem value="">-- Select TAC --</MenuItem>
                {tacList.map((tac) => (
                  <MenuItem key={tac._id} value={tac._id}>
                    {`${tac.firstName} ${tac.lastName ?? ""}`.trim()}
                  </MenuItem>
                ))}
              </Select>
              {fh("toId") && <FormHelperText>{fh("toId")}</FormHelperText>}
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Reason *"
              name="reason"
              placeholder="Enter reason for escalation..."
              className="mb-4"
              slotProps={{ input: { className: "text-[14px]" } }}
              value={escalationForm.values.reason}
              onChange={escalationForm.handleChange}
              onBlur={escalationForm.handleBlur}
              error={fe("reason")}
              helperText={fh("reason")}
            />

            <Typography className="text-[12px] text-[var(--mui-palette-error-light)] mb-4 font-medium">
              NOTE: This will need approval of your manager.
            </Typography>

            <Box className="flex justify-center">
              <Button
                variant="contained"
                type="submit"
                disabled={escalationForm.isSubmitting}
                className="w-full normal-case rounded-xl shadow-md"
              >
                {escalationForm.isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Submit"
                )}
              </Button>
            </Box>
          </form>
        </>
      )}
    </Card>
  );
};

export default ProgressSidebar;
