'use client'

import { useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import Chip from '@mui/material/Chip'

// Reusable File Upload Box Component
const FileUploadField = ({ label, subLabel }: { label: string, subLabel?: string }) => (
  <Box sx={{ mb: 5 }}>
    <Typography variant="body2" sx={{ fontWeight: 800, color: '#000', mb: 1.5 }}>
      {label} {subLabel && <span style={{ fontWeight: 400, color: '#666', fontSize: '12px' }}>({subLabel})</span>}
    </Typography>
    <Box 
      sx={{ 
        border: '2px dashed #d1d5db', 
        borderRadius: '12px', 
        p: 4, 
        textAlign: 'center',
        backgroundColor: '#f9fafb',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': { borderColor: '#1976d2', backgroundColor: '#f0f7ff' }
      }}
    >
      <i className="ri-upload-cloud-2-line" style={{ fontSize: '32px', color: '#1976d2' }}></i>
      <Typography variant="body2" sx={{ mt: 1, fontWeight: 700, color: '#111' }}>
        Click to upload or drag and drop
      </Typography>
      <Typography variant="caption" sx={{ color: '#6b7280' }}>
        PDF, JPG or PNG (Max 5MB)
      </Typography>
    </Box>
  </Box>
)

const DocumentUpload = () => {
  return (
    <Grid container spacing={6}>
      
      {/* LEFT SECTION: MAIN FORM */}
      <Grid size={{ xs: 12, md: 8 }}>
        <Card sx={{ p: { xs: 2, sm: 6 }, borderRadius: '16px', boxShadow: '0px 4px 18px rgba(0,0,0,0.04)' }}>
          
          <Typography variant='h4' sx={{ fontWeight: 900, color: '#000', mb: 1.5 }}>
            Upload Required Documents
          </Typography>
          <Typography variant='body1' sx={{ color: '#666', mb: 8, lineHeight: 1.6 }}>
            Please upload the following documents to complete your application. Accepted formats: PDF, JPG, PNG (Max 5MB each).
          </Typography>

          {/* All 6 Fields as per image */}
          <FileUploadField label="Recent Passport Size Photo" />
          <FileUploadField label="Identity Proof" subLabel="Aadhar Card / PAN Card / Passport" />
          <FileUploadField label="Updated Resume / CV" />
          <FileUploadField label="Academic Certificates" subLabel="10th, 12th, Graduation" />
          <FileUploadField label="Experience Letters" subLabel="If applicable" />
          <FileUploadField label="Last 3 Months Salary Slips" subLabel="If applicable" />

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mt: 6, justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined" 
              sx={{ 
                borderRadius: '8px', 
                px: 4, 
                py: 1.5, 
                textTransform: 'none', 
                fontWeight: 800, 
                color: '#374151', 
                borderColor: '#d1d5db' 
              }}
            >
              Save Draft
            </Button>
            <Button 
              variant="contained" 
              sx={{ 
                borderRadius: '8px', 
                px: 4, 
                py: 1.5, 
                textTransform: 'none', 
                fontWeight: 800, 
                backgroundColor: '#1976d2', 
                boxShadow: 'none',
                '&:hover': { backgroundColor: '#1565c0', boxShadow: 'none' }
              }}
            >
              Submit Documents
            </Button>
          </Box>
        </Card>
      </Grid>

      {/* RIGHT SECTION: SIDEBAR */}
      <Grid size={{ xs: 12, md: 4 }}>
        
        {/* Application Progress Card */}
        <Card sx={{ borderRadius: '16px', mb: 6, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
          <CardContent sx={{ p: 6 }}>
            <Typography variant='subtitle1' sx={{ fontWeight: 800, color: '#000', mb: 3 }}>
                Your Application Progress
            </Typography>
            <Typography variant='body2' sx={{ mb: 2, color: '#666', fontWeight: 500 }}>
                Documents: 3 of 7 steps complete
            </Typography>
            <LinearProgress 
                variant="determinate" 
                value={42} 
                sx={{ height: 10, borderRadius: 5, mb: 2, backgroundColor: '#f3f4f6', '& .MuiLinearProgress-bar': { backgroundColor: '#1976d2' } }} 
            />
            <Typography variant='caption' sx={{ color: '#1976d2', fontWeight: 700 }}>
                Verification in progress after upload.
            </Typography>
          </CardContent>
        </Card>

        {/* Verification Status Card */}
        <Card sx={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: 'none' }}>
          <CardContent sx={{ p: 6 }}>
            <Typography variant='subtitle1' sx={{ fontWeight: 800, color: '#000', mb: 4 }}>
                Verification Status
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
              {[
                { name: 'Passport Photo', status: 'Uploaded', color: 'success' },
                { name: 'Identity Proof', status: 'Pending', color: 'warning' },
                { name: 'Resume / CV', status: 'Rejected', color: 'error' },
                { name: 'Academic Certs', status: 'Pending', color: 'warning' }
              ].map((doc, index) => (
                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <i className="ri-file-text-line" style={{ fontSize: '20px', color: '#666' }}></i>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#333' }}>{doc.name}</Typography>
                  </Box>
                  <Chip 
                    label={doc.status} 
                    size="small" 
                    color={doc.color as any} 
                    sx={{ 
                        fontWeight: 900, 
                        fontSize: '10px', 
                        borderRadius: '6px',
                        height: '22px'
                    }} 
                  />
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

      </Grid>
    </Grid>
  )
}

export default DocumentUpload