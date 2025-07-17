import mongoose from 'mongoose';
import Expression from './models/Expression.js';
import dotenv from 'dotenv';

dotenv.config();

const cleanupDatabase = async () => {
    try {
        // Connect to MongoDB
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/live_english';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        // Find expressions without userId
        const expressionsWithoutUserId = await Expression.find({ userId: { $exists: false } });
        console.log(`Found ${expressionsWithoutUserId.length} expressions without userId`);

        if (expressionsWithoutUserId.length > 0) {
            // Delete expressions without userId
            const deleteResult = await Expression.deleteMany({ userId: { $exists: false } });
            console.log(`Deleted ${deleteResult.deletedCount} expressions without userId`);
        }

        // Show remaining expressions
        const remainingExpressions = await Expression.find({});
        console.log(`Remaining expressions in database: ${remainingExpressions.length}`);

        console.log('Database cleanup completed successfully!');

    } catch (error) {
        console.error('Cleanup error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

cleanupDatabase(); 