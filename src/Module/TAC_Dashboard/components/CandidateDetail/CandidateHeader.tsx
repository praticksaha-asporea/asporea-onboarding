import React, { useState } from "react";
import { Box, IconButton, Typography, Chip, Avatar, Dialog } from "@mui/material";
import { CamelCase } from "@/Utils/common";
import { CandidateLead } from "@/Types/Frontend_Payload/Candidate.types";

interface CandidateHeaderProps {
  candidate: CandidateLead;
  onBack: () => void;
}

const resolveFileSrc = (path?: string) => {
  if (!path) return "/images/avatars/avatar.png";  
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
  const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://localhost:3000";
  return `${BACKEND_BASE}${path.startsWith("/") ? path : `/${path}`}`;
};

const CandidateHeader: React.FC<CandidateHeaderProps> = ({ candidate, onBack }) => {
  const profilePicUrl = resolveFileSrc(candidate?.profilePic);
  const [previewOpen, setPreviewOpen] = useState(false);
  
  const initialLetter = (candidate?.name ?? candidate?.fullName ?? "C").charAt(0).toUpperCase();
  return (
    <>
    <Box className="flex items-center gap-4 mb-6">
      <IconButton
        onClick={onBack}
        className="bg-white border border-gray-200 rounded-lg shadow-sm"
      >
        <i className="mdi--arrow-back text-gray-600" />
      </IconButton>

      <Avatar
        src={profilePicUrl}
        alt={candidate?.name}
        onClick={() => setPreviewOpen(true)}
        sx={{ 
          width: 50, 
          height: 50, 
          bgcolor: "#0D80F2", 
          fontWeight: "bold",
          border: "2px solid white",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}
      >
        {initialLetter}
      </Avatar>
      <Box>
        <Typography className="text-[22px] font-bold leading-tight">
          {candidate?.name ?? candidate.fullName ?? "Candidate Details"}
        </Typography>
        <Typography className="text-[13px] text-gray-500">{candidate.inqNo}</Typography>
      </Box>
      {candidate.status && (
        <Chip
          label={CamelCase(candidate.status)}
          size="small"
          className="ml-2"
          sx={{ fontWeight: 600, fontSize: 12 }}
        />
      )}

    </Box>
    <Dialog 
        open={previewOpen} 
        onClose={() => setPreviewOpen(false)} 
        maxWidth="md"
        PaperProps={{ style: { backgroundColor: 'transparent', boxShadow: 'none' } }}
      >
        <Box className="relative">
          <IconButton 
            onClick={() => setPreviewOpen(false)} 
            className="absolute -top-4 -right-4 bg-white text-gray-800 shadow-md hover:bg-gray-200 z-50"
          >
            <i className="mdi--close text-xl" />
          </IconButton>
          <img 
            src={profilePicUrl} 
            alt="Candidate Preview" 
            className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain bg-white"
          />
        </Box>
      </Dialog>
    </>
  );
};

export default CandidateHeader;