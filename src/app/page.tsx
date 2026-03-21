import Link from "next/link";
import SceneWrapper from "@/components/three/SceneWrapper";
import ScrollAnimations from "@/components/ui/ScrollAnimations";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      {/* 3D Background */}
      <SceneWrapper />

      {/* HTML Content (scrolls over 3D) */}
      <ScrollAnimations>
        <div className="relative z-10">
          {/* Hero Section */}
          <section className="min-h-screen flex flex-col items-center justify-center px-6 py-24 text-center">
            <h1
              data-anim="hero-title"
              className="font-[family-name:var(--font-space-grotesk)] text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
            >
              <span className="neon-text">MAIN CHARACTER</span>
              <br />
              <span className="bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan bg-clip-text text-transparent">
                ENERGY
              </span>
            </h1>
            <p
              data-anim="hero-subtitle"
              className="text-text-secondary text-lg md:text-xl max-w-2xl mb-10"
            >
              Drop your handle. Get your anime intro, fake trailer, roast video,
              and meme pack. AI thinks you&apos;re the main character.
            </p>
            <Link
              href="/create"
              data-anim="hero-cta"
              className="neon-button text-lg animate-neon-pulse hover-scale"
            >
              Enter Your Handle
            </Link>
          </section>

          {/* Feature Cards */}
          <section
            data-anim="features-section"
            className="px-6 py-20 max-w-6xl mx-auto w-full"
          >
            <h2
              data-anim="section-heading"
              className="font-[family-name:var(--font-space-grotesk)] text-3xl md:text-4xl font-bold text-center mb-12"
            >
              Pick Your Vibe
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Anime Intro",
                  desc: "Your origin story, anime style. Complete with a dramatic voiceover and animated portrait.",
                  icon: "⚔️",
                  color: "neon-purple",
                },
                {
                  title: "Fake Trailer",
                  desc: "You're the main character. Pick your genre and get a cinematic movie trailer.",
                  icon: "🎬",
                  color: "neon-cyan",
                },
                {
                  title: "Roast Video",
                  desc: "AI doesn't hold back. Get a savage (but fun) roast of your entire profile.",
                  icon: "🔥",
                  color: "neon-orange",
                },
                {
                  title: "Meme Pack",
                  desc: "Your life in 4 memes. Personalized, shareable, and actually funny.",
                  icon: "😂",
                  color: "neon-pink",
                },
              ].map((f) => (
                <div
                  key={f.title}
                  data-anim="feature-card"
                  className="glass-card p-6 text-center hover-scale"
                >
                  <div className="text-5xl mb-4">{f.icon}</div>
                  <h3
                    className={`font-[family-name:var(--font-space-grotesk)] text-xl font-bold mb-2 text-${f.color}`}
                  >
                    {f.title}
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* How It Works */}
          <section
            data-anim="steps-section"
            className="px-6 py-20 max-w-4xl mx-auto w-full text-center"
          >
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl md:text-4xl font-bold mb-16">
              How It Works
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-12">
              {[
                {
                  step: "1",
                  title: "Drop your @ handle",
                  desc: "Twitter or Instagram — we'll scrape your public profile",
                  icon: "📱",
                },
                {
                  step: "2",
                  title: "AI does its thing",
                  desc: "Claude writes your story, Magic Hour brings it to life",
                  icon: "✨",
                },
                {
                  step: "3",
                  title: "Share your results",
                  desc: "One-click share to Twitter, Instagram, or download",
                  icon: "🚀",
                },
              ].map((s, i) => (
                <div
                  key={s.step}
                  data-anim="step"
                  className="flex flex-col items-center gap-4"
                >
                  <div className="w-20 h-20 rounded-2xl bg-bg-secondary border border-neon-purple/30 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(168,85,247,0.15)]">
                    {s.icon}
                  </div>
                  <h3 className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold">
                    {s.title}
                  </h3>
                  <p className="text-text-secondary text-sm max-w-[200px]">
                    {s.desc}
                  </p>
                  {i < 2 && (
                    <span className="hidden md:block text-neon-purple text-2xl absolute translate-x-[140px]">
                      →
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* CTA Footer */}
          <section
            data-anim="cta-section"
            className="px-6 py-24 text-center"
          >
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl md:text-5xl font-bold mb-8">
              Ready to find out
              <br />
              <span className="bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent">
                who you really are?
              </span>
            </h2>
            <Link
              href="/create"
              className="neon-button text-xl inline-block hover-scale"
            >
              Drop Your Handle
            </Link>
            <div className="mt-12 flex items-center justify-center gap-2 text-text-secondary text-sm">
              <span>Powered by</span>
              <a
                href="https://magichour.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neon-purple hover:underline font-semibold"
              >
                Magic Hour
              </a>
            </div>
          </section>
        </div>
      </ScrollAnimations>
    </div>
  );
}
