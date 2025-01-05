import { describe, expect, it } from "vitest";
import { SearchGame } from "../dist";

describe("should", () => {
  it("[SEARCH GAME] be object and not empty", async () => {
    const result = await SearchGame({
      sortBy: "Relevance",
      platform: "pc",
      searchString: "Half-Life",
    });
    
    expect(typeof result).toBe("object");
    expect(result).not.toBeNull();
    expect(Object.keys(result).length).toBeGreaterThan(0);
  });
});
