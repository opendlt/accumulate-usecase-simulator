import { describe, it, expect } from "vitest";
import { SeededRandom } from "../seeded-random";

describe("SeededRandom", () => {
  it("produces deterministic output for the same seed", () => {
    const rng1 = new SeededRandom(42);
    const rng2 = new SeededRandom(42);
    for (let i = 0; i < 10; i++) {
      expect(rng1.next()).toBe(rng2.next());
    }
  });

  it("produces different output for different seeds", () => {
    const rng1 = new SeededRandom(42);
    const rng2 = new SeededRandom(123);
    const results1 = Array.from({ length: 5 }, () => rng1.next());
    const results2 = Array.from({ length: 5 }, () => rng2.next());
    expect(results1).not.toEqual(results2);
  });

  it("nextInt returns values within range", () => {
    const rng = new SeededRandom(42);
    for (let i = 0; i < 100; i++) {
      const val = rng.nextInt(5, 10);
      expect(val).toBeGreaterThanOrEqual(5);
      expect(val).toBeLessThanOrEqual(10);
    }
  });

  it("nextDelay returns values within range", () => {
    const rng = new SeededRandom(42);
    for (let i = 0; i < 50; i++) {
      const val = rng.nextDelay(3, 15);
      expect(val).toBeGreaterThanOrEqual(3);
      expect(val).toBeLessThanOrEqual(15);
    }
  });

  it("nextBool returns boolean values", () => {
    const rng = new SeededRandom(42);
    const results = Array.from({ length: 100 }, () => rng.nextBool());
    expect(results.some((v) => v === true)).toBe(true);
    expect(results.some((v) => v === false)).toBe(true);
  });

  it("shuffle returns array with same elements", () => {
    const rng = new SeededRandom(42);
    const arr = [1, 2, 3, 4, 5];
    const shuffled = rng.shuffle(arr);
    expect(shuffled).toHaveLength(5);
    expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it("shuffle is deterministic with same seed", () => {
    const rng1 = new SeededRandom(42);
    const rng2 = new SeededRandom(42);
    const arr = [1, 2, 3, 4, 5];
    expect(rng1.shuffle(arr)).toEqual(rng2.shuffle(arr));
  });
});
