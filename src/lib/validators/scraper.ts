import { z } from "zod";

export const ScraperDataFieldSchema = z.enum([
  "phone",
  "address",
  "website",
  "email",
  "category",
  "rating",
  "coordinates",
]);

export const ScraperStartSchema = z
  .object({
    keyword: z.string().min(1, "Kata kunci wajib diisi").max(200),
    mode: z.enum(["map", "text", "extension"]).default("map"),
    centerLat: z.number().min(-90).max(90).optional(),
    centerLng: z.number().min(-180).max(180).optional(),
    radiusKm: z.number().min(1).max(20).optional(),
    location: z.string().max(200).optional(),
    locationLabel: z.string().max(200).optional(),
    name: z.string().max(100).optional(),
    color: z.string().max(20).optional(),
    dataFields: z.array(ScraperDataFieldSchema).min(1).max(7).optional(),
  })
  .refine(
    (d) => {
      if (d.mode === "extension") return true;
      if (d.mode === "map") return d.centerLat !== undefined && d.centerLng !== undefined && d.radiusKm !== undefined;
      return !!d.location;
    },
    { message: "Mode peta butuh titik pusat & radius; mode teks butuh lokasi" },
  );

export type ScraperStartInput = z.infer<typeof ScraperStartSchema>;
