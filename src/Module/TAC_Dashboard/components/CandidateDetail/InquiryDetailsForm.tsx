import React from "react";
import { Box, Button, Card, CircularProgress, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Typography, Chip, ListSubheader, FormHelperText, Divider } from "@mui/material";
import { CamelCase } from "@/Utils/common";
import { useInquiryDetails } from "./useInquiryDetails";
import { CandidateLead } from "@/Types/Frontend_Payload/Candidate.types";
import { InquiryStageProgress } from "./Inquirystageprogress";
import { positionDBData } from "@/Types/object.types";
import dayjs from "dayjs";
import { SectionHeader } from "@/Components/InquiryStaff/SectionHeader";

interface InquiryDetailsFormProps { candidate: CandidateLead; }

const InquiryDetailsForm: React.FC<InquiryDetailsFormProps> = ({ candidate }) => {
  const { inquiryForm, fe, fh, getChipStyle, preferences, notifPrefs, categoryOptions, positionData } = useInquiryDetails(candidate);
  return (
    <Card className="p-6 rounded-xl shadow-2xl">
      <Typography className="text-[18px] font-medium mb-5">
        Inquiry Details ({candidate.inqNo ?? "—"})
      </Typography>
      <form onSubmit={inquiryForm.handleSubmit}>
        <Grid container spacing={5}>
          {/* step 1*/}
          <SectionHeader
            icon="ri-file-list-3-line"
            eyebrow="Inquiry Details"
            title="Inquiry Details - Step 1"
            description="Basic information provided during inquiry creation."
            accentColor="primary"
          />

          {/* Step 1 fields */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              name="fullName"
              label="Full Name"
              value={inquiryForm.values.fullName}
              onChange={inquiryForm.handleChange}
              onBlur={inquiryForm.handleBlur}
              error={fe("fullName")}
              helperText={fh("fullName")}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth name="email" label="Email Address" value={inquiryForm.values.email} onChange={inquiryForm.handleChange} onBlur={inquiryForm.handleBlur} error={fe("email")} helperText={fh("email")} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth name="phone" label="Phone Number" value={inquiryForm.values.phone} onChange={inquiryForm.handleChange} onBlur={inquiryForm.handleBlur} error={fe("phone")} helperText={fh("phone")} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth name="whatsapp" label="WhatsApp Number" value={inquiryForm.values.whatsapp} onChange={inquiryForm.handleChange} onBlur={inquiryForm.handleBlur} error={fe("whatsapp")} helperText={fh("whatsapp")} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl
              fullWidth
            >
              <InputLabel id="inquiry-category-label">
                Inquiry For
              </InputLabel>

              <Select
                labelId="inquiry-category-label"
                id="inquiry-category"
                name="inqForType"
                value={inquiryForm?.values.inqForType}
                onChange={(e) => inquiryForm.setFieldValue("inqForType", e.target.value)}
                label="Inquiry For"
                // disabled
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
                  ),
                )}
              </Select>

            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl
              fullWidth
              // error={err("inquiryFor")}
              disabled={!inquiryForm.values.inqForPosition}
            >
              <InputLabel id="inquiry-position-label">
                {inquiryForm.values.inqForPosition
                  ? "Select position"
                  : "Select a category first"}
              </InputLabel>
              <Select
                labelId="inquiry-position-label"
                label={
                  inquiryForm.values.inqForPosition
                    ? "Select position"
                    : "Select a category first"
                }
                name="inqForPosition"
                value={inquiryForm.values.inqForPosition}
                onChange={inquiryForm.handleChange}
                onBlur={inquiryForm.handleBlur}
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
              {/* {err("inquiryFor") && (
                <FormHelperText>
                  {helperText("inquiryFor")}
                </FormHelperText>
              )} */}
            </FormControl>
          </Grid>
          {/* step 2*/}
          <Divider className="my-6" />

          <SectionHeader
            icon="ri-calendar-check-line"
            eyebrow="Inquiry Details"
            title="Inquiry Details - Step 2"
            description="Basic information provided during inquiry creation."
            accentColor="success"
          />

          {/* Step 2 fields */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth
            // error={err("nationality")}
            >
              <InputLabel id="inquiry-nationality-label">
                Nationality
              </InputLabel>
              <Select
                labelId="inquiry-nationality-label"
                label="Nationality"
                name="nationality"
                value={inquiryForm?.values?.nationality}
                onChange={inquiryForm.handleChange}
                onBlur={inquiryForm.handleBlur}
              >
                <MenuItem value="indian">Indian</MenuItem>
                <MenuItem value="nepalese">Nepalese</MenuItem>
                <MenuItem value="bhutanese">
                  Bhutanese
                </MenuItem>
                <MenuItem value="tibetan">Tibetan</MenuItem>
                <MenuItem value="bangladeshi">
                  Bangladeshi
                </MenuItem>
              </Select>
              {/* {err("nationality") && (
                <FormHelperText>
                  {helperText("nationality")}
                </FormHelperText>
              )} */}
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl
              fullWidth
            // error={err("latestAcademic")}
            >
              <InputLabel id="inquiry-latestAcademic-label">
                Latest academic qualification
              </InputLabel>
              <Select
                labelId="inquiry-latestAcademic-label"
                label="Latest academic qualification"
                name="latestAcademic"
                value={inquiryForm.values.latestAcademic}
                onChange={inquiryForm.handleChange}
                onBlur={inquiryForm.handleBlur}
              >
                <MenuItem value="secondary">
                  Secondary
                </MenuItem>
                <MenuItem value="higher_secondary">
                  Higher secondary
                </MenuItem>
                <MenuItem value="graduate">Graduate</MenuItem>
                <MenuItem value="post_graduate">
                  Post graduate
                </MenuItem>
              </Select>
              {/* {err("latestAcademic") && (
                <FormHelperText>
                  {helperText("latestAcademic")}
                </FormHelperText>
              )} */}
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              name="latestTechnical"
              label="Latest technical qualification"
              value={inquiryForm.values.latestTechnical}
              onChange={inquiryForm.handleChange}
              onBlur={inquiryForm.handleBlur}
            // error={err("latestTechnical")}
            // helperText={helperText("latestTechnical")}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              name="workExperience"
              label="Work experience"
              multiline
              value={inquiryForm.values.workExperience}
              onChange={inquiryForm.handleChange}
              onBlur={inquiryForm.handleBlur}
            // error={err("workExperience")}
            // helperText={helperText("workExperience")}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Source" disabled value={CamelCase(candidate?.source?.type ?? "")} />
          </Grid>

          {candidate?.source?.refType &&
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Referred By (Type)" disabled value={CamelCase(candidate?.source?.refType ?? "")} />
            </Grid>
          }
          {candidate?.source?.refName &&
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Referred By (Name)" disabled value={candidate?.source.refName} />
            </Grid>
          }


          <SectionHeader
            icon="ri-information-line"
            eyebrow="Additional Information"
            title="Inquiry Information"
            description="System-generated and workflow information."
            accentColor="info"
          />

          {/* Additional information */}

          <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Inquiry Created" disabled value={candidate?.createdAt ? dayjs(candidate.createdAt).format("DD/MM/YYYY hh:mm A") : "—"} /></Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth error={fe("passportStatus")}>
              <InputLabel>Passport Status</InputLabel>
              <Select name="passportStatus" label="Passport Status" value={inquiryForm.values.passportStatus} onChange={(e) => { inquiryForm.handleChange(e); if (e.target.value !== "having") inquiryForm.setFieldValue("passportNo", ""); }} onBlur={inquiryForm.handleBlur}>
                <MenuItem value="having">Having</MenuItem><MenuItem value="applied">Applied</MenuItem><MenuItem value="no">Not Having</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {inquiryForm.values.passportStatus === "having" && (
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth name="passportNo" label="Passport No" value={inquiryForm.values.passportNo} onChange={(e) => inquiryForm.setFieldValue("passportNo", e.target.value.toUpperCase())} onBlur={inquiryForm.handleBlur} error={fe("passportNo")} helperText={fh("passportNo")} /></Grid>
          )}


          <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Status" disabled value={CamelCase(candidate.status ?? "")} /></Grid>

          <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Preffered Visit Type" disabled value={CamelCase(preferences.visitType ?? "")} /></Grid>


          <Grid
            size={{ xs: 12, md: 6 }}
            className="flex flex-col -mt-2 justify-center"
          >
            <Typography
              variant="h6"
              className="text-[var(--mui-palette-text-secondary)] font-medium mb-2  tracking-wide"
            >
              Contact Preferences
            </Typography>
            <Box className="flex flex-wrap gap-2">
              <Chip label="WhatsApp" size="small" className={getChipStyle(!!notifPrefs?.whatsapp)} />
              <Chip label="Email" size="small" className={getChipStyle(!!notifPrefs?.email)} />
              <Chip label="SMS" size="small" className={getChipStyle(!!notifPrefs?.sms)} />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <InquiryStageProgress stages={candidate?.inquiryStages as any} />
          </Grid>

        </Grid>

        <Box className="flex justify-end mt-6">
          <Button variant="contained" type="submit" disabled={inquiryForm.isSubmitting} className="normal-case px-6">
            {inquiryForm.isSubmitting ? <CircularProgress size={20} color="inherit" /> : "Update"}
          </Button>
        </Box>
      </form>
    </Card>
  );
};

export default InquiryDetailsForm;