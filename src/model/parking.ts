import * as mongoose from 'mongoose';
import { RepositoryBase } from "./database";
import { RestrictionModel } from "./restriction";
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
    restriction?: RestrictionModel;
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
        type: Schema.Types.ObjectId,
        required: false,
        ref: 'restriction'
    }
});

export let parkingSchema = mongoose.model<ParkingModel>("parking", schema, "parkings", true);

export class ParkingRepository extends RepositoryBase<ParkingModel> {
    constructor() {
        super(parkingSchema);
    }

    public findWithLimit(cond?: Object, options?: Object, sort?: Object, skip?: number,
                         limit?: number): Promise<ParkingModel[]> {
        return new Promise<ParkingModel[]>((resolve, reject) => {
            this._model.find(cond, options, (err: any, res: ParkingModel[]) => {

                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            }).sort(sort).skip(skip).limit(limit).populate('restriction');
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
            }).populate('restriction');
        });
    }
}
