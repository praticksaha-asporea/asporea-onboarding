import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { RootState } from "@/Redux/store";
import {
    getLeadNotesAction,
    createLeadNoteAction,
    deleteLeadNoteAction,
} from "@/Services/APIs/leadNotes/leadNotes.action";

export const useLeadNotesCard = (leadId: string) => {

    const userData = useSelector((state: RootState) => state.user.userData);
    const currentUserId = userData?.id || userData?._id;

    const [notes, setNotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [newNote, setNewNote] = useState("");
    const [submitting, setSubmitting] = useState(false);


    const fetchNotes = useCallback(async () => {
        if (!leadId) return;
        setLoading(true);
        try {
            const res = await getLeadNotesAction({leadId});
            if (res.data?.success) {
                setNotes(res.data.data || []);
            }
        } catch (error: any) {
            console.error("Failed to load notes", error);
        } finally {
            setLoading(false);
        }
    }, [leadId]);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);


    const handleAddNote = async () => {
        if (!newNote.trim()) return;
        setSubmitting(true);
        try {
            const res = await createLeadNoteAction({ leadId, note: newNote });
            if (res.data?.success) {
                toast.success("Note added successfully!");
                setNewNote("");
                fetchNotes();
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to add note");
        } finally {
            setSubmitting(false);
        }
    };


    const handleDeleteNote = async (noteId: string) => {
        try {
            const res = await deleteLeadNoteAction({ noteId });
            if (res.data?.success) {
                toast.success("Note deleted successfully!");
                setNotes((prev) => prev.filter((n) => n._id !== noteId));
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to delete note");
        }
    };

    return {
        notes,
        loading,
        newNote,
        setNewNote,
        submitting,
        currentUserId,
        handleAddNote,
        handleDeleteNote,
    };
};