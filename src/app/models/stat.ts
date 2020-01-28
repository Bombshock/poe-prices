export type Stat = {
    id: string;
    text: string;
    type: string;
}

export type StatGroup = {
    label: string;
    entries: Stat[];
}