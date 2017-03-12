
export interface StationnementMtl {
    name: string;
    type: string;
    features: StationnementMtlFeature[];
}

export interface StationnementMtlFeature {
    type: string;
    geometry: {
        type: string;
        coordinates: number[];
    };
    properties: {
        POTEAU_ID_POT: number;
        PANNEAU_ID_PAN: number;
        PANNEAU_ID_RPA: number;
        DESCRIPTION_RPA: string;
        CODE_RPA: string;
        FLECHE_PAN: string;
        TOPONYME_PAN: string;
        POTEAU_VERSION_POT: number;
        DATE_CONCEPTION_POT: string;
        PAS_SUR_RUE: boolean;
        DESCRIPTION_REP: string;
        DESCRIPTION_RTP: string;
        X_EPSG32188: number;
        Y_EPSG32188: number;
        Longitude: number;
        Latitude: number;
        DESCRIPTION_CAT: string;
        NOM_ARR: number;
    };
}

export interface Signalec {

    CODE_RPA: string;
    DESCRIPTION_RPA: string;
}

export enum Periodes {
    nId = 0,
    dtHeureDebut = 1,
    dtHeureFin = 2,
    bLun = 3,
    bMar = 4,
    bMer = 5,
    bJeu = 6,
    bVen = 7,
    bSam = 8,
    bDim = 9
}

export enum ReglementationPeriodes {
    sCode = 0,
    noPeriode = 1,
    sDescription = 2
}

export enum Reglementations {
    Name = 0,
    Type = 1,
    DateDebut = 2,
    DateFin = 3,
    maxHeures = 4
}

export enum EmplacementReglementation {
    sNoEmplacement = 0,
    sCodeAutocollant = 1
}

export enum Places {
    sNoPlace = 0,
    nLongitude = 1,
    nLatitude = 2,
    nPositionCentreLongitude = 3,
    nPositionCentreLatitude = 4,
    sStatut = 5,
    sGenre = 6,
    sType = 7,
    sAutreTete = 8,
    sNomRue = 9,
    nSupVelo = 10,
    sTypeExploitation = 11,
    nTarifHoraire = 12,
    sLocalisation = 13,
    nTarifMax = 14
}
