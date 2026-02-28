import { connectDatabase } from '../database/mongodb';
import mongoose from 'mongoose';

// Integration tests hit real DB and can exceed Jest's 5s default timeout.
jest.setTimeout(30000);

beforeAll(async () => {
    await connectDatabase();
});

afterAll(async () => {
    await mongoose.connection.close();
});
