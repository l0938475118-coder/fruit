"use client";

import { useSyncExternalStore } from "react";

// 抽獎券數量與每日遊戲次數，存在使用者瀏覽器（localStorage）
const TICKETS_KEY = "formosa-tickets";
const PLAYS_KEY = "formosa-game-plays";
const EVENT = "game-store-change";
export const MAX_PLAYS_PER_DAY = 3;

// 存不進 localStorage 時（無痕、封鎖儲存），退回只記在這次瀏覽
const memory: Record<string, string> = {};

function get(key: string): string | null {
  try {
    const v = localStorage.getItem(key);
    if (v !== null) return v;
  } catch {}
  return memory[key] ?? null;
}

function set(key: string, value: string) {
  memory[key] = value;
  try {
    localStorage.setItem(key, value);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

/** 台灣時間的今天，例如 2026-11-06 */
function today() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Taipei" });
}

// ── 抽獎券 ──
export function getTickets(): number {
  const n = Number(get(TICKETS_KEY));
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

export function addTicket() {
  set(TICKETS_KEY, String(getTickets() + 1));
}

/** 用掉一張抽獎券，沒有券時回傳 false */
export function spendTicket(): boolean {
  const n = getTickets();
  if (n <= 0) return false;
  set(TICKETS_KEY, String(n - 1));
  return true;
}

// ── 每日遊戲次數 ──
function playsToday(): number {
  try {
    const v = JSON.parse(get(PLAYS_KEY) ?? "null") as { date: string; count: number } | null;
    return v && v.date === today() ? v.count : 0;
  } catch {
    return 0;
  }
}

export function getPlaysLeft(): number {
  return Math.max(0, MAX_PLAYS_PER_DAY - playsToday());
}

/** 開始一局時扣一次；今天次數用完回傳 false */
export function startPlay(): boolean {
  const used = playsToday();
  if (used >= MAX_PLAYS_PER_DAY) return false;
  set(PLAYS_KEY, JSON.stringify({ date: today(), count: used + 1 }));
  return true;
}

// ── React hooks ──
function subscribe(cb: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === TICKETS_KEY || e.key === PLAYS_KEY) cb();
  };
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", onStorage); // 其他分頁同步
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", onStorage);
  };
}

/** 伺服器端不知道數量，回傳 null */
export function useTickets() {
  return useSyncExternalStore(subscribe, getTickets, () => null);
}

export function usePlaysLeft() {
  return useSyncExternalStore(subscribe, getPlaysLeft, () => null);
}

// 讓其他元件（例如遊戲結束畫面）打開抽獎視窗
export const OPEN_LUCKY_DRAW_EVENT = "open-lucky-draw";
export function openLuckyDraw() {
  window.dispatchEvent(new Event(OPEN_LUCKY_DRAW_EVENT));
}
