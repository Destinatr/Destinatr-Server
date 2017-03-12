import * as fs from 'fs';
import * as XLS from 'xlsx';
import * as csv from 'fast-csv';
import * as mtl from '../model/stationnement_mtl';
import { ParkingModel, ParkingRepository } from '../model/parking';
import { RestrictionModel, RestrictionRepository } from '../model/restriction';
import { PermissionModel, PermissionRepository } from '../model/permissions';

interface Periodes {
    dtHeureDebut: string;
    dtHeureFin: string;
    bLun: boolean;
    bMar: boolean;
    bMer: boolean;
    bJeu: boolean;
    bVen: boolean;
    bSam: boolean;
    bDim: boolean;
}

interface Reglementations {
    Type: string;
    DateDebut: number;
    DateFin: number;
    maxHeures: number;
}

interface Places {
    nLongitude: number;
    nLatitude: number;
    nPositionCentreLongitude: number;
    nPositionCentreLatitude: number;
    sStatut: string;
    sGenre: string;
    sType: string;
    sAutreTete: string;
    sNomRue: string;
    nSupVelo: boolean;
    sTypeExploitation: string;
    nTarifHoraire: number;
    sLocalisation: string;
    nTarifMax: number;
}

module Controller {

    export class StationnementMtl {

        private repo: RestrictionRepository;
        private repoParking: ParkingRepository;
        private repoPermission: PermissionRepository;

        constructor() {
            this.repo = new RestrictionRepository();
            this.repoParking = new ParkingRepository();
            this.repoPermission = new PermissionRepository();
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
                            parking.free = true;
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

        public parseNonFreeParking() {
            return new Promise<boolean>(async (resolve, reject) => {
                let periodes = await this.getPeriodes();
                let reglementationPeriodes = await this.getReglementationsPeriodes();
                let reglementations = await this.getReglementations();
                let i = 0;
                let j = 0;
                for (let rp in reglementationPeriodes) {
                    if (!rp) {
                        continue;
                    }
                    ++j;
                    let rule = reglementations[rp];
                    let rps = reglementationPeriodes[rp];
                    if (!rule) {
                        continue;
                    }
                    if (rule.Type === 'U' || rule.Type === 'P' || rule.Type === 'Q'
                        || rule.Type === 'V' || rule.Type === 'M') {
                        ++i;
                        let permission: PermissionModel = <PermissionModel>{};
                        permission.code = rp;
                        permission.days = [];

                        for (let r of rps) {
                            let per: Periodes = periodes[r];
                            let dh = per.dtHeureDebut.replace(":", "h").slice(0, 5);
                            let fh = per.dtHeureFin.replace(":", "h").slice(0, 5);

                            if (per.bLun) {
                                permission.days.push({
                                    day: 'lundi',
                                    heureDebut: [dh],
                                    heureFin: [fh]
                                });
                            }
                            if (per.bMar) {
                                permission.days.push({
                                    day: 'mardi',
                                    heureDebut: [dh],
                                    heureFin: [fh]
                                });
                            }
                            if (per.bMer) {
                                permission.days.push({
                                    day: 'mercredi',
                                    heureDebut: [dh],
                                    heureFin: [fh]
                                });
                            }
                            if (per.bJeu) {
                                permission.days.push({
                                    day: 'jeudi',
                                    heureDebut: [dh],
                                    heureFin: [fh]
                                });
                            }
                            if (per.bVen) {
                                permission.days.push({
                                    day: 'vendredi',
                                    heureDebut: [dh],
                                    heureFin: [fh]
                                });
                            }
                            if (per.bSam) {
                                permission.days.push({
                                    day: 'samedi',
                                    heureDebut: [dh],
                                    heureFin: [fh]
                                });
                            }
                            if (per.bDim) {
                                permission.days.push({
                                    day: 'dimanche',
                                    heureDebut: [dh],
                                    heureFin: [fh]
                                });
                            }
                        }
                        await this.repoPermission.create(permission);
                        let ok = true;
                    }
                }

                let emplacementsReglementations = await this.getEmplacementReglementation();
                let places = await this.getPlaces();

                for (let place in places) {
                    if (!place) {
                        continue;
                    }
                    let rules = emplacementsReglementations[place];
                    let parking: ParkingModel = <ParkingModel>{};
                    parking.permissions = [];
                    for (let rule of rules) {
                        let permission = await this.repoPermission.findOne({
                            code: rule
                        });
                        if (!permission) {
                            continue;
                        }
                        parking.permissions.push(permission._id);
                    }
                    if (parking.permissions.length > 0) {
                        parking.free = false;
                        parking.hourPrize = places[place].nTarifHoraire;
                        parking.position = {
                            type: "Point",
                            coordinates: [
                                places[place].nLongitude,
                                places[place].nLatitude
                            ]
                        };
                        await this.repoParking.create(parking);
                    }
                }

                let ok = true;
                resolve(true);
                console.log("Eh ben : " + j + ":" + i);
            });
        }

        public getPeriodes() {
            return new Promise<Periodes[]>(async (resolve, reject) => {
                let i = 0;
                let periodes: Periodes[] = [];
                csv.fromPath(__dirname +
                    "/../../sets/Periodes.csv")
                    .on("data", function (data) {
                        if (i) {
                            periodes[data[mtl.Periodes.nId]] = {
                                dtHeureDebut: data[mtl.Periodes.dtHeureDebut],
                                dtHeureFin: data[mtl.Periodes.dtHeureFin],
                                bLun: Boolean(Number(data[mtl.Periodes.bLun])),
                                bMar: Boolean(Number(data[mtl.Periodes.bMar])),
                                bMer: Boolean(Number(data[mtl.Periodes.bMer])),
                                bJeu: Boolean(Number(data[mtl.Periodes.bJeu])),
                                bVen: Boolean(Number(data[mtl.Periodes.bVen])),
                                bSam: Boolean(Number(data[mtl.Periodes.bSam])),
                                bDim: Boolean(Number(data[mtl.Periodes.bDim])),
                            };
                        }
                        ++i;
                    })
                    .on("end", function () {
                        resolve(periodes);
                        console.log("Eh ben : " + periodes.length);
                    });
            });
        }

        public getReglementationsPeriodes() {
            return new Promise<string[][]>(async (resolve, reject) => {
                let i = 0;
                let reglementations: string[][] = [];
                csv.fromPath(__dirname +
                    "/../../sets/ReglementationPeriode.csv")
                    .on("data", function (data) {
                        if (i) {
                            if (reglementations[data[mtl.ReglementationPeriodes.sCode]]) {
                                reglementations[data[mtl.ReglementationPeriodes.sCode]]
                                    .push(data[mtl.ReglementationPeriodes.noPeriode]);
                            } else {
                                reglementations[data[mtl.ReglementationPeriodes.sCode]] =
                                    [data[mtl.ReglementationPeriodes.noPeriode]];
                            }
                        }
                        ++i;
                    })
                    .on("end", function () {
                        resolve(reglementations);
                        console.log("Eh ben : " + reglementations.length);
                    });
            });
        }

        public getReglementations() {
            return new Promise<Reglementations[]>(async (resolve, reject) => {
                let i = 0;
                let reglementations: Reglementations[] = [];
                csv.fromPath(__dirname +
                    "/../../sets/Reglementations.csv")
                    .on("data", function (data) {
                        if (i) {
                            reglementations[data[mtl.Reglementations.Name]] = {
                                Type: data[mtl.Reglementations.Type],
                                DateDebut: data[mtl.Reglementations.DateDebut],
                                DateFin: data[mtl.Reglementations.DateFin],
                                maxHeures: data[mtl.Reglementations.maxHeures]
                            };
                        }
                        ++i;
                    })
                    .on("end", function () {
                        resolve(reglementations);
                        console.log("Eh ben : " + reglementations.length);
                    });
            });
        }

        public getEmplacementReglementation() {
            return new Promise<string[][]>(async (resolve, reject) => {
                let i = 0;
                let emplacements: string[][] = [];
                csv.fromPath(__dirname +
                    "/../../sets/EmplacementReglementation.csv")
                    .on("data", function (data) {
                        if (i) {
                            if (emplacements[data[mtl.EmplacementReglementation.sNoEmplacement]]) {
                                emplacements[data[mtl.EmplacementReglementation.sNoEmplacement]]
                                    .push(data[mtl.EmplacementReglementation.sCodeAutocollant]);
                            } else {
                                emplacements[data[mtl.EmplacementReglementation.sNoEmplacement]] =
                                    [data[mtl.EmplacementReglementation.sCodeAutocollant]];
                            }
                        }
                        ++i;
                    })
                    .on("end", function () {
                        resolve(emplacements);
                        console.log("Eh ben : " + emplacements.length);
                    });
            });
        }

        public getPlaces() {
            return new Promise<Places[]>(async (resolve, reject) => {
                let i = 0;
                let places: Places[] = [];
                csv.fromPath(__dirname +
                    "/../../sets/Places.csv")
                    .on("data", function (data) {
                        if (i) {
                            places[data[mtl.Places.sNoPlace]] = {
                                nLongitude: data[mtl.Places.nLongitude],
                                nLatitude: data[mtl.Places.nLatitude],
                                nPositionCentreLongitude: data[mtl.Places.nPositionCentreLongitude],
                                nPositionCentreLatitude: data[mtl.Places.nPositionCentreLatitude],
                                sStatut: data[mtl.Places.sStatut],
                                sGenre: data[mtl.Places.sGenre],
                                sType: data[mtl.Places.sType],
                                sAutreTete: data[mtl.Places.sAutreTete],
                                sNomRue: data[mtl.Places.sNomRue],
                                nSupVelo: data[mtl.Places.nSupVelo],
                                sTypeExploitation: data[mtl.Places.sTypeExploitation],
                                nTarifHoraire: data[mtl.Places.nTarifHoraire],
                                sLocalisation: data[mtl.Places.sLocalisation],
                                nTarifMax: data[mtl.Places.nTarifMax],
                            };
                        }
                        ++i;
                    })
                    .on("end", function () {
                        resolve(places);
                        console.log("Eh ben : " + places.length);
                    });
            });
        }
    }
}
export = Controller;
