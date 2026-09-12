"use client";

import { createContext, useContext } from "react";
import type { PlanFeatures } from "@/config/plans";

/**
 * Flag fitur dari CMS owner dan batas paket workspace, dibagi ke seluruh isi
 * halaman.
 *
 * Nav atas sudah menerima keduanya sebagai prop dari layout, tapi kepala
 * halaman berada di cabang pohon yang lain — dan ia perlu tahu tab mana yang
 * boleh tampil. Mengoperkannya sebagai prop berarti menyentuh ke-18 halaman
 * hanya untuk meneruskan dua nilai yang sama; context menahannya di satu
 * tempat.
 */
export interface NavAccess {
  featureFlags?: Record<string, boolean> | null;
  planFeatures?: PlanFeatures;
}

const NavAccessContext = createContext<NavAccess>({});

export function NavAccessProvider({ value, children }: { value: NavAccess; children: React.ReactNode }) {
  return <NavAccessContext.Provider value={value}>{children}</NavAccessContext.Provider>;
}

export function useNavAccess(): NavAccess {
  return useContext(NavAccessContext);
}
