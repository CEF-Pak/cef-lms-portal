import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/api/useAuth";
import { baseUrl } from "@/config/authConfig";

interface BlogDetailType {
  blog_id: number;
  blog_title: string;
  blog_details: string;
  blog_image: string;
  blog_date: string;
}

export const Route = createFileRoute("/_authenticated/tutor/blog/$blogId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { blogId } = Route.useParams(); // ✅ Correct hook usage
  const [blog, setBlog] = useState<BlogDetailType | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchBlogDetails = async () => {
      try {
        const res = await fetch(`${baseUrl}instructor/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        // ✅ Fix: Access latest_blogs instead of assuming it's flat
        const matchedBlog = data.latest_blogs?.find(
          (item: BlogDetailType) => item.blog_id.toString() === blogId
        );

        setBlog(matchedBlog || null);
      } catch (err) {
        console.error("Failed to fetch blog:", err);
      }
    };

    fetchBlogDetails();
  }, [blogId, token]);

  if (!blog) {
    return <div className="p-4 text-gray-500">Loading blog details...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link
        to="/"
        className="text-blue-600 font-semibold hover:underline text-sm inline-flex items-center gap-1 mb-4"
      >
        ← Back to Dashboard
      </Link>

      <h1 className="text-2xl md:text-3xl font-semibold mb-2">
        {blog.blog_title}
      </h1>
      <p className="text-gray-400 text-sm mb-4">{blog.blog_date}</p>

      <img
        src={blog.blog_image}
        alt={blog.blog_title}
        className="w-full max-h-[400px] object-cover rounded-md mb-6"
      />

      <div
        className="prose prose-sm md:prose-base max-w-none"
        dangerouslySetInnerHTML={{ __html: blog.blog_details }}
      />
    </div>
  );
}
