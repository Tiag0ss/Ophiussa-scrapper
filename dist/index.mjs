import { load } from 'cheerio';
import axios from 'axios';

const METACRITC_URL = "https://www.metacritic.com";

function request(props) {
  return new Promise((resolve, reject) => {
    axios(props).then((response) => {
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

async function GetGameMetaCritic(options) {
  const result = await SearchGameMetaCritic({
    sortBy: "relevance",
    searchString: options.gameName
  });
  let game = result.find((z) => z.title == options.gameName);
  if (game) {
    const requestOpt = {
      url: `${METACRITC_URL}/game/${encodeURIComponent(game.id ?? "")}/`,
      method: "get"
    };
    const res = await request(requestOpt);
    const $ = load(res);
    let result2 = $(".c-pageProductGame").map(
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
            id: game.id,
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
    );
    return Promise.all(result2);
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
  const $ = load(res);
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
async function test() {
  let result2 = await GetGameMetaCritic({ gameName: "Half-Life" });
  console.log(result2);
}
test();

export { GetGameMetaCritic, SearchGameMetaCritic };
