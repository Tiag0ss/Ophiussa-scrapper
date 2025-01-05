type platform =
  | "ps5"
  | "ps4"
  | "xbox-series-x"
  | "xboxone"
  | "switch"
  | "pc"
  | "ios"
  | "stadia";

  
type sortBy = "relevance" | "popularity" | "metascore" | "newest-release";


/**
 *  Interface GamesParamsOptions
 *  @interface
 *  @classdesc URL parameter options
 */
export interface GamesSearchParamsOptions { 
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
export interface GameParamsOptions { 
    /**
     * @member {string} gameName
     */
    gameName: string;  
  }