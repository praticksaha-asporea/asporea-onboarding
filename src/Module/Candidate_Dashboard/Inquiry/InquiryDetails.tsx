"use client";

// React Imports
import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";

// MUI Imports
import { Dialog, DialogContent, IconButton, Divider } from "@mui/material";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import {
  Box,
  capitalize,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  Step,
  StepContent,
  StepLabel,
  Stepper,
} from "@mui/material";
import toast from "react-hot-toast";

type Data = {
  fullName: string;
  email: string;
  phoneNumber: number | string;
  whatsappNumber: number | string;
  prefferedBranch: string;
  prefferedConsultant: string;
  visitOption: number;
  fullAddress: string;
  referedFrom: string;
  referedType: string;
  referedBy: number;
  otherReferedBy: string | null;
};

// Vars
const initialData: Data = {
  fullName: "",
  email: "",
  phoneNumber: "",
  whatsappNumber: "",
  prefferedBranch: "",
  prefferedConsultant: "",
  visitOption: 0,
  fullAddress: "",
  referedFrom: "web-app",
  referedType: "pcra",
  referedBy: 1,
  otherReferedBy: "",
};
type StateType = {
  [key: string]: boolean;
};

const AccountDetails = () => {
  // States
  const [formData, setFormData] = useState<Data>(initialData);
  const [showInquiryPopup, setShowInquiryPopup] = useState(false);
  const [branches, setBranches] = useState([]);

  const handleFormChange = (field: keyof Data, value: Data[keyof Data]) => {
    setFormData({ ...formData, [field]: value });
  };
  const [activeStep] = useState(0);
  const [state, setState] = useState<StateType>({
    gilad: true,
    jason: false,
    antoine: false,
  });

  // Vars
  const { gilad, jason, antoine } = state;
  const error = [gilad, jason, antoine].filter((v) => v).length !== 2;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };
  const steps = [
    {
      step: 1,
      label: "Inquiry",
      description: "",
      status: "completed",
    },
    {
      step: 2,
      label: "Pre-Counselling",
      description: "Start now",
      status: "pending",
    },
    {
      step: 3,
      label: "Documents",
      description: "Start now",
      status: "pending",
    },
    {
      step: 4,
      label: "Experience Selection",
      description: "Start now",
      status: "pending",
    },
    {
      step: 5,
      label: "Assessment Status",
      description: "Start now",
      status: "pending",
    },
    {
      step: 6,
      label: "Technical Round",
      description: "Start now",
      status: "pending",
    },
  ];

  const fetchBranches = async (
    lat: number,
    lng: number,
  ) => {
    try {
      const response = await fetch(
        `/api/branch/list?lat=${lat}&lng=${lng}&radiusKm=5000&limit=50`
      );

      const result = await response.json();

      setBranches(result?.data?.data || []);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchBranches(
          position.coords.latitude,
          position.coords.longitude,
        );
      },
      (error) => {
        console.error(error);
        toast.error(`Please allow location access to get preffered branch list`)
      }
    );
  }, []);
  return (
    <>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h4">Generate Inquiry</Typography>
              <Typography variant="subtitle1" className="pb-5">
                Please fill out the form below to register an inquiry
              </Typography>
              <form onSubmit={(e) => e.preventDefault()}>
                <Card>
                  <CardContent className="mbe-5">
                    <Grid container spacing={5}>
                      <Grid size={{ xs: 12, md: 6, sm: 12 }}>
                        <TextField
                          fullWidth
                          label="Full Name"
                          value={formData.fullName}
                          placeholder="Kunal Chettri"
                          onChange={(e) =>
                            handleFormChange("fullName", e.target.value)
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6, sm: 12 }}>
                        <TextField
                          fullWidth
                          label="Email Address"
                          value={formData.email}
                          placeholder="kunal.chettri@gmail.com"
                          onChange={(e) =>
                            handleFormChange("email", e.target.value)
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6, sm: 12 }}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Phone Number"
                          value={formData.phoneNumber}
                          placeholder="9876543210"
                          onChange={(e) =>
                            handleFormChange("phoneNumber", e.target.value)
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6, sm: 12 }}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Whatsapp Number"
                          value={formData.whatsappNumber}
                          placeholder="9876543210"
                          onChange={(e) =>
                            handleFormChange("phoneNumber", e.target.value)
                          }
                        />
                      </Grid>

                      <Grid size={{ xs: 12, md: 6, sm: 12 }}>
                        <FormControl fullWidth>
                          <InputLabel>Preferred Branch</InputLabel>

                          <Select
                            label="Preferred Branch"
                            value={formData.prefferedBranch}
                            onChange={(e) =>
                              handleFormChange(
                                "prefferedBranch",
                                e.target.value,
                              )
                            }
                          >
                            {branches?.map((branch: any,index:number) => (
                              <MenuItem
                                key={branch._id}
                                value={branch._id}
                              >
                                {branch.title}
                                {branch.distanceKm !== undefined &&
                                  ` (
                                  ${index==0?`Recommend - `:``}
                                  ${branch.distanceKm < 1
                                    ? "Within 1 Km"
                                    : `${branch.distanceKm.toFixed(2)} Km`
                                  }
                                  )`}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid size={{ xs: 12, md: 6, sm: 12 }}>
                        <FormControl fullWidth>
                          <InputLabel>Preffered Consultant</InputLabel>
                          <Select
                            label="prefferedConsultant"
                            value={formData.prefferedConsultant}
                            onChange={(e) =>
                              handleFormChange(
                                "prefferedConsultant",
                                e.target.value,
                              )
                            }
                          >
                            <MenuItem value="srijana">Srijana</MenuItem>
                            <MenuItem value="swarnima">Swarnima</MenuItem>
                            <MenuItem value="puspa">Puspa</MenuItem>
                            <MenuItem value="priyanjali">Priyanjali</MenuItem>
                            <MenuItem value="ayush">Ayush</MenuItem>
                            <MenuItem value="matilda">Matilda</MenuItem>
                            <MenuItem value="matilda">Matilda</MenuItem>
                            <MenuItem value="sanjana">Sanjana</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, md: 12, sm: 12 }}>
                        <FormControl fullWidth>
                          <RadioGroup
                            aria-label="Visit Option"
                            value={formData.visitOption}
                            onChange={(e) =>
                              handleFormChange("visitOption", e.target.value)
                            }
                          >
                            <FormControlLabel
                              value={1}
                              control={<Radio />}
                              label="Are you currently now in this branch? (Only use while you are in branch premises)"
                            />
                            <FormControlLabel
                              value={0}
                              control={<Radio />}
                              label="Are you visiting this branch?  (Only use while you are outside and willing to visit in-person )"
                            />
                            <FormControlLabel
                              value={2}
                              control={<Radio />}
                              label="Want to visit online rather than in-person branch visit"
                            />
                          </RadioGroup>
                          <FormHelperText className="py-2">
                            NOTE: Online Schedule you can choose from next
                            screen, If you have preferred consultant.
                          </FormHelperText>
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, md: 12, sm: 12 }}>
                        <TextField
                          fullWidth
                          label="Full Address"
                          value={formData.fullAddress}
                          placeholder={`123 Talent Lane,Darjeeling,
West Bengal,
700001`}
                          multiline
                          aria-colspan={3}
                          onChange={(e) =>
                            handleFormChange("fullAddress", e.target.value)
                          }
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Card className="mt-5">
                  <CardContent className="mbe-5">
                    <Grid container spacing={5}>
                      <Grid size={{ xs: 12, md: 6, sm: 12 }}>
                        <FormControl fullWidth>
                          <FormLabel component="legend">
                            How did you hear about us?.
                          </FormLabel>

                          <RadioGroup
                            row
                            aria-label="Refered From"
                            value={formData.referedFrom}
                            onChange={(e) =>
                              handleFormChange("referedFrom", e.target.value)
                            }
                          >
                            <FormControlLabel
                              value={`web-app`}
                              control={<Radio />}
                              label="Asporea Website/App"
                            />
                            <FormControlLabel
                              value={`call`}
                              control={<Radio />}
                              label="Tele Caller"
                            />
                            <FormControlLabel
                              value={`social`}
                              control={<Radio />}
                              label="Social Media"
                            />
                            <FormControlLabel
                              value={`reffer`}
                              control={<Radio />}
                              label="Referral"
                            />
                          </RadioGroup>
                        </FormControl>
                      </Grid>

                      <Grid size={{ xs: 12, md: 6, sm: 12 }}>
                        <FormControl fullWidth>
                          <FormLabel component="legend">Reffered By</FormLabel>

                          <RadioGroup
                            row
                            aria-label="Refered Type"
                            value={formData.referedType}
                            onChange={(e) =>
                              handleFormChange("referedType", e.target.value)
                            }
                          >
                            <FormControlLabel
                              value={`pca`}
                              control={<Radio />}
                              label="PCA"
                            />
                            <FormControlLabel
                              value={`pcra`}
                              control={<Radio />}
                              label="PCRA"
                            />
                            <FormControlLabel
                              value={`institution`}
                              control={<Radio />}
                              label="Institution"
                            />
                            <FormControlLabel
                              value={`other`}
                              control={<Radio />}
                              label="Other"
                            />
                          </RadioGroup>
                        </FormControl>
                      </Grid>

                      <Grid size={{ xs: 12, md: 6, sm: 12 }}>
                        <FormControl fullWidth>
                          <InputLabel>
                            Name of {capitalize(formData.referedType)}
                          </InputLabel>
                          <Select
                            label="referedBy"
                            value={formData.referedBy}
                            onChange={(e) =>
                              handleFormChange("referedBy", e.target.value)
                            }
                          >
                            <MenuItem value={`1`}>
                              {capitalize(formData.referedType) + ` 1`}
                            </MenuItem>
                            <MenuItem value={`2`}>
                              {capitalize(formData.referedType) + ` 2`}
                            </MenuItem>
                            <MenuItem value={`3`}>
                              {capitalize(formData.referedType) + ` 3`}
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6, sm: 12 }}>
                        <FormControl fullWidth>
                          <TextField
                            fullWidth
                            label="Please specify"
                            value={formData.otherReferedBy}
                            placeholder="Eg: John Singh"
                            onChange={(e) =>
                              handleFormChange("otherReferedBy", e.target.value)
                            }
                          />
                        </FormControl>
                      </Grid>
                    </Grid>
                  </CardContent>
                  <CardContent className="mbe-5">
                    <Grid container spacing={5}>
                      <Grid
                        size={{ xs: 12, md: 12, sm: 12 }}
                        className="flex gap-4 flex-wrap justify-end"
                      >
                        <Button
                          variant="contained"
                          type="button"
                          onClick={() => setShowInquiryPopup(true)}
                          className="rounded-xl normal-case text-sm shadow-md hover:bg-blue-700 hover:shadow-lg"
                        >
                          Submit
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </form>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Grid container spacing={5}>
            <Grid size={{ xs: 12, md: 12, sm: 12 }}>
              <Card className="hidden md:block">
                <CardContent>
                  <Typography variant="h4" className="mb-5">
                    Application Progress
                  </Typography>
                  <Stepper activeStep={activeStep} orientation="vertical">
                    {steps.map((step, index) => (
                      <Step key={step.label}>
                        <StepLabel
                          optional={
                            index !== 0 ? (
                              <Typography variant="caption">Pending</Typography>
                            ) : null
                          }
                          className=""
                        >
                          {step.label}
                        </StepLabel>
                        <StepContent>
                          <Typography>{step.description}</Typography>
                        </StepContent>
                      </Step>
                    ))}
                  </Stepper>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={5}>
            <Grid size={{ xs: 12, md: 12, sm: 12 }}></Grid>
            {/* <Grid container spacing={5}> */}
            <Grid size={{ xs: 12, md: 12, sm: 12 }}>
              <Card>
                <CardContent>
                  <FormControl className="mbs-4 mie-4">
                    <Typography variant="h5" className="pb-5">
                      Contact Preferences
                    </Typography>
                    <FormGroup>
                      <FormControlLabel
                        label="Receive updates via Email"
                        control={
                          <Checkbox
                            checked={gilad}
                            onChange={handleChange}
                            name="gilad"
                          />
                        }
                      />
                      <FormControlLabel
                        label="Receive updates via WhatsApp"
                        control={
                          <Checkbox
                            checked={jason}
                            onChange={handleChange}
                            name="jason"
                          />
                        }
                      />
                      <FormControlLabel
                        label="Receive updates via SMS"
                        control={
                          <Checkbox
                            checked={antoine}
                            onChange={handleChange}
                            name="antoine"
                          />
                        }
                      />
                    </FormGroup>
                    <FormHelperText className="pt-3">
                      At least One
                    </FormHelperText>
                  </FormControl>
                </CardContent>
              </Card>
              {/* </Grid> */}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      {/* Inquiry Submitted Popup  */}
      <Dialog
        open={showInquiryPopup}
        onClose={() => setShowInquiryPopup(false)}
        maxWidth="sm"
        fullWidth
      >
        <IconButton
          onClick={() => setShowInquiryPopup(false)}
          className="absolute right-5 top-5 text-gray-500"
        >
          <i className="material-symbols--close-rounded" />
        </IconButton>

        <DialogContent className="text-center p-8">
          <Typography variant="h4" className="mt-4">
            Inquiry Submitted
          </Typography>
          <Typography variant="h6" className="mt-2 mb-8">
            ID: ASP-INQ-0841
          </Typography>

          <Box className="mb-8">
            <Typography variant="body1" className="mt-2 mb-4 px-8">
              You are assigned to a Talent Acquisition Consultant(TAC). <br />
              Be ready for Pre-Counselling.
            </Typography>
            <Button
              variant="contained"
              className="normal-case rounded-[50px] py-[9.6px]"
              href="/pre-counselling"
            >
              Schedule Pre-Counselling
            </Button>
          </Box>

          {/* <Divider className="my-8" />

          <Box className="mb-4">
            <Typography variant="body1" className="mt-2 mb-4 px-8">
              As you are now inside / visiting our{" "}
              <span className="text-[#d32f2f] font-bold">
                Siliguri
              </span>{" "}
              Branch. <br />
              Be ready For Pre-Counselling,
            </Typography>
            <Button
              variant="contained"
             className="normal-case rounded-[50px] px-10 py-[9.6px] text-[1.1rem]"
            >
              Schedule Pre-Counselling
            </Button>
          </Box>

          <Divider className="my: 4 " />

          <Box className="mb-2">
            <Typography
              variant="body1"
              color="error"
            className="mt-2 px-8 font-medium"
            >
              As you're in <span className="font-bold">Siliguri</span>{" "}
              Branch. <br />
              For Pre-counselling, Please reach to Reception Counter. <br />
              Receptionist will Generate a Token behalf of you.
            </Typography>
          </Box> */}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AccountDetails;
