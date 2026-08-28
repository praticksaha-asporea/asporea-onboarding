import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormHelperText from "@mui/material/FormHelperText";
import FormLabel from "@mui/material/FormLabel";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";

interface InquiryStep2FormProps {
  formik: any;
  err: (field: string) => boolean;
  helperText: (field: string) => string | undefined;
  loadingSources: boolean;
  externalSources: any[];
}

export const InquiryStep2Form: React.FC<InquiryStep2FormProps> = ({
  formik,
  err,
  helperText,
  loadingSources,
  externalSources,
}) => {
  return (
    <Card variant="outlined">
      <CardContent className="mbe-5">
        <Grid container spacing={5}>
          {/* Nationality */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth error={err("nationality")}>
              <InputLabel id="inquiry-nationality-label">Nationality</InputLabel>
              <Select
                labelId="inquiry-nationality-label"
                label="Nationality"
                name="nationality"
                value={formik.values.nationality || ""}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <MenuItem value="indian">Indian</MenuItem>
                <MenuItem value="nepalese">Nepalese</MenuItem>
                <MenuItem value="bhutanese">Bhutanese</MenuItem>
                <MenuItem value="tibetan">Tibetan</MenuItem>
                <MenuItem value="bangladeshi">Bangladeshi</MenuItem>
              </Select>
              {err("nationality") && (
                <FormHelperText>{helperText("nationality")}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          {/* Latest Academic */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth error={err("latestAcademic")}>
              <InputLabel id="inquiry-latestAcademic-label">
                Latest academic qualification
              </InputLabel>
              <Select
                labelId="inquiry-latestAcademic-label"
                label="Latest academic qualification"
                name="latestAcademic"
                value={formik.values.latestAcademic || ""}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <MenuItem value="secondary">Secondary</MenuItem>
                <MenuItem value="higher_secondary">Higher secondary</MenuItem>
                <MenuItem value="graduate">Graduate</MenuItem>
                <MenuItem value="post_graduate">Post graduate</MenuItem>
              </Select>
              {err("latestAcademic") && (
                <FormHelperText>{helperText("latestAcademic")}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          {/* Latest Technical */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              name="latestTechnical"
              label="Latest technical qualification"
              value={formik.values.latestTechnical || ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={err("latestTechnical")}
              helperText={helperText("latestTechnical")}
            />
          </Grid>

          {/* Work Experience */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              name="workExperience"
              label="Work experience"
              multiline
              value={formik.values.workExperience || ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={err("workExperience")}
              helperText={helperText("workExperience")}
            />
          </Grid>

          {/* Referred From Radio Group */}
          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth error={err("referedFrom")}>
              <FormLabel component="legend">How did you hear about us?</FormLabel>
              <RadioGroup
                row
                name="referedFrom"
                value={formik.values.referedFrom}
                onChange={(e) => {
                  formik.handleChange(e);
                  if (e.target.value !== "reffer") {
                    formik.setFieldValue("referedType", "");
                    formik.setFieldValue("referedBy", "");
                    formik.setFieldValue("otherReferedBy", "");
                  }
                }}
              >
                <FormControlLabel
                  value="web-app"
                  control={<Radio />}
                  label="Asporea website/app"
                />
                <FormControlLabel
                  value="call"
                  control={<Radio />}
                  label="Tele caller"
                />
                <FormControlLabel
                  value="social"
                  control={<Radio />}
                  label="Social media"
                />
                <FormControlLabel
                  value="reffer"
                  control={<Radio />}
                  label="Referral"
                />
              </RadioGroup>
              {err("referedFrom") && (
                <FormHelperText>{helperText("referedFrom")}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          {/* Referred Details (If Referral chosen) */}
          {formik.values.referedFrom === "reffer" && (
            <>
              <Grid size={{ xs: 12, md: 12 }}>
                <FormControl fullWidth error={err("referedType")}>
                  <FormLabel component="legend">Referred by</FormLabel>
                  <RadioGroup
                    row
                    name="referedType"
                    value={formik.values.referedType || ""}
                    onChange={(e) => {
                      formik.handleChange(e);
                      formik.setFieldValue("referedBy", "");
                    }}
                  >
                    <FormControlLabel
                      value="pca"
                      control={<Radio />}
                      label="PCA"
                    />
                    <FormControlLabel
                      value="pcra"
                      control={<Radio />}
                      label="PCRA"
                    />
                    <FormControlLabel
                      value="institution"
                      control={<Radio />}
                      label="Institution"
                    />
                    <FormControlLabel
                      value="other"
                      control={<Radio />}
                      label="Other"
                    />
                  </RadioGroup>
                  {err("referedType") && (
                    <FormHelperText>{helperText("referedType")}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {formik.values.referedType !== "other" && (
                <Grid size={{ xs: 12, md: 12 }}>
                  <FormControl
                    fullWidth
                    disabled={
                      loadingSources || formik.values.referedType === "other"
                    }
                    error={err("referedBy")}
                  >
                    <InputLabel>
                      {loadingSources ? "Loading..." : "Name of referrer"}
                    </InputLabel>
                    <Select
                      name="referedBy"
                      label="Name of referrer"
                      value={formik.values.referedBy}
                      onChange={(e) => {
                        formik.handleChange(e);
                        if (e.target.value === "other") {
                          formik.setFieldValue("referedType", "other");
                        }
                      }}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {externalSources.map((src: any) => (
                        <MenuItem key={src._id} value={src._id}>
                          {src.name ||
                            `${src.firstName || ""} ${src.lastName || ""}`.trim()}
                        </MenuItem>
                      ))}
                    </Select>
                    {err("referedBy") && (
                      <FormHelperText>{helperText("referedBy")}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
              )}

              {formik.values.referedType === "other" && (
                <Grid size={{ xs: 12, md: 12 }}>
                  <TextField
                    fullWidth
                    name="otherReferedBy"
                    label="Referrer name"
                    value={formik.values.otherReferedBy || ""}
                    placeholder="John Singh"
                    onChange={formik.handleChange}
                    error={err("otherReferedBy")}
                    helperText={helperText("otherReferedBy")}
                  />
                </Grid>
              )}
            </>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};