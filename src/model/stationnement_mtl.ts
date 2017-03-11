
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
