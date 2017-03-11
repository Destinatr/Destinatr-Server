import * as express from 'express';
import { ParkingController } from '../controller/parking';
import { ParkingRepository, ParkingModel } from '../model/parking';
import { HttpStatus } from '../model/http_status';

module Route {

    export class ParkingRoute {
        public router: express.Router;
        private parkingRepository: ParkingRepository;

        constructor() {
            this.router = express.Router();
            this.parkingRepository = new ParkingRepository();
            this.router.get("/near/:longitude/:latitude/:distanceRadius", this.getNearestParkings);
        }

        private getNearestParkings(req: express.Request, res: express.Response) {
            if (!req.params["latitude"] || !req.params["longitude"] || !req.params["distanceRadius"]) {
                res.json({ success: false, msg: "Please enter all required information." });
            } else {
                ParkingController.getInstance().getNearestParkings({
                    longitude: req.params["longitude"],
                    latitude: req.params["latitude"],
                    distanceRadius: req.params["distanceRadius"]
                }).then((parkings: ParkingModel[]) => {
                    res.json({ success: true, parkings: parkings });
                }).catch((err) => {
                    res.json({ success: false, err: err });
                });
            }
        }
    }
}

export = Route;
