import * as express from 'express';
import { HttpStatus } from '../model/http_status';
import { RatingController } from '../controller/rating';
import { RatingModel } from '../model/rating';

module Route {

    export class Rating {

        public router: express.Router;

        constructor() {
            this.router = express.Router();

            this.router.post("/", this.create);
        }

        private async create(req: express.Request, res: express.Response) {

            if (!req.body["latitude"] || !req.body["longitude"] || req.body["timestamp"] === undefined
                || !req.body["value"]) {
                res.json({ success: false, msg: "Please enter all required information." });
            } else {
                try {
                    let rating = await RatingController.getInstance().create(<RatingModel>{
                        position: {
                            type: 'Point',
                            coordinates: [
                                req.body["longitude"],
                                req.body["latitude"]
                            ]
                        },
                        timestamp: req.body["timestamp"],
                        value: req.body["value"]
                    });
                    res.json({success: true, rating: rating});
                } catch (err) {
                    res.status(HttpStatus.Internal_Server_Error).json({ success: false, err: err });
                }
            }
        }
    }
}

export = Route;
