import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  IconButton,
} from "@mui/material";
import toast from "react-hot-toast";
import { sendTacEmailAction } from "@/Services/APIs/tac/tac.actions";

interface CommunicationModalProps {
  open: boolean;
  onClose: () => void;
  candidate: any;
  mode: "chat" | "email" | null;
}

const DashboardCommunicationModal: React.FC<CommunicationModalProps> = ({
  open,
  onClose,
  candidate,
  mode,
}) => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!candidate || !mode) return null;

  const isChat = mode === "chat";
  const isEmail = mode === "email";

  const handleSend = async () => {
    if (!message.trim()) {
      return toast.error("Please enter a message before sending.");
    }
if (isChat) {
      
      const targetNumber = candidate.contact?.whatsapp  ;

      if (!targetNumber) {
        return toast.error("Candidate's WhatsApp or Phone number is missing.");
      }

      
      let cleanNumber = targetNumber.replace(/\D/g, "");

      
      if (cleanNumber.length === 10) {
        cleanNumber = "91" + cleanNumber;
      }

       
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodedMessage}`;

      window.open(whatsappUrl, "_blank");

      toast.success("Redirecting to WhatsApp...");
      onClose();
      setMessage("");

    }else if (isEmail) {
      setLoading(true);
      try {
        const res = await sendTacEmailAction({
          leadId: candidate._id,
          message: message,
        });
        if (res?.success) {
          toast.success("Email sent successfully!");
          onClose();
          setMessage("");
        } else {
          toast.error(res?.message || "Failed to send email");
        }
      } catch (error) {
        toast.error("An error occurred while sending email.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ className: "rounded-[20px] p-2" }}
    >
      <DialogContent>
        <Box className="flex justify-between items-center mb-4">
          <Typography variant="h5" className="font-medium text-[var(--mui-palette-primary)]
">
            {isChat ? "Send WhatsApp Message" : "Send Email"}
          </Typography>
          <IconButton onClick={onClose} disabled={loading} size="small">
            <i className="ri-close-line text-2xl" />
          </IconButton>
        </Box>

        {/* Candidate Details Card */}
        <Box className="bg-[var(--mui-palette-primary)] p-4 rounded-xl mb-6 shadow-2xl">
          <Typography variant="subtitle1" className="font-medium  text-[var(--mui-palette-primary)]
 mb-2">
            {candidate.name}
          </Typography>

          
          <Typography
            variant="body2"
            className={`mb-1 flex items-center gap-2 ${
              isChat ? "font-bold text-[var(--mui-palette-success-main)]   bg-[var(--mui-palette-primary)] p-1 rounded w-fit" : "text-[var(--mui-palette-primary)]"
            }`}
          >
            <i className="ri-phone-line" />{candidate.contact?.whatsapp || candidate.contact?.phone || "N/A"}
          </Typography>

          
          <Typography
            variant="body2"
            className={`flex items-center gap-2 ${
              isEmail ? "font-bold text-[var(--mui-palette-info-main)] bg-[var(--mui-palette-primary)] p-1 rounded w-fit" : "text-[var(--mui-palette-primary)]"
            }`}
          >
            <i className="ri-mail-line" /> {candidate.contact?.email || "N/A"}
          </Typography>
        </Box>

      <Box className="mt-2">
          <TextField
            fullWidth
            multiline
            rows={5}
            label="Message"  
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            variant="outlined"
            disabled={loading}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
              },
            }}
          />
        </Box>

        {/* Action Button */}
        <Box className="mt-6 flex justify-end">
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={loading}
            className={`rounded-xl px-6 py-2.5 normal-case font-semibold shadow-md ${
              isChat ? "bg-[var(--mui-palette-success-main)] hover:bg-[var(--mui-palette-success-dark)]" : "bg-[var(--mui-palette-primary-main)] hover:bg-[var(--mui-palette-primary-dark)]"
            }`}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : isChat ? (
              <>
                <i className="ri-whatsapp-fill text-xl mr-2" /> Send via WhatsApp
              </>
            ) : (
              <>
                <i className="ri-send-plane-fill text-lg mr-2" /> Send Email
              </>
            )}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardCommunicationModal;