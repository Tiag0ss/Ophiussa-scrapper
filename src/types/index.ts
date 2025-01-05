export type SearchResult = {
    id?: string; 
    title?: string;
    poster?: string;
    score?: string;  
    platforms? :PlatformInfo[]
}

export type PlatformInfo = {
    id?: string; 
    score?: string; 
}