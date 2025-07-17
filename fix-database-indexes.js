import mongoose from 'mongoose';
import Expression from './models/Expression.js';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const fixDatabaseIndexes = async () => {
    try {
        // Connect to MongoDB
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/live_english';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        // Get the expressions collection
        const db = mongoose.connection.db;
        const expressionsCollection = db.collection('expressions');

        console.log('=== CHECKING CURRENT INDEXES ===');
        
        // List all current indexes
        const indexes = await expressionsCollection.indexes();
        console.log('Current indexes:');
        indexes.forEach((index, i) => {
            console.log(`${i + 1}. ${index.name}:`, index.key);
        });

        // Drop problematic indexes
        console.log('\n=== DROPPING PROBLEMATIC INDEXES ===');
        
        try {
            // Drop the id_1 index if it exists
            await expressionsCollection.dropIndex('id_1');
            console.log('SUCCESS: Dropped id_1 index');
        } catch (error) {
            if (error.message.includes('index not found')) {
                console.log('INFO: id_1 index not found (already removed)');
            } else {
                console.log('ERROR: Error dropping id_1 index:', error.message);
            }
        }

        try {
            // Drop the compound index if it exists
            await expressionsCollection.dropIndex('id_1_userId_1');
            console.log('SUCCESS: Dropped id_1_userId_1 index');
        } catch (error) {
            if (error.message.includes('index not found')) {
                console.log('INFO: id_1_userId_1 index not found (already removed)');
            } else {
                console.log('ERROR: Error dropping id_1_userId_1 index:', error.message);
            }
        }

        // Recreate proper indexes
        console.log('\n=== CREATING PROPER INDEXES ===');
        
        // Create userId index
        await expressionsCollection.createIndex({ userId: 1 });
        console.log('SUCCESS: Created userId index');

        // Create compound index for better performance
        await expressionsCollection.createIndex({ userId: 1, dateTime: -1 });
        console.log('SUCCESS: Created userId + dateTime index');

        // List final indexes
        console.log('\n=== FINAL INDEXES ===');
        const finalIndexes = await expressionsCollection.indexes();
        finalIndexes.forEach((index, i) => {
            console.log(`${i + 1}. ${index.name}:`, index.key);
        });

        console.log('\nSUCCESS: Database indexes fixed successfully!');
        console.log('You can now save expressions without duplicate key errors.');

    } catch (error) {
        console.error('ERROR: Error fixing database indexes:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

fixDatabaseIndexes(); 