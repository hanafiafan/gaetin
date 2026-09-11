import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Kondisi kosong yang selalu membawa langkah berikutnya.
 *
 * Sebelumnya halaman kosong hanya menulis "Belum ada tugas." atau "Belum ada
 * percakapan masuk." — memberi tahu tidak ada apa-apa tanpa memberi tahu cara
 * mengisinya. Bagi pengguna baru itu jalan buntu: mereka harus menebak sendiri
 * menu mana yang harus dibuka. Halaman validator bahkan menyebut "Pengaturan"
 * sebagai teks biasa, bukan tautan.
 *
 * Halaman kosong adalah layar yang PALING sering dilihat pengguna baru, jadi di
 * sinilah arahan paling dibutuhkan.
 */
export default function EmptyState({
  icon: Icon,
  title,
  hint,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  hint?: string;
  action?: { href: string; label: string };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border px-6 py-10 text-center",
        className,
      )}
    >
      {Icon && (
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-foreground/[0.06] text-foreground/60">
          <Icon className="h-5 w-5" />
        </span>
      )}
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {hint && <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{hint}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="mt-1 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          {action.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
