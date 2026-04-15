"use client";

import { useRef, useState } from "react";

import clsx from "clsx";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { Alert, AlertTitle } from "@mui/material";


const UploadCard = ({ subtitle, allowedFormats }: { subtitle?: string, allowedFormats?: string[] }) => {

  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isValidFile = (file: File, allowedFormats: string[]) => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    return fileExtension && allowedFormats.includes(fileExtension)
  }

  const validateFiles = (fileList: FileList | File[]) => {
    const validFiles: File[] = []

    Array.from(fileList).forEach((file) => {
      if (allowedFormats && !isValidFile(file, allowedFormats)) {
        return
      }
      validFiles.push(file)
    })

    return validFiles
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

    const droppedFiles = e.dataTransfer.files
    if (droppedFiles && droppedFiles.length > 0) {
      const validFiles = validateFiles(droppedFiles)
      setFiles(prev => [...prev, ...validFiles])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files

    if (selectedFiles && selectedFiles.length > 0) {
      const validFiles = validateFiles(selectedFiles)
      setFiles(prev => [...prev, ...validFiles])
    }
  }

  return (
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
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept={allowedFormats?.map(ext => `.${ext}`).join(',')}
          multiple
        />

        {files.length > 0 ? (
          <Box className="flex flex-col gap-2 w-full">
            {files.map((file, index) => (
              <Box
                key={index}
                className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg w-full"
              >
                <i className="ri-file-text-fill text-lg text-[var(--mui-palette-primary-main)]"></i>

                <Typography className="text-xs font-semibold text-gray-800 truncate flex-1">
                  {file.name}
                </Typography>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setFiles(prev => prev.filter((_, i) => i !== index))
                  }}
                  className="text-red-500 text-xs bg-transparent"
                >
                  ✕
                </button>
              </Box>
            ))}

            <Typography className="text-xs text-green-600 font-extrabold text-center mt-1">
              {files.length} file(s) attached
            </Typography>
          </Box>
        ) : (
          <Box className="flex flex-col items-center text-center">
            <Box className="w-10 h-10 bg-[var(--mui-overlays-1)] border border-gray-200 rounded-full flex items-center justify-center mb-2 shadow-sm">
              <i className="ri-upload-cloud-2-line text-xl text-[var(--mui-palette-primary-main)]"></i>
            </Box>

            <Typography className="text-xs font-semibold">
              Drop your files here or{" "}
              <span className="text-[var(--mui-palette-primary-main)] font-extrabold">
                browse
              </span>
            </Typography>
          </Box>
        )}
      </Box>

      {subtitle && (
        <Typography
          className="text-xs text-center whitespace-pre-line pt-3 leading-[1.2] h-[4.2em] overflow-hidden"
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  )
}

const Experience = () => {
  const [selectedExperience, setSelectedExperience] = useState<string | null>(
    null,
  );

  const experienceTypes = [
    {
      id: "fresher",
      title: "Fresher",
      description:
        "Starting your career journey. No prior work experience needed.",
      icon: "ri-graduation-cap-line",
    },
    {
      id: "domestic",
      title: "Domestic Experience",
      description: "Professional experience gained within your home country.",
      icon: "ri-briefcase-line",
    },
    {
      id: "abroad",
      title: "Abroad Experience",
      description:
        "Valuable work experience acquired in international settings.",
      icon: "ri-trophy-line",
    },
    {
      id: "freelancer",
      title: "Freelancer",
      description: "Self-employed or contract-based professional work history.",
      icon: "ri-clipboard-line",
    },
  ];

  return (
    <Box className="w-full flex justify-center">
      <Card className="w-full max-w-[1000px] p-6 md:p-12 rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        <Box className="text-left mb-12">
          <Typography
            variant="subtitle2"
            className="mb-3 tracking-[0.5px]"
          >
            Step 4 of 6: Experience Selection
          </Typography>
          <Typography variant="h4" className="mb-2">
            Select Your Experience Type
          </Typography>
          <Typography
            variant="body1"
            className="text-[13px] font-medium leading-[1.2] max-w-[900px]"
          >
            Please select the option that best describes your professional
            background. This helps us tailor your application process.
          </Typography>
        </Box>

        <Grid container spacing={4} className="mb-6">
          {experienceTypes.map((type) => {
            const isSelected = selectedExperience === type.id;

            return (
              <Grid size={{ xs: 12, sm: 3 }} key={type.id}>
                <Card
                  onClick={() => setSelectedExperience(type.id)}
                  className={clsx(
                    "h-full pt-12 px-4 pb-6 cursor-pointer rounded-[16px] border-2 transition-all duration-200 ease-in-out flex flex-col items-center text-center",
                    isSelected
                      ? "border-[#1976d2] border-4 bg-[--mui-palette-secondary-darkerOpacity] shadow-[0_10px_25px_-5px_rgba(25,118,210,0.1),_0_8px_10px_-6px_rgba(25,118,210,0.1)]"
                      : "border-[#e5e7eb] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),_0_2px_4px_-2px_rgba(0,0,0,0.05)] hover:border-[#d1d5db] hover:-translate-y-0.5",
                  )}
                >
                  <Box
                    onClick={() => setSelectedExperience(type.id)}
                    className={clsx(
                      "w-16 h-16 rounded-full flex items-center justify-center mb-6",
                      isSelected
                        ? "bg-white shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
                        : "bg-[#f0f7ff] shadow-none",
                    )}
                  >
                    <i
                      className={`${type.icon} text-[#1976d2] text-[28px]`}
                    ></i>
                  </Box>
                  <Typography
                    variant="h6"
                    className="font-extrabold mb-3"
                  >
                    {type.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    className="leading-6"
                  >
                    {type.description}
                  </Typography>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <Box className="mt-5 shadow-md p-6 rounded-xl">
          <Typography variant="h5" className="mb-2">
            Experience Documentation
          </Typography>
          <Typography
            variant="body1"
            className="mb-6"
          >
            Please provide proof of your professional experience to support your application.
          </Typography>
            {/* <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 12, lg: 12 }}> */}
                <UploadCard
                  // title="Certificates"
                  subtitle={`Supported format: PDF, DOCX`}
                  allowedFormats={['pdf', 'docx']}
                />
          <Alert severity="info">
            <AlertTitle>Optional, but recommended</AlertTitle>
            Upload relevant documents of your experience only if you did not already upload them in the previous Document Upload section. Valid documents include experience letters, appointment letters, or recent pay slips.
          </Alert>
              {/* </Grid>
            </Grid> */}
          </Box>

        {/* Action Buttons */}
        <Box className="flex justify-end gap-4 pt-8">
          <Button
            variant="outlined"
            className="rounded-xl normal-case border border-[#d1d5db] hover:shadow-lg hover:border-[#9ca3af] text-inherit"
            href='/document-upload'
          >
            Back to Document Upload
          </Button>
          <Button
            variant="contained"
            disabled={!selectedExperience}
                                      
            className="rounded-xl normal-case text-sm shadow-md hover:bg-blue-700 hover:shadow-lg disabled:text-white disabled:shadow-none disabled:cursor-not-allowed"
            href="/applicationtracking"
          >
            Continue to Assessment
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default Experience;
