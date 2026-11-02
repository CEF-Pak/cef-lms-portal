import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { baseUrl } from "@/config/authConfig";
import { useAuth } from "@/api/useAuth";

interface BlogType {
  blog_id: number;
  blog_title: string;
  blog_date: string;
  blog_image: string;
}

const SkeletonBlog = () => (
  <div className="flex items-center h-[5rem] px-2">
    <div className="w-[26%]">
      <div className="w-full h-[4.5rem] rounded-md bg-gray-200 animate-pulse" />
    </div>
    <div className="w-[74%] ms-2 flex flex-col justify-center items-start gap-2">
      <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
      <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
    </div>
  </div>
);

export default function LatestBlog() {
  const [blogs, setBlogs] = useState<BlogType[]>([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${baseUrl}instructor/dashboard`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        const raw = data?.latest_blogs;
        setBlogs(Array.isArray(raw) ? raw : []);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch blogs:", err);
        setBlogs([]);
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [token]);

  if (loading) return <>
    <SkeletonBlog />
    <SkeletonBlog />
    <SkeletonBlog />
  </>;

  return (
    <div className="flex flex-col gap-3 h-[16rem] overflow-y-auto">
      {blogs.map((blog) => (
        <Link
          to="/tutor/blog/$blogId"
          params={{ blogId: blog.blog_id.toString() }}
          key={blog.blog_id}
          className="flex items-center h-[5rem] hover:bg-gray-100 rounded-md px-2"
        >
          <div className="w-[26%]">
            <img
              src={blog.blog_image}
              className="w-full h-[4.5rem] rounded-md object-cover"
              alt={blog.blog_title}
            />
          </div>
          <div className="w-[74%] ms-2 flex flex-col justify-center items-start">
            <span className="text-gray-400 text-xs">{blog.blog_date}</span>
            <h6 className="text-sm line-clamp-2">{blog.blog_title}</h6>
          </div>
        </Link>
      ))}
    </div>
  );
}
