import mongoose from 'mongoose';

const expressionSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    draft: {
        type: String,
        required: true
    },
    english: {
        type: String,
        required: true
    },
    dateTime: {
        type: Date,
        default: Date.now
    },
    isMemory: {
        type: Boolean,
        default: false
    },
    numberStudy: {
        type: Number,
        default: 0
    },
    lastStudyDate: {
        type: Date,
        default: null
    }
});

// Add index for better query performance
expressionSchema.index({ userId: 1, dateTime: -1 });

const Expression = mongoose.model('Expression', expressionSchema);

export default Expression; 