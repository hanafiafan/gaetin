"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Field = "phone" | "name" | "label" | "email" | "city" | "category";
const FIELDS: { key: Field; label: string; required?: boolean }[] = [
  { key: "phone", label: "Nomor telepon", required: true },
  { key: "name", label: "Nama" },
  { key: "label", label: "Label" },
  { key: "email", label: "Email" },
  { key: "city", label: "Kota" },
  { key: "category", label: "Kategori" },
];

const HINTS: Record<Field, string[]> = {
  phone: ["phone", "telp", "telepon", "hp", "nomor", "wa", "whatsapp"],
  name: ["nama", "name", "bisnis", "business"],
  label: ["label", "tag"],
  email: ["email", "surel"],
  city: ["kota", "city"],
  category: ["kategori", "category"],
};

interface Summary {
  total: number;
  imported: number;
  invalid: number;
  duplicatesInFile: number;
  duplicatesExisting: number;
}

export default function ImportContacts() {
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [records, setRecords] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<Field, number>>({
    phone: -1,
    name: -1,
    label: -1,
    email: -1,
    city: -1,
    category: -1,
  });
  const [importing, setImporting] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  function autoMap(hs: string[]) {
    const next: Record<Field, number> = { phone: -1, name: -1, label: -1, email: -1, city: -1, category: -1 };
    (Object.keys(HINTS) as Field[]).forEach((f) => {
      const idx = hs.findIndex((h) => HINTS[f].some((k) => h.toLowerCase().includes(k)));
      next[f] = idx;
    });
    setMapping(next);
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setSummary(null);
    setFileName(file.name);

    try {
      let hs: string[] = [];
      let rows: string[][] = [];
      if (file.name.toLowerCase().endsWith(".csv")) {
        const Papa = (await import("papaparse")).default;
        const text = await file.text();
        const res = Papa.parse<string[]>(text, { skipEmptyLines: true });
        const data = res.data as string[][];
        hs = data[0] ?? [];
        rows = data.slice(1);
      } else {
        const XLSX = await import("xlsx");
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const aoa = XLSX.utils.sheet_to_json(ws, { header: 1 }) as unknown[][];
        hs = (aoa[0] ?? []).map((c) => String(c ?? ""));
        rows = aoa.slice(1).map((r) => r.map((c) => (c == null ? "" : String(c))));
      }
      setHeaders(hs);
      setRecords(rows);
      autoMap(hs);
    } catch {
      setError("Gagal membaca file. Pastikan format .csv, .xlsx, atau .xls.");
    }
  }

  async function runImport() {
    if (mapping.phone < 0) return;
    setImporting(true);
    setError(null);
    const rows = records
      .map((r) => {
        const get = (f: Field) => (mapping[f] >= 0 ? (r[mapping[f]] ?? "").trim() : undefined);
        return {
          phone: get("phone") ?? "",
          name: get("name"),
          label: get("label"),
          email: get("email"),
          city: get("city"),
          category: get("category"),
        };
      })
      .filter((r) => r.phone);

    const res = await fetch("/api/contacts/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows }),
    });
    const j = await res.json();
    setImporting(false);
    if (!res.ok) {
      setError(j?.error?.message ?? "Gagal mengimpor");
      return;
    }
    setSummary(j.data);
  }

  const preview = records.slice(0, 10);

  return (
    <div className="space-y-5">
      <div>
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={onFile}
          className="text-sm file:mr-3 file:rounded-md file:border file:bg-background file:px-3 file:py-1.5 file:text-sm"
        />
        {fileName && <p className="mt-1 text-xs text-muted-foreground">{fileName}</p>}
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
      )}

      {headers.length > 0 && !summary && (
        <>
          <div>
            <h3 className="mb-2 text-sm font-medium">Cocokkan kolom</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {FIELDS.map((f) => (
                <div key={f.key} className="flex items-center gap-2">
                  <span className="w-28 text-sm text-muted-foreground">
                    {f.label}
                    {f.required && <span className="text-destructive"> *</span>}
                  </span>
                  <select
                    value={mapping[f.key]}
                    onChange={(e) => setMapping((m) => ({ ...m, [f.key]: Number(e.target.value) }))}
                    className="h-9 flex-1 rounded-md border border-input bg-background px-2 text-sm"
                  >
                    <option value={-1}>— tidak ada —</option>
                    {headers.map((h, i) => (
                      <option key={i} value={i}>
                        {h || `Kolom ${i + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium">Pratinjau ({Math.min(10, records.length)} dari {records.length} baris)</h3>
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    {headers.map((h, i) => (
                      <th key={i} className="p-2">{h || `Kolom ${i + 1}`}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((r, ri) => (
                    <tr key={ri} className="border-b last:border-0">
                      {headers.map((_, ci) => (
                        <td key={ci} className="p-2 text-muted-foreground">{r[ci] ?? ""}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Button onClick={runImport} disabled={mapping.phone < 0 || importing}>
            {importing ? "Mengimpor..." : "Impor kontak"}
          </Button>
          {mapping.phone < 0 && (
            <p className="text-xs text-muted-foreground">Kolom nomor telepon wajib dipetakan.</p>
          )}
        </>
      )}

      {summary && (
        <div className="space-y-3 rounded-md border p-4">
          <h3 className="text-sm font-medium">Ringkasan impor</h3>
          <ul className="space-y-1 text-sm">
            <li>Total baris: {summary.total}</li>
            <li className="text-green-600">Berhasil diimpor: {summary.imported}</li>
            <li className="text-muted-foreground">Duplikat dalam file: {summary.duplicatesInFile}</li>
            <li className="text-muted-foreground">Sudah ada di database: {summary.duplicatesExisting}</li>
            <li className="text-muted-foreground">Baris tidak valid: {summary.invalid}</li>
          </ul>
          <Link href="/dashboard/contacts">
            <Button variant="outline" size="sm">Lihat kontak</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
