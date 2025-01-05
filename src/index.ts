
import { load } from "cheerio";
import { GamesSearchParamsOptions, GameParamsOptions } from "./interfaces";
import { METACRITC_URL } from "./urls";
import request from "./request";


export async function GetGame(options: GameParamsOptions) {
    const result = await SearchGame({
        sortBy: "relevance",
        searchString: options.gameName,
    });

    let game = result.find(z => z.title == options.gameName)
    if (game) {
        return game
    } else
        return {} as SearchResult
}
export async function SearchGame(options: GamesSearchParamsOptions) {

    let sort: string = ""
    switch (options.sortBy) {
        case "relevance":
            //default
            break;
        case "popularity":
            sort = "&sortBy=REVIEW_COUNT"
            break;
        case "metascore":
            sort = "&sortBy=META_SCORE"
            break;
        case "newest-release":
            sort = "&sortBy=RELEASE_YEAR"
            break;
    }
    const requestOpt = {
        url: `${METACRITC_URL}/search/${encodeURIComponent(options.searchString)}/?page=1&category=13${sort}`,
        method: "get",
    };

    const res = await request(requestOpt);
    const $ = load(res);

    let result = $(
        ".g-grid-container .u-grid-columns"
    ).map(
        (_index: number, element: any) =>
            new Promise(async (resolve, _reject) => {
                const $element = $(element);
                const id = $element.find("a").attr("href") || null;
                const poster = $element.find("a .c-pageSiteSearch-results-item-image picture img").attr("src") || null;
                const title = ($element.find("a .u-text-overflow-ellipsis p").text() || null)?.trim();
                const score = $element.find("a div .c-siteReviewScore_background").text() || null;

                resolve({
                    id: id,
                    title: title,
                    poster: poster,
                    score: score === "tbd" ? "0" : score
                });
            }
            )
    )
        .get();

    return Promise.all(result as SearchResult[]);
}



async function test() {

    const result = await SearchGame({
        sortBy: "metascore",
        searchString: "Half-Life",
    });

    console.log(result)
 
    console.log(await GetGame({ gameName: "Half-Life" }))
}

test()