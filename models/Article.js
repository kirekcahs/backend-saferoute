import mongoose from 'mongoose'

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required.'],
        default: null,
    },
    photoUrl: {
        type: String,
        default: null
    },
    description: {
        type: String,
        required: [true, `Description is required`],
        default: null
    },
    sourceLink: {
        type: String,
        default: null
    }, 
}, {timestamps: true})

export default mongoose.model('Article', articleSchema)