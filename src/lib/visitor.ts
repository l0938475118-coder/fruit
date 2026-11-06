"use client";

import { useSyncExternalStore } from "react";

// 訪客稱呼存在使用者自己的瀏覽器（localStorage），不會送到伺服器；下次進站會直接顯示
const KEY = "formosa-visitor-name";
const EVENT = "visitor-name-change";
export const NAME_MAX = 20;

/**
 * null  → 還沒問過（第一次來）
 * ""    → 問過但選擇略過
 * 其他  → 使用者的稱呼
 */

// 存不進 localStorage 時（無痕模式、封鎖儲存），至少在這次瀏覽中記得
let memory: string | null = null;

function read(): string | null {
  if (memory !== null) return memory;
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function saveVisitorName(name: string) {
  const clean = name.trim().slice(0, NAME_MAX);
  memory = clean;
  try {
    localStorage.setItem(KEY, clean);
  } catch {
    // 存不了也沒關係，這次瀏覽仍會顯示
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  const onStorage = (e: StorageEvent) => {
    // 其他分頁改名時同步
    if (e.key === KEY) {
      memory = null;
      cb();
    }
  };
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useVisitorName() {
  return useSyncExternalStore(
    subscribe,
    read,
    () => "", // 伺服器端：不知道是誰，先不顯示也不跳視窗
  );
}

export const OPEN_WELCOME_EVENT = "open-welcome";
export function openWelcome() {
  window.dispatchEvent(new Event(OPEN_WELCOME_EVENT));
}
