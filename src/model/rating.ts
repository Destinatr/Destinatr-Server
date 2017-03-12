import * as mongoose from 'mongoose';
import { RepositoryBase } from "./database";
export let Schema = mongoose.Schema;
export let ObjectId = mongoose.Schema.Types.ObjectId;
export let Mixed = mongoose.Schema.Types.Mixed;

export interface Position {
    type: string;
    coordinates: number[];
}

export interface RatingModel extends mongoose.Document {
    position: Position;
    timestamp: number;
    value: number;
}

let schema = new Schema({
    position: {
        type: {
            type: String,
            default: "Point"
        },
        coordinates: {
            type: [Number]
        }
    },
    timestamp: {
        type: Number,
        required: true,
    },
    value: {
        type: Number,
        required: true
    }
});

export let ratingSchema = mongoose.model<RatingModel>("rating", schema, "ratings", true);

export class RatingRepository extends RepositoryBase<RatingModel> {
    constructor() {
        super(ratingSchema);
    }
}
