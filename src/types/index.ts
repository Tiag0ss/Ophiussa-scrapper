export type SearchResult = {
    id?: string;
    title?: string;
    description?: string;
    poster?: string;
    score?: string;
    platforms?: PlatformInfo[]
    criticreviews?: Review[]
    userreviews?: Review[]
}

export type PlatformInfo = {
    id?: string;
    score?: string;
}


export type Review = {
    reviewName?: string;
    externalLink?: string;
    quote?: string;
    platform?: string;
    score?: string;
}


export type HLTBTimes = {
    type?: string;
    time?: string;
}

export type HLTBAdditionalContent = {
    id?: string;
    name?: string;
    polled?: string;
    rated?: string;
    main?: string;
    mainplus?: string;
    completist?: string;
    all?: string;
}

export type HLTBGameTimeTableSinglePlayer = { 
    name?: string;
    polled?: string;
    average?: string;
    median?: string;
    rushed?: string;
    leisure?: string; 
}

export type HLTBGameTimeTableSpeedrun = { 
    name?: string;
    polled?: string;
    average?: string;
    median?: string;
    fastest?: string;
    slowest?: string; 
}

export type HLTBGameTimeTableMultiplayer = { 
    name?: string;
    polled?: string;
    average?: string;
    median?: string;
    least?: string;
    most?: string; 
}
export type HLTBPlatformTimeTable = { 
    name?: string;
    polled?: string;
    main?: string;
    mainplus?: string;
    completist?: string;
    fastest?: string;
    slowest?: string; 
}