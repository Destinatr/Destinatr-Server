
import * as mongoose from 'mongoose';
import { RepositoryBase } from "./database";

export let Schema = mongoose.Schema;
export let ObjectId = mongoose.Schema.Types.ObjectId;
export let Mixed = mongoose.Schema.Types.Mixed;

export interface DaysPermissions {
    day: string;
    heureDebut?: string[];
    heureFin?: string[];
}

export interface PermissionModel extends mongoose.Document {
    code: string;
    days: DaysPermissions[];
}

let schema = new Schema({
    code: {
        type: String,
        required: true
    },
    days: {
        type: Object,
        required: false
    }
});

export let permissionSchema = mongoose.model<PermissionModel>("permission", schema, "permissions", true);

export class PermissionRepository extends RepositoryBase<PermissionModel> {
    constructor() {
        super(permissionSchema);
    }
}
