import { ParkingModel, ParkingRepository, Position } from "../model/parking";

module Conrtoller {

    interface ParkingRequest {
        latitude: number;
        longitude: number;
    }

    export class ParkingController {

        private static instance: ParkingController;

        private parkingRepository: ParkingRepository;
        private maxDistance = 500;

        public static getInstance() {
            if (!ParkingController.instance) {
                ParkingController.instance = new ParkingController();
            }
            return ParkingController.instance;
        }

        private constructor() {
            this.parkingRepository = new ParkingRepository();
        }

        public getNearestParkings(parkingRequest: ParkingRequest): Promise<ParkingModel[]> {
            return new Promise<ParkingModel[]>((resolve, reject) => {
                this.parkingRepository.findAndPopulate({
                    position: {
                        $nearSphere: {
                            $geometry: {
                                type: "Point",
                                coordinates: [Number(parkingRequest.longitude), Number(parkingRequest.latitude)]
                            },
                            $maxDistance: this.maxDistance
                        }
                    }
                }, null, null).then((parkings: ParkingModel[]) => {
                    resolve(parkings);
                }).catch((err) => {
                    reject(err);
                });
            });
        }
    }
}

export = Conrtoller;
