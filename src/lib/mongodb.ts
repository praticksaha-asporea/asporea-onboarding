import mongoose from 'mongoose';
const MONGODB_URI=process.env.MONGODB_URI as string;

if(!MONGODB_URI) {
    throw new Error('Please define MONGODBURI in environmental varibale')
}

let cached = (global as any).mongoose;

if(!cached) {
    cached = (global as any).mongoose = {
        conn:null,
        promise:null,
    };
}

async function connectToDatabase() {
    if(cached.conn) {
        return cached.conn;
    }

    if(!cached.promise) {
        cached.promise=mongoose.connect(MONGODB_URI,{
            bufferCommands:false,
        }).then((mongoose)=>mongoose)
    }

    try {
        cached.conn = await cached.promise;
    }catch(error) {
        cached.promise=null;
        throw error;
    }

    return cached.conn;
}

export default connectToDatabase