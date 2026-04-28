import mongoose from 'mongoose'

export const segmentSchema = new mongoose.Schema({
    points: {
        type: [[Number]], // Array of Arrays for Point A and Point B
        required: true,
        validate: {
            validator: function(val) {
                // 2 points (Start and End)
                if (val.length !== 2) return false;
                
                // Both Point A and Point B must have exactly 2 numbers (lat, lon)
                if (val[0].length !== 2 || val[1].length !== 2) return false;
                
                return true;
            },
            message: 'Points must contain exactly 2 coordinates: [[lat1, lon1], [lat2, lon2]]'
        }
    },
    coords: {
        type: [[Number]],
        required: true,
    },
    floodReport:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FloodReportAdmin',
        default: null
    },
    
}, {timestamps: true}
)

export default mongoose.model('Segment', segmentSchema)