import { useState } from "react";

import toast from "react-hot-toast";
import { sendTacEmailAction } from "@/Services/APIs/tac/tac.actions";
import { CandidateRow } from "@/Types/object.types";

export const useDashboardCommunication = ({ candidate, onClose, mode }: { candidate: CandidateRow, onClose: () => void, mode?: "chat" | "email" | null }) => {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const isChat = mode === "chat";
    const isEmail = mode === "email";

    const handleSend = async () => {
        if (!message.trim()) {
            return toast.error("Please enter a message before sending.");
        }
        if (isChat) {

            const targetNumber = candidate.contact?.whatsapp;

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

        } else if (isEmail) {
            setLoading(true);
            try {
                const res = await sendTacEmailAction({
                    leadId: candidate._id,
                    message: message,
                });
                if (res?.data?.success) {
                    toast.success("Email sent successfully!");
                    onClose();
                    setMessage("");
                } else {
                    toast.error(res?.data?.message || "Failed to send email");
                }
            } catch (error) {
                toast.error("An error occurred while sending email.");
            } finally {
                setLoading(false);
            }
        }
    };

    return { handleSend, isChat, isEmail, loading, message, setMessage };
}