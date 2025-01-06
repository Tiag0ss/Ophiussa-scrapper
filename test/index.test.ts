import { describe, expect, it } from "vitest";
import { SearchGameMetaCritic,GetGameMetaCritic } from "../dist"; 
import { GetGameByIdHowLongToBeat } from "../src";

describe("should", () => {
  it("[SEARCH GAME] be object and not empty", async () => {
    const result = await SearchGameMetaCritic({
      sortBy: "relevance", 
      searchString: "Half-Life",
    });
    
    expect(typeof result).toBe("object");
    expect(result).not.toBeNull();
    expect(Object.keys(result).length).toBeGreaterThan(0);
  });
});


describe("should", () => {
  it("[GET GAME] be object and not empty", async () => {
    const result = await GetGameMetaCritic({
      gameName: "Half-Life",
    });
    
    expect(typeof result).toBe("object");
    expect(result).not.toBeNull();
    expect(Object.keys(result as {}).length).toBeGreaterThan(0);
  });
});



describe("should", () => {
  it("[GET GAME HLTB] be object and not empty", async () => {
    const result = await GetGameByIdHowLongToBeat({
      id: "43894",
    });
    
    expect(typeof result).toBe("object");
    expect(result).not.toBeNull();
    expect(Object.keys(result as {}).length).toBeGreaterThan(0);
  });
});