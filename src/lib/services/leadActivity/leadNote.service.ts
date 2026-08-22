import mongoose from "mongoose";
import { LeadNote, ILeadNote } from "@/lib/models/LeadNote.model";
import { ApiError } from "@/lib/error/api.error";
import "@/lib/models/Upload.model";

export const createLeadNoteService = async (
  leadId: string,
  note: string,
  authorId: string,
  authorRole: string,
) => {
  if (!leadId || !mongoose.Types.ObjectId.isValid(leadId)) {
    throw new ApiError("Valid Lead ID is required", 400);
  }
  if (!note || !note.trim()) {
    throw new ApiError("Note text is required", 400);
  }

  const newNote = await LeadNote.create({
    leadId: new mongoose.Types.ObjectId(leadId),
    authorId: new mongoose.Types.ObjectId(authorId),
    authorRole: authorRole as ILeadNote["authorRole"],
    note: note.trim(),
  });

  return await LeadNote.findById(newNote._id).populate(
    "authorId",
    "firstName lastName email profilePic",
  );
};

export const getLeadNotesService = async (leadId: string) => {
  if (!leadId || !mongoose.Types.ObjectId.isValid(leadId)) {
    throw new ApiError("Valid Lead ID query parameter is required", 400);
  }

  return await LeadNote.find({ leadId: new mongoose.Types.ObjectId(leadId) })
    .populate({
      path: "authorId",
      select: "firstName lastName email profilePic",
      populate: { path: "profilePic", select: "path" },
    })
    .sort({ createdAt: -1 })
    .lean();
};

export const deleteLeadNoteService = async (
  noteId: string,
  userId: string,
  userRole: string,
) => {
  if (!noteId || !mongoose.Types.ObjectId.isValid(noteId)) {
    throw new ApiError("Valid Note ID is required", 400);
  }

  const noteDoc = await LeadNote.findById(noteId);
  if (!noteDoc) throw new ApiError("Note not found", 404);

  const isAuthor = noteDoc.authorId.toString() === userId;
  const isElevatedUser = ["admin", "tac_head", "branch_head"].includes(
    userRole,
  );

  if (!isAuthor && !isElevatedUser) {
    throw new ApiError("You do not have permission to delete this note", 403);
  }

  await LeadNote.findByIdAndDelete(noteId);
  return { noteId };
};
