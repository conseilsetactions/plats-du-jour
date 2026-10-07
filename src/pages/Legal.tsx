import { Fragment, type ReactNode } from 'react';
import { Link, useParams } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import { LEGAL_DOCS, type LegalDocId } from '@/pages/legal/legalContent';
import { pageMain } from '@/components/layout';

/** Surligne les informations manquantes « [à compléter : …] ». */
export function withPlaceholders(text: string): ReactNode {
  return text.split(/(\[[^\]]+\])/g).map((part, i) =>
    part.startsWith('[') ? (
      <mark key={i} className="rounded bg-[#fff3c4] px-1 text-foreground">
        {part}
      </mark>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

// Textes juridiques : PROJETS à faire relire par un juriste avant la mise en ligne
export default function Legal() {
  const { doc } = useParams({ from: '/legal/$doc' });
  const content = LEGAL_DOCS[doc as LegalDocId] as (typeof LEGAL_DOCS)[LegalDocId] | undefined;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className={`${pageMain} px-4 py-6`}>
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent no-underline">
          <ArrowLeft className="h-4 w-4" />
          Accueil
        </Link>

        {!content ? (
          <>
            <h1 className="mt-4 text-xl font-bold text-foreground">Document introuvable</h1>
            <p className="mt-3 text-sm text-muted-foreground">Ce document n'existe pas</p>
          </>
        ) : (
          <article className="mt-4">
            <h1 className="text-xl font-bold text-foreground">{content.title}</h1>
            <p className="mt-1 text-xs text-subtle">Mise à jour : {withPlaceholders(content.updatedAt)}</p>
            {content.intro && (
              <p className="mt-4 text-sm leading-relaxed text-foreground">{withPlaceholders(content.intro)}</p>
            )}
            {content.sections.map((section) => (
              <section key={section.title} className="mt-6">
                <h2 className="text-base font-semibold text-foreground">{section.title}</h2>
                {section.paragraphs.map((p, i) => (
                  <p key={i} className="mt-2 text-sm leading-relaxed text-foreground">
                    {withPlaceholders(p)}
                  </p>
                ))}
              </section>
            ))}
          </article>
        )}
      </main>
    </div>
  );
}
