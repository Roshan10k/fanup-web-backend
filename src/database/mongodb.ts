import mongoose from 'mongoose';
import { MONGODB_URI } from '../configs';


export async function connectDatabase() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB connected successfully');
    } catch (error: unknown) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}
