
import { load } from "cheerio";
import { GamesSearchParamsOptions, GameParamsOptions, GameByIdParamsOptions, HLTBSearchParamsOptions } from "./interfaces";
import { METACRITC_URL, HOWLONGTOBEAT_URL } from "./urls";
import request from "./request";
import { PlatformInfo, SearchResult, Review, HLTBTimes, HLTBAdditionalContent, HLTBGameTimeTableSinglePlayer, HLTBGameTimeTableSpeedrun, HLTBGameTimeTableMultiplayer, HLTBPlatformTimeTable } from "./types";



export async function GetGameByIdMetaCritic(options: GameByIdParamsOptions) {
    const requestOpt = {
        url: `${METACRITC_URL}game/${encodeURIComponent(options.id ?? "")}/`,
        method: "get",
        headers: {
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        }
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
                            let score = $element2.find(".c-siteReviewScore").text().trim();

                            critreviews.push({
                                reviewName: reviewName,
                                quote: quote,
                                platform: platform,
                                externalLink: externalLink,
                                score: score
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
                            let score = $element2.find(".c-siteReviewScore").text().trim();

                            userreviews.push({
                                reviewName: reviewName,
                                quote: quote,
                                platform: platform,
                                score: score
                            } as Review)
                        }
                    );

                    let description = $element.find(".c-productionDetailsGame_description").text() || null;

                    resolve({
                        id: options.id,
                        title: name,
                        description: description,
                        releaseDate: new Date(releaseDate as string),
                        metascore: metascore,
                        userscore: userscore,
                        platforms: platInfo,
                        criticreviews: critreviews,
                        userreviews: userreviews
                    } as SearchResult);
                }
                )
        ).get();
    let ret = await Promise.all(result);;

    return ret[0]
}
export async function GetGameMetaCritic(options: GameParamsOptions) {
    const result = await SearchGameMetaCritic({
        sortBy: "relevance",
        searchString: options.gameName,
    });

    let game = result.find(z => z.title == options.gameName)

    if (game) {

        let result2 = await GetGameByIdMetaCritic({ id: game.id ?? "" });

        return result2

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
        url: `${METACRITC_URL}search/${encodeURIComponent(options.searchString.replaceAll('/', ' '))}/?page=1&category=13${sort}`,
        method: "get",
        headers: {
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        }
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
    ).get();

    return Promise.all(result as SearchResult[]);
}
/*
export async function SearchGameHowLongToBeat(options: HLTBSearchParamsOptions) {
    const requestOpt = {
        url: `${HOWLONGTOBEAT_URL}/?q=${encodeURIComponent(options.searchString)}`,
        method: "get",
        headers : {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36",
          }
    };
    
    console.log(requestOpt)

    const res = await request(requestOpt);
    const $ = load(res);
    
    //$('[xml\\:id="search-results-header"');
    console.log($.html())
    let result = $(
        ".content_100 .GameCard_inside_blur__cP8_l"
    ).map(
        (_index: number, element: any) =>
            new Promise(async (resolve, _reject) => {
                const $element = $(element);
                const id = $element.find("a").attr("href") || null;
                const cover = $element.find("img").attr("src") || null;
                const name = $element.find("h2").text().trim() || null;
                console.log(name);

                
                resolve({
                    id: extractGameName(id as string),
                    name:name,
                    cover:cover
                });
            }
            )
    ).get();

    return Promise.all(result as SearchResult[]);
}
*/


export async function GetGameByIdHowLongToBeat(options: GameByIdParamsOptions) {
    const requestOpt = {
        url: `${HOWLONGTOBEAT_URL}/game/${options.id ?? ""}`,
        method: "get",
        headers: {
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        }
    };

    const res = await request(requestOpt);
    const $ = load(res);


    let result = $(
        ".Layout_main__RMpyO"
    ).map(
        (_index: number, element: any) =>
            new Promise(async (resolve, _reject) => {
                const $element = $(element);

                const name = $element.find(".GameHeader_profile_header__q_PID").text().trim() || null;


                let main: HLTBTimes[] = [];
                let times = $element.find(".content_75_static .GameStats_game_times__KHrRY ul").children();
                times.map(
                    (_index2: number, element2: any) => {
                        const $element2 = $(element2);

                        let type = $element2.find("h4").text().trim();
                        let time = $element2.find("h5").text().trim();
                        main.push({
                            time: time,
                            type: type,
                        } as HLTBTimes)
                    }
                );

                let addc: HLTBAdditionalContent[] = [];

                let additionalcontent = $element.find(`table:contains("Additional Content") tbody`).children();

                additionalcontent.map(
                    (_index2: number, element2: any) => {
                        const $element2 = $(element2);

                        let id = extractGameName($element2.find("td a").attr("href") as string);
                        let name = $element2.find("td a").text().trim();
                        let polled = $element2.find("td:eq(1)").text().trim();
                        let rated = $element2.find("td:eq(2)").text().trim();
                        let main = $element2.find("td:eq(3)").text().trim();
                        let mainplus = $element2.find("td:eq(4)").text().trim();
                        let completist = $element2.find("td:eq(5)").text().trim();
                        let all = $element2.find("td:eq(6)").text().trim();


                        let ret = {
                            id: id,
                            name: name,
                            polled: polled,
                            rated: rated,
                            main: main,
                            mainplus: mainplus,
                            completist: completist,
                            all: all
                        }
                        addc.push(ret as HLTBAdditionalContent)
                    }
                );


                let sp: HLTBGameTimeTableSinglePlayer[] = [];
                let spc = $element.find(`table:contains("Single-Player") tbody`).children();

                spc.map(
                    (_index2: number, element2: any) => {
                        const $element2 = $(element2);

                        let name = $element2.find("td:eq(0)").text().trim();
                        let polled = $element2.find("td:eq(1)").text().trim();
                        let average = $element2.find("td:eq(2)").text().trim();
                        let median = $element2.find("td:eq(3)").text().trim();
                        let rushed = $element2.find("td:eq(4)").text().trim();
                        let leisure = $element2.find("td:eq(5)").text().trim();


                        let ret = {
                            name: name,
                            polled: polled,
                            average: average,
                            median: median,
                            rushed: rushed,
                            leisure: leisure
                        }

                        sp.push(ret as HLTBGameTimeTableSinglePlayer)
                    }
                );


                let speedrun: HLTBGameTimeTableSpeedrun[] = [];
                let speedrunc = $element.find(`table:contains("Speedruns") tbody`).children();

                speedrunc.map(
                    (_index2: number, element2: any) => {
                        const $element2 = $(element2);

                        let name = $element2.find("td:eq(0)").text().trim();
                        let polled = $element2.find("td:eq(1)").text().trim();
                        let average = $element2.find("td:eq(2)").text().trim();
                        let median = $element2.find("td:eq(3)").text().trim();
                        let fastest = $element2.find("td:eq(4)").text().trim();
                        let slowest = $element2.find("td:eq(5)").text().trim();


                        let ret = {
                            name: name,
                            polled: polled,
                            average: average,
                            median: median,
                            fastest: fastest,
                            slowest: slowest
                        }
                        speedrun.push(ret as HLTBGameTimeTableSpeedrun)
                    }
                );

                let multiplayer: HLTBGameTimeTableMultiplayer[] = [];
                let multiplayerc = $element.find(`table:contains("Multi-Player") tbody`).children();

                multiplayerc.map(
                    (_index2: number, element2: any) => {
                        const $element2 = $(element2);

                        let name = $element2.find("td:eq(0)").text().trim();
                        let polled = $element2.find("td:eq(1)").text().trim();
                        let average = $element2.find("td:eq(2)").text().trim();
                        let median = $element2.find("td:eq(3)").text().trim();
                        let least = $element2.find("td:eq(4)").text().trim();
                        let most = $element2.find("td:eq(5)").text().trim();


                        let ret = {
                            name: name,
                            polled: polled,
                            average: average,
                            median: median,
                            least: least,
                            most: most
                        }

                        multiplayer.push(ret as HLTBGameTimeTableMultiplayer)
                    }
                );


                let platform: HLTBPlatformTimeTable[] = [];
                let platformc = $element.find(`table:contains("Platform") tbody`).children();

                platformc.map(
                    (_index2: number, element2: any) => {
                        const $element2 = $(element2);

                        let name = $element2.find("td:eq(0)").text().trim();
                        let polled = $element2.find("td:eq(1)").text().trim();
                        let main = $element2.find("td:eq(2)").text().trim();
                        let mainplus = $element2.find("td:eq(3)").text().trim();
                        let completist = $element2.find("td:eq(4)").text().trim();
                        let fastest = $element2.find("td:eq(5)").text().trim();
                        let slowest = $element2.find("td:eq(6)").text().trim();


                        let ret = {
                            name: name,
                            polled: polled,
                            main: main,
                            mainplus: mainplus,
                            completist: completist,
                            fastest: fastest,
                            slowest: slowest
                        }

                        platform.push(ret as HLTBPlatformTimeTable)
                    }
                );

                resolve({
                    id: options.id,
                    name: name,
                    main: main,
                    additionalcontent: addc,
                    singleplayer: sp,
                    speedrun: speedrun,
                    multiplayer: multiplayer,
                    platform: platform
                });
            }
            )
    ).get();

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
    let result2 = await GetGameMetaCritic({ gameName: "Destiny 2" });
    
    console.log(result2)
     
    const result3 = await GetGameByIdMetaCritic({
        id : "half-life"
    });
    console.log(result3)
   // const result4 = await SearchGameHowLongToBeat({
   //      searchString : "half-life"
   //  });
   //  console.log(result4)
    const result5 = await GetGameByIdHowLongToBeat({
        id: "43894"
    })
    console.log(result5)
}

test()*/