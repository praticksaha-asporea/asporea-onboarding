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
import { Stack, Step, StepConnector, stepConnectorClasses, StepIconProps, StepLabel } from '@mui/material'
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

        <Typography variant="body1" className="text.secondary mb-6">
          Please upload the required documents for verification. Ensure all documents are clear and valid to avoid delays.
        </Typography>

        <Card
          className="p-2 sm:p-6 rounded-xl shadow-md"
        >
          <Stack className="w-full" spacing={4}>
            <Stepper alternativeLabel activeStep={2} connector={<ColorlibConnector />}>
              {steps.map(({ label }) => (
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
    <Card className="p-2 sm:p-6 rounded-xl shadow-md mt-6">
      <Box className="mb-6">
        <Typography variant="h5" className="font-bold tracking-wide block mb-5">
          Position applying for
        </Typography>

        <Box className="flex flex-wrap gap-1.5 mb-4">
          {positions.map((pos) => (
            <Button
              key={pos}
              variant={
                selected === pos ? "contained" : "outlined"
              }
              onClick={() => setSelected(pos)}
              className={`rounded-full normal-case px-3 border
              ${selected === pos
                  ? ' border-[var(--mui-palette-primary-main)] text-white hover:border-[var(--mui-palette-primary-main)]'
                  : 'bg-[var(--variant-outlinedBg)] border-[#e0e0e0] text-[var(--mui-palette-text-primary)] hover:border-[#e0e0e0]'}
              disabled:bg-[#f5f5f5] disabled:text-[#bdbdbd] disabled:border-[#e0e0e0]
            `}
            >
              {pos}
            </Button>
          ))}
        </Box>
        <Box className="flex items-center gap-1">
          <Box
            className="w-4 h-4 rounded bg-blue-600"
          />
          <Typography variant="body2">Selected</Typography>
          <Box
            className="w-4 h-4 rounded border border-gray-300 bg-transparent"
          />
          <Typography variant="body2">Available</Typography>
        </Box>
      </Box>
    </Card>
  )
}

// 3. UPLOAD CARD COMPONENT
const UploadCard = ({ title, subtitle, allowedFormats }: { title: string, subtitle?: string, allowedFormats?: string[] }) => {

  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isValidFile = (file: File, allowedFormats: string[]) => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    return fileExtension && allowedFormats.includes(fileExtension)
  }
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

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const selectedFile = files[0]

      if (allowedFormats && !isValidFile(selectedFile, allowedFormats)) {
        alert('Invalid file type')
        return
      }

      setFile(selectedFile)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files

    if (files && files.length > 0) {
      const selectedFile = files[0]

      if (allowedFormats && !isValidFile(selectedFile, allowedFormats)) {
        alert('Invalid file type')
        return
      }

      setFile(selectedFile)
    }
  }

  return (
    <Card variant="outlined" className="rounded-[16px] flex flex-col h-full shadow-none hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all duration-200">
      <Box className="p-2.5 h-[2.4em] flex items-center justify-center">
        <Typography className="font-extrabold text-[13px] leading-[1.2] text-center overflow-hidden">
          {title}
        </Typography>
      </Box>
      <Box
        className="p-2.5 flex flex-col flex-grow bg-[var(--mui-overlays-1)]"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Box
          onClick={() => fileInputRef.current?.click()}
          className={`w-full h-full min-h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-3 cursor-pointer transition-all duration-200
            ${isDragging ? 'border-blue-600 bg-blue-50' : ''}
            hover:border-blue-300 hover:bg-[var(--mui-palette-secondary-lightOpacity)]
          `}
        >
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept={allowedFormats?.map(ext => `.${ext}`).join(',')} />

          {file ? (
            <Box className="flex flex-col items-center text-center">
              <i className="ri-file-text-fill text-3xl text-[var(--mui-palette-primary-main)] mb-2"></i>
              <Typography className="text-sm font-extrabold text-gray-800 max-w-xs whitespace-nowrap overflow-hidden text-ellipsis">
                {file.name}
              </Typography>
              <Typography className="text-xs text-green-600 font-extrabold mt-0.5">File attached</Typography>
            </Box>
          ) : (
            <Box className="flex flex-col items-center text-center">
              <Box className="w-10 h-10 bg-var(--mui-overlays-1) border border-gray-200 rounded-full flex items-center justify-center mb-2 shadow-sm">
                <i className="ri-upload-cloud-2-line text-xl text-[var(--mui-palette-primary-main)]"></i>
              </Box>
              <Typography className="text-xs font-semibold">
                Drop your files here or <span className="text-[var(--mui-palette-primary-main)] font-extrabold">browse</span>
              </Typography>
            </Box>
          )}
        </Box>

        {subtitle && (
          <Typography
            className="text-xs  text-center whitespace-pre-line pt-3 leading-[1.2] h-[4.2em] overflow-hidden"
          >
            {subtitle}
          </Typography>
        )}
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
      className=" mb-3 overflow-hidden shadow-sm before:hidden"
    >
      <AccordionSummary
        expandIcon={
          <Box className="w-8 h-8 rounded-full flex items-center justify-center">
            <i className="ri-arrow-down-s-line text-xl"></i>
          </Box>
        }
        className="p-3 bg-var(--mui-overlays-1) hover:bg-[var(--mui-palette-primary-main)]"
      >
        <Box className="flex items-center gap-2">
          <Typography className="text-base font-extrabold">{title}</Typography>
          {status === 'uploaded' && (
            <Chip
              label="Uploaded"
              size="small"
              className="bg-blue-50 text-[var(--mui-palette-primary-main)] font-extrabold text-xs h-6 rounded border border-green-200"
            />
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails className="p-4">
        {children}
      </AccordionDetails>
    </Accordion>
  )
}

// 5. MAIN PAGE COMPONENT
const DocumentUploadPage = () => {
  return (
    <Box className="w-full flex justify-center">
      <Card className="w-full p-3 md:p-6 rounded-3xl shadow-md border border-gray-100">

        {/* Top Stepper */}
        <Stepper_Steps />

        {/* Position Selector */}
        <PositionSelector />
        <Box className="mt-5">
          {/* Section 1: Resume */}
          <SectionAccordion title="Resume" status="uploaded" defaultExpanded={false}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                <UploadCard
                  title="Resume / CV"
                  subtitle={`Supported format: PDF, DOCX`}
                  allowedFormats={['pdf', 'docx']}
                />
              </Grid>
            </Grid>
          </SectionAccordion>

          {/* Section 2: Documents */}
          <SectionAccordion title="Documents" defaultExpanded={true}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <UploadCard
                  title="Full Photo"
                  subtitle={`Supported format: JPG, PNG\n(Aspect Ratio: 9:16)`}
                  allowedFormats={['jpg', 'png']}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <UploadCard
                  title="Passport"
                  subtitle={`Supported format: JPG, PDF, PNG\n(First & Last 2 Pages)`}
                  allowedFormats={['jpg', 'png', 'pdf']}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <UploadCard
                  title="ID Proof"
                  subtitle={`Supported format: JPG, PDF, PNG\n(Aadhar / Voter Card)`}
                  allowedFormats={['jpg', 'png', 'pdf']}
                />
              </Grid>
            </Grid>
          </SectionAccordion>

          {/* Section 3: Experience Certificates */}
          <SectionAccordion title="Experience Certificates" defaultExpanded={true}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <UploadCard
                  title="Offer Letter / Letter of Appointment"
                  subtitle={`Supported format: JPG, PDF, PNG`}
                  allowedFormats={['jpg', 'png', 'pdf']}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <UploadCard
                  title="Work Experience Letter / Service Certificate"
                  subtitle={`Supported format: JPG, PDF, PNG`}
                  allowedFormats={['jpg', 'png', 'pdf']}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <UploadCard
                  title="OJT / Internship Letter / Certificate"
                  subtitle={`Supported format: JPG, PDF, PNG`}
                  allowedFormats={['jpg', 'png', 'pdf']}
                />
              </Grid>
            </Grid>
          </SectionAccordion>

          {/* Section 4: Academic Certificates */}
          <SectionAccordion title="Academic Certificates" defaultExpanded={true}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <UploadCard
                  title="Nursing Council Registration Certificate"
                  subtitle={`Supported format: JPG, PDF, PNG\n(Nursing)`}
                  allowedFormats={['jpg', 'png', 'pdf']}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <UploadCard
                  title="Degree Certificate"
                  subtitle={`Supported format: JPG, PDF, PNG`}
                  allowedFormats={['jpg', 'png', 'pdf']}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <UploadCard
                  title="Mark Sheets – All Semesters / Years"
                  subtitle={`Supported format: JPG, PDF, PNG\n(Post Basic Nursing)`}
                  allowedFormats={['jpg', 'png', 'pdf']}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <UploadCard
                  title="Passing Certificate"
                  subtitle={`Supported format: JPG, PDF, PNG\n(GNM)`}
                  allowedFormats={['jpg', 'png', 'pdf']}
                />
              </Grid>
            </Grid>
          </SectionAccordion>
        </Box>

        {/* Bottom Save Button */}
        <Box className="flex justify-end mt-6 pt-4">
          <Button
            variant="contained"
            className="rounded-xl px-6 py-2 normal-case text-sm shadow-md hover:bg-blue-700 hover:shadow-lg"
            href="/experience"
          >
            Save & Continue
          </Button>
        </Box>

      </Card>
    </Box>
  )
}

export default DocumentUploadPage