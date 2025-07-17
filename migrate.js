import mongoose from 'mongoose';
import fs from 'fs/promises';
import Expression from './models/Expression.js';
import User from './models/User.js';

const migrateData = async () => {
    try {
        // Connect to MongoDB
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/live_english';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        // Read existing data from db.json
        const data = await fs.readFile('db.json', 'utf-8');
        const jsonData = JSON.parse(data);

        if (jsonData.expressions && jsonData.expressions.length > 0) {
            console.log(`Found ${jsonData.expressions.length} expressions to migrate`);

            // Option 1: Create a default user for existing expressions
            let defaultUser = await User.findOne({ email: 'default@example.com' });
            if (!defaultUser) {
                console.log('Creating default user for existing expressions...');
                defaultUser = new User({
                    googleId: 'default-user-id',
                    email: 'default@example.com',
                    name: 'Default User',
                    picture: null
                });
                await defaultUser.save();
                console.log('Default user created');
            }

            // Clear existing expressions in MongoDB (to avoid duplicates)
            await Expression.deleteMany({});
            console.log('Cleared existing MongoDB expression data');

            // Insert data into MongoDB with userId
            for (const expr of jsonData.expressions) {
                const newExpression = new Expression({
                    id: expr.id,
                    userId: defaultUser._id.toString(), // Add required userId field
                    draft: expr.draft,
                    english: expr.english,
                    dateTime: new Date(expr.dateTime),
                    isMemory: expr.isMemory,
                    numberStudy: expr.numberStudy,
                    lastStudyDate: expr.lastStudyDate ? new Date(expr.lastStudyDate) : null
                });

                await newExpression.save();
                console.log(`Migrated expression ${expr.id}: ${expr.draft}`);
            }

            console.log('Migration completed successfully!');
            console.log(`All expressions have been assigned to user: ${defaultUser.email}`);
        } else {
            console.log('No expressions found in db.json');
        }

    } catch (error) {
        console.error('Migration error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

migrateData(); 