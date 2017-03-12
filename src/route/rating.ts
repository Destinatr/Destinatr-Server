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
            this.router.get("/:longitude/:latitude/:distanceRadius/:timestamp", this.getPoints);
        }

        private async create(req: express.Request, res: express.Response) {

            if (!req.body["latitude"] || !req.body["longitude"] || req.body["timestamp"] === undefined
                || !req.body["value"]) {
                res.json({ success: false, msg: "Please enter all required information." });
            } else {
                try {
                    let date = new Date(req.body["timestamp"]);
                    let rating = await RatingController.getInstance().create(<RatingModel>{
                        position: {
                            type: 'Point',
                            coordinates: [
                                req.body["longitude"],
                                req.body["latitude"]
                            ]
                        },
                        day: date.getDay(),
                        hour: date.getHours(),
                        value: req.body["value"]
                    });
                    res.json({success: true, rating: rating});
                } catch (err) {
                    res.status(HttpStatus.Internal_Server_Error).json({ success: false, err: err });
                }
            }
        }

        private async getPoints(req: express.Request, res: express.Response) {

            let longitude = req.params["longitude"];
            let latitude = req.params["latitude"];
            let radius = req.params["distanceRadius"];
            let timestamp = req.params["timestamp"];
        }
    }
}

export = Route;
