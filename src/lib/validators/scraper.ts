import { z } from "zod";

export const ScraperDataFieldSchema = z.enum([
  // Existing
  "phone",
  "address",
  "website",
  "email",
  "category",
  "rating",
  "coordinates",
  // New
  "openingHours",
  "priceRange",
  "amenities",
  "serviceOptions",
  "plusCode",
  "mapsUrl",
  "reviews",
  "photos",
  "description",
]);

export const ScraperStartSchema = z.object({
  keyword: z.string().min(1, "Kata kunci wajib diisi").max(200),
  location: z.string().max(200).optional(),
  name: z.string().max(100).optional(),
  color: z.string().max(20).optional(),
  dataFields: z.array(ScraperDataFieldSchema).min(1).max(17).optional(),
});

export type ScraperStartInput = z.infer<typeof ScraperStartSchema>;
