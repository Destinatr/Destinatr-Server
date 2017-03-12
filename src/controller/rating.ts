import { RatingModel, RatingRepository, Position } from "../model/rating";

module Conrtoller {

    interface RatingRequest {
        latitude: number;
        longitude: number;
        distanceRadius: number;
        timestamp: number;
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
                let date = new Date(ratingRequest.timestamp);
                let gt = date.getHours() - 1;
                if (gt < 0) {
                    gt = 0;
                }
                let lt = date.getHours() + 1;
                if (lt > 23) {
                    lt = 23;
                }
                console.log(gt + "<= hours <= " + lt);
                this.ratingRepository.find({
                    position: {
                        $nearSphere: {
                            $geometry: {
                                type: "Point",
                                coordinates: [Number(ratingRequest.longitude), Number(ratingRequest.latitude)]
                            },
                            $maxDistance: ratingRequest.distanceRadius
                        }
                    },
                    day: date.getDay(),
                    hours: {
                        $gte: gt, $lte: lt
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
