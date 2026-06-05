"use client";

import { useRef, useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import clsx from "clsx";

// MUI Imports
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Chip from "@mui/material/Chip";
import { Alert, AlertTitle, CircularProgress } from "@mui/material";

import {
  uploadFileAction,
  saveMappedDocumentsAction,
  getPositionDetailsAction,
  checkDocumentStatusAction,
} from "@/Services/APIs/Documents/document.actions";
import { saveExperienceTypeAction } from "@/Services/APIs/experience/experience.actions";

// ─── 1. UPLOAD CARD COMPONENT ───────────────────────────────────────────
const UploadCard = ({
  title,
  subtitle,
  allowedFormats,
  isMandatory,
  multiple,
  onFilesChange,
}: any) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isValidFile = (file: File, allowedFormats: string[]) => {
    if (!allowedFormats || allowedFormats.length === 0) return true;
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    return (
      fileExtension &&
      allowedFormats.map((ext) => ext.toLowerCase()).includes(fileExtension)
    );
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0)
      processFiles(e.target.files);
  };

  const handleReset = (e: React.MouseEvent, indexToRemove?: number) => {
    e.stopPropagation();
    if (indexToRemove !== undefined) {
      const newArray = files.filter((_, i) => i !== indexToRemove);
      setFiles(newArray);
      if (onFilesChange) onFilesChange(newArray);
    } else {
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (onFilesChange) onFilesChange([]);
    }
  };

  return (
    <Card
      variant="outlined"
      className="rounded-[16px] flex flex-col h-full shadow-none hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all duration-200"
    >
      <Box className="p-2.5 h-[2.4em] flex items-center justify-center relative">
        <Typography className="font-extrabold text-[13px] leading-[1.2] text-center overflow-hidden">
          {title}
        </Typography>
      </Box>
      {isMandatory && (
        <Typography className="text-red-500 font-bold text-[11px] text-center mb-1">
          * This is mandatory
        </Typography>
      )}
      <Box
        className="p-2.5 flex flex-col flex-grow bg-[var(--mui-overlays-1)]"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Box
          onClick={() => fileInputRef.current?.click()}
          className={`w-full h-full min-h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-3 cursor-pointer transition-all duration-200 ${isDragging ? "border-blue-600 bg-blue-50" : ""} hover:border-blue-300 hover:bg-[var(--mui-palette-secondary-lightOpacity)]`}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple={multiple}
            onChange={handleFileChange}
            accept={allowedFormats
              ?.map((ext: string) => `.${ext.toLowerCase()}`)
              .join(",")}
          />
          {files.length > 0 ? (
            <Box className="flex flex-col items-center text-center w-full relative">
              <i className="ri-file-text-fill text-3xl text-[var(--mui-palette-primary-main)] mb-1"></i>
              <Box className="w-full max-h-[60px] overflow-y-auto mb-1 px-1">
                {files.map((file, idx) => (
                  <Box
                    key={idx}
                    className="flex items-center gap-2 justify-center w-full"
                  >
                    <Typography className="text-xs font-extrabold max-w-[150px] whitespace-nowrap overflow-hidden text-ellipsis">
                      {file.name}
                    </Typography>
                    <button
                      onClick={(e) => handleReset(e, idx)}
                      className="text-red-500 font-bold text-xs"
                    >
                      ✕
                    </button>
                  </Box>
                ))}
              </Box>
              <Typography className="text-xs text-green-600 font-extrabold mt-0.5">
                {files.length} {files.length === 1 ? "File" : "Files"} attached
              </Typography>
              <Typography
                onClick={(e) => handleReset(e)}
                className="text-[11px] text-red-500 font-bold underline mt-1 hover:text-red-700"
              >
                Clear All
              </Typography>
            </Box>
          ) : (
            <Box className="flex flex-col items-center text-center">
              <Box className="w-10 h-10 bg-var(--mui-overlays-1) border border-gray-200 rounded-full flex items-center justify-center mb-2 shadow-sm">
                <i className="ri-upload-cloud-2-line text-xl text-[var(--mui-palette-primary-main)]"></i>
              </Box>
              <Typography className="text-xs font-semibold">
                Drop files here or{" "}
                <span className="text-[var(--mui-palette-primary-main)] font-extrabold">
                  browse
                </span>
              </Typography>
              {multiple && (
                <Typography className="text-[10px] text-blue-500 font-bold mt-1">
                  (Multiple uploads allowed)
                </Typography>
              )}
            </Box>
          )}
        </Box>
        <Box className="pt-3 text-center min-h-[4.2em] flex flex-col justify-center items-center overflow-hidden">
          {subtitle && (
            <Typography className="text-xs font-medium leading-[1.2]  text-[var(--mui-palette-primary)]">
              {subtitle}
            </Typography>
          )}
          {allowedFormats && allowedFormats.length > 0 && (
            <Typography className="text-[11px] font-medium  text-[var(--mui-palette-primary)] mt-1.5 tracking-wide">
              Supported Extensions: {allowedFormats.join(", ").toUpperCase()}
            </Typography>
          )}
        </Box>
      </Box>
    </Card>
  );
};

// ─── 2. SECTION ACCORDION COMPONENT ─────────────────────────────────────
const SectionAccordion = ({
  title,
  status,
  defaultExpanded = false,
  children,
}: any) => {
  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      disableGutters
      elevation={0}
      className="mb-3 overflow-hidden shadow-sm before:hidden border-dashed  border-[var(--mui-palette-divider)] rounded-xl"
    >
      <AccordionSummary
        expandIcon={
          <Box className="w-8 h-8 rounded-full flex items-center justify-center">
            <i className="ri-arrow-down-s-line text-xl"></i>
          </Box>
        }
        className="p-3 bg-[var(--mui-overlays-1)] hover:bg-[var(--mui-palette-primary-lightOpacity)]"
      >
        <Box className="flex items-center gap-2">
          <Typography className="text-base font-extrabold">{title}</Typography>
          {status === "uploaded" && (
            <Chip
              label="Uploaded"
              size="small"
              className="bg-blue-50 text-[var(--mui-palette-primary-main)] font-extrabold text-xs h-6 rounded border border-green-200"
            />
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails className="p-4 bg-[var(--mui-palette-background-paper)]">
        {children}
      </AccordionDetails>
    </Accordion>
  );
};

// ─── 3. MAIN EXPERIENCE CONTENT ─────────────────────────────────────────
const ExperienceContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const reduxUser = useSelector(
    (state: any) => state.userSlice?.userData || state.user?.userData,
  );
  const leadId = reduxUser?.leadId || reduxUser?.user?.leadId || "";
  
  const [selectedExperience, setSelectedExperience] = useState<string | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [additionalDocs, setAdditionalDocs] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [selectedFilesMap, setSelectedFilesMap] = useState<
    Record<string, File[]>
  >({});
  const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false);
  const [isReduxReady, setIsReduxReady] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [positionId, setPositionId] = useState<string>("");
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
      id: "free",
      title: "Freelancer",
      description: "Self-employed or contract-based professional work history.",
      icon: "ri-clipboard-line",
    },
  ];

  useEffect(() => {
    const urlParam = searchParams?.get("positionId");
    if (urlParam) {
      setPositionId(urlParam);
      sessionStorage.setItem("selectedPositionId", urlParam);
    } else {
      const storedId = sessionStorage.getItem("selectedPositionId") || "";
      setPositionId(storedId);
    }
  }, [searchParams]);

  
  useEffect(() => {
    const timer = setTimeout(() => setIsReduxReady(true), 800);
    return () => clearTimeout(timer);
  }, []);

   
  useEffect(() => {
    const checkAccessAndStatus = async () => {
      if (!isReduxReady) return;

      
      if (!leadId) {
        toast.error("Please generate inquiry first", { id: "guard-toast" });
        router.push("/inquiry");
        return;
      }

      setCheckingStatus(true);
      try {
        const res = await checkDocumentStatusAction(leadId);
        
        if (res?.success && res.data) {
          const currentStatus = res.data.status;

          
          if (currentStatus === "inquiry_pending" || currentStatus === "inquiry_submitted") {
            toast.error("Please schedule pre-counselling first", { id: "guard-toast" });
            router.push(`/pre-counselling?leadId=${leadId}`);
            return;
          }

         
          const docCompletedStatuses = ["doc_submitted", "exp_submitted", "assessment_submitted", "assessment_scheduled"];
          const isDocUploaded = res.data.documentStatus === "uploaded" || docCompletedStatuses.includes(currentStatus);

          if (!isDocUploaded) {
            toast.error("Please upload documents first", { id: "guard-toast" });
          router.push(`/document-upload?leadId=${leadId}`);
            return;
          }

      
          const submittedStages = ["exp_submitted", "assessment_submitted", "assessment_scheduled"];
          if (submittedStages.includes(currentStatus)) {
            setIsAlreadySubmitted(true);
            if (res.data.experienceType) {
              setSelectedExperience(res.data.experienceType);
            }
          }
        }
      } catch (error) {
        console.error("Status check failed:", error);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkAccessAndStatus();
  }, [isReduxReady, leadId, router]);

  useEffect(() => {
    const fetchDynamicDocs = async () => {
      if (!positionId) {
        setLoadingDocs(false);
        return;
      }

      setLoadingDocs(true);
      const res = await getPositionDetailsAction(positionId);
      if (res?.success) {
        const required = res.data.requiredDocuments || [];
        const mandatory = res.data.mandatoryDocuments || [];

        const docMap = new Map();
        required.forEach((d: any) =>
          docMap.set(d._id, { ...d, isMandatory: false }),
        );
        mandatory.forEach((d: any) =>
          docMap.set(d._id, { ...d, isMandatory: true }),
        );
        const allUniqueDocs = Array.from(docMap.values());

        const filteredDocs = allUniqueDocs.filter(
          (d: any) => d.section === "additional",
        );
        setAdditionalDocs(filteredDocs);
      }
      setLoadingDocs(false);
    };

    fetchDynamicDocs();
  }, [positionId]);

  const handleFilesUpdate = (typeId: string, files: File[]) => {
    setSelectedFilesMap((prev) => ({ ...prev, [typeId]: files }));
  };

  const handleSubmit = async () => {
    if (!leadId)
      return toast.error("Lead ID missing. Please refresh or login again.");
    if (!selectedExperience)
      return toast.error("Please select an experience type.");

    setIsSubmitting(true);
    try {
      const mappedDocs = [];

      for (const [typeId, files] of Object.entries(selectedFilesMap)) {
        for (const file of files) {
          const uploadRes = await uploadFileAction(file);
          if (uploadRes?.success && uploadRes.data?.uploadId) {
            mappedDocs.push({
              typeId,
              uploadId: uploadRes.data.uploadId,
            });
          } else {
            toast.error(`Failed to upload ${file.name}`);
            setIsSubmitting(false);
            return;
          }
        }
      }

      if (mappedDocs.length > 0) {
        await saveMappedDocumentsAction({ leadId, documents: mappedDocs });
      }

      const expRes = await saveExperienceTypeAction({
        leadId,
        experienceType: selectedExperience,
      });

      if (expRes?.success) {
        toast.success("Experience details saved successfully!");
        router.push("/applicationtracking");
      } else {
        // toast.error(expRes?.message || "Failed to update experience status.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while saving.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isReduxReady || checkingStatus) {
    return (
      <Box className="w-full flex justify-center items-center min-h-[500px]">
        <CircularProgress size={40} />
        <Typography className="ml-4 text-gray-500 font-medium">Verifying ...</Typography>
      </Box>
    );
  }

  
  if (!leadId) return null;

  return (
    <Box className="w-full flex  justify-center">
      <Card className="w-full max-w-[1000px] p-6 md:p-12 rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        <Box className="text-left mb-12">
          <Typography variant="subtitle2" className="mb-3 tracking-[0.5px]">
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

        <Grid
          container
          spacing={4}
          className={clsx(
            "mb-10",
            isAlreadySubmitted && "opacity-60 pointer-events-none",
          )}
        >
          {experienceTypes.map((type) => {
            const isSelected = selectedExperience === type.id;
            return (
              <Grid size={{ xs: 12, sm: 3 }} key={type.id}>
                <Card
                  onClick={() =>
                    setSelectedExperience(isSelected ? null : type.id)
                  }
                  className={clsx(
                    "h-full pt-12 px-4 pb-6 cursor-pointer rounded-[16px] border-2 transition-all duration-200 ease-in-out flex flex-col items-center text-center",
                    isSelected
                      ? "border-[#1976d2] border-4 bg-[--mui-palette-secondary-darkerOpacity] shadow-[0_10px_25px_-5px_rgba(25,118,210,0.1),_0_8px_10px_-6px_rgba(25,118,210,0.1)]"
                      : "border-[#e5e7eb] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),_0_2px_4px_-2px_rgba(0,0,0,0.05)] hover:border-[#d1d5db] hover:-translate-y-0.5",
                  )}
                >
                  <Box
                    className={clsx(
                      "w-16 h-16 rounded-full flex items-center justify-center mb-6",
                      isSelected
                        ? "bg-white shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
                        : "bg-[#f0f7ff] shadow-none",
                    )}
                  >
                    <i
                      className={`${type.icon} text-[var(--mui-palette-primary-main)] text-[28px]`}
                    ></i>
                  </Box>
                  <Typography variant="h6" className="font-extrabold mb-3">
                    {type.title}
                  </Typography>
                  <Typography variant="body2" className="leading-6">
                    {type.description}
                  </Typography>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {loadingDocs ? (
          <Box className="flex justify-center p-10">
            <CircularProgress size={30} />
          </Box>
        ) : additionalDocs.length > 0 ? (
          <Box
            className={clsx(
              "mt-8",
              isAlreadySubmitted && "opacity-60 pointer-events-none",
            )}
          >
            <SectionAccordion
              title="Additional Documents"
              defaultExpanded={true}
            >
              <Grid container spacing={3}>
                {additionalDocs.map((doc: any) => (
                  <Grid size={{ xs: 12, md: 6, lg: 4 }} key={doc._id}>
                    <UploadCard
                      title={doc.title}
                      subtitle={
                        doc.subTitle ||
                        (doc.supportedExtensions?.length
                          ? `Supported format: ${doc.supportedExtensions.join(", ")}`
                          : "")
                      }
                      allowedFormats={doc.supportedExtensions}
                      isMandatory={doc.isMandatory}
                      multiple={doc.multiple}
                      onFilesChange={(files: File[]) =>
                        handleFilesUpdate(doc._id, files)
                      }
                    />
                  </Grid>
                ))}
              </Grid>

              <Alert severity="info" className="mt-6 rounded-xl">
                <AlertTitle>Optional, but recommended</AlertTitle>
                Upload relevant documents of your experience only if you did not
                already upload them in the previous Document Upload section.
                Valid documents include experience letters, appointment letters,
                or recent pay slips.
              </Alert>
            </SectionAccordion>
          </Box>
        ) : (
          <Box className="mt-8 p-6 text-center border-2 border-dashed border-[var(--mui-palette-divider)] rounded-xl">
            <Typography
              variant="body1"
              className="text-[var(--mui-palette-primary) tracking-wide]"
            >
              No additional documents required for the selected position.
            </Typography>
          </Box>
        )}

        <Box className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
          <Box>
            {isAlreadySubmitted && (
              <Typography
                variant="h4"
                className="text-[var(--mui-palette-text-primary)] font-medium text-sm flex items-center gap-2"
              >
                <i className="ri-checkbox-circle-fill text-xl text-[var(--mui-palette-primary)]"></i>
                Experience details already submitted.
              </Typography>
            )}
          </Box>
          <Box className="flex gap-4">
            <Button
              variant="contained"
              disabled={!selectedExperience || isSubmitting}
              className="rounded-xl normal-case text-sm shadow-md hover:bg-blue-700 hover:shadow-lg px-8"
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Continue to Assessment"
              )}
            </Button>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

const Experience = () => {
  return (
    <Suspense fallback={<CircularProgress />}>
      <ExperienceContent />
    </Suspense>
  );
};

export default Experience;
