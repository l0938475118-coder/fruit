"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  children?: ReactNode;
  /**
   * 視差強度。正數＝比捲動慢（像遠景），負數＝比捲動快（像近景）。
   * 建議範圍 -0.3 ~ 0.3。
   */
  speed?: number;
  /** 移動方向，預設上下 */
  axis?: "y" | "x";
  /** 放在外層：負責定位與尺寸，不會被移動 */
  className?: string;
  style?: React.CSSProperties;
};

/**
 * 滾動視差：量測外層位置，只移動內層，避免量測被自己的位移干擾。
 * - 只在元素出現在畫面中時計算
 * - 使用者系統設定「減少動態效果」時完全停用
 */
export default function Parallax({ children, speed = 0.2, axis = "y", className, style }: Props) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let visible = false;
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = o.getBoundingClientRect();
      // 元素中心距離畫面中心多遠
      const distance = rect.top + rect.height / 2 - window.innerHeight / 2;
      const move = -distance * speed;
      i.style.transform =
        axis === "y" ? `translate3d(0, ${move.toFixed(1)}px, 0)` : `translate3d(${move.toFixed(1)}px, 0, 0)`;
    };

    const onScroll = () => {
      if (visible && !frame) frame = requestAnimationFrame(update);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) onScroll();
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(o);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [speed, axis]);

  return (
    <div ref={outer} className={className} style={style}>
      <div ref={inner} className="h-full w-full will-change-transform">
        {children}
      </div>
    </div>
  );
}
