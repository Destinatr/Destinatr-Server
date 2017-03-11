import * as mongoose from 'mongoose';
import { RepositoryBase } from "./database";

export let Schema = mongoose.Schema;
export let ObjectId = mongoose.Schema.Types.ObjectId;
export let Mixed = mongoose.Schema.Types.Mixed;

export interface Position {
    type: string;
    coordinates: number[];
}


export interface Restriction {
    code: string;
    journee: string;
    moisDebut: string;
    moisFin: string;
    heureDebut: string;
    heureFin: string;
}

export interface ParkingModel extends mongoose.Document {
    position: Position;
    restriction?: Restriction;
}

let schema = new Schema({
    position: {
        type: {
            type: String,
            default: "Point"
        },
        coordinates: {
            type: [Number]
        },
        required: true
    },
    restriction: {
        type: {
            code: String,
            journee: String,
            moisDebut: String,
            moisFin: String,
            heureDebut: String,
            heureFin: String
        },
        required: false
    }
});

export let parkingSchema = mongoose.model<ParkingModel>("parking", schema, "parkings", true);

export class ParkingRepository extends RepositoryBase<ParkingModel> {
    constructor() {
        super(parkingSchema);
    }
}
