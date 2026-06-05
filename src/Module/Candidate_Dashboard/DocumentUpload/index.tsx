// "use client";

// import React, { useState, useRef, useEffect } from "react";

// // MUI Imports
// import Grid from "@mui/material/Grid";
// import Card from "@mui/material/Card";
// import Typography from "@mui/material/Typography";
// import Button from "@mui/material/Button";
// import Box from "@mui/material/Box";
// import Accordion from "@mui/material/Accordion";
// import AccordionSummary from "@mui/material/AccordionSummary";
// import AccordionDetails from "@mui/material/AccordionDetails";
// import Chip from "@mui/material/Chip";
// import Stepper from "@mui/material/Stepper";
// import {
//   Stack,
//   Step,
//   StepConnector,
//   stepConnectorClasses,
//   StepIconProps,
//   StepLabel,
//   CircularProgress,
// } from "@mui/material";
// import { lighten, styled } from "@mui/material/styles";
// import toast from "react-hot-toast";

// import {
//   getPositionsListAction,
//   getPositionDetailsAction,
//   uploadFileAction,
//   saveMappedDocumentsAction,
//   checkDocumentStatusAction,
// } from "@/Services/APIs/Documents/document.actions";
// import { useRouter } from "next/navigation";
// import { useSelector } from "react-redux";
// import { getJourneyTimelineAction } from "@/Services/APIs/Assessment/assessment.actions";

// const Stepper_Steps = ({ activeStep }: { activeStep: number }) => {
//   const steps = [
//     "Inquiry",
//     "Counselling",
//     "Documents",
//     "Experience",
//     "Assessment",
//   ];

//   const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
//     [`&.${stepConnectorClasses.alternativeLabel}`]: { top: 22 },
//     [`&.${stepConnectorClasses.active}`]: {
//       [`& .${stepConnectorClasses.line}`]: {
//         backgroundColor: "#eaeaf0",
//         backgroundImage: "none",
//       },
//     },
//     [`&.${stepConnectorClasses.completed}`]: {
//       [`& .${stepConnectorClasses.line}`]: {
//         backgroundImage: `linear-gradient(270deg, ${lighten(theme.palette.primary.main, 0.5)}, var(--mui-palette-primary-main) 100%)`,
//       },
//     },
//     [`& .${stepConnectorClasses.line}`]: {
//       height: 3,
//       border: 0,
//       backgroundColor: "#eaeaf0",
//       borderRadius: 1,
//       ...theme.applyStyles("dark", {
//         backgroundColor: theme.palette.grey[800],
//       }),
//     },
//   }));

//   const ColorlibStepIconRoot = styled("div")<{
//     ownerState: { completed?: boolean; active?: boolean };
//   }>(({ theme }) => ({
//     backgroundColor: "#ccc",
//     zIndex: 1,
//     color: "#fff",
//     width: 50,
//     height: 50,
//     display: "flex",
//     borderRadius: "50%",
//     justifyContent: "center",
//     alignItems: "center",
//     ...theme.applyStyles("dark", { backgroundColor: theme.palette.grey[700] }),
//     variants: [
//       {
//         props: ({ ownerState }) => ownerState.active,
//         style: {
//           backgroundColor: "#ccc",
//           backgroundImage: "none",
//           boxShadow: "0 0 0 5px rgba(204, 204, 204, 0.3)",
//         },
//       },
//       {
//         props: ({ ownerState }) => ownerState.completed,
//         style: {
//           backgroundImage: `linear-gradient(270deg, ${lighten(theme.palette.primary.main, 0.5)}, var(--mui-palette-primary-main) 100%)`,
//           boxShadow: "none",
//         },
//       },
//     ],
//   }));

//   function ColorlibStepIcon(props: StepIconProps) {
//     const { active, completed, className, icon } = props;
//     const icons: { [index: string]: React.ReactElement<unknown> } = {
//       1: <i className="material-symbols--help-outline" />,
//       2: <i className="material-symbols--check-circle-outline" />,
//       3: <i className="material-symbols--file-upload" />,
//       4: <i className="material-symbols--work-outline" />,
//       5: <i className="material-symbols--emoji-events" />,
//     };
//     return (
//       <ColorlibStepIconRoot
//         ownerState={{ completed, active }}
//         className={className}
//       >
//         {icons[String(icon)]}
//       </ColorlibStepIconRoot>
//     );
//   }

//   return (
//     <Grid container spacing={6}>
//       <Grid size={{ xs: 12, md: 12 }}>
//         <Typography variant="h4">Document Upload & Verification</Typography>
//         <Typography variant="body1" className="text-secondary mb-6">
//           Please upload the required documents for verification. Ensure all
//           documents are clear and valid to avoid delays.
//         </Typography>
//         <Card className="p-2 sm:p-6 rounded-xl shadow-md">
//           <Stack className="w-full" spacing={4}>
//             <Stepper
//               alternativeLabel
//               activeStep={activeStep}
//               connector={<ColorlibConnector />}
//             >
//               {steps.map((label) => (
//                 <Step key={label}>
//                   <StepLabel StepIconComponent={ColorlibStepIcon}>
//                     <span className="hidden md:inline">{label}</span>
//                   </StepLabel>
//                 </Step>
//               ))}
//             </Stepper>
//           </Stack>
//         </Card>
//       </Grid>
//     </Grid>
//   );
// };

// const PositionSelector = ({ positions, selected, onSelect, loading }: any) => {
//   return (
//     <Card className="p-2 sm:p-6 rounded-xl shadow-md mt-6">
//       <Box className="mb-6">
//         <Typography variant="h5" className="font-bold tracking-wide block mb-5">
//           Position applying for
//         </Typography>

//         {loading ? (
//           <CircularProgress size={30} />
//         ) : (
//           <Box className="flex flex-wrap gap-1.5 mb-4">
//             {positions.map((pos: any) => (
//               <Button
//                 key={pos._id}
//                 variant={selected === pos._id ? "contained" : "outlined"}
//                 onClick={() => onSelect(selected === pos._id ? "" : pos._id)}
//                 className={`rounded-full normal-case px-3 border
//                 ${
//                   selected === pos._id
//                     ? " border-[var(--mui-palette-primary-main)] text-white hover:border-[var(--mui-palette-primary-main)]"
//                     : "bg-[var(--variant-outlinedBg)] border-[#e0e0e0] text-[var(--mui-palette-text-primary)] hover:border-[#e0e0e0]"
//                 }
//                 disabled:bg-[#f5f5f5] disabled:text-[#bdbdbd] disabled:border-[#e0e0e0]
//               `}
//               >
//                 {pos.title}
//               </Button>
//             ))}
//           </Box>
//         )}
//         <Box className="flex items-center gap-2">
//           <Box className="w-4 h-4 rounded bg-blue-600" />
//           <Typography variant="body2">Selected</Typography>
//           <Box className="w-4 h-4 rounded border border-gray-300 bg-transparent" />
//           <Typography variant="body2">Available</Typography>
//         </Box>
//       </Box>
//     </Card>
//   );
// };

// // ─── 3. UPLOAD CARD COMPONENT (With Red Mandatory Text) ───────────────────
// const UploadCard = ({
//   title,
//   subtitle,
//   allowedFormats,
//   isMandatory,
//   multiple,
//   onFilesChange,
// }: {
//   title: string;
//   subtitle?: string;
//   allowedFormats?: string[];
//   isMandatory?: boolean;
//   multiple?: boolean;
//   onFilesChange?: (files: File[]) => void;
// }) => {
//   const [files, setFiles] = useState<File[]>([]);
//   const [isDragging, setIsDragging] = useState(false);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const isValidFile = (file: File, allowedFormats: string[]) => {
//     if (!allowedFormats || allowedFormats.length === 0) return true;
//     const fileExtension = file.name.split(".").pop()?.toLowerCase();
//     return (
//       fileExtension &&
//       allowedFormats.map((ext) => ext.toLowerCase()).includes(fileExtension)
//     );
//   };

//   const handleDragOver = (e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(true);
//   };
//   const handleDragLeave = (e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(false);
//   };

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(false);
//     const droppedFiles = e.dataTransfer.files;
//     if (droppedFiles && droppedFiles.length > 0) processFiles(droppedFiles);
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const selectedFiles = e.target.files;
//     if (selectedFiles && selectedFiles.length > 0) processFiles(selectedFiles);
//   };

//   const processFiles = (fileList: FileList) => {
//     const validFiles: File[] = [];
//     for (let i = 0; i < fileList.length; i++) {
//       const currentFile = fileList[i];
//       if (allowedFormats && !isValidFile(currentFile, allowedFormats)) {
//         toast.error(`Invalid file type: ${currentFile.name}`);
//         continue;
//       }
//       validFiles.push(currentFile);
//     }

//     if (validFiles.length > 0) {
//       const newArray = multiple ? [...files, ...validFiles] : [validFiles[0]];

//       setFiles(newArray);

//       if (onFilesChange) {
//         onFilesChange(newArray);
//       }
//     }
//   };

//   const handleReset = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     setFiles([]);
//     if (fileInputRef.current) fileInputRef.current.value = "";
//     if (onFilesChange) onFilesChange([]);
//   };
//   return (
//     <Card
//       variant="outlined"
//       className="rounded-[16px] flex flex-col h-full shadow-none hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all duration-200"
//     >
//       <Box className="p-2.5 h-[2.4em] flex items-center justify-center relative">
//         <Typography className="font-extrabold text-[13px] leading-[1.2] text-center overflow-hidden">
//           {title}
//         </Typography>
//       </Box>

//       {isMandatory && (
//         <Typography className="text-red-500 font-bold text-[11px] text-center mb-1">
//           * This is mandatory
//         </Typography>
//       )}

//       <Box
//         className="p-2.5 flex flex-col flex-grow bg-[var(--mui-overlays-1)]"
//         onDragOver={handleDragOver}
//         onDragLeave={handleDragLeave}
//         onDrop={handleDrop}
//       >
//         <Box
//           onClick={() => fileInputRef.current?.click()}
//           className={`w-full h-full min-h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-3 cursor-pointer transition-all duration-200
//             ${isDragging ? "border-blue-600 bg-blue-50" : ""} hover:border-blue-300 hover:bg-[var(--mui-palette-secondary-lightOpacity)]`}
//         >
//           <input
//             type="file"
//             ref={fileInputRef}
//             className="hidden"
//             multiple={multiple}
//             onChange={handleFileChange}
//             accept={allowedFormats
//               ?.map((ext) => `.${ext.toLowerCase()}`)
//               .join(",")}
//           />

//           {files.length > 0 ? (
//             <Box className="flex flex-col items-center text-center w-full relative">
//               <i className="ri-file-text-fill text-3xl text-[var(--mui-palette-primary-main)] mb-1"></i>

//               <Box className="w-full max-h-[60px] overflow-y-auto mb-1 px-1">
//                 {files.map((file, idx) => (
//                   <Typography
//                     key={idx}
//                     className="text-xs font-extrabold max-w-xs whitespace-nowrap overflow-hidden text-ellipsis"
//                   >
//                     {file.name}
//                   </Typography>
//                 ))}
//               </Box>

//               <Typography className="text-xs text-green-600 font-extrabold mt-0.5">
//                 {files.length} {files.length === 1 ? "File" : "Files"} attached
//               </Typography>

//               <Typography
//                 onClick={handleReset}
//                 className="text-[11px] text-red-500 font-bold underline mt-1 hover:text-red-700"
//               >
//                 Clear
//               </Typography>
//             </Box>
//           ) : (
//             <Box className="flex flex-col items-center text-center">
//               <Box className="w-10 h-10 bg-var(--mui-overlays-1) border border-gray-200 rounded-full flex items-center justify-center mb-2 shadow-sm">
//                 <i className="ri-upload-cloud-2-line text-xl text-[var(--mui-palette-primary-main)]"></i>
//               </Box>
//               <Typography className="text-xs font-semibold">
//                 Drop files here or{" "}
//                 <span className="text-[var(--mui-palette-primary-main)] font-extrabold">
//                   browse
//                 </span>
//               </Typography>
//               {multiple && (
//                 <Typography className="text-[10px] text-blue-500 font-bold mt-1">
//                   (Multiple uploads allowed)
//                 </Typography>
//               )}
//             </Box>
//           )}
//         </Box>
//         <Box className="pt-3 text-center min-h-[4.2em] flex flex-col justify-center items-center overflow-hidden">
//           {subtitle && (
//             <Typography className="text-xs font-medium leading-[1.2] text-[var(--mui-palette-text-secondary)] tracking-wide">
//               {subtitle}
//             </Typography>
//           )}
//           {allowedFormats && allowedFormats.length > 0 && (
//             <Typography className="text-xs font-medium leading-[1.2] text-[var(--mui-palette-secondary)] mt-1.5 tracking-wide">
//               Supported Extensions: {allowedFormats.join(", ").toUpperCase()}
//             </Typography>
//           )}
//         </Box>
//       </Box>
//     </Card>
//   );
// };

// const SectionAccordion = ({
//   title,
//   status,
//   defaultExpanded = false,
//   children,
// }: {
//   title: string;
//   status?: string;
//   defaultExpanded?: boolean;
//   children: React.ReactNode;
// }) => {
//   return (
//     <Accordion
//       defaultExpanded={defaultExpanded}
//       disableGutters
//       elevation={0}
//       className="mb-3 overflow-hidden shadow-sm before:hidden"
//     >
//       <AccordionSummary
//         expandIcon={
//           <Box className="w-8 h-8 rounded-full flex items-center justify-center">
//             <i className="ri-arrow-down-s-line text-xl"></i>
//           </Box>
//         }
//         className="p-3 bg-var(--mui-overlays-1) hover:bg-[var(--mui-palette-primary-main)]"
//       >
//         <Box className="flex items-center gap-2">
//           <Typography className="text-base font-extrabold">{title}</Typography>
//           {status === "uploaded" && (
//             <Chip
//               label="Uploaded"
//               size="small"
//               className="bg-blue-50 text-[var(--mui-palette-primary-main)] font-extrabold text-xs h-6 rounded border border-green-200"
//             />
//           )}
//         </Box>
//       </AccordionSummary>
//       <AccordionDetails className="p-4">{children}</AccordionDetails>
//     </Accordion>
//   );
// };

// const DocumentUploadPage = () => {
//   const router = useRouter();
//   const reduxUser = useSelector(
//     (state: any) => state.userSlice?.userData || state.user?.userData,
//   );
//   const leadId = reduxUser?.leadId || reduxUser?.user?.leadId || "";
//   const [activeStep, setActiveStep] = useState<number>(2);
//   const [positions, setPositions] = useState<any[]>([]);
//   const [selectedPosition, setSelectedPosition] = useState<string>("");
//   const [loadingPositions, setLoadingPositions] = useState(true);
//   const [loadingDocs, setLoadingDocs] = useState(false);
//   const [hasDocuments, setHasDocuments] = useState(true);
//   const [isReduxReady, setIsReduxReady] = useState(false);

//   const [groupedDocs, setGroupedDocs] = useState<any>({
//     resume: [],
//     document: [],
//     experience: [],
//     academic: [],
//     additional: [],
//   });

//   const [selectedFilesMap, setSelectedFilesMap] = useState<
//     Record<string, File[]>
//   >({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false);
//   const [checkingStatus, setCheckingStatus] = useState(true);

//   // useEffect(() => {
//   //   const savedPos = sessionStorage.getItem("selectedPositionId");
//   //   if (savedPos) {
//   //     setSelectedPosition(savedPos);
//   //   }
//   // }, []);

//   // useEffect(() => {
//   //   if (selectedPosition) {
//   //     sessionStorage.setItem("selectedPositionId", selectedPosition);
//   //   }
//   // }, [selectedPosition]);

//    useEffect(() => {
//     const timer = setTimeout(() => setIsReduxReady(true), 800);
//     return () => clearTimeout(timer);
//   }, []);

//  useEffect(() => {
//     const checkAccessAndStatus = async () => {
//       if (!isReduxReady) return;

//       if (!leadId) {
//         toast.error("Please generate inquiry first", { id: "doc-guard-inquiry" });
//         router.push("/inquiry");
//         return;
//       }

//       setCheckingStatus(true);
//       try {

//         const timelineRes = await getJourneyTimelineAction(leadId);

//         if (timelineRes?.success && timelineRes.data) {
//           const currentActiveStep = timelineRes.data.activeStep;
//           setActiveStep(currentActiveStep);

//           if (currentActiveStep < 2) {
//             toast.error("Please schedule pre-counselling first", { id: "doc-guard-precoun" });

//             router.push(`/pre-counselling?leadId=${leadId}`);
//             return;
//           }
//         }

//         const res = await checkDocumentStatusAction(leadId);
//         if (res?.success && res.data) {
//           const submittedStages = ["doc_submitted", "exp_submitted", "assessment_submitted", "assessment_scheduled"];
//           if (submittedStages.includes(res.data.status) || res.data.documentStatus === "uploaded") {
//             setIsAlreadySubmitted(true);
//           }
//         }
//       } catch (err) {
//         console.error("Error pulling timeline or status", err);
//       } finally {
//         setCheckingStatus(false);
//       }
//     };

//     checkAccessAndStatus();
//   }, [isReduxReady, leadId, router]);
//   const handleFilesUpdate = (typeId: string, files: File[]) => {
//     setSelectedFilesMap((prev) => ({ ...prev, [typeId]: files }));
//   };

//   useEffect(() => {
//     const fetchPositions = async () => {
//       setLoadingPositions(true);
//       const res = await getPositionsListAction();
//       if (res?.success) {
//         setPositions(res.data);
//       } else {
//         toast.error(res?.message || "Failed to load positions");
//       }
//       setLoadingPositions(false);
//     };
//     fetchPositions();
//   }, []);

//   useEffect(() => {
//     if (!selectedPosition) {
//       setGroupedDocs({
//         resume: [],
//         document: [],
//         experience: [],
//         academic: [],
//         additional: [],
//       });
//       setHasDocuments(true);
//       return;
//     }

//     const fetchDocs = async () => {
//       setLoadingDocs(true);
//       const res = await getPositionDetailsAction(selectedPosition);
//       if (res?.success) {
//         const required = res.data.requiredDocuments || [];
//         const mandatory = res.data.mandatoryDocuments || [];

//         if (required.length === 0 && mandatory.length === 0) {
//           setHasDocuments(false);
//         } else {
//           setHasDocuments(true);
//         }

//         const docMap = new Map();
//         required.forEach((d: any) =>
//           docMap.set(d._id, { ...d, isMandatory: false }),
//         );
//         mandatory.forEach((d: any) =>
//           docMap.set(d._id, { ...d, isMandatory: true }),
//         );
//         const allUniqueDocs = Array.from(docMap.values());

//         setGroupedDocs({
//           resume: allUniqueDocs.filter((d: any) => d.section === "resume"),
//           document: allUniqueDocs.filter((d: any) => d.section === "document"),
//           experience: allUniqueDocs.filter(
//             (d: any) => d.section === "experience",
//           ),
//           academic: allUniqueDocs.filter((d: any) => d.section === "academic"),
//           additional: [],
//         });
//       }
//       setLoadingDocs(false);
//     };
//     fetchDocs();
//   }, [selectedPosition]);

//   const handleSubmit = async () => {
//     if (!leadId) {
//       toast.error("Session expired or Lead ID missing.");
//       return;
//     }

//     const allRequiredDocs = [
//       ...groupedDocs.resume,
//       ...groupedDocs.document,
//       ...groupedDocs.experience,
//       ...groupedDocs.academic,

//     ];

//     const missingMandatory = allRequiredDocs.filter(
//       (d) =>
//         d.isMandatory &&
//         (!selectedFilesMap[d._id] || selectedFilesMap[d._id].length === 0),
//     );

//     if (missingMandatory.length > 0) {
//       toast.error("Please upload all mandatory documents.");
//       return;
//     }

//     const hasFiles = Object.values(selectedFilesMap).flat().length > 0;
//     if (!hasFiles) {
//       router.push(`/experience?positionId=${selectedPosition}`);
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       const mappedDocs = [];

//       for (const [typeId, files] of Object.entries(selectedFilesMap)) {
//         for (const file of files) {
//           const uploadRes = await uploadFileAction(file);

//           if (uploadRes?.success && uploadRes.data?.uploadId) {
//             mappedDocs.push({
//               typeId,
//               uploadId: uploadRes.data.uploadId,
//             });
//           } else {
//             toast.error(`Failed to upload ${file.name}`);
//             setIsSubmitting(false);
//             return;
//           }
//         }
//       }

//       if (mappedDocs.length > 0) {
//         const saveRes = await saveMappedDocumentsAction({
//           leadId,
//           documents: mappedDocs,
//         });
//         if (saveRes?.success) {
//           toast.success("Documents uploaded successfully!");
//           router.push(`/experience?positionId=${selectedPosition}`);
//         } else {
//           toast.error(saveRes?.message || "Failed to save document records.");
//         }
//       }
//     } catch (err) {
//       toast.error("An error occurred during the upload process.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (!isReduxReady || checkingStatus) {
//     return (
//       <Box className="flex justify-center items-center mt-20 mb-20 h-40">
//          <CircularProgress size={40} />
//          <Typography className="ml-4 text-gray-500 font-medium">Verifying...</Typography>
//       </Box>
//     );
//   }

//   if (!leadId || activeStep < 2) return null;
//   return (
//     <Box className="w-full flex justify-center">
//       <Card className="w-full p-3 md:p-6 rounded-3xl shadow-md">
//         <Stepper_Steps activeStep={activeStep} />

//         {/* 🔥 Loader jab tak Redux & Status check ho raha hai */}
//         {checkingStatus ? (
//           <Box className="flex justify-center items-center mt-10 mb-10 h-40">
//             <CircularProgress />
//           </Box>
//         ) : (
//           <Box>
//             {/* ORIGINAL FORM CONTENT STARTS HERE */}
//             <Box
//               className={`${isAlreadySubmitted ? "opacity-60 pointer-events-none" : ""}`}
//             >
//               <PositionSelector
//                 positions={positions}
//                 selected={selectedPosition}
//                 onSelect={setSelectedPosition}
//                 loading={loadingPositions}
//               />
//             </Box>

//             {loadingDocs ? (
//               <Box className="flex justify-center items-center mt-10 mb-10">
//                 <CircularProgress />
//               </Box>
//             ) : !hasDocuments && selectedPosition ? (
//               <Box className="mt-8 mb-8 p-10 text-center  rounded-xl border-2 border-dashed border-[#ccc]">
//                 <Typography
//                   variant="h5"
//                   className="text-[var(--mui-palette-text-primary)] font-medium tracking-wider"
//                 >
//                   COMING SOON
//                 </Typography>
//                 <Typography
//                   variant="body2"
//                   className="text-[var(--mui-palette-text-primary)] mt-2 font-medium"
//                 >
//                   Document requirements for this position are currently being
//                   updated. Please check back later.
//                 </Typography>
//               </Box>
//             ) : (
//               <Box
//                 className={`mt-5 ${isAlreadySubmitted ? "opacity-60 pointer-events-none" : ""}`}
//               >
//                 {/* Section 1: Resume */}
//                 {groupedDocs.resume.length > 0 && (
//                   <SectionAccordion title="Resume" defaultExpanded={true}>
//                     <Grid container spacing={3}>
//                       {groupedDocs.resume.map((doc: any) => (
//                         <Grid size={{ xs: 12, md: 6, lg: 4 }} key={doc._id}>
//                           <UploadCard
//                             title={doc.title}
//                             subtitle={
//                               doc.subTitle ||
//                               (doc.supportedExtensions?.length
//                                 ? `Supported format: ${doc.supportedExtensions.join(", ")}`
//                                 : "")
//                             }
//                             allowedFormats={doc.supportedExtensions}
//                             isMandatory={doc.isMandatory}
//                             multiple={doc.multiple}
//                             onFilesChange={(files) =>
//                               handleFilesUpdate(doc._id, files)
//                             }
//                           />
//                         </Grid>
//                       ))}
//                     </Grid>
//                   </SectionAccordion>
//                 )}

//                 {/* Section 2: Documents */}
//                 {groupedDocs.document.length > 0 && (
//                   <SectionAccordion title="Documents" defaultExpanded={true}>
//                     <Grid container spacing={3}>
//                       {groupedDocs.document.map((doc: any) => (
//                         <Grid size={{ xs: 12, md: 6, lg: 4 }} key={doc._id}>
//                           <UploadCard
//                             title={doc.title}
//                             subtitle={
//                               doc.subTitle ||
//                               (doc.supportedExtensions?.length
//                                 ? `Supported format: ${doc.supportedExtensions.join(", ")}`
//                                 : "")
//                             }
//                             allowedFormats={doc.supportedExtensions}
//                             isMandatory={doc.isMandatory}
//                             multiple={doc.multiple}
//                             onFilesChange={(files) =>
//                               handleFilesUpdate(doc._id, files)
//                             }
//                           />
//                         </Grid>
//                       ))}
//                     </Grid>
//                   </SectionAccordion>
//                 )}

//                 {/* Section 3: Experience Certificates */}
//                 {groupedDocs.experience.length > 0 && (
//                   <SectionAccordion
//                     title="Experience Certificates"
//                     defaultExpanded={true}
//                   >
//                     <Grid container spacing={3}>
//                       {groupedDocs.experience.map((doc: any) => (
//                         <Grid size={{ xs: 12, md: 6, lg: 4 }} key={doc._id}>
//                           <UploadCard
//                             title={doc.title}
//                             subtitle={
//                               doc.subTitle ||
//                               (doc.supportedExtensions?.length
//                                 ? `Supported format: ${doc.supportedExtensions.join(", ")}`
//                                 : "")
//                             }
//                             allowedFormats={doc.supportedExtensions}
//                             isMandatory={doc.isMandatory}
//                             multiple={doc.multiple}
//                             onFilesChange={(files) =>
//                               handleFilesUpdate(doc._id, files)
//                             }
//                           />
//                         </Grid>
//                       ))}
//                     </Grid>
//                   </SectionAccordion>
//                 )}

//                 {/* Section 4: Academic Certificates */}
//                 {groupedDocs.academic.length > 0 && (
//                   <SectionAccordion
//                     title="Academic Certificates"
//                     defaultExpanded={true}
//                   >
//                     <Grid container spacing={3}>
//                       {groupedDocs.academic.map((doc: any) => (
//                         <Grid size={{ xs: 12, md: 6, lg: 4 }} key={doc._id}>
//                           <UploadCard
//                             title={doc.title}
//                             subtitle={
//                               doc.subTitle ||
//                               (doc.supportedExtensions?.length
//                                 ? `Supported format: ${doc.supportedExtensions.join(", ")}`
//                                 : "")
//                             }
//                             allowedFormats={doc.supportedExtensions}
//                             isMandatory={doc.isMandatory}
//                             multiple={doc.multiple}
//                             onFilesChange={(files) =>
//                               handleFilesUpdate(doc._id, files)
//                             }
//                           />
//                         </Grid>
//                       ))}
//                     </Grid>
//                   </SectionAccordion>
//                 )}
//               </Box>
//             )}

//             <Box className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
//               <Box>
//                 {isAlreadySubmitted && (
//                   <Typography
//                     variant="body2"
//                     className="text-[var(--mui-palette-text-primary)] font-medium text-sm flex items-center gap-2"
//                   >
//                     <i className="ri-checkbox-circle-fill text-xl"></i>
//                     Documents already submitted and are under review.
//                   </Typography>
//                 )}
//               </Box>

//               <Box className="flex gap-3 items-center">
//                 {isAlreadySubmitted && (
//                   <Button
//                     variant="contained"
//                     onClick={() => {
//                        const activePos = selectedPosition || "";  ;
//                       router.push(`/experience?positionId=${activePos}`);
//                     }}
//                     className="rounded-xl px-6 py-2 normal-case text-sm bg-[var(--mui-palette-primary-main)] border border-[var(--mui-palette-primary-main)]   hover:bg-[var(--mui-palette-primary-dark)] font-medium tracking-wide"
//                   >
//                     Go to Experience
//                   </Button>
//                 )}

//                 <Button
//                   variant="contained"
//                   disabled={
//                     !hasDocuments ||
//                     loadingDocs ||
//                     !selectedPosition ||
//                     isSubmitting ||
//                     isAlreadySubmitted ||
//                     checkingStatus
//                   }
//                   onClick={handleSubmit}
//                   className="rounded-xl px-6 py-2 normal-case text-sm shadow-md hover:bg-blue-700 hover:shadow-lg"
//                 >
//                   {isSubmitting || checkingStatus ? (
//                     <CircularProgress size={24} color="inherit" />
//                   ) : isAlreadySubmitted ? (
//                     "Submitted"
//                   ) : (
//                     "Save & Continue"
//                   )}
//                 </Button>
//               </Box>
//             </Box>
//           </Box>
//         )}
//       </Card>
//     </Box>
//   );
// };

// export default DocumentUploadPage;

import Grid from "@mui/material/Grid";

import DocumentUpload from "./DocumentUpload";

const DocumentUploadPage = () => {
  return <DocumentUpload />;
};

export default DocumentUploadPage;
