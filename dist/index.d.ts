type sortBy = "relevance" | "popularity" | "metascore" | "newest-release";
/**
 *  Interface GamesParamsOptions
 *  @interface
 *  @classdesc URL parameter options
 */
interface GamesSearchParamsOptions {
    /**
     * @member {string} searchString
     */
    searchString: string;
    /**
     * @member {sortBy} sortBy
     */
    sortBy: sortBy;
}
/**
 *  Interface GamesParamsOptions
 *  @interface
 *  @classdesc URL parameter options
 */
interface GameParamsOptions {
    /**
     * @member {string} gameName
     */
    gameName: string;
}
/**
 *  Interface GamesParamsOptions
 *  @interface
 *  @classdesc URL parameter options
 */
interface GameByIdParamsOptions {
    /**
     * @member {string} id
     */
    id: string;
}

type SearchResult = {
    id?: string;
    title?: string;
    description?: string;
    poster?: string;
    score?: string;
    platforms?: PlatformInfo[];
    criticreviews?: Review[];
    userreviews?: Review[];
};
type PlatformInfo = {
    id?: string;
    score?: string;
};
type Review = {
    reviewName?: string;
    externalLink?: string;
    quote?: string;
    platform?: string;
    score?: string;
};

declare function GetGameByIdMetaCritic(options: GameByIdParamsOptions): Promise<unknown[]>;
declare function GetGameMetaCritic(options: GameParamsOptions): Promise<unknown>;
declare function SearchGameMetaCritic(options: GamesSearchParamsOptions): Promise<SearchResult[]>;
declare function GetGameByIdHowLongToBeat(options: GameByIdParamsOptions): Promise<SearchResult[]>;

export { GetGameByIdHowLongToBeat, GetGameByIdMetaCritic, GetGameMetaCritic, SearchGameMetaCritic };
