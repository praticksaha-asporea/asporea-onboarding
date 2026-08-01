import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import axios from 'axios';
import { Upload } from '../models/Upload.model';

export const handleProfilePicUpload = async (userId: string, profilePicData: string) => {
    if (!profilePicData || profilePicData === "REMOVE") return null;

    if (profilePicData.startsWith('data:image')) {
        const matches = profilePicData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
            const imageType = matches[1];
            const base64Data = matches[2];
            const buffer = Buffer.from(base64Data, 'base64');
            const extension = imageType.split('/')[1] || 'jpeg';

            const fileName = `profile_${userId}_${Date.now()}.${extension}`;
            const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');

            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
            fs.writeFileSync(path.join(uploadDir, fileName), buffer);

            const uploadDoc = await Upload.create({
                userId: new mongoose.Types.ObjectId(userId),
                path: `/uploads/profiles/${fileName}`
            });
            return uploadDoc._id;
        }
    }

    if (profilePicData.startsWith('http')) {
        try {

            const response = await axios.get(profilePicData, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data, 'binary');
            const contentType = response.headers['content-type'];
            let extension = 'jpeg';

            if (typeof contentType === 'string' && contentType.includes('image/')) {
                extension = contentType.split('/')[1];
            }
            const fileName = `profile_social_${userId}_${Date.now()}.${extension}`;
            const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');

            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
            fs.writeFileSync(path.join(uploadDir, fileName), buffer);

            const uploadDoc = await Upload.create({
                userId: new mongoose.Types.ObjectId(userId),
                path: `/uploads/profiles/${fileName}`
            });
            return uploadDoc._id;
        } catch (error) {
            console.error("Failed to download social profile image:", error);
            return null;
        }
    }

    return null;
};