"use client";

import React from "react";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import toast from "react-hot-toast";
import { useExperienceUploadCard } from "./useExperienceUploadCard";

interface UploadCardProps {
  title: string;
  subtitle?: string;
  allowedFormats?: string[];
  isMandatory?: boolean;
  multiple?: boolean;
  onFilesChange?: (files: File[]) => void;
}

export const ExperienceUploadCard: React.FC<UploadCardProps> = ({ title, subtitle, allowedFormats, isMandatory, multiple, onFilesChange }) => {

  const {
    files,
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileChange,
    handleReset,
    fileInputRef
  } = useExperienceUploadCard(
    { allowedFormats, multiple, onFilesChange });


  return (
    <Card variant="outlined" className="rounded-[16px] flex flex-col h-full shadow-none hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all duration-200">
      <Box className="p-2.5 h-[2.4em] flex items-center justify-center relative">
        <Typography className="font-extrabold text-[13px] leading-[1.2] text-center overflow-hidden">{title}</Typography>
      </Box>
      {isMandatory && <Typography className="text-red-500 font-bold text-[11px] text-center mb-1">* This is mandatory</Typography>}
      <Box className="p-2.5 flex flex-col flex-grow bg-[var(--mui-overlays-1)]" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
        <Box onClick={() => fileInputRef.current?.click()} className={`w-full h-full min-h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-3 cursor-pointer transition-all duration-200 ${isDragging ? "border-blue-600 bg-blue-50" : ""} hover:border-blue-300 hover:bg-[var(--mui-palette-secondary-lightOpacity)]`}>
          <input type="file" ref={fileInputRef} className="hidden" multiple={multiple} onChange={handleFileChange} accept={allowedFormats?.map((ext) => `.${ext.toLowerCase()}`).join(",")} />
          {files.length > 0 ? (
            <Box className="flex flex-col items-center text-center w-full relative">
              <i className="ri-file-text-fill text-3xl text-[var(--mui-palette-primary-main)] mb-1"></i>
              <Box className="w-full max-h-[60px] overflow-y-auto mb-1 px-1">
                {files.map((file, idx) => (
                  <Box key={idx} className="flex items-center gap-2 justify-center w-full">
                    <Typography className="text-xs font-extrabold max-w-[150px] whitespace-nowrap overflow-hidden text-ellipsis">{file.name}</Typography>
                    {/* <button onClick={(e) => handleReset(e, idx)} className="text-red-500 font-bold text-xs">✕</button> */}
                  </Box>
                ))}
              </Box>
              <Typography className="text-xs text-green-600 font-extrabold mt-0.5">{files.length} {files.length === 1 ? "File" : "Files"} attached</Typography>
              <Typography onClick={(e) => handleReset(e)} className="text-[11px] text-red-500 font-bold underline mt-1 hover:text-red-700">Clear All</Typography>
            </Box>
          ) : (
            <Box className="flex flex-col items-center text-center">
              <Box className="w-10 h-10 bg-var(--mui-overlays-1) border border-gray-200 rounded-full flex items-center justify-center mb-2 shadow-sm"><i className="ri-upload-cloud-2-line text-xl text-[var(--mui-palette-primary-main)]"></i></Box>
              <Typography className="text-xs font-semibold">Drop files here or <span className="text-[var(--mui-palette-primary-main)] font-extrabold">browse</span></Typography>
              {multiple && <Typography className="text-[10px] text-blue-500 font-bold mt-1">(Multiple uploads allowed)</Typography>}
            </Box>
          )}
        </Box>
        <Box className="pt-3 text-center min-h-[4.2em] flex flex-col justify-center items-center overflow-hidden">
          {subtitle && <Typography className="text-xs font-medium leading-[1.2] text-[var(--mui-palette-primary)]">{subtitle}</Typography>}
          {allowedFormats && allowedFormats.length > 0 && <Typography className="text-[11px] font-medium text-[var(--mui-palette-primary)] mt-1.5 tracking-wide">Supported Extensions: {allowedFormats.join(", ").toUpperCase()}</Typography>}
        </Box>
      </Box>
    </Card>
  );
};