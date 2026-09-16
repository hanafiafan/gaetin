"use client";

import { useEffect, useId, useState } from "react";

interface LabelCount { label: string; count: number }

/**
 * Kolom "Filter label" dengan daftar label yang benar-benar ada.
 *
 * Sebelumnya ini kotak teks polos tanpa keterangan: tidak ada cara mengetahui
 * label apa yang boleh diisi, dan satu huruf yang meleset menghasilkan "tidak
 * ada kontak yang cocok" tanpa menyebut sebabnya. Pakai <datalist> bawaan
 * browser — tetap boleh diketik bebas, tapi pilihannya terlihat begitu kolom
 * ini disentuh.
 */
export default function LabelFilter({
  value,
  onChange,
  hint,
  label = "Filter label",
  source,
}: {
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  label?: string;
  /** LEAD memakai kategori hasil pencarian Maps, bukan label kontak. */
  source?: "LEAD" | "CONTACT";
}) {
  const id = useId();
  const [labels, setLabels] = useState<LabelCount[]>([]);

  useEffect(() => {
    let batal = false;
    (async () => {
      const r = await fetch(`/api/contacts/labels${source ? `?source=${source}` : ""}`);
      const j = await r.json().catch(() => null);
      if (!batal && j?.success) setLabels(j.data);
    })();
    return () => { batal = true; };
  }, [source]);

  const kosong = labels.length === 0;

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-muted-foreground">
        {label} <span className="font-normal">(boleh dikosongkan)</span>
      </label>
      <input
        id={id}
        list={`${id}-opsi`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={kosong ? "Belum ada pilihan — kosongkan saja" : `Contoh: ${labels[0].label}`}
        className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none"
      />
      <datalist id={`${id}-opsi`}>
        {labels.map((l) => (
          <option key={l.label} value={l.label}>{`${l.label} (${l.count} kontak)`}</option>
        ))}
      </datalist>
      {labels.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {labels.slice(0, 6).map((l) => (
            <button
              key={l.label}
              type="button"
              onClick={() => onChange(value === l.label ? "" : l.label)}
              aria-pressed={value === l.label}
              className={
                value === l.label
                  ? "rounded-full border border-primary bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground"
                  : "rounded-full border border-border px-2.5 py-1 text-xs font-medium text-foreground/70 transition hover:border-foreground/30 hover:text-foreground"
              }
            >
              {l.label} · {l.count}
            </button>
          ))}
        </div>
      )}
      <p className="mt-1 text-xs text-muted-foreground">{hint ?? "Kosongkan untuk mengirim ke semua kontak yang cocok."}</p>
    </div>
  );
}
