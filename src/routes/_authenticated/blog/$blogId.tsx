import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { useAuth } from "@/api/useAuth";
import { baseUrl } from "@/config/authConfig";
import { Skeleton } from "@/components/ui/skeleton";

interface BlogDetailType {
  blog_id: number;
  blog_title: string;
  blog_details: string;
  blog_image: string;
  blog_date: string;
}

export const Route = createFileRoute("/_authenticated/blog/$blogId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { blogId } = useParams({ from: "/_authenticated/blog/$blogId" });
  const [blog, setBlog] = useState<BlogDetailType | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    fetch(`${baseUrl}student/latestBlogs`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const matchedBlog = data.find(
          (item: any) => item.blog_id.toString() === blogId
        );
        setBlog(matchedBlog);
      })
      .catch((err) => console.error("Failed to fetch blog:", err));
  }, [blogId]);

  if (!blog) {
    return (
      <div className="max-w-4xl p-6 container mx-auto">
        <div className="mb-4">
          <Skeleton className="h-6 w-32" />
        </div>
        
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-[400px] w-full rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl p-6 container mx-auto">
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
