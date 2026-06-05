"use client";

import Link from "next/link";

// MUI Imports
import { CircularProgress } from "@mui/material";
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
    authBackground
  } = useGuestToken({mode});

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
              <Typography className="mbs-1">
                Generate Token
              </Typography>
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
                helperText={formik.submitCount > 0 && formik.errors.identity ? (formik.errors.identity as string) : undefined}
                onChange={(e) => {
                  formik.handleChange(e);
                }}
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

      <Illustrations maskImg={{ src: authBackground }} />
    </div>
  );
};

export default GuestToken;
