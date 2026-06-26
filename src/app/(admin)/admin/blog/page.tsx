import AdminBlog from "@/components/admin/admin-blog";

export default function AdminBlogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Blog</h1>
        <p className="text-sm text-muted-foreground">Tulis & terbitkan artikel yang tampil di /blog.</p>
      </div>
      <AdminBlog />
    </div>
  );
}
