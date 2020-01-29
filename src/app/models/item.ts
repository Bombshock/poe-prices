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
    requirements: { displayMode: number, name: string, values: [string, number]}[];
    typeLine: string;
    verified: false;
    w: number;
    x: number;
    y: number;
    result?: ItemQueryResultMapped;
    stackSize: number;
    maxStackSize: number;
    sockets?: {
        attr: string;
        group: number;
        sColour: 'R' | 'G' | 'B'
    }[]
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

export type ItemModMap = { [ key: string ]: number };