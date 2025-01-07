<p align="center">
   Metacritic API is a provider of compilations on reviews of video games.
</p>

<p align="center">
  <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-blue.svg" />          
  <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-blue.svg" />
  <img src="https://img.shields.io/badge/Metacritic-API-blue.svg"/>
</p>

<p align="center">
 <a href="https://www.npmjs.com/package/ophiussa-scrapper/"><img src="https://nodei.co/npm/ophiussa-scrapper.png"></a>
</p>

# 📖 API Documentation

## GetGameByIdHowLongToBeat([options: GameByIdParamsOptions])
  
|  @interface          | @member  |     @type     |  @values                                                               |
|----------------------|----------|:-------------:|-----------------------------------------------------------------------:|
|GameByIdParamsOptions | id       |  string       |  ex:43894                                                          |


```js
const scrapper = require("ophiussa-scrapper")

let result = await scrapper.GetGameByIdHowLongToBeat({
    id : "43894"
})

console.log(result)
```

## GetGameByIdMetaCritic([options: GameByIdParamsOptions])
  
|  @interface          | @member  |     @type     |  @values                                                               |
|----------------------|----------|:-------------:|-----------------------------------------------------------------------:|
|GameByIdParamsOptions | id       |  string       |  ex:half-life                                                          |


```js
const scrapper = require("ophiussa-scrapper")

let result = await scrapper.GetGameByIdMetaCritic({
    id : "elden-ring-shadow-of-the-erdtree"
})

console.log(result)
```

## GetGameMetaCritic([options: GameParamsOptions])
  
|  @interface          | @member  |     @type     |  @values                                                               |
|----------------------|----------|:-------------:|-----------------------------------------------------------------------:|
|GameParamsOptions     | gameName |  string       |  ex:Elden Ring                                                         |


```js
const scrapper = require("ophiussa-scrapper")

let result = await scrapper.GetGameMetaCritic({
    gameName : "Elden Ring"
})

console.log(result)
```


## SearchGameMetaCritic([options: GamesSearchParamsOptions])
  
|  @interface          | @member  |     @type     |  @values                                                               |
|----------------------|----------|:-------------:|-----------------------------------------------------------------------:|
|GamesSearchParamsOptions | searchString | string |  ex:Elden Ring                                                         |
|                      | sortBy   |  string       |  relevance,popularity,metascore,newest-release"  |


```js
const scrapper = require("ophiussa-scrapper")

let result = await scrapper.SearchGameMetaCritic({
    searchString : "Elden Ring",
    sortBy: "relevance"
})

console.log(result)
```