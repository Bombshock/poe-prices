export type Item = {
    explicitMods: string[];
    frameType: number;
    h: number;
    icon: string;
    id: string;
    identified: boolean;
    ilvl: number;
    implicitMods: string[];
    inventoryId: string;
    league: string;
    name: string;
    requirements: { displayMode: number, name: string, values: [string, number] }[];
    typeLine: string;
    verified: false;
    w: number;
    x: number;
    y: number;
    result?: ItemQueryResultMapped;
    descrText?: string;
    stackSize: number;
    maxStackSize: number;
    sockets?: {
        attr: string;
        group: number;
        sColour: 'R' | 'G' | 'B'
    }[];
    properties?: {
        displayMode: number;
        name: string;
        type: number;
        values: [string, number][]
    }[];
    category: any;
    priceInChaos?: number;
}

export type ItemListing = {
    item: Item;
    id: string;
    listing: {
        method: string;
        indexed: string;
        whisper: string;
        price: {
            type: string;
            amount: number;
            currency: string;
        },
        account: {
            name: string,
            lastCharacterName: string,
            online: null | {
                league: string,
                status: 'afk' | 'online'
            },
            language: string
        }
    }
}

export type ItemQueryResult = {
    id: string;
    result: string[];
    total: number;
}

export type ItemQueryResultMapped = {
    id: string;
    result: ItemListing[];
    total: number;
}

export type ItemModMap = { [key: string]: number };

export type StaticItemDataGroup = {
    label: string;
    entries: StaticItemDataEntry[]
}

export type StaticItemDataEntry = {
    type: string;
    text: string;

    disc?: string;
    name?: string;
    flags?: {
        unique: boolean
    }
}