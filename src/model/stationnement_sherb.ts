export interface StationnementSherb {
    name: string;
    type: string;
    features: StationnementSherbFeature[];
}

export interface StationnementSherbFeature {
    type: string;
    geometry: {
        type: string;
        coordinates: number[];
    };
    properties: {
        NOM: string;
        x: number;
        y: number;
        ID: string;
        Type: string;
        No: string;
        Duree: string;
        Tarif: string;
    };
}
