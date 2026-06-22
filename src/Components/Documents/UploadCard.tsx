"use client";

import React, { useState, useRef, useEffect } from "react";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import toast from "react-hot-toast";

interface UploadCardProps {
  title: string;
  subtitle?: string;
  allowedFormats?: string[];
  isMandatory?: boolean;
  multiple?: boolean;
  onFilesChange?: (files: File[]) => void;
}

export const UploadCard: React.FC<UploadCardProps> = ({ title, subtitle, allowedFormats, isMandatory, multiple, onFilesChange }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handlePreview = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const file = files[index];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewFile(file);
      setPreviewUrl(url);
    }
  };

  const handleClosePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewFile(null);
    setPreviewUrl(null);
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const isValidFile = (file: File, allowedFormats: string[]) => {
    if (!allowedFormats || allowedFormats.length === 0) return true;
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    return fileExtension && allowedFormats.map((ext) => ext.toLowerCase()).includes(fileExtension);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) processFiles(droppedFiles);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) processFiles(selectedFiles);
  };

  const processFiles = (fileList: FileList) => {
    const validFiles: File[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const currentFile = fileList[i];
      if (allowedFormats && !isValidFile(currentFile, allowedFormats)) {
        toast.error(`Invalid file type: ${currentFile.name}`);
        continue;
      }
      validFiles.push(currentFile);
    }
    if (validFiles.length > 0) {
      const newArray = multiple ? [...files, ...validFiles] : [validFiles[0]];
      setFiles(newArray);
      if (onFilesChange) onFilesChange(newArray);
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation(); setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (onFilesChange) onFilesChange([]);
  };

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
            <Box className="flex flex-col items-center w-full relative" onClick={(e) => e.stopPropagation()}>
              <Box className="w-full max-h-[140px] overflow-y-auto mb-2 px-1 flex flex-col gap-1.5">
                {files.map((file, idx) => {
                  const isFileImg = file.type.startsWith("image/") || /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(file.name);
                  const isFilePdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
                  return (
                    <Box
                      key={idx}
                      onClick={(e) => handlePreview(e, idx)}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white border hover:border-blue-500 transition-all cursor-pointer group/file w-full shadow-sm"
                    >
                      <Box className="flex items-center gap-2 overflow-hidden">
                        <i className={`text-lg shrink-0 ${isFilePdf ? "ri-file-pdf-2-line text-red-500" :
                          isFileImg ? "ri-image-line text-green-500" : "ri-file-text-line text-blue-500"
                          }`} />
                        <Typography className="text-[11px] font-bold truncate max-w-[130px] text-gray-700">
                          {file.name}
                        </Typography>
                      </Box>
                      <Box className="flex items-center gap-1.5 shrink-0">
                        <i className="ri-eye-line text-xs text-gray-400 group-hover/file:text-blue-500 transition-colors" />
                        <IconButton
                          size="small"
                          className="!p-0.5 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            const updatedFiles = files.filter((_, i) => i !== idx);
                            setFiles(updatedFiles);
                            if (onFilesChange) onFilesChange(updatedFiles);
                          }}
                        >
                          <i className="ri-close-line text-[14px] text-red-500 font-bold" />
                        </IconButton>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
              <Typography className="text-[11px] text-green-600 font-extrabold">{files.length} {files.length === 1 ? "File" : "Files"} attached</Typography>
              {multiple &&
                <Typography onClick={handleReset} className="text-[10px] text-red-500 font-bold underline mt-1 hover:text-red-700 cursor-pointer">Clear All</Typography>
              }
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
          {subtitle && <Typography className="text-xs font-medium leading-[1.2] text-[var(--mui-palette-text-secondary)] tracking-wide">{subtitle}</Typography>}
          {allowedFormats && allowedFormats.length > 0 && <Typography className="text-xs font-medium leading-[1.2] text-[var(--mui-palette-secondary)] mt-1.5 tracking-wide">Supported Extensions: {allowedFormats.join(", ").toUpperCase()}</Typography>}
        </Box>
      </Box>

      {/* Document Fullscreen Preview Dialog */}
      <Dialog
        open={!!previewFile}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
        PaperProps={{ className: "rounded-[20px] relative overflow-hidden" }}
      >
        <Box className="flex items-center justify-between px-5 py-3 border-b border-[var(--mui-palette-divider)]">
          <Typography variant="subtitle1" className="font-bold truncate max-w-[80%]">
            {previewFile?.name}
          </Typography>
          <Box className="flex items-center gap-2">
            {previewUrl && (
              <a href={previewUrl} download={previewFile?.name} target="_blank" rel="noreferrer">
                <Button size="small" variant="text" startIcon={<i className="ri-download-2-line" />}>
                  Download
                </Button>
              </a>
            )}
            <IconButton size="small" onClick={handleClosePreview}>
              <i className="ri-close-line text-xl" />
            </IconButton>
          </Box>
        </Box>
        <DialogContent className="p-0 bg-gray-50 flex items-center justify-center min-h-[60vh]">
          {previewUrl && previewFile && (previewFile.type === "application/pdf" || previewFile.name.toLowerCase().endsWith(".pdf")) ? (
            <iframe
              src={previewUrl}
              title={previewFile.name}
              className="w-full min-h-[75vh] border-0"
            />
          ) : previewUrl && previewFile && (previewFile.type.startsWith("image/") || /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(previewFile.name)) ? (
            <img
              src={previewUrl}
              alt={previewFile.name}
              className="max-w-full max-h-[75vh] object-contain p-4"
            />
          ) : (
            previewUrl && (
              <Box className="flex flex-col items-center gap-4 p-10">
                <i className="ri-file-line text-6xl text-[var(--mui-palette-text-secondary)]" />
                <Typography variant="body1" className="text-[var(--mui-palette-text-secondary)]">
                  Preview not available for this file type.
                </Typography>
                <a href={previewUrl} download={previewFile?.name} target="_blank" rel="noreferrer">
                  <Button variant="contained" className="!rounded-xl !normal-case">
                    Download File
                  </Button>
                </a>
              </Box>
            )
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};