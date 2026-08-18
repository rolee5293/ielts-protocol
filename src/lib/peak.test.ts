/**
 * 巅峰层落点。数据取自 2026-08-18 云端真实存档，
 * 断言的是"上线当天哥哥停在哪一级"——逐级解锁一旦写错，
 * 补差会让人一口气连跳好几级，之后再无目标。
 */
import { describe, expect, it } from "vitest";
import { PEAKS, peakLevel, nextPeak } from "./game";
import { migrateXpRate } from "./storage";
import type { SaveState } from "@/types";

const helpers = { streak: 9, maxStreak: 9 };

function save(over: Partial<SaveState> = {}): SaveState {
  return {
    version: 1, xpRate: 2, createdAt: "2026-07-23", xp: 31510, wordCursor: 0,
    words: {}, daily: {}, badges: [], agents: { unlocked: [], current: "sage-01" },
    stats: {
      masteredCount: 0, quizzesTaken: 0, quizQuestions: 0, quizCorrect: 0,
      perfectQuizzes: 17, readingsDone: 0, readingsPerfect: 27,
      bestCombo: 10, wordsLearned: 0, perfectDays: 15,
    },
    ...over,
  };
}

describe("巅峰层", () => {
  it("哥哥当前落在巅峰 1", () => {
    expect(peakLevel(save(), helpers)).toBe(1);
  });

  it("XP 再高也不能跳过没达成的挑战", () => {
    // XP 直接给满巅峰 10 的门槛，等级仍应停在同一级
    expect(peakLevel(save({ xp: 999999 }), helpers)).toBe(1);
  });

  it("下一级会给出具体缺口，而不是只报一个 XP 数字", () => {
    const n = nextPeak(save(), helpers);
    expect(n).not.toBeNull();
    expect(n!.def.level).toBe(1 + 1);
    expect(n!.need).toBeGreaterThan(0);
    expect(n!.def.challenge).toBeTruthy();
  });

  it("巅峰 1 的门槛就是段位满级线，满级当天即可入巅峰", () => {
    expect(PEAKS[0].minXp).toBe(31200);
  });
});

/**
 * 哥哥这边费率没变，迁移必须是纯粹的空操作。
 * 一旦它动了分数，改的就是孩子屏幕上那个总分。
 */
describe("migrateXpRate 对 ielts 必须不改分", () => {
  it("总 XP 一分不动，只补 readingCorrect 与标记", () => {
    const before = save({ xp: 31510, xpRate: undefined });
    const after = migrateXpRate(before);
    expect(after.xp).toBe(31510);
    expect(after.xpRate).toBe(2);
  });
});
