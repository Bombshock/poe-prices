export type StaticGroup = {
    id: StaticType;
    label: string;
    entries: StaticItem[]
}

export type StaticItem = {
    id: string;
    text: string;
    image: string;
}

export type StaticType = (
    'Currency' |
    'Fragments' |
    'Catalysts' |
    'Oils' |
    'Incubators' |
    'Scarabs' |
    'DelveResonators' |
    'DelveFossils' |
    'Vials' |
    'Nets' |
    'Leaguestones' |
    'Essences' |
    'Cards' |
    'MapsTier1' |
    'MapsTier2' |
    'MapsTier3' |
    'MapsTier4' |
    'MapsTier5' |
    'MapsTier6' |
    'MapsTier7' |
    'MapsTier8' |
    'MapsTier9' |
    'MapsTier10' |
    'MapsTier11' |
    'MapsTier12' |
    'MapsTier13' |
    'MapsTier14' |
    'MapsTier15' |
    'MapsTier16' |
    'MapsBlighted' |
    'Misc' |
    undefined
)
