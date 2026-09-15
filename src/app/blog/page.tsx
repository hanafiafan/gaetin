import { publicMetadata } from "@/lib/public/metadata";
import type { Metadata } from "next";
import JournalGrid from "@/components/public/journal-grid";
import { PublicShell } from "@/components/public/public-shell";
import { getPublicPosts } from "@/lib/public/posts";
export const dynamic = "force-dynamic";
export const metadata: Metadata = publicMetadata(
  "Jurnal Hellens — Riset Prospek & CRM",
  "Panduan praktis riset prospek, komunikasi dan CRM untuk bisnis yang terus tumbuh.",
  "/blog",
);
export default async function BlogListPage() {
  const posts = await getPublicPosts();
  return (
    <PublicShell>
      <main id="main-content">
        <section className="pub-page-hero">
          <div className="pub-wrap">
            <span className="pub-eyebrow">THE HELLENS JOURNAL</span>
            <h1>
              BEKAL UNTUK
              <br />
              <span className="pub-orange-text">LANGKAH BESAR.</span>
            </h1>
            <p>
              Catatan praktis tentang menemukan peluang, membangun percakapan
              dan merapikan cara kerja tim.
            </p>
          </div>
        </section>
        <section className="pub-wrap pub-section">
          <JournalGrid posts={posts} />
        </section>
      </main>
    </PublicShell>
  );
}
