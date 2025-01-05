
import { load } from "cheerio";
import { GamesSearchParamsOptions, GameParamsOptions } from "./interfaces";
import { METACRITC_URL } from "./urls";
import request from "./request";


export async function GetGameMetaCritic(options: GameParamsOptions) {
    const result = await SearchGameMetaCritic({
        sortBy: "relevance",
        searchString: options.gameName,
    });

    let game = result.find(z => z.title == options.gameName)
    if (game) {

        const requestOpt = {
            url: `${METACRITC_URL}/game/${encodeURIComponent(game.id ?? "")}/`,
            method: "get",
        };

        const res = await request(requestOpt);
        const $ = load(res);

        let result = $(".c-pageProductGame")
            .map(
                (_index: number, element: any) =>
                    new Promise(async (resolve, _reject) => {
                        const $element = $(element);

                        let name = $element.find(".c-productHero_title").text() || null;

                        let releaseDate = $element.find(".g-text-xsmall .u-text-uppercase").text() || null;

                        let metascore = $element.find(".c-productHero_scoreInfo .c-siteReviewScore_background-critic_medium .c-siteReviewScore").text() || null;

                        let userscore = $element.find(".c-productHero_scoreInfo .c-siteReviewScore_background-user .c-siteReviewScore").text() || null;

                        let platforms = $element.find(".c-gamePlatformsSection_list").children();

                        let platInfo: any[] = [];

                        platforms.map(
                            (_index2: number, element2: any) => {
                                const $element2 = $(element2);
                                let platformLink = $element2.attr("href")

                                let platform = getParameterFromURL(`${METACRITC_URL}${platformLink}` as string, "platform")
                                if (platform === null) {
                                    platformLink = $element2.attr("to")
                                    platform = getParameterFromURL(`${METACRITC_URL}${platformLink}` as string, "platform")
                                }

                                let score = $element2.find(".c-siteReviewScore").text()

                                platInfo.push({
                                    platform: platform,
                                    rating: score === "tbd" ? "0" : score
                                } as PlatformInfo);
                            }
                        );
                        console.log(platforms.length);

                        resolve({
                            id: game.id,
                            name: name,
                            releaseDate: new Date(releaseDate as string),
                            metascore: metascore,
                            userscore: userscore,
                            platforms: platInfo
                        } as SearchResult);
                    }
                    )
            )

        return Promise.all(result);
    } else
        return {} as SearchResult
}
export async function SearchGameMetaCritic(options: GamesSearchParamsOptions) {

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
                    id: extractGameName(id as string),
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

const extractGameName = (path: string): string => {
    // Remove leading and trailing slashes 
    const trimmedPath = path.replace(/^\/|\/$/g, '');
    // Split the path by '/' 
    const parts = trimmedPath.split('/');
    // The game name is the last part 
    const gameName = parts[parts.length - 1];
    return gameName;
};


const getParameterFromURL = (url: string, parameter: string): string | null => {
    // Create a URL object 
    const urlObj = new URL(url);
    // Use URLSearchParams to get the parameter value 
    const params = new URLSearchParams(urlObj.search);
    return params.get(parameter) as string;
};
/*
async function test() {

    const result = await SearchGameMetaCritic({
        sortBy: "metascore",
        searchString: "Half-Life",
    });

    console.log(result)
    let result = await GetGameMetaCritic({ gameName: "Half-Life" });

    console.log(result)
}

test()*/