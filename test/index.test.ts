import { describe, expect, it } from "vitest";
import { SearchGameMetaCritic,GetGameMetaCritic } from "../dist"; 

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