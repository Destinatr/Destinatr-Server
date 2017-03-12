import { ParkingModel, ParkingRepository, Position } from "../model/parking";
import { RestrictionModel, RestrictionRepository } from "../model/restriction";

module Conrtoller {

    interface ParkingRequest {
        pageNumber: number;
        pageSize: number;
        latitude: number;
        longitude: number;
        distanceRadius: number;
    }

    export class ParkingController {

        private static instance: ParkingController;

        private parkingRepository: ParkingRepository;
        private restrictionRepository: RestrictionRepository;

        public static getInstance() {
            if (!ParkingController.instance) {
                ParkingController.instance = new ParkingController();
            }
            return ParkingController.instance;
        }

        private constructor() {
            this.restrictionRepository = new RestrictionRepository();
            this.parkingRepository = new ParkingRepository();
        }

        public parkingsCount(parkingRequest: ParkingRequest): Promise<number>{
             return new Promise<number>((resolve, reject) => {
                this.parkingRepository.count({
                    position: {
                        $nearSphere: {
                            $geometry: {
                                type: "Point",
                                coordinates: [Number(parkingRequest.longitude), Number(parkingRequest.latitude)]
                            },
                            $maxDistance: parkingRequest.distanceRadius
                        }
                    }
                }).then((count: number) => {
                    resolve(count);
                }).catch((err) => {
                    reject(err);
                });
            });
        }

        public getNearestParking(parkingRequest: ParkingRequest): Promise<ParkingModel> {
            return new Promise<ParkingModel>((resolve, reject) => {
                this.parkingRepository.findOneAndPopulate({
                    position: {
                        $nearSphere: {
                            $geometry: {
                                type: "Point",
                                coordinates: [Number(parkingRequest.longitude), Number(parkingRequest.latitude)]
                            },
                            $maxDistance: parkingRequest.distanceRadius
                        }
                    }
                }).then((parking: ParkingModel) => {
                    resolve(parking);
                }).catch((err) => {
                    reject(err);
                });
            });
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
                            $maxDistance: parkingRequest.distanceRadius
                        }
                    }
                }, null, Number(parkingRequest.pageNumber * parkingRequest.pageSize),
                Number(parkingRequest.pageSize)).then((parkings: ParkingModel[]) => {
                    resolve(parkings);
                }).catch((err) => {
                    reject(err);
                });
            });
        }
    }
}

export = Conrtoller;
