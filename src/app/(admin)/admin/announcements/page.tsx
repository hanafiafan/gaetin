import AdminAnnouncements from "@/components/admin/admin-announcements";

export default function AdminAnnouncementsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Pengumuman</h1>
        <p className="text-sm text-muted-foreground">Banner yang tampil di dashboard semua pengguna.</p>
      </div>
      <AdminAnnouncements />
    </div>
  );
}
