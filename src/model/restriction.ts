
import * as mongoose from 'mongoose';
import { RepositoryBase } from "./database";

export let Schema = mongoose.Schema;
export let ObjectId = mongoose.Schema.Types.ObjectId;
export let Mixed = mongoose.Schema.Types.Mixed;


export interface RestrictionModel extends mongoose.Document {
    code: string;
    toujours?: boolean;
    journee?: string[];
    mois?: number[];
    heureDebut?: string[];
    heureFin?: string[];
}

let schema = new Schema({
    code: {
        type: String,
        required: true
    },
    toujours: {
        type: Boolean,
        required: false
    },
    journee: {
        type: [String],
        required: false
    },
    mois: {
        type: [Number],
        required: false
    },
    heureDebut: {
        type: [String],
        required: false
    },
    heureFin: {
        type: [String],
        required: false
    }
});

export let restrictionSchema = mongoose.model<RestrictionModel>("restriction", schema, "restrictions", true);

export class RestrictionRepository extends RepositoryBase<RestrictionModel> {
    constructor() {
        super(restrictionSchema);
    }
}
