import * as fs from 'fs';
import * as XLS from 'xlsx';
import * as sherb from '../model/stationnement_sherb';
import { ParkingModel, ParkingRepository } from '../model/parking';

module Controller {

    export class StationnementSherb {

        private repoParking: ParkingRepository;

        constructor() {
            this.repoParking = new ParkingRepository();
        }

        public async parsePublicParking() {
            return new Promise<boolean>(async (resolve, reject) => {
                let data = "";
                let stream = fs.createReadStream(__dirname +
                    "/../../sets/stationnementpublic.json");
                stream.on("data", (chunk: Buffer) => {
                    if (!chunk) {
                        reject();
                    } else {
                        data += chunk.toString();
                    }
                });
                let datas = [];
                stream.on("end", async () => {
                    let stationnements: sherb.StationnementSherb = JSON.parse(data);
                    for (let set of stationnements.features) {
                        datas.push(set);
                        let parking: ParkingModel = <ParkingModel>{};
                        parking.restriction = null;
                        parking.free = true;
                        parking.position = set.geometry;
                        await this.repoParking.create(parking);
                    }

                    let ok = true;
                    resolve(true);
                    console.log("Eh ben : " + datas.length);
                });
            });
        }

        public async parseBorne() {
            return new Promise<boolean>(async (resolve, reject) => {
                let data = "";
                let stream = fs.createReadStream(__dirname +
                    "/../../sets/bornestationnementsdt.json");
                stream.on("data", (chunk: Buffer) => {
                    if (!chunk) {
                        reject();
                    } else {
                        data += chunk.toString();
                    }
                });
                let datas = [];
                stream.on("end", async () => {
                    let stationnements: sherb.StationnementSherb = JSON.parse(data);
                    for (let set of stationnements.features) {
                        datas.push(set);
                        let parking: ParkingModel = <ParkingModel>{};
                        parking.restriction = null;
                        parking.free = false;
                        parking.position = set.geometry;
                        await this.repoParking.create(parking);
                    }

                    let ok = true;
                    resolve(true);
                    console.log("Eh ben : " + datas.length);
                });
            });
        }
    }
}
export = Controller;
