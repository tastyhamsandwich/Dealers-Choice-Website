import Link from "next/link";

export default async function HomePage() {

return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#111] to-[#222255] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Dealer&apos;s Choice <span className="text-[rgb(50,150,250)]">Poker</span> Online
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
            href="https://create.t3.gg/en/usage/first-steps"
            target="_blank"
          >
            <h3 className="text-2xl font-bold">Learn to Play →</h3>
            <div className="text-lg">
              New to poker? It&apos;s easier than you think. Just the basics - Everything you need to know to get betting and start winning.
            </div>
          </Link>
          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
            href="https://create.t3.gg/en/introduction"
            target="_blank"
          >
            <h3 className="text-2xl font-bold">Game Designer →</h3>
            <div className="text-lg">
              Create your own poker game styles, and deal whatever suits you when it&apos;s your deal. Boundless possibilities, limited only by your imagination.
            </div>
          </Link>
        </div>
        <div className="items-center justify-center border-none rounded-lg">
          <button className="bg-white drop-shadow-lg text-slate-800 align-middle px-4 py-4 rounded-lg text-xl font-bold hover:bg-slate-200 hover:shadow-2xl hover:shadow-black hover:text-black active:shadow-slate-500 active:text-gray-700 active:shadow-m active:bg-slate-400">Log In</button>
        </div>
      </div>
    </main>
  );
}

