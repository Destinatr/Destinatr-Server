import * as fs from 'fs';
import * as XLS from 'xlsx';
import * as mtl from '../model/stationnement_mtl';
import { ParkingModel, ParkingRepository } from '../model/parking';
import { RestrictionModel, RestrictionRepository } from '../model/restriction';

module Controller {

    export class StationnementMtl {

        private repo: RestrictionRepository;
        private repoParking: ParkingRepository;

        constructor() {
            this.repo = new RestrictionRepository();
            this.repoParking = new ParkingRepository();
        }

        public async parseParking() {
            return new Promise<boolean>(async (resolve, reject) => {
                let data = "";
                let stream = fs.createReadStream(__dirname +
                    "/../../signalisation.json");
                stream.on("data", (chunk: Buffer) => {
                    if (!chunk) {
                        reject();
                    } else {
                        data += chunk.toString();
                    }
                });
                let datas = [];
                stream.on("end", async () => {
                    let stationnements: mtl.StationnementMtl = JSON.parse(data);
                    for (let set of stationnements.features) {
                        if (set.properties.DESCRIPTION_CAT === "STATIONNEMENT") {
                            let restriction = await this.repo.findOne({
                                code: set.properties.CODE_RPA
                            });
                            if (!restriction) {
                                console.log("NOPE");
                                continue;
                            }
                            datas.push(set);
                            let parking: ParkingModel = <ParkingModel>{};
                            parking.restriction = restriction._id;
                            parking.position = set.geometry;
                            await this.repoParking.create(parking);
                        }
                    }
                    let ok = true;
                    resolve(true);
                    console.log("Eh ben : " + datas.length);
                });
            });
        }

        public async parseSignalec() {
            return new Promise<boolean>(async (resolve, reject) => {
                let data = XLS.readFile(__dirname +
                    "/../../signalec-descriptifs.ods");
                let json: mtl.Signalec[] = XLS.utils.sheet_to_json(data.Sheets[data.SheetNames[0]]);
                let kk = [];
                for (let set of json) {
                    let restriction: RestrictionModel = <RestrictionModel>{};
                    restriction.code = set.CODE_RPA;
                    if (!set.DESCRIPTION_RPA) {
                        continue;
                    }
                    let desc = set.DESCRIPTION_RPA.split(' ');

                    let time: string[] = this.findTime(desc);
                    let days: string[] = this.findDays(desc);
                    let months: string[] = this.findMonths(desc);
                    if (time.length === 0 && days.length === 0 && months.length === 0) {
                        console.log("NOPE");
                        continue;
                    }
                    kk.push(set);
                    restriction.journee = days;
                    restriction.toujours = false;
                    restriction.heureDebut = [];
                    restriction.heureFin = [];
                    for (let i = 0; i < time.length; ++i) {
                        if (!(i % 2)) {
                            restriction.heureDebut.push(time[i]);
                        } else {
                            restriction.heureFin.push(time[i]);
                        }
                    }
                    await this.repo.create(restriction);
                }
                let ok = true;
                resolve(true);
                console.log("Eh ben : " + kk.length);
            });
        }

        public findTime(desc: string[]) {
            let time = [];
            let regex: RegExp = new RegExp("[0-9][0-9]h([0-9][0-9])?-[0-9][0-9]h([0-9][0-9])?", "g");
            for (let data of desc) {
                if (regex.test(data)) {
                    let hours = data.split('-');
                    for (let h of hours) {
                        time.push(h);
                    }
                }
            }
            return time;
        }

        public findDays(desc: string[]) {
            let days = [];
            for (let data of desc) {
                if (data.toLowerCase().indexOf('lun') !== -1 || data.toLowerCase().indexOf('lundi') !== -1) {
                    days.push('lundi');
                } else if (data.toLowerCase().indexOf('mar') !== -1 || data.toLowerCase().indexOf('mardi') !== -1) {
                    days.push('mardi');
                } else if (data.toLowerCase().indexOf('mer') !== -1 || data.toLowerCase().indexOf('mercredi') !== -1) {
                    days.push('mercredi');
                } if (data.toLowerCase().indexOf('jeu') !== -1 || data.toLowerCase().indexOf('jeudi') !== -1) {
                    days.push('jeudi');
                } if (data.toLowerCase().indexOf('ven') !== -1 || data.toLowerCase().indexOf('vendredi') !== -1) {
                    days.push('vendredi');
                } if (data.toLowerCase().indexOf('sam') !== -1 || data.toLowerCase().indexOf('samedi') !== -1) {
                    days.push('samedi');
                } if (data.toLowerCase().indexOf('dim') !== -1 || data.toLowerCase().indexOf('dimanche') !== -1) {
                    days.push('dimanche');
                } if (data.toLowerCase().indexOf('lun a ven') !== -1 ||
                    data.toLowerCase().indexOf('lun au ven') !== -1) {
                    days.push('lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi');
                }
            }
            return days;
        }

        public findMonths(desc: string[]) {
            let months = [];
            for (let data of desc) {
                if (data.toLowerCase().indexOf('janv') !== -1) {
                    months.push('janvier');
                } else if (data.toLowerCase().indexOf('fevr') !== -1) {
                    months.push('fevrier');
                } else if (data.toLowerCase().indexOf('mars') !== -1) {
                    months.push('mars');
                } if (data.toLowerCase().indexOf('avr') !== -1) {
                    months.push('avril');
                } if (data.toLowerCase().indexOf('mai') !== -1) {
                    months.push('mai');
                } if (data.toLowerCase().indexOf('juin') !== -1) {
                    months.push('juin');
                } if (data.toLowerCase().indexOf('juill') !== -1) {
                    months.push('juillet');
                } if (data.toLowerCase().indexOf('aout') !== -1) {
                    months.push('aout');
                } if (data.toLowerCase().indexOf('sept') !== -1) {
                    months.push('septembre');
                } if (data.toLowerCase().indexOf('oct') !== -1) {
                    months.push('octobre');
                } if (data.toLowerCase().indexOf('nov') !== -1) {
                    months.push('novembre');
                } if (data.toLowerCase().indexOf('dec') !== -1) {
                    months.push('decembre');
                }
            }
            return months;
        }
    }
}
export = Controller;
