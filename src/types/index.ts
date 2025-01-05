export type SearchResult = {
    id?: string; 
    title?: string;
    description?:string;
    poster?: string;
    score?: string;  
    platforms? :PlatformInfo[]
    criticreviews? :Review[]
    userreviews? :Review[]
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