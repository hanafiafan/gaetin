import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import AnnouncementBanner from "@/components/dashboard/announcement-banner";
import ImpersonationBanner from "@/components/dashboard/impersonation-banner";
import FeatureGate from "@/components/dashboard/feature-gate";
import { getOwnerCmsSettings } from "@/lib/owner-cms";

// Konversi hex (#RRGGBB) ke string HSL "H S% L%" untuk override CSS var Tailwind.
function hexToHsl(hex: string): string | null {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return null;
  const int = parseInt(m[1], 16);
  const r = ((int >> 16) & 255) / 255;
  const g = ((int >> 8) & 255) / 255;
  const b = (int & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const [branding, ownerCms, workspaceInfo] = await Promise.all([
    prisma.brandingSettings.findUnique({
      where: { workspaceId: session.workspace.id },
    }),
    getOwnerCmsSettings(),
    prisma.workspace.findUnique({
      where: { id: session.workspace.id },
      select: {
        credits: true,
        subscription: { select: { plan: true, status: true, trialEndsAt: true } },
      },
    }),
  ]);
  const appName = branding?.appName || "Gaetin";
  const hsl = branding?.primaryColor ? hexToHsl(branding.primaryColor) : null;

  return (
    <div className="cg-shell flex h-screen overflow-hidden bg-[#060810] text-white">
      {hsl && <style dangerouslySetInnerHTML={{ __html: `:root{--primary:${hsl};--ring:${hsl};}` }} />}
      <Sidebar
        appName={appName}
        featureFlags={ownerCms.featureFlags}
        isSuperAdmin={session.isSuperAdmin}
        credits={workspaceInfo?.credits ?? 0}
        plan={workspaceInfo?.subscription?.plan ?? "STARTER"}
        subscriptionStatus={workspaceInfo?.subscription?.status ?? "TRIAL"}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <FeatureGate featureFlags={ownerCms.featureFlags} />
        {session.impersonating && <ImpersonationBanner workspaceName={session.workspace.name} />}
        <Header user={session.user} workspace={session.workspace} isSuperAdmin={session.isSuperAdmin} />
      <main className="relative z-10 flex-1 px-3 py-4 sm:px-5 lg:px-7">
        <div className="mx-auto max-w-[1440px] animate-fade-in space-y-5">
            <AnnouncementBanner />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
