import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Greeting from "@/components/Greeting";
import CatchGame from "@/components/CatchGame";

export const metadata: Metadata = {
  title: "接水果遊戲｜福爾摩沙果園",
  description: "20 秒內接住好水果、避開爛水果和垃圾，達到 100 分就能拿到抽獎券。",
};

export default function GamePage() {
  return (
    <div className="grain relative overflow-x-clip">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[700px]">
        <div className="absolute left-[-20%] top-[-10%] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,#ffb34766,transparent_65%)]" />
        <div className="absolute right-[-20%] top-[20%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,#e05a7a33,transparent_65%)]" />
      </div>

      <Header />

      <main className="relative mx-auto max-w-7xl px-4 sm:px-8">
        <section className="grid gap-8 pb-10 pt-12 sm:pt-16 lg:grid-cols-12 lg:pb-12 lg:pt-20">
          <div className="lg:col-span-7">
            <Greeting message="來挑戰接水果吧！" />
            <p className="mb-8 flex items-center gap-4 text-[11px] uppercase tracking-[0.3em] text-muted">
              <span className="h-px w-10 bg-ink/40" />
              Mini game · 小遊戲
            </p>
            <h1 className="font-serif text-[clamp(2.4rem,7vw,4.5rem)] font-black leading-[1.1] tracking-tight">
              接水果，
              <br />
              <span className="whitespace-nowrap">換抽獎券。</span>
            </h1>
          </div>
          <p className="self-end text-[15px] leading-loose text-muted lg:col-span-5">
            20 秒內接住從天而降的好水果，小心別接到爛水果和垃圾。
            一局達到 100 分就能拿到一張抽獎券，每人每天可以玩 3 次。
          </p>
        </section>

        <div className="mx-auto max-w-3xl">
          <CatchGame />
        </div>
      </main>

      <Footer />
    </div>
  );
}
