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

// 1. TOP STEPPER COMPONENT
const Stepper = () => {
  const steps = [
    { label: 'Inquiry', status: 'completed' },
    { label: 'Counselling', status: 'completed' },
    { label: 'Documents', status: 'active' },
    { label: 'Experience', status: 'pending' },
    { label: 'Assessment', status: 'pending' },
  ]

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
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 6, overflowX: 'auto', pb: 1 }}>
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      transition: 'all 0.3s',
                      backgroundColor: step.status === 'completed' ? '#dcfce7' : step.status === 'active' ? '#1976d2' : '#f3f4f6',
                      color: step.status === 'completed' ? '#16a34a' : step.status === 'active' ? '#fff' : '#9ca3af',
                      boxShadow: step.status === 'active' ? '0 4px 10px rgba(25, 118, 210, 0.3)' : 'none'
                    }}
                  >
                    {step.status === 'completed' ? <i className="ri-check-line" style={{ fontSize: '16px', fontWeight: 'bold' }} /> : index + 1}
                  </Box>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 800,
                      color: step.status === 'active' ? '#1976d2' : step.status === 'completed' ? '#1f2937' : '#9ca3af'
                    }}
                  >
                    {step.label}
                  </Typography>
                </Box>
                {index < steps.length - 1 && (
                  <Box sx={{ flex: 1, height: 2, mx: 2, minWidth: 40, backgroundColor: '#e5e7eb', position: 'relative' }}>
                    {step.status === 'completed' && <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '100%', backgroundColor: '#4ade80' }} />}
                  </Box>
                )}
              </React.Fragment>
            ))}
          </Box></Card>
      </Grid>
    </Grid>
  )
}

// 2. POSITION SELECTOR COMPONENT
const PositionSelector = () => {
  const positions = ['Nurse', 'Receptionist', 'Security Guard']
  const [selected, setSelected] = useState('Nurse')

  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="caption" sx={{ fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', mb: 2 }}>
        Position applying for
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
        {positions.map(pos => (
          <Button
            key={pos}
            onClick={() => setSelected(pos)}
            variant="outlined"
            sx={{
              borderRadius: '50px',
              px: 3,
              py: 1,
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '13px',
              borderWidth: '1px',
              borderColor: selected === pos ? '#1976d2' : '#e5e7eb',
              backgroundColor: selected === pos ? '#f0f7ff' : '#fff',
              color: selected === pos ? '#1976d2' : '#6b7280',
              '&:hover': {
                backgroundColor: selected === pos ? '#f0f7ff' : '#f9fafb',
                borderColor: selected === pos ? '#1976d2' : '#d1d5db'
              }
            }}
          >
            {pos}
          </Button>
        ))}
      </Box>
    </Box>
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
              icon={<i className="ri-check-line" style={{ fontSize: '14px', color: '#16a34a', marginLeft: '4px' }} />}
              label="Uploaded"
              size="small"
              sx={{
                backgroundColor: '#dcfce7',
                color: '#16a34a',
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
        <Stepper />

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