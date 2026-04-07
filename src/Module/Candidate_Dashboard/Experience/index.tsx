'use client'

import { useState } from 'react'


import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

const Experience = () => {
    const [selectedExperience, setSelectedExperience] = useState<string | null>(null)

    const experienceTypes = [
        {
            id: 'fresher',
            title: 'Fresher',
            description: 'Starting your career journey. No prior work experience needed.',
            icon: 'ri-graduation-cap-line'
        },
        {
            id: 'domestic',
            title: 'Domestic Experience',
            description: 'Professional experience gained within your home country.',
            icon: 'ri-briefcase-line'
        },
        {
            id: 'abroad',
            title: 'Abroad Experience',
            description: 'Valuable work experience acquired in international settings.',
            icon: 'ri-trophy-line'
        },
        {
            id: 'freelancer',
            title: 'Freelancer',
            description: 'Self-employed or contract-based professional work history.',
            icon: 'ri-clipboard-line'
        }
    ]

    return (
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Card
                sx={{
                    width: '100%',
                    maxWidth: '1000px',
                    p: { xs: 3, md: 6 },
                    borderRadius: '24px',
                    boxShadow: '0px 4px 24px rgba(0,0,0,0.04)',
                    border: '1px solid #f3f4f6'
                }}
            >

                <Box sx={{ textAlign: 'left', mb: 6 }}>
                    <Typography
                        variant="subtitle2"
                        sx={{
                            color: '#6b7280',

                            mb: 1.5,
                            letterSpacing: '0.5px'
                        }}
                    >
                        Step 4 of 5: Experience Selection
                    </Typography>
                    <Typography
                        variant="h4"
                        sx={{

                            mb: 2
                        }}
                    >
                        Select Your Experience Type
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            fontSize: '13px',
                            fontWeight: '500',
                            color: '#6b7280',
                            lineHeight: 1.2,
                            maxWidth: '900px',


                        }}
                    >
                        Please select the option that best describes your professional background. This helps us tailor your application process.
                    </Typography>
                </Box>


                <Grid container spacing={4} sx={{ mb: 6 }}>
                    {experienceTypes.map((type) => {
                        const isSelected = selectedExperience === type.id

                        return (
                            <Grid size={{ xs: 12, sm: 6 }} key={type.id}>
                                <Card
                                    onClick={() => setSelectedExperience(type.id)}
                                    sx={{
                                        height: '100%',
                                        pt: 6,
                                        px: 4,
                                        pb: 13,
                                        cursor: 'pointer',
                                        borderRadius: '16px',
                                        border: '2px solid',
                                        borderColor: isSelected ? '#1976d2' : '#e5e7eb',
                                        backgroundColor: isSelected ? '#f0f7ff' : '#ffffff',
                                        boxShadow: isSelected ? '0 10px 25px -5px rgba(25, 118, 210, 0.1), 0 8px 10px -6px rgba(25, 118, 210, 0.1)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
                                        transition: 'all 0.2s ease-in-out',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        '&:hover': {
                                            borderColor: isSelected ? '#1976d2' : '#d1d5db',
                                            transform: 'translateY(-2px)'
                                        }
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 64,
                                            height: 64,
                                            borderRadius: '50%',
                                            backgroundColor: isSelected ? '#ffffff' : '#f0f7ff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mb: 3,
                                            boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
                                        }}
                                    >
                                        <i className={type.icon} style={{ fontSize: '28px', color: '#1976d2' }}></i>
                                    </Box>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 800,
                                            color: '#111827',
                                            mb: 1.5
                                        }}
                                    >
                                        {type.title}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: '#6b7280',
                                            lineHeight: 1.5
                                        }}
                                    >
                                        {type.description}
                                    </Typography>
                                </Card>
                            </Grid>
                        )
                    })}
                </Grid>

                {/* Action Buttons */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 2,
                        pt: 4,
                        borderTop: '1px solid #f3f4f6'
                    }}
                >
                    <Button
                        variant="outlined"
                        sx={{
                            borderRadius: '12px',
                            px: 4,
                            py: 1.5,
                            textTransform: 'none',
                            fontWeight: 800,
                            color: '#374151',
                            borderColor: '#d1d5db',
                            '&:hover': {
                                backgroundColor: '#f9fafb',
                                borderColor: '#9ca3af'
                            }
                        }}
                    >
                        Back to Document Upload
                    </Button>
                    <Button
                        variant="contained"
                        disabled={!selectedExperience}
                        sx={{
                            borderRadius: '12px',
                            px: 4,
                            py: 1.5,
                            textTransform: 'none',
                            fontWeight: 800,
                            backgroundColor: '#1976d2',
                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                            '&:hover': {
                                backgroundColor: '#1565c0',
                                boxShadow: '0 6px 16px rgba(25, 118, 210, 0.3)'
                            },
                            '&.Mui-disabled': {
                                backgroundColor: '#bfdbfe',
                                color: '#ffffff',
                                boxShadow: 'none'
                            }
                        }}
                    >
                        Continue to Assessment
                    </Button>
                </Box>
            </Card>
        </Box>
    )
}

export default Experience