"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const ROUTE_FLAGS = [
  { prefix: "/dashboard/scraper", flag: "scraper" },
  { prefix: "/dashboard/blast", flag: "blast" },
  { prefix: "/dashboard/validator", flag: "validator" },
  { prefix: "/dashboard/campaigns", flag: "campaigns" },
  { prefix: "/dashboard/crm", flag: "crm" },
  { prefix: "/dashboard/inbox", flag: "inbox" },
  { prefix: "/dashboard/map", flag: "betaMapAnalysis" },
  { prefix: "/dashboard/billing", flag: "billing" },
];

export default function FeatureGate({ featureFlags }: { featureFlags: Record<string, boolean> }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const match = ROUTE_FLAGS.find((route) => pathname.startsWith(route.prefix));
    if (match && featureFlags[match.flag] === false) {
      router.replace("/dashboard?feature=disabled");
    }
  }, [featureFlags, pathname, router]);

  return null;
}
