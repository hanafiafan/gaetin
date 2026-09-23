import { describe, expect, it } from "vitest";
import { parseEnumParam, parseIntegerParam } from "@/lib/http/query";

const pagination = { min: 1, max: 100, fallback: 20 };

describe("parseIntegerParam", () => {
  it("accepts integers inside the permitted range", () => {
    expect(parseIntegerParam("42", pagination)).toBe(42);
  });

  it("clamps integers outside the permitted range", () => {
    expect(parseIntegerParam("0", pagination)).toBe(1);
    expect(parseIntegerParam("999", pagination)).toBe(100);
  });

  it("uses the fallback for malformed and unsafe values", () => {
    for (const value of [null, "", "abc", "1.5", "Infinity", "9007199254740992"]) {
      expect(parseIntegerParam(value, pagination)).toBe(20);
    }
  });

  it("allows zero when an offset permits it", () => {
    expect(parseIntegerParam("0", { min: 0, max: 500, fallback: 0 })).toBe(0);
  });
});

describe("parseEnumParam", () => {
  const statuses = ["ACTIVE", "INACTIVE", "UNKNOWN"] as const;

  it("accepts only an exact allowed value", () => {
    expect(parseEnumParam("ACTIVE", statuses)).toBe("ACTIVE");
    expect(parseEnumParam("active", statuses)).toBeUndefined();
    expect(parseEnumParam("BROKEN", statuses)).toBeUndefined();
    expect(parseEnumParam(null, statuses)).toBeUndefined();
  });
});
