"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

// MUI Imports
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
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import type { SelectChangeEvent } from "@mui/material/Select";
import axios from "axios";

type Data = {
  firstName: string;
  lastName: string;
  email: string;
  organization: string;
  phoneNumber: string;
  whatsappNumber: string;
  address: string;
  state: string;
  zipCode: string;
  country: string;
  language: string;
  timezone: string;
  currency: string;
  passportStatus: string;
  passportNumber: string;
};

const initialData: Data = {
  firstName: "",
  lastName: "",
  email: "",
  organization: "Tech Solutions",
  phoneNumber: "",
  whatsappNumber: "",
  address: "",
  state: "",
  zipCode: "",
  country: "india",
  language: "english",
  timezone: "gmt-0530",
  currency: "inr",
  passportStatus: "not",
  passportNumber: "",
};

export default function CompleteProfilePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<Data>(initialData);
  const [fileInput, setFileInput] = useState<string>("");
  const [imgSrc, setImgSrc] = useState<string>("/images/avatars/1.png");
  const [loading, setLoading] = useState(false);

  // Jab page load ho, toh LocalStorage se Email utha kar form me bhar do
  useEffect(() => {
    const savedEmail = localStorage.getItem("temp_register_email");
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleFormChange = (field: keyof Data, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFileInputChange = (file: ChangeEvent) => {
    const reader = new FileReader();
    const { files } = file.target as HTMLInputElement;
    if (files && files.length !== 0) {
      reader.onload = () => setImgSrc(reader.result as string);
      reader.readAsDataURL(files[0]);
      if (reader.result !== null) {
        setFileInput(reader.result as string);
      }
    }
  };

  // 🚀 MAIN REGISTRATION API CALL 🚀
  const handleRegisterUser = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const email = localStorage.getItem("temp_register_email") || formData.email;
    const password = localStorage.getItem("temp_register_password");

    const payload = {
      ...formData,
      email,
      password,
    };

    try {
       
      const res = await axios.post("/api/auth/register", payload);

      if (res.data?.success) {
         
        localStorage.removeItem("temp_register_email");
        localStorage.removeItem("temp_register_password");

       
        router.push("/inquiry");
      }
    } catch (err: any) {
      console.error(err);
      alert(
        err.response?.data?.message ||
          "Something went wrong during registration.",
      );
    } finally {
      setLoading(false);
    }
  };
  
  const handleFileInputReset = () => {
    setFileInput('')
    setImgSrc('/images/avatars/1.png')
  }


  return (
    <Box className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-8">
      <Card className="w-full max-w-4xl shadow-xl rounded-2xl">
        <Box className="p-6 text-center border-b border-gray-100 bg-white rounded-t-2xl">
          <Typography variant="h5" className="font-semibold tracking-wide text-gray-500">
            Complete Your Profile
          </Typography>
          <Typography className="text-gray-500 mt-2">
            Almost there! Please fill in your details to create your account.
          </Typography>
        </Box>

        <CardContent className="p-6 sm:p-10  bg-white rounded-b-2xl">
           <div className='flex max-sm:flex-col mb-4 items-center gap-6'>
                     <img height={100} width={100} className='rounded' src={imgSrc} alt='Profile' />
                     <div className='flex flex-grow flex-col gap-4'>
                       <div className='flex flex-col sm:flex-row gap-4'>
                         <Button component='label' size='small' variant='contained' htmlFor='account-settings-upload-image'>
                           Upload New Photo
                           <input
                             hidden
                             type='file'
                             value={fileInput}
                             accept='image/png, image/jpeg'
                             onChange={handleFileInputChange}
                             id='account-settings-upload-image'
                           />
                         </Button>
                         <Button size='small' variant='outlined' color='error' onClick={handleFileInputReset}>
                           Reset
                         </Button>
                       </div>
                       <Typography>Allowed JPG, GIF or PNG. Max size of 800K</Typography>
                     </div>
                   </div>

          <form onSubmit={handleRegisterUser}>
            <Grid container spacing={4}>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  required
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleFormChange("firstName", e.target.value)
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  required
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => handleFormChange("lastName", e.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Email"
                  value={formData.email}
                  disabled
                  helperText="Verified via OTP"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="tel"
                  required
                  label="Phone Number"
                  value={formData.phoneNumber}
                  placeholder="+91 9876543210"
                  onChange={(e) =>
                    handleFormChange("phoneNumber", e.target.value)
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="tel"
                  label="WhatsApp Number"
                  value={formData.whatsappNumber}
                  placeholder="+91 9876543210"
                  onChange={(e) =>
                    handleFormChange("whatsappNumber", e.target.value)
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Having Passport</InputLabel>
                  <Select
                    label="Having Passport"
                    value={formData.passportStatus}
                    onChange={(e) =>
                      handleFormChange("passportStatus", e.target.value)
                    }
                  >
                    <MenuItem value="having">Yes</MenuItem>
                    <MenuItem value="not">No</MenuItem>
                    <MenuItem value="applied">Applied</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Passport Number"
                  value={formData.passportNumber}
                  placeholder="Z1234567"
                  onChange={(e) =>
                    handleFormChange("passportNumber", e.target.value)
                  }
                   disabled={formData.passportStatus !== 'having'}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Country</InputLabel>
                  <Select
                    label="Country"
                    value={formData.country}
                    onChange={(e) =>
                      handleFormChange("country", e.target.value)
                    }
                  >
                    <MenuItem value="india">India</MenuItem>
                    <MenuItem value="usa">USA</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Address"
                  value={formData.address}
                  placeholder="123 Talent Lane..."
                  multiline
                  rows={3}
                  onChange={(e) => handleFormChange("address", e.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12 }} className="flex justify-end gap-4 mt-4">
                <Button
                  variant="contained"
                  type="submit"
                  size="large"
                  disabled={loading}
                  className="min-w-[180px] bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Complete Registration"
                  )}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
