import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import ListSubheader from "@mui/material/ListSubheader";
import FormHelperText from "@mui/material/FormHelperText";
import { positionDBData } from "@/Types/object.types";

interface InquiryStep1FormProps {
  formik: any;
  err: (field: string) => boolean;
  helperText: (field: string) => string | undefined;
  handleCategoryChange: (value: string) => void;
  categoryOptions: any[];
  positionData: positionDBData[] | null;
  isFormDisabled: boolean;
}

export const InquiryStep1Form: React.FC<InquiryStep1FormProps> = ({
  formik,
  err,
  helperText,
  handleCategoryChange,
  categoryOptions,
  positionData,
  isFormDisabled,
}) => {
  return (
    <Card variant="outlined">
      <CardContent className="mbe-5">
        <Grid container spacing={5}>
          {/* Full Name */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              name="fullName"
              label="Full name"
              value={formik.values.fullName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={err("fullName")}
              helperText={helperText("fullName")}
            />
          </Grid>

          {/* Email Address */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              name="email"
              label="Email address"
              value={formik.values.email}
              placeholder="name@email.com"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={err("email")}
              helperText={helperText("email")}
            />
          </Grid>

          {/* Phone Number */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              type="tel"
              name="phoneNumber"
              label="Phone number"
              value={formik.values.phoneNumber}
              placeholder="9876543210"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={err("phoneNumber")}
              helperText={helperText("phoneNumber")}
            />
          </Grid>

          {/* WhatsApp Number */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              type="tel"
              name="whatsappNumber"
              label="WhatsApp number"
              value={formik.values.whatsappNumber}
              placeholder="9876543210"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={err("whatsappNumber")}
              helperText={helperText("whatsappNumber")}
            />
          </Grid>

          {/* Inquiry Category Select */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth error={err("inquiryCategory")}>
              <InputLabel id="inquiry-category-label">Inquiry For</InputLabel>
              <Select
                labelId="inquiry-category-label"
                id="inquiry-category"
                name="inquiryCategory"
                value={formik.values.inquiryCategory || ""}
                onChange={(e) => handleCategoryChange(e.target.value as string)}
                label="Inquiry For"
                disabled={isFormDisabled}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      maxHeight: "calc(100vh - 250px)",
                      "& .MuiListSubheader-root": {
                        backgroundColor: "#f5f8fc",
                        color: "#0054a6",
                        fontWeight: 600,
                        fontSize: "14px",
                        lineHeight: "36px",
                      },
                      "& .inquiry-child": {
                        paddingLeft: "32px",
                        fontSize: "14px",
                      },
                      "& .inquiry-grandchild": {
                        paddingLeft: "52px",
                        fontSize: "14px",
                      },
                    },
                  },
                }}
              >
                {categoryOptions.map((option) =>
                  option.kind === "header" ? (
                    <ListSubheader
                      key={option.key}
                      sx={{ pl: option.level === 0 ? 2 : 4 }}
                    >
                      {option.label}
                    </ListSubheader>
                  ) : (
                    <MenuItem
                      key={option.key}
                      value={option.value}
                      className={
                        option.level === 1
                          ? "inquiry-child"
                          : option.level >= 2
                          ? "inquiry-grandchild"
                          : ""
                      }
                    >
                      {option.label}
                    </MenuItem>
                  )
                )}
              </Select>
              {err("inquiryCategory") && (
                <FormHelperText>{helperText("inquiryCategory")}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          {/* Inquiry For Position Select */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl
              fullWidth
              error={err("inquiryFor")}
              disabled={!formik.values.inquiryCategory}
            >
              <InputLabel id="inquiry-position-label">
                {formik.values.inquiryCategory
                  ? "Select position"
                  : "Select a category first"}
              </InputLabel>
              <Select
                labelId="inquiry-position-label"
                label={
                  formik.values.inquiryCategory
                    ? "Select position"
                    : "Select a category first"
                }
                name="inquiryFor"
                value={formik.values.inquiryFor}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                MenuProps={{
                  PaperProps: { sx: { maxHeight: 400 } },
                }}
              >
                {Array.isArray(positionData) &&
                  positionData.map((p: positionDBData) => (
                    <MenuItem key={p._id} value={p._id}>
                      {p?.title}
                    </MenuItem>
                  ))}
              </Select>
              {err("inquiryFor") && (
                <FormHelperText>{helperText("inquiryFor")}</FormHelperText>
              )}
            </FormControl>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};