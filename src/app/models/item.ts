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
    result?: ItemListing;
    stackSize: number;
    maxStackSize: number;
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