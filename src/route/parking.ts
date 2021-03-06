import * as express from 'express';
import { ParkingController } from '../controller/parking';
import { ParkingRepository, ParkingModel } from '../model/parking';

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
                    let availableSpots: ParkingModel[] = [];
                    let date: Date = new Date();
                    let currentMonth = date.getMonth();
                    let currentDay = date.getDay();
                    let currentHours = date.getHours();
                    let currentMinutes = date.getMinutes();
                    let self = this;
                    for (let parking of parkings) {
                        if (!parking.restriction) {
                            availableSpots.push(parking);
                        } else if (!parking.restriction.mois && !parking.restriction.journee &&
                            !parking.restriction.heureDebut) {
                            availableSpots.push(parking);
                        } else if (parking.restriction.mois) {
                            if (parking.restriction.mois.indexOf(currentDay) === -1) {
                                availableSpots.push(parking);
                            } else if (parking.restriction.journee) {
                                if (parking.restriction.journee.indexOf(self.days[currentDay]) === -1) {
                                    availableSpots.push(parking);
                                } else if (parking.restriction.heureDebut) {
                                    let startHours: string[];
                                    let endHours: string[];
                                    let available = false;
                                    for (let i = 0; i < parking.restriction.heureDebut.length; ++i) {
                                        startHours = parking.restriction.heureDebut[i].split("h");
                                        endHours = parking.restriction.heureFin[i].split("h");
                                        if (startHours[1] !== "") {
                                            if (endHours[1] !== "") {
                                                // tslint:disable-next-line:max-line-length
                                                if ((Number(startHours[0]) > currentHours && Number(startHours[1]) > currentMinutes)) {
                                                    available = true;
                                                } else {
                                                    // tslint:disable-next-line:max-line-length
                                                    if ((Number(endHours[0]) < currentHours && Number(endHours[1]) < currentMinutes)) {
                                                        available = true;
                                                    } else {
                                                        available = false;
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    if (available) {
                                        availableSpots.push(parking);
                                    }
                                }
                            }
                        } else if (parking.restriction.journee) {
                            if (parking.restriction.journee.indexOf(self.days[currentDay]) === -1) {
                                availableSpots.push(parking);
                            } else if (parking.restriction.heureDebut) {
                                let startHours: string[];
                                let endHours: string[];
                                let available = false;
                                for (let i = 0; i < parking.restriction.heureDebut.length; ++i) {
                                    startHours = parking.restriction.heureDebut[i].split("h");
                                    endHours = parking.restriction.heureFin[i].split("h");
                                    if (startHours[1] !== "") {
                                        if (endHours[1] !== "") {
                                            // tslint:disable-next-line:max-line-length
                                            if ((Number(startHours[0]) > currentHours && Number(startHours[1]) > currentMinutes)) {
                                                available = true;
                                            } else {
                                                // tslint:disable-next-line:max-line-length
                                                if ((Number(endHours[0]) < currentHours && Number(endHours[1]) < currentMinutes)) {
                                                    available = true;
                                                } else {
                                                    available = false;
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                                if (available) {
                                    availableSpots.push(parking);
                                }
                            }
                        } else if (parking.restriction.heureDebut) {
                            let startHours: string[];
                            let endHours: string[];
                            let available = false;
                            for (let i = 0; i < parking.restriction.heureDebut.length; ++i) {
                                startHours = parking.restriction.heureDebut[i].split("h");
                                endHours = parking.restriction.heureFin[i].split("h");
                                if (startHours[1] !== "") {
                                    if (endHours[1] !== "") {
                                        // tslint:disable-next-line:max-line-length
                                        if ((Number(startHours[0]) > currentHours && Number(startHours[1]) > currentMinutes)) {
                                            available = true;
                                        } else {
                                            // tslint:disable-next-line:max-line-length
                                            if ((Number(endHours[0]) < currentHours && Number(endHours[1]) < currentMinutes)) {
                                                available = true;
                                            } else {
                                                available = false;
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                            if (available) {
                                availableSpots.push(parking);
                            }
                        }
                    }

                    let index = 0;
                    let maxScore = -1000;

                    for (let i = 0; i < availableSpots.length; ++i) {
                        let s: any = {
                            destLat: req.params["latitude"],
                            destLong: req.params["longitude"],
                            parkLat: availableSpots[i].position.coordinates[1],
                            parkLong: availableSpots[i].position.coordinates[0],
                            rating: 0,
                            cost: availableSpots[i].hourPrize,
                            score: 0
                        };
                        s.score = this.distanceVal(Math.abs(this.getDistanceFromLatLonInM(s.destLat,
                                s.destLong, s.parkLat, s.parkLong))) + s.rating + this.costVal(s.cost);
                        if (s.score > maxScore) {
                            maxScore = s.score;
                            index = i;
                        }
                    }
                    res.json({ success: true, parkings: availableSpots[index] });
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
                        let availableSpots: ParkingModel[] = [];
                        let date: Date = new Date();
                        let currentMonth = date.getMonth();
                        let currentDay = date.getDay();
                        let currentHours = date.getHours();
                        let currentMinutes = date.getMinutes();
                        let self = this;
                        for (let parking of parkings) {
                            if (parking.permissions) {
                                for (let permission of parking.permissions) {
                                    if (permission.days) {
                                        for (let day of permission.days) {
                                            if (day.day === self.days[currentDay]) {
                                                if (day.heureDebut) {
                                                    let startHours: string[];
                                                    let endHours: string[];
                                                    let available = false;
                                                    for (let i = 0; i < day.heureDebut.length; ++i) {
                                                        startHours = day.heureDebut[i].split("h");
                                                        endHours = day.heureFin[i].split("h");
                                                        if (startHours[1] !== "") {
                                                            if (endHours[1] !== "") {
                                                                // tslint:disable-next-line:max-line-length
                                                                if ((Number(startHours[0]) < currentHours && Number(startHours[1]) < currentMinutes)) {
                                                                    if ((Number(endHours[0]) > currentHours && Number(endHours[1]) > currentMinutes)) {
                                                                        available = true;
                                                                    } else {
                                                                        available = false;
                                                                        break;
                                                                    }
                                                                } else {
                                                                    available = false;
                                                                    break;
                                                                }
                                                            }
                                                        }
                                                    }
                                                    if (available) {
                                                        availableSpots.push(parking);
                                                    }
                                                } else {
                                                    availableSpots.push(parking);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            if (!parking.restriction) {
                                availableSpots.push(parking);
                            } else if (!parking.restriction.mois && !parking.restriction.journee &&
                                !parking.restriction.heureDebut) {
                                availableSpots.push(parking);
                            } else if (parking.restriction.mois) {
                                if (parking.restriction.mois.indexOf(currentDay) === -1) {
                                    availableSpots.push(parking);
                                } else if (parking.restriction.journee) {
                                    if (parking.restriction.journee.indexOf(self.days[currentDay]) === -1) {
                                        availableSpots.push(parking);
                                    } else if (parking.restriction.heureDebut) {
                                        let startHours: string[];
                                        let endHours: string[];
                                        let available = false;
                                        for (let i = 0; i < parking.restriction.heureDebut.length; ++i) {
                                            startHours = parking.restriction.heureDebut[i].split("h");
                                            endHours = parking.restriction.heureFin[i].split("h");
                                            if (startHours[1] !== "") {
                                                if (endHours[1] !== "") {
                                                    // tslint:disable-next-line:max-line-length
                                                    if ((Number(startHours[0]) > currentHours && Number(startHours[1]) > currentMinutes)) {
                                                        available = true;
                                                    } else {
                                                        // tslint:disable-next-line:max-line-length
                                                        if ((Number(endHours[0]) < currentHours && Number(endHours[1]) < currentMinutes)) {
                                                            available = true;
                                                        } else {
                                                            available = false;
                                                            break;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        if (available) {
                                            availableSpots.push(parking);
                                        }
                                    }
                                }
                            } else if (parking.restriction.journee) {
                                if (parking.restriction.journee.indexOf(self.days[currentDay]) === -1) {
                                    availableSpots.push(parking);
                                } else if (parking.restriction.heureDebut) {
                                    let startHours: string[];
                                    let endHours: string[];
                                    let available = false;
                                    for (let i = 0; i < parking.restriction.heureDebut.length; ++i) {
                                        startHours = parking.restriction.heureDebut[i].split("h");
                                        endHours = parking.restriction.heureFin[i].split("h");
                                        if (startHours[1] !== "") {
                                            if (endHours[1] !== "") {
                                                // tslint:disable-next-line:max-line-length
                                                if ((Number(startHours[0]) > currentHours && Number(startHours[1]) > currentMinutes)) {
                                                    available = true;
                                                } else {
                                                    // tslint:disable-next-line:max-line-length
                                                    if ((Number(endHours[0]) < currentHours && Number(endHours[1]) < currentMinutes)) {
                                                        available = true;
                                                    } else {
                                                        available = false;
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    if (available) {
                                        availableSpots.push(parking);
                                    }
                                }
                            } else if (parking.restriction.heureDebut) {
                                let startHours: string[];
                                let endHours: string[];
                                let available = false;
                                for (let i = 0; i < parking.restriction.heureDebut.length; ++i) {
                                    startHours = parking.restriction.heureDebut[i].split("h");
                                    endHours = parking.restriction.heureFin[i].split("h");
                                    if (startHours[1] !== "") {
                                        if (endHours[1] !== "") {
                                            // tslint:disable-next-line:max-line-length
                                            if ((Number(startHours[0]) > currentHours && Number(startHours[1]) > currentMinutes)) {
                                                available = true;
                                            } else {
                                                // tslint:disable-next-line:max-line-length
                                                if ((Number(endHours[0]) < currentHours && Number(endHours[1]) < currentMinutes)) {
                                                    available = true;
                                                } else {
                                                    available = false;
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                                if (available) {
                                    availableSpots.push(parking);
                                }
                            }
                        }
                        let remainingPages = Math.ceil((count - (Number(pageSize) * (Number(pageNumber) + 1)))
                            / Number(pageSize));
                        if (remainingPages < 0) {
                            remainingPages = 0;
                        }

                        res.json({ success: true, parkings: availableSpots, remainingPages: remainingPages });
                    });
                }).catch((err) => {
                    res.json({ success: false, err: err });
                });
            }
        }

        private getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
            let R = 6371; // Radius of the earth in km
            let dLat = this.deg2rad(lat2 - lat1);  // deg2rad below
            let dLon = this.deg2rad(lon2 - lon1);
            let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            let d = R * c; // Distance in km
            return d * 1000;
        }

        private deg2rad(deg) {
            return deg * (Math.PI / 180);
        }

        private distanceVal(x: number) {
            return -189.5038 + (4.007324 - -189.5038) / (1 + Math.pow((x / 1699694), 0.3677176));
        }

        private costVal(x: number) {
            return -1487.258 + (0.9846472 - -1487.258) / (1 + Math.pow((x / 6675845000), 0.3959707));
        }
    }
}

export = Route;
