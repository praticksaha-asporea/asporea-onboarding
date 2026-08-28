import { useState, useEffect, useRef } from "react";

export const useCvUpload = (existingResumeUrl: string | null) => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isPdf = resumeFile
    ? resumeFile.type === "application/pdf"
    : (existingResumeUrl?.toLowerCase().includes(".pdf") ?? false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleFileChange = (file: File | null) => {
    if (file) setResumeFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) handleFileChange(e.dataTransfer.files[0]);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFileChange(e.target.files[0]);
  };

  useEffect(() => {
    let objectUrl: string | null = null;
    if (resumeFile) {
      objectUrl = URL.createObjectURL(resumeFile);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl(existingResumeUrl);
    }

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [resumeFile, existingResumeUrl]);

  return {
    resumeFile,
    setResumeFile,
    isDragging,
    fileInputRef,
    previewUrl,
    setPreviewUrl,
    isPreviewOpen,
    setIsPreviewOpen,
    isPdf,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    onFileInputChange,
  };
};
