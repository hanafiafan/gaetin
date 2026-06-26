import AdminBlog from "@/components/admin/admin-blog";

export default function AdminBlogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Blog</h1>
        <p className="text-sm text-slate-400">Tulis & terbitkan artikel yang tampil di /blog.</p>
      </div>
      <AdminBlog />
    </div>
  );
}
