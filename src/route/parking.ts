import * as express from 'express';
import { ParkingController } from '../controller/parking';
import { ParkingRepository, ParkingModel } from '../model/parking';
import { HttpStatus } from '../model/http_status';

module Route {

    export class ParkingRoute {
        public router: express.Router;
        private parkingRepository: ParkingRepository;
        private months: string[] = ["janvier", "fevrier", "mars", "avril",
            "mai", "juin", "juillet", "aout",
            "septembre", "octobre", "novembre", "decembre"];
        private days: string[] = ["dimanche", "lundi", ",mardi", "mercredi", "jeudi", "vendredi", "samedi"];

        constructor() {
            this.router = express.Router();
            this.parkingRepository = new ParkingRepository();
            // tslint:disable-next-line:max-line-length
            this.router.get("/near/:longitude/:latitude/:distanceRadius/:pageNumber/:pageSize", this.getNearestParkings.bind(this));
            this.router.get("/nearest/:longitude/:latitude/:distanceRadius", this.getNearestParking.bind(this));
            this.router.get("/prediction/:longitude/:latitude/:distanceRadius", this.getNearestParking.bind(this));
        }

        private getNearestParking(req: express.Request, res: express.Response) {
            // tslint:disable-next-line:max-line-length
            if (!req.params["latitude"] || !req.params["longitude"] || !req.params["distanceRadius"]) {
                res.json({ success: false, msg: "Please enter all required information." });
            } else {
                ParkingController.getInstance().getNearestParkings({
                    longitude: req.params["longitude"],
                    latitude: req.params["latitude"],
                    distanceRadius: req.params["distanceRadius"],
                    pageNumber: 0,
                    pageSize: 200
                }).then((parkings: ParkingModel[]) => {
                        let avaliableSpots: ParkingModel[] = [];
                        let date: Date = new Date();
                        let currentMonth = date.getMonth();
                        let currentDay = date.getDay();
                        let currentHours = date.getHours();
                        let currentMinutes = date.getMinutes();
                        let self = this;
                        for (let parking of parkings) {
                            if (!parking.restriction) {
                                avaliableSpots.push(parking);
                            } else if (!parking.restriction.moisDebut && !parking.restriction.journee &&
                                !parking.restriction.heureDebut) {
                                avaliableSpots.push(parking);
                            } else if (parking.restriction.journee) {
                                if (parking.restriction.journee.indexOf(self.days[currentDay]) === -1) {
                                    avaliableSpots.push(parking);
                                }
                            } else if (parking.restriction.heureDebut) {
                                let startHours: string[];
                                let endHours: string[];
                                let avaliable = false;
                                for (let i = 0; i < parking.restriction.heureDebut.length; ++i) {
                                    startHours = parking.restriction.heureDebut[i].split("h");
                                    endHours = parking.restriction.heureFin[i].split("h");
                                    if (startHours[1] !== "") {
                                        if (endHours[1] !== "") {
                                            // tslint:disable-next-line:max-line-length
                                            if ((Number(startHours[0]) > currentHours && Number(startHours[1]) > currentMinutes)) {
                                                avaliable = true;
                                            } else {
                                                // tslint:disable-next-line:max-line-length
                                                if ((Number(endHours[0]) < currentHours && Number(endHours[1]) < currentMinutes)) {
                                                    avaliable = true;
                                                } else {
                                                    avaliable = false;
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                                if (avaliable) {
                                    avaliableSpots.push(parking);
                                }
                            }
                        }
                        res.json({ success: true, parkings: avaliableSpots[0]});
                    }).catch((err) => {
                    res.json({ success: false, err: err });
                });
            }
        }

        private getNearestParkings(req: express.Request, res: express.Response) {
            // tslint:disable-next-line:max-line-length
            if (!req.params["latitude"] || !req.params["longitude"] || !req.params["distanceRadius"] || !req.params["pageNumber"] || !req.params["pageSize"]) {
                res.json({ success: false, msg: "Please enter all required information." });
            } else {
                let pageNumber = req.params["pageNumber"];
                let pageSize = req.params["pageSize"];
                ParkingController.getInstance().getNearestParkings({
                    longitude: req.params["longitude"],
                    latitude: req.params["latitude"],
                    distanceRadius: req.params["distanceRadius"],
                    pageNumber: pageNumber,
                    pageSize: pageSize
                }).then((parkings: ParkingModel[]) => {
                    ParkingController.getInstance().parkingsCount({
                        longitude: req.params["longitude"],
                        latitude: req.params["latitude"],
                        distanceRadius: req.params["distanceRadius"],
                        pageNumber: pageNumber,
                        pageSize: pageSize
                    }).then((count: number) => {
                        let avaliableSpots: ParkingModel[] = [];
                        let date: Date = new Date();
                        let currentMonth = date.getMonth();
                        let currentDay = date.getDay();
                        let currentHours = date.getHours();
                        let currentMinutes = date.getMinutes();
                        let self = this;
                        for (let parking of parkings) {
                            if (!parking.restriction) {
                                avaliableSpots.push(parking);
                            } else if (!parking.restriction.moisDebut && !parking.restriction.journee &&
                                !parking.restriction.heureDebut) {
                                avaliableSpots.push(parking);
                            } else if (parking.restriction.journee) {
                                if (parking.restriction.journee.indexOf(self.days[currentDay]) === -1) {
                                    avaliableSpots.push(parking);
                                }
                            } else if (parking.restriction.heureDebut) {
                                let startHours: string[];
                                let endHours: string[];
                                let avaliable = false;
                                for (let i = 0; i < parking.restriction.heureDebut.length; ++i) {
                                    startHours = parking.restriction.heureDebut[i].split("h");
                                    endHours = parking.restriction.heureFin[i].split("h");
                                    if (startHours[1] !== "") {
                                        if (endHours[1] !== "") {
                                            // tslint:disable-next-line:max-line-length
                                            if ((Number(startHours[0]) > currentHours && Number(startHours[1]) > currentMinutes)) {
                                                avaliable = true;
                                            } else {
                                                // tslint:disable-next-line:max-line-length
                                                if ((Number(endHours[0]) < currentHours && Number(endHours[1]) < currentMinutes)) {
                                                    avaliable = true;
                                                } else {
                                                    avaliable = false;
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                                if (avaliable) {
                                    avaliableSpots.push(parking);
                                }
                            }
                        }
                        let remainingPages = Math.ceil(count / ( Number(pageSize) * (Number(pageNumber) + 1)) );
                        remainingPages = (remainingPages) ? remainingPages - 1 : 0;
                        res.json({ success: true, parkings: avaliableSpots, remainingPages: remainingPages });
                    });
                }).catch((err) => {
                    res.json({ success: false, err: err });
                });
            }
        }
    }
}

export = Route;
