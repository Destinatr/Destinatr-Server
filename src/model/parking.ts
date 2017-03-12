import * as mongoose from 'mongoose';
import { RepositoryBase } from "./database";
import { RestrictionModel } from "./restriction";
import { PermissionModel } from './permissions';
export let Schema = mongoose.Schema;
export let ObjectId = mongoose.Schema.Types.ObjectId;
export let Mixed = mongoose.Schema.Types.Mixed;

export interface Position {
    type: string;
    coordinates: number[];
}

export interface ParkingModel extends mongoose.Document {
    position: Position;
    restriction?: RestrictionModel;
    permissions?: PermissionModel[];
    free?: boolean;
    hourPrize?: number;
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
    restriction: {
        type: Schema.Types.ObjectId,
        required: false,
        ref: 'restriction'
    },
    permissions: {
        type: [Schema.Types.ObjectId],
        required: false,
        ref: 'permissions'
    },
    free: {
        type: Boolean,
        required: true,
        default: false
    },
    hourPrize: {
        type: Number,
        required: false
    },
    maxTime: {
        type: Number,
        required: false
    }
});

export let parkingSchema = mongoose.model<ParkingModel>("parking", schema, "parkings", true);

export class ParkingRepository extends RepositoryBase<ParkingModel> {
    constructor() {
        super(parkingSchema);
    }

    public findAndPopulate(cond?: Object, options?: Object, sort?: Object): Promise<ParkingModel[]> {
        return new Promise<ParkingModel[]>((resolve, reject) => {
            this._model.find(cond, options, (err: any, res: ParkingModel[]) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            }).sort(sort).populate('restriction').populate('permission');
        });
    }

    public findByIdAndPopulate(_id) {
        return new Promise<ParkingModel>((resolve, reject) => {
            this._model.findById({ _id: _id }, (err: any, res: ParkingModel) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            }).populate('restriction').populate('permission');
        });
    }
}
