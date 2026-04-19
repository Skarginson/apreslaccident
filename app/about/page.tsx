import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 md:p-16">
      <main className="w-full max-w-2xl flex flex-col gap-12">
        <header>
          <Link
            href="/"
            className="text-[0.6875rem] font-label uppercase tracking-[0.05rem] text-secondary hover:text-on-surface transition-colors duration-200 flex items-center gap-2 mb-12"
          >
            ← Accueil
          </Link>
          <h1 className="font-headline text-5xl md:text-6xl text-on-surface tracking-tight leading-none">
            À propos du jeu
          </h1>
        </header>

        <section className="flex flex-col gap-6 font-body text-lg text-on-surface leading-relaxed">
          <p>
            <em>Après l&apos;accident</em> est un jeu de rôle solo de Nicolas{" "}
            <span>&ldquo;Gulix&rdquo;</span> Ronvel, publié par Neoludis en 2025. Vous
            incarnez la survivante d&apos;un accident, isolée dans un endroit mystérieux.
            Chaque jour, vous tirez une carte, lisez un prompt et écrivez une entrée dans
            votre journal intime.
          </p>

          <p>
            Le jeu utilise le système{" "}
            <strong>LEADS</strong> (Lieux, Événements, Actions, Décisions, Sensations)
            pour structurer la narration. Chaque partie est unique grâce aux{" "}
            <strong>18 Pistes</strong> thématiques qui s&apos;insèrent dynamiquement dans
            le Paquet Histoire.
          </p>
        </section>

        <div className="border-t border-outline-variant/30 pt-8 flex flex-col gap-3 font-label text-[0.6875rem] uppercase tracking-[0.05rem] text-secondary">
          <p>
            Cette adaptation web est réalisée avec l&apos;accord explicite de l&apos;auteur.
          </p>
          <p>
            Système LEADS v1.1 —{" "}
            <a
              href="https://gulix.itch.io/leads"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-on-surface transition-colors duration-200"
            >
              CC-BY Nicolas Ronvel
            </a>
          </p>
          <p>Code source — MIT License</p>
        </div>
      </main>
    </div>
  );
}
