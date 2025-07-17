import mongoose from 'mongoose';
import Expression from './models/Expression.js';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const resetDatabase = async () => {
    try {
        // Connect to MongoDB
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/live_english';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        // Drop all collections to start fresh
        console.log('Dropping all collections...');
        
        // Drop expressions collection
        try {
            await Expression.collection.drop();
            console.log('Expressions collection dropped');
        } catch (error) {
            if (error.message.includes('ns not found')) {
                console.log('Expressions collection does not exist');
            } else {
                throw error;
            }
        }

        // Drop users collection
        try {
            await User.collection.drop();
            console.log('Users collection dropped');
        } catch (error) {
            if (error.message.includes('ns not found')) {
                console.log('Users collection does not exist');
            } else {
                throw error;
            }
        }

        // Recreate the collections with proper indexes
        console.log('Recreating collections with proper indexes...');
        
        // Create a dummy expression to trigger index creation
        const testExpression = new Expression({
            userId: 'test',
            draft: 'test',
            english: 'test'
        });
        await testExpression.save();
        await Expression.deleteOne({ _id: testExpression._id });
        
        // Create a dummy user to trigger index creation
        const testUser = new User({
            googleId: 'test',
            email: 'test@example.com',
            name: 'Test User'
        });
        await testUser.save();
        await User.deleteOne({ _id: testUser._id });

        console.log('Database reset completed successfully!');
        console.log('The database is now clean and ready for use.');

    } catch (error) {
        console.error('Database reset error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

resetDatabase(); 