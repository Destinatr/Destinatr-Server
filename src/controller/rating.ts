import { RatingModel, RatingRepository, Position } from "../model/rating";

module Conrtoller {

    interface RatingRequest {
        latitude: number;
        longitude: number;
        distanceRadius: number;
    }

    export class RatingController {

        private static instance: RatingController;
        private ratingRepository: RatingRepository;

        public static getInstance() {
            if (!RatingController.instance) {
                RatingController.instance = new RatingController();
            }
            return RatingController.instance;
        }

        private constructor() {
            this.ratingRepository = new RatingRepository();
        }

        public async create(rating: RatingModel) {
            try {
                let r = await this.ratingRepository.create(rating);
                return r;
            } catch (err) {
                throw err;
            }
        }

        public getNearestRatings(ratingRequest: RatingRequest): Promise<RatingModel[]> {
            return new Promise<RatingModel[]>((resolve, reject) => {
                this.ratingRepository.find({
                    position: {
                        $nearSphere: {
                            $geometry: {
                                type: "Point",
                                coordinates: [Number(ratingRequest.longitude), Number(ratingRequest.latitude)]
                            },
                            $maxDistance: ratingRequest.distanceRadius
                        }
                    }
                }, null, null).then((ratings: RatingModel[]) => {
                    resolve(ratings);
                }).catch((err) => {
                    reject(err);
                });
            });
        }
    }
}

export = Conrtoller;
