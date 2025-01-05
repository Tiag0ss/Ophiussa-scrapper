
import { load } from "cheerio";
import { GamesSearchParamsOptions, GameParamsOptions } from "./interfaces";
import { METACRITC_URL } from "./urls";
import request from "./request";
import { PlatformInfo, SearchResult, Review } from "./types";


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

                        let platInfo: PlatformInfo[] = [];

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

                        let critreviews: Review[] = [];

                        let criticReviews = $element.find(".c-pageProductGame_row .c-reviewsSection_criticReviews .c-reviewsSection_carousel").children();
                        criticReviews.map(
                            (_index2: number, element2: any) => {
                                const $element2 = $(element2);

                                let reviewName = $element2.find(".c-siteReviewHeader_publicationName").text().trim();
                                let externalLink = $element2.find(".c-siteReview_externalLink").attr("href");
                                let quote = $element2.find(".c-siteReview_quote").text().trim();
                                let platform = $element2.find(".c-siteReview_platform").text().trim();
                                critreviews.push({
                                    reviewName: reviewName,
                                    quote: quote,
                                    platform: platform,
                                    externalLink: externalLink
                                } as Review)
                            }
                        );

                        let userreviews: Review[] = [];
                        let userReviews = $element.find(".c-pageProductGame_row .c-reviewsSection_userReviews div .c-reviewsSection_carousel").children();
                        userReviews.map(
                            (_index2: number, element2: any) => {
                                const $element2 = $(element2);

                                let reviewName = $element2.find(".c-siteReviewHeader_username").text().trim(); 
                                let quote = $element2.find(".c-siteReview_quote").text().trim();
                                let platform = $element2.find(".c-siteReview_platform").text().trim(); 
                                userreviews.push({
                                    reviewName: reviewName,
                                    quote: quote,
                                    platform: platform
                                } as Review)
                            }
                        );

                        let description = $element.find(".c-productionDetailsGame_description").text() || null;
                        console.log(description)
                        resolve({
                            id: game.id,
                            title: name,
                            description:description,
                            releaseDate: new Date(releaseDate as string),
                            metascore: metascore,
                            userscore: userscore,
                            platforms: platInfo,
                            criticreviews: critreviews,
                            userreviews: userreviews
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


async function test() {

    /*const result = await SearchGameMetaCritic({
        sortBy: "metascore",
        searchString: "Half-Life",
    });

    console.log(result)*/
    let result2 = await GetGameMetaCritic({ gameName: "Half-Life" });

    console.log(result2)
}

test()