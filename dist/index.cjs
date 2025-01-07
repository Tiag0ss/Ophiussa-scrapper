'use strict';

const cheerio = require('cheerio');
const axios = require('axios');

function _interopDefaultCompat (e) { return e && typeof e === 'object' && 'default' in e ? e.default : e; }

const axios__default = /*#__PURE__*/_interopDefaultCompat(axios);

const METACRITC_URL = "https://www.metacritic.com";
const HOWLONGTOBEAT_URL = "https://howlongtobeat.com/";

function request(props) {
  return new Promise((resolve, reject) => {
    axios__default(props).then((response) => {
      resolve(response.data);
    }).catch((error) => {
      if (error.response) {
        reject(error.response.data);
      } else if (error.request) {
        reject("No response received");
      } else {
        reject("Error occurred while making the request");
      }
    });
  });
}

async function GetGameByIdMetaCritic(options) {
  const requestOpt = {
    url: `${METACRITC_URL}/game/${encodeURIComponent(options.id ?? "")}/`,
    method: "get"
  };
  const res = await request(requestOpt);
  const $ = cheerio.load(res);
  let result = $(".c-pageProductGame").map(
    (_index, element) => new Promise(
      async (resolve, _reject) => {
        const $element = $(element);
        let name = $element.find(".c-productHero_title").text() || null;
        let releaseDate = $element.find(".g-text-xsmall .u-text-uppercase").text() || null;
        let metascore = $element.find(".c-productHero_scoreInfo .c-siteReviewScore_background-critic_medium .c-siteReviewScore").text() || null;
        let userscore = $element.find(".c-productHero_scoreInfo .c-siteReviewScore_background-user .c-siteReviewScore").text() || null;
        let platforms = $element.find(".c-gamePlatformsSection_list").children();
        let platInfo = [];
        platforms.map(
          (_index2, element2) => {
            const $element2 = $(element2);
            let platformLink = $element2.attr("href");
            let platform = getParameterFromURL(`${METACRITC_URL}${platformLink}`, "platform");
            if (platform === null) {
              platformLink = $element2.attr("to");
              platform = getParameterFromURL(`${METACRITC_URL}${platformLink}`, "platform");
            }
            let score = $element2.find(".c-siteReviewScore").text();
            platInfo.push({
              platform,
              rating: score === "tbd" ? "0" : score
            });
          }
        );
        let critreviews = [];
        let criticReviews = $element.find(".c-pageProductGame_row .c-reviewsSection_criticReviews .c-reviewsSection_carousel").children();
        criticReviews.map(
          (_index2, element2) => {
            const $element2 = $(element2);
            let reviewName = $element2.find(".c-siteReviewHeader_publicationName").text().trim();
            let externalLink = $element2.find(".c-siteReview_externalLink").attr("href");
            let quote = $element2.find(".c-siteReview_quote").text().trim();
            let platform = $element2.find(".c-siteReview_platform").text().trim();
            let score = $element2.find(".c-siteReviewScore").text().trim();
            critreviews.push({
              reviewName,
              quote,
              platform,
              externalLink,
              score
            });
          }
        );
        let userreviews = [];
        let userReviews = $element.find(".c-pageProductGame_row .c-reviewsSection_userReviews div .c-reviewsSection_carousel").children();
        userReviews.map(
          (_index2, element2) => {
            const $element2 = $(element2);
            let reviewName = $element2.find(".c-siteReviewHeader_username").text().trim();
            let quote = $element2.find(".c-siteReview_quote").text().trim();
            let platform = $element2.find(".c-siteReview_platform").text().trim();
            let score = $element2.find(".c-siteReviewScore").text().trim();
            userreviews.push({
              reviewName,
              quote,
              platform,
              score
            });
          }
        );
        let description = $element.find(".c-productionDetailsGame_description").text() || null;
        resolve({
          id: options.id,
          title: name,
          description,
          releaseDate: new Date(releaseDate),
          metascore,
          userscore,
          platforms: platInfo,
          criticreviews: critreviews,
          userreviews
        });
      }
    )
  ).get();
  return Promise.all(result);
}
async function GetGameMetaCritic(options) {
  const result = await SearchGameMetaCritic({
    sortBy: "relevance",
    searchString: options.gameName
  });
  let game = result.find((z) => z.title == options.gameName);
  if (game) {
    let result2 = await GetGameByIdMetaCritic({ id: game.id ?? "" });
    return result2[0];
  } else
    return {};
}
async function SearchGameMetaCritic(options) {
  let sort = "";
  switch (options.sortBy) {
    case "relevance":
      break;
    case "popularity":
      sort = "&sortBy=REVIEW_COUNT";
      break;
    case "metascore":
      sort = "&sortBy=META_SCORE";
      break;
    case "newest-release":
      sort = "&sortBy=RELEASE_YEAR";
      break;
  }
  const requestOpt = {
    url: `${METACRITC_URL}/search/${encodeURIComponent(options.searchString)}/?page=1&category=13${sort}`,
    method: "get"
  };
  const res = await request(requestOpt);
  const $ = cheerio.load(res);
  let result = $(
    ".g-grid-container .u-grid-columns"
  ).map(
    (_index, element) => new Promise(
      async (resolve, _reject) => {
        const $element = $(element);
        const id = $element.find("a").attr("href") || null;
        const poster = $element.find("a .c-pageSiteSearch-results-item-image picture img").attr("src") || null;
        const title = ($element.find("a .u-text-overflow-ellipsis p").text() || null)?.trim();
        const score = $element.find("a div .c-siteReviewScore_background").text() || null;
        resolve({
          id: extractGameName(id),
          title,
          poster,
          score: score === "tbd" ? "0" : score
        });
      }
    )
  ).get();
  return Promise.all(result);
}
async function GetGameByIdHowLongToBeat(options) {
  const requestOpt = {
    url: `${HOWLONGTOBEAT_URL}/game/${options.id ?? ""}`,
    method: "get",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    }
  };
  const res = await request(requestOpt);
  const $ = cheerio.load(res);
  let result = $(
    ".Layout_main__RMpyO"
  ).map(
    (_index, element) => new Promise(
      async (resolve, _reject) => {
        const $element = $(element);
        const name = $element.find(".GameHeader_profile_header__q_PID").text().trim() || null;
        let main = [];
        let times = $element.find(".content_75_static .GameStats_game_times__KHrRY ul").children();
        times.map(
          (_index2, element2) => {
            const $element2 = $(element2);
            let type = $element2.find("h4").text().trim();
            let time = $element2.find("h5").text().trim();
            main.push({
              time,
              type
            });
          }
        );
        let addc = [];
        let additionalcontent = $element.find(`table:contains("Additional Content") tbody`).children();
        additionalcontent.map(
          (_index2, element2) => {
            const $element2 = $(element2);
            let id = extractGameName($element2.find("td a").attr("href"));
            let name2 = $element2.find("td a").text().trim();
            let polled = $element2.find("td:eq(1)").text().trim();
            let rated = $element2.find("td:eq(2)").text().trim();
            let main2 = $element2.find("td:eq(3)").text().trim();
            let mainplus = $element2.find("td:eq(4)").text().trim();
            let completist = $element2.find("td:eq(5)").text().trim();
            let all = $element2.find("td:eq(6)").text().trim();
            let ret = {
              id,
              name: name2,
              polled,
              rated,
              main: main2,
              mainplus,
              completist,
              all
            };
            addc.push(ret);
          }
        );
        let sp = [];
        let spc = $element.find(`table:contains("Single-Player") tbody`).children();
        spc.map(
          (_index2, element2) => {
            const $element2 = $(element2);
            let name2 = $element2.find("td:eq(0)").text().trim();
            let polled = $element2.find("td:eq(1)").text().trim();
            let average = $element2.find("td:eq(2)").text().trim();
            let median = $element2.find("td:eq(3)").text().trim();
            let rushed = $element2.find("td:eq(4)").text().trim();
            let leisure = $element2.find("td:eq(5)").text().trim();
            let ret = {
              name: name2,
              polled,
              average,
              median,
              rushed,
              leisure
            };
            sp.push(ret);
          }
        );
        let speedrun = [];
        let speedrunc = $element.find(`table:contains("Speedruns") tbody`).children();
        speedrunc.map(
          (_index2, element2) => {
            const $element2 = $(element2);
            let name2 = $element2.find("td:eq(0)").text().trim();
            let polled = $element2.find("td:eq(1)").text().trim();
            let average = $element2.find("td:eq(2)").text().trim();
            let median = $element2.find("td:eq(3)").text().trim();
            let fastest = $element2.find("td:eq(4)").text().trim();
            let slowest = $element2.find("td:eq(5)").text().trim();
            let ret = {
              name: name2,
              polled,
              average,
              median,
              fastest,
              slowest
            };
            speedrun.push(ret);
          }
        );
        let multiplayer = [];
        let multiplayerc = $element.find(`table:contains("Multi-Player") tbody`).children();
        multiplayerc.map(
          (_index2, element2) => {
            const $element2 = $(element2);
            let name2 = $element2.find("td:eq(0)").text().trim();
            let polled = $element2.find("td:eq(1)").text().trim();
            let average = $element2.find("td:eq(2)").text().trim();
            let median = $element2.find("td:eq(3)").text().trim();
            let least = $element2.find("td:eq(4)").text().trim();
            let most = $element2.find("td:eq(5)").text().trim();
            let ret = {
              name: name2,
              polled,
              average,
              median,
              least,
              most
            };
            multiplayer.push(ret);
          }
        );
        let platformc = $element.find(`table:contains("Platform") tbody`).children();
        platformc.map(
          (_index2, element2) => {
            const $element2 = $(element2);
            $element2.find("td:eq(0)").text().trim();
            $element2.find("td:eq(1)").text().trim();
            $element2.find("td:eq(2)").text().trim();
            $element2.find("td:eq(3)").text().trim();
            $element2.find("td:eq(4)").text().trim();
            $element2.find("td:eq(5)").text().trim();
            $element2.find("td:eq(6)").text().trim();
          }
        );
        resolve({
          id: options.id,
          name,
          main,
          additionalcontent: addc,
          singleplyer: sp,
          speedrun,
          multiplayer
        });
      }
    )
  ).get();
  return Promise.all(result);
}
const extractGameName = (path) => {
  const trimmedPath = path.replace(/^\/|\/$/g, "");
  const parts = trimmedPath.split("/");
  const gameName = parts[parts.length - 1];
  return gameName;
};
const getParameterFromURL = (url, parameter) => {
  const urlObj = new URL(url);
  const params = new URLSearchParams(urlObj.search);
  return params.get(parameter);
};

exports.GetGameByIdHowLongToBeat = GetGameByIdHowLongToBeat;
exports.GetGameByIdMetaCritic = GetGameByIdMetaCritic;
exports.GetGameMetaCritic = GetGameMetaCritic;
exports.SearchGameMetaCritic = SearchGameMetaCritic;
