"use client";

import Link from "next/link";

// MUI Imports
import { CircularProgress, Dialog, DialogContent, Divider, IconButton } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

// Hooks & Components
import Logo from "../../../Components_Theme/layout/shared/Logo";
import Illustrations from "../../../Components/Illustrations";
import type { Mode } from "@core/types";
import { useGuestToken } from "./useGuestToken";


const GuestToken = ({ mode }: { mode: Mode }) => {
  const {
    formik,
    authBackground,
    showTokenModal,
    tokenData,
    handleCloseTokenModal,
  } = useGuestToken({ mode });

  return (
    <div className="flex flex-col justify-center items-center min-bs-[100dvh] relative p-6">
      <Card className="flex flex-col sm:is-[450px]">
        <CardContent className="p-6 sm:!p-12">
          <Link href="/" className="flex justify-center items-center mbe-6">
            <Logo />
          </Link>
          <div className="flex flex-col gap-5">
            <div className="text-center">
              <Typography variant="h4">{`Welcome to Asporea`}</Typography>
              <Typography className="mbs-1">Generate Token</Typography>
            </div>

            <form
              noValidate
              autoComplete="off"
              onSubmit={formik.handleSubmit}
              className="flex flex-col gap-5"
            >
              {/* IDENTITY FIELD */}
              <TextField
                autoFocus
                fullWidth
                id="identity"
                name="identity"
                label="Phone Number or Email"
                value={formik.values.identity}
                onBlur={formik.handleBlur}
                error={formik.submitCount > 0 && Boolean(formik.errors.identity)}
                helperText={
                  formik.submitCount > 0 && formik.errors.identity
                    ? (formik.errors.identity as string)
                    : undefined
                }
                onChange={formik.handleChange}
              />

              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={formik?.isSubmitting}
              >
                {formik?.isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Generate"
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* ── Token Generated Modal ─────────────────────────────────────────── */}
      <Dialog
        open={showTokenModal}
        onClose={handleCloseTokenModal}
        maxWidth="xs"
        fullWidth
        PaperProps={{ className: "rounded-[20px] p-3 relative" }}
      >
        <DialogContent className="flex flex-col items-center text-center pt-8 pb-8">
          {/* Close button */}
          <IconButton
            onClick={handleCloseTokenModal}
            size="small"
            className="!absolute top-3 right-3 text-textSecondary"
          >
            <i className="ri-close-line text-xl" />
          </IconButton>

          {/* Heading */}
          <Typography variant="h4" fontWeight="bold" className="mb-6">
            Token Generated
          </Typography>

          {/* Token number */}
          <Typography variant="body2" color="text.secondary" className="mb-1">
            Your Token No.
          </Typography>
          <Typography variant="h4" fontWeight="bold" className="mb-5">
            {tokenData?.token}
          </Typography>

          {/* Warning note */}
          <Typography
            variant="body2"
            // color="text.primary"
            className="mb-6 px-4 leading-relaxed text-[--mui-palette-error-dark]"
          >
            Please keep an eye on token waiting display, and be ready for your
            turn.
          </Typography>

          <Divider className="w-full mb-5" />

          {/* Slot info */}
          <Typography variant="body2" color="text.secondary" className="mb-1">
            Chosen Slot Is:{" "}
            <span className="font-semibold text-textPrimary">
              {tokenData?.slot?.from} – {tokenData?.slot?.to}
            </span>
          </Typography>
          <Typography variant="body2" color="text.secondary" className="mb-1">
            In case, {
              tokenData?.token?.startsWith("A")
                ? "TAC"
                : tokenData?.token?.startsWith("C")
                  ? "Coordinator"
                  : tokenData?.token?.startsWith("T")
                    ? "An Employee"
                    : "-"
            } is available earlier.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No need to wait till this slot.
          </Typography>
        </DialogContent>
      </Dialog>
      {/* ──────────────────────────────────────────────────────────────────── */}

      <Illustrations maskImg={{ src: authBackground }} />
    </div>
  );
};

export default GuestToken;
