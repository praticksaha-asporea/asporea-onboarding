'use client'

import React, { useState, useRef } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Chip from '@mui/material/Chip'
import Stepper from '@mui/material/Stepper';
import { Checkbox, Stack, Step, StepConnector, stepConnectorClasses, StepIconProps, StepLabel } from '@mui/material'
import { lighten, styled } from '@mui/material/styles'

// 1. TOP STEPPER COMPONENT
const Stepper_Steps = () => {
  const steps = [
    { label: 'Inquiry', status: 'completed' },
    { label: 'Counselling', status: 'completed' },
    { label: 'Documents', status: 'active' },
    { label: 'Experience', status: 'pending' },
    { label: 'Assessment', status: 'pending' },
  ];


  const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
      top: 22,
    },
    [`&.${stepConnectorClasses.active}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        backgroundImage:
          `linear-gradient(270deg, ${lighten(
            theme.palette.primary.main,
            0.5
          )}, var(--mui-palette-primary-main) 100%)`
      },
    },
    [`&.${stepConnectorClasses.completed}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        backgroundImage:
          `linear-gradient(270deg, ${lighten(
            theme.palette.primary.main,
            0.5
          )}, var(--mui-palette-primary-main) 100%)`,
      },
    },
    [`& .${stepConnectorClasses.line}`]: {
      height: 3,
      border: 0,
      backgroundColor: '#eaeaf0',
      borderRadius: 1,
      ...theme.applyStyles('dark', {
        backgroundColor: theme.palette.grey[800],
      }),
    },
  }));

  const ColorlibStepIconRoot = styled('div')<{
    ownerState: { completed?: boolean; active?: boolean };
  }>(({ theme }) => ({
    backgroundColor: '#ccc',
    zIndex: 1,
    color: '#fff',
    width: 50,
    height: 50,
    display: 'flex',
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.applyStyles('dark', {
      backgroundColor: theme.palette.grey[700],
    }),
    variants: [
      {
        props: ({ ownerState }) => ownerState.active,
        style: {
          backgroundImage:
            `linear-gradient(270deg, ${lighten(
              theme.palette.primary.main,
              0.5
            )}, var(--mui-palette-primary-main) 100%)`,
          boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
        },
      },
      {
        props: ({ ownerState }) => ownerState.completed,
        style: {
          backgroundImage:
            `linear-gradient(270deg, ${lighten(
              theme.palette.primary.main,
              0.5
            )}, var(--mui-palette-primary-main) 100%)`,
        },
      },
    ],
  }));

  function ColorlibStepIcon(props: StepIconProps) {
    const { active, completed, className } = props;

    const icons: { [index: string]: React.ReactElement<unknown> } = {
      1: <i className="material-symbols--help-outline" />,
      2: <i className="material-symbols--check-circle-outline" />,
      3: <i className="material-symbols--file-upload" />,
      4: <i className="material-symbols--work-outline" />,
      5: <i className="material-symbols--emoji-events" />,
    };

    return (
      <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
        {icons[String(props.icon)]}
      </ColorlibStepIconRoot>
    );
  }

  return (
    <Grid container spacing={6}>
      {/* Left Section   */}
      <Grid size={{ xs: 12, md: 12 }}>
        <Typography variant="h4">
          Document Upload & Verification
        </Typography>

        <Typography variant="body1" sx={{ color: "text.secondary", mb: 6 }}>
          Please upload the required documents for verification. Ensure all documents are clear and valid to avoid delays.
        </Typography>

        <Card
          sx={{
            p: { xs: 2, sm: 6 },
            borderRadius: "15px",
            boxShadow: "0px 4px 18px rgba(0,0,0,0.04)",
          }}
        >
          <Stack sx={{ width: '100%' }} spacing={4}>
            <Stepper alternativeLabel activeStep={2} connector={<ColorlibConnector />}>
              {steps.map(({ label, status }) => (
                <Step key={label}>
                  <StepLabel StepIconComponent={ColorlibStepIcon}>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Stack>
        </Card>
      </Grid>
    </Grid>
  )
}

const PositionSelector = () => {
const positions = [
    'Nurse',
    'Caregiver',
    'Cashier',
    'Sales Associate',
    'Sales Merchandiser',
    'Storekeeper',
    'CNC Operator & Programmer',
    'Warehouse Helper',
    'Order Picker',
    'Checker / Receiver',
    'F&B Service',
    'F&B Production',
    'Front Office',
    'Housekeeping',
    'General Worker',
    'Forklift Operator',
    'Trailer Driver',
    'CNC Operator',
    'Data Entry Operator'
  ];
  const [selected, setSelected] = useState('Nurse')

  return (
    <Card sx={{
            p: { xs: 2, sm: 6 },
            borderRadius: "15px",
            boxShadow: "0px 4px 18px rgba(0,0,0,0.04)",
            mt:6
          }}>
    <Box sx={{ mb: 6 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', letterSpacing: '0.5px', display: 'block', mb: 5 }}>
        Position applying for
      </Typography>
      
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 4 }}>
        {positions.map((pos) => (
          <Button
            key={pos}
            variant={
              selected === pos ? "contained" : "outlined"
            }
            onClick={() => setSelected(pos)}
            sx={{
              borderRadius: "20px",
              textTransform: "none",
              px: 3,
              borderColor:
                selected===pos ? "primary.main" : "#e0e0e0",
              backgroundColor:
                selected===pos
                  ? "primary.main"
                  : "var(--variant-outlinedBg)",
              color:
                selected===pos
                  ? "white"
                  : "#6b7280",
              "&:hover": {
                borderColor: selected===pos
                  ? "primary.main"
                  : "#e0e0e0",
              },
              "&.Mui-disabled": {
                backgroundColor: "#f5f5f5",
                color: "#bdbdbd",
                borderColor: "#e0e0e0",
              },
            }}
          >
            {pos}
          </Button>
        ))}
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          sx={{
            width: 16,
            height: 16,
            borderRadius: "4px",
            backgroundColor: "#1976d2",
          }}
        />
        <Typography variant="body2">Selected</Typography>
        <Box
          sx={{
            width: 16,
            height: 16,
            borderRadius: "4px",
            border: "1px solid #ccc",
            backgroundColor: "transparent",
          }}
        />
        <Typography variant="body2">Available</Typography>
      </Box>
    </Box>
    </Card>
  )
}

// 3. UPLOAD CARD COMPONENT
const UploadCard = ({ title, subtitle }: { title: string, subtitle?: string }) => {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  return (
    <Card variant="outlined" sx={{ borderRadius: '16px', display: 'flex', flexDirection: 'column', height: '100%', borderColor: '#e5e7eb', boxShadow: 'none', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }, transition: 'all 0.2s' }}>
      <Box sx={{ p: 2.5, borderBottom: '1px solid #f3f4f6', backgroundColor: '#f9fafb' }}>
        <Typography sx={{ fontWeight: 800, fontSize: '13px', color: '#1f2937', lineHeight: 1.2 }}>{title}</Typography>
        {subtitle && <Typography sx={{ fontSize: '11px', color: '#6b7280', mt: 0.5, fontWeight: 600 }}>{subtitle}</Typography>}
      </Box>
      <Box
        sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Box
          onClick={() => fileInputRef.current?.click()}
          sx={{
            width: '100%',
            height: '100%',
            minHeight: '140px',
            border: '2px dashed',
            borderColor: isDragging ? '#1976d2' : '#d1d5db',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            cursor: 'pointer',
            backgroundColor: isDragging ? '#f0f7ff' : '#f9fafb',
            transition: 'all 0.2s',
            '&:hover': { borderColor: '#93c5fd', backgroundColor: '#f0f7ff' }
          }}
        >
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} style={{ display: 'none' }} />

          {file ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <i className="ri-file-text-fill" style={{ fontSize: '32px', color: '#1976d2', marginBottom: '8px' }}></i>
              <Typography sx={{ fontSize: '13px', fontWeight: 800, color: '#1f2937', maxWidth: '160px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {file.name}
              </Typography>
              <Typography sx={{ fontSize: '11px', color: '#16a34a', fontWeight: 800, mt: 0.5 }}>File attached</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Box sx={{ width: 40, height: 40, backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <i className="ri-upload-cloud-2-line" style={{ fontSize: '20px', color: '#1976d2' }}></i>
              </Box>
              <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#4b5563' }}>
                Drop your files here or <span style={{ color: '#1976d2', fontWeight: 800 }}>browse</span>
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Card>
  )
}

// 4. ACCORDION WRAPPER COMPONENT
const SectionAccordion = ({ title, status, defaultExpanded = false, children }: { title: string, status?: string, defaultExpanded?: boolean, children: React.ReactNode }) => {
  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      disableGutters
      elevation={0}
      sx={{
        border: '1px solid #e5e7eb',
        borderRadius: '16px !important',
        mb: 3,
        '&:before': { display: 'none' },
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}
    >
      <AccordionSummary
        expandIcon={
          <Box sx={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ri-arrow-down-s-line" style={{ fontSize: '20px', color: '#6b7280' }}></i>
          </Box>
        }
        sx={{
          p: 3,
          backgroundColor: '#fff',
          '&:hover': { backgroundColor: '#f9fafb' },
          borderBottom: '1px solid #f3f4f6'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography sx={{ fontSize: '16px', fontWeight: 800, color: '#111' }}>{title}</Typography>
          {status === 'uploaded' && (
            <Chip
              label="Uploaded"
              size="small"
              sx={{
                backgroundColor: '#e6f2fe',
                color: 'var(--mui-palette-primary-main)',
                fontWeight: 800,
                fontSize: '11px',
                height: '24px',
                borderRadius: '6px',
                border: '1px solid #bbf7d0'
              }}
            />
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 4, backgroundColor: '#fafbfc' }}>
        {children}
      </AccordionDetails>
    </Accordion>
  )
}

// 5. MAIN PAGE COMPONENT
const DocumentUploadPage = () => {
  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <Card sx={{ width: '100%', p: { xs: 3, md: 6 }, borderRadius: '24px', boxShadow: '0px 4px 24px rgba(0,0,0,0.04)', border: '1px solid #f3f4f6' }}>

        {/* Top Stepper */}
        <Stepper_Steps />

        {/* Position Selector */}
        <PositionSelector />

        <Box sx={{ mt: 5 }}>
          {/* Section 1: Resume */}
          <SectionAccordion title="Resume / CV" status="uploaded" defaultExpanded={false}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                <UploadCard title="Updated Resume / CV" subtitle="PDF, DOCX format" />
              </Grid>
            </Grid>
          </SectionAccordion>

          {/* Section 2: Basic Documents */}
          <SectionAccordion title="Basic Documents" defaultExpanded={true}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <UploadCard title="Full Photo - Clear Background" subtitle="png, jpg | Aspect 9:16" />
              </Grid>
              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <UploadCard title="Passport" subtitle="1st & last 2 pages" />
              </Grid>
              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <UploadCard title="ID Proof" subtitle="Aadhar / Voter" />
              </Grid>
            </Grid>
          </SectionAccordion>

          {/* Section 3: Experience Certificates */}
          <SectionAccordion title="Experience Certificates" defaultExpanded={true}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <UploadCard title="Offer Letter" />
              </Grid>
              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <UploadCard title="Work Experience Letter" />
              </Grid>
              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <UploadCard title="OJT / Internship" />
              </Grid>
            </Grid>
          </SectionAccordion>

          {/* Section 4: Academic Certificates */}
          <SectionAccordion title="Academic Certificates" defaultExpanded={true}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                <UploadCard title="Nursing Registration Certificate" />
              </Grid>
              <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                <UploadCard title="Degree Certificate" />
              </Grid>
              <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                <UploadCard title="Mark Sheets" subtitle="All Semesters" />
              </Grid>
              <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                <UploadCard title="Passing Certificates" subtitle="10th, 12th, GNM / BSc" />
              </Grid>
            </Grid>
          </SectionAccordion>
        </Box>

        {/* Bottom Save Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 6, pt: 4, borderTop: '1px solid #f3f4f6' }}>
          <Button
            variant="contained"
            sx={{
              borderRadius: '12px',
              px: 6,
              py: 1.8,
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '15px',
              backgroundColor: '#1976d2',
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
              '&:hover': { backgroundColor: '#1565c0', boxShadow: '0 6px 16px rgba(25, 118, 210, 0.3)' }
            }}
          >
            Save & Continue
          </Button>
        </Box>

      </Card>
    </Box>
  )
}

export default DocumentUploadPage