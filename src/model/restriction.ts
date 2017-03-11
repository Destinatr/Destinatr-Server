




import * as mongoose from 'mongoose';
import { RepositoryBase } from "./database";

export let Schema = mongoose.Schema;
export let ObjectId = mongoose.Schema.Types.ObjectId;
export let Mixed = mongoose.Schema.Types.Mixed;


export interface RestrictionModel extends mongoose.Document {
    code: string;
    journee: string;
    moisDebut: string;
    moisFin: string;
    heureDebut: string;
    heureFin: string;
}

let schema = new Schema({
            code: {
                type: String,
                required: true
            },
            journee: {
                type: String,
                required: true
            },
            moisDebut: {
                type: String,
                required: true
            },
            moisFin: {
                type: String,
                required: true
            },
            heureDebut: {
                type: String,
                required: true
            },
            heureFin: {
                type: String,
                required: true
            }
});

export let restrictionSchema = mongoose.model<RestrictionModel>("restriction", schema, "restrictions", true);

export class RestrictionRepository extends RepositoryBase<RestrictionModel> {
    constructor() {
        super(restrictionSchema);
    }
}
