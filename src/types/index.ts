type SearchResult = {
    id?: string; 
    title?: string;
    poster?: string;
    score?: string;  
    platforms? :PlatformInfo[]
}

type PlatformInfo = {
    id?: string; 
    score?: string; 
}