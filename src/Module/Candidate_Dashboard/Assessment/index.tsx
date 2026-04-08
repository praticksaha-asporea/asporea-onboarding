'use client'

import React from 'react'

// MUI Imports

import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

const Stepper = () => {
    const steps = [
        { label: 'Inquiry', status: 'completed', icon: 'ri-question-line' },
        { label: 'Counselling', status: 'completed', icon: 'ri-checkbox-circle-line' },
        { label: 'Documents', status: 'completed', icon: 'ri-upload-cloud-2-line' },
        { label: 'Experience', status: 'completed', icon: 'ri-briefcase-line' },
        { label: 'Assessment', status: 'active', icon: 'ri-trophy-line' },
        { label: 'Technical Round', status: 'pending', icon: 'ri-file-list-3-line' },
    ]

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                mb: 8,
                overflowX: 'auto',
                pb: 2
            }}
        >
            {steps.map((step, index) => (
                <Box
                    key={index}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1.5,
                        flexShrink: 0,
                        minWidth: '100px'
                    }}
                >
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            transition: 'all 0.3s',

                            backgroundColor: step.label === 'Assessment' ? '#ccfbf1' : (step.status === 'completed' ? '#1976d2' : '#f3f4f6'),
                            color: step.label === 'Assessment' ? '#14b8a6' : (step.status === 'completed' ? '#fff' : '#9ca3af'),
                            border: step.status === 'active' && step.label !== 'Assessment' ? '2px solid #1976d2' : 'none',
                            boxShadow: step.status === 'active' ? '0 0 15px rgba(0,0,0,0.05)' : 'none'
                        }}
                    >
                        <i className={step.icon}></i>
                    </Box>
                    <Typography
                        sx={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: step.status === 'active' ? '#1976d2' : (step.status === 'completed' ? '#1f2937' : '#9ca3af'),
                            textAlign: 'center'
                        }}
                    >
                        {step.label}
                    </Typography>
                </Box>
            ))}
        </Box>
    )
}

// Custom Status Badge
const StatusBadge = ({ status }: { status: string }) => {
    const isCompleted = status === 'Completed'
    return (
        <Box
            sx={{
                fontSize: '12px',
                fontWeight: 500,

                backgroundColor: 'transparent',
                border: 'none',
                padding: 0,
                textTransform: 'capitalize',
                letterSpacing: '0.2px'
            }}
        >
            {status}
        </Box>
    )
}


const JourneyCard = ({ title, status, dateLabel, date, description, buttonLabel, disabledButton }: any) => {
    return (
        <Card
            variant="outlined"
            sx={{
                mb: 3,
                p: { xs: 3, sm: 4 },
                borderRadius: '16px',
                borderColor: '#e5e7eb',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                transition: 'all 0.2s',
                '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
            }}
        >

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>


                <Typography variant="h6" sx={{   fontSize: '0.9rem', mt: 0.5 }}>
                    {title}
                </Typography>


                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <StatusBadge status={status} />

                    {dateLabel && date && (
                        <Typography variant="caption" sx={{ fontWeight: 400, color: '#6b7280', whiteSpace: 'nowrap' }}>
                            {dateLabel}: <span style={{ fontWeight: 400, color: '#6b7280' }}>{date}</span>
                        </Typography>
                    )}
                </Box>
            </Box>

            {/* Description */}
            <Typography variant="body2" sx={{ color: '#4b5563', lineHeight: 1.6, mb: 3 }}>
                {description}
            </Typography>


            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    pt: 2.5,
                    borderTop: '1px solid #f3f4f6'
                }}
            >

                {buttonLabel && (
                    <Button
                        variant="contained"
                        disabled={disabledButton}
                        sx={{
                            borderRadius: '8px',
                            px: 3,
                            py: 1,
                            textTransform: 'none',
                            fontWeight: 800,
                            backgroundColor: disabledButton ? '#e3f2fd' : '#1976d2',
                            color: disabledButton ? '#93c5fd' : '#fff',
                            boxShadow: 'none',
                            '&:hover': {
                                backgroundColor: disabledButton ? '#e3f2fd' : '#1565c0',
                                boxShadow: 'none'
                            },
                            '&.Mui-disabled': {
                                backgroundColor: '#e3f2fd',
                                color: '#93c5fd',
                            }
                        }}
                    >
                        {buttonLabel}
                    </Button>
                )}
            </Box>
        </Card>
    )
}

// Main Page Component
const Assessment = () => {
    return (
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Card
                sx={{
                    width: '100%',
                    maxWidth: '900px',
                    p: { xs: 3, md: 6 },
                    borderRadius: '24px',
                    boxShadow: '0px 4px 24px rgba(0,0,0,0.04)',
                    border: '1px solid #f3f4f6'
                }}
            >

                <Typography variant='h4' sx={{ mb: 6 }}>
                    Application Status Tracking
                </Typography>


                <Stepper />

                <Box sx={{ mt: 5 }}>

                    <Typography variant='h5' sx={{ fontWeight: 500, mb: 4 }}>
                        Your Application Journey
                    </Typography>


                    <JourneyCard
                        title="Inquiry Submission"
                        status="Completed"
                        dateLabel="Completed"
                        date="Feb 27, 2026"
                        description="A Talent Acquisition Consultant will be assigned to you shortly to guide you through the next stages."
                    />

                    <JourneyCard
                        title="Pre-Counselling Readiness"
                        status="Completed"
                        dateLabel="Completed"
                        date="Feb 27, 2026"
                        description="Please confirm your readiness for pre-counselling sessions. This is a crucial step."
                    />

                    <JourneyCard
                        title="Document Verification"
                        status="Pending"
                        dateLabel="Uploaded"
                        date="Feb 28, 2026"
                        description="All uploaded documents (ID, Resume, Certificates) have been verified and approved. Good job!"
                    />

                    <JourneyCard
                        title="Experience Verification"
                        status="Pending"
                        dateLabel="Filled"
                        date="Feb 28, 2026"
                        description="Your experience type has been confirmed as 'Domestic Professional'."
                    />

                    <JourneyCard
                        title="Assessment"
                        status="Pending"
                        description="Your initial online assessment is currently in progress. Please complete it by the deadline."
                        buttonLabel="Schedule Assessment"
                        disabledButton={false}
                    />

                    <JourneyCard
                        title="Technical Round"
                        status="Pending"
                        dateLabel="Scheduled"
                        date="Feb 01, 2024"
                        description="Assessor will decide if you will need to clear this round or no need. We will notify you of the result after assessment."
                        buttonLabel="View Result"
                        disabledButton={true}
                    />

                </Box>
            </Card>
        </Box>
    )
}

export default Assessment