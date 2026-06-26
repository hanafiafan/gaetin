// Lead scoring sederhana 0-100 dari kelengkapan kontak & sinyal kualitas.

export interface ScoreInput {
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
}

export function computeScore(x: ScoreInput): number {
  let s = 0;
  if (x.phone) s += 30;
  if (x.email) s += 15;
  if (x.website) s += 10;
  if (x.rating) s += Math.round((x.rating / 5) * 25);
  if (x.reviewCount) s += Math.min(20, Math.round(Math.log10(x.reviewCount + 1) * 10));
  return Math.max(0, Math.min(100, s));
}
