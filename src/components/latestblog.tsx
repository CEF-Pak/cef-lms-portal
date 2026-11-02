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

export default function LatestBlog() {
  const [blogs, setBlogs] = useState<BlogType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    setIsLoading(true);
    fetch(`${baseUrl}student/latestBlogs`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        setBlogs(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setBlogs([]);
        setIsLoading(false);
      });
  }, [token]);

  const SkeletonBlog = () => (
    <div className="flex items-center h-[5rem] sm:h-[4rem] px-2 sm:px-1">
      <div className="w-[26%]">
        <div className="w-full h-[4.5rem] sm:h-[3.5rem] rounded-md bg-gray-200 animate-pulse" />
      </div>
      <div className="w-[74%] ms-2 sm:ms-1 flex flex-col justify-center items-start gap-2 sm:gap-1">
        <div className="h-3 sm:h-2.5 w-20 sm:w-16 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 sm:h-3 w-full bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col gap-3 h-[16rem] md:h-[14rem] sm:h-[12rem] overflow-y-auto">
      {isLoading ? (
        <>
          <SkeletonBlog />
          <SkeletonBlog />
          <SkeletonBlog />
        </>
      ) : (
        blogs &&
        blogs.map((blog) => (
          <Link
            to="/blog/$blogId"
            params={{ blogId: blog.blog_id.toString() }}
            key={blog.blog_id}
            className="flex items-center h-[5rem] sm:h-[4rem] hover:bg-gray-100 rounded-md px-2 sm:px-1"
          >
            <div className="w-[26%]">
              <img
                src={blog.blog_image}
                className="w-full h-[4.5rem] sm:h-[3.5rem] rounded-md object-cover"
                alt={blog.blog_title}
              />
            </div>
            <div className="w-[74%] ms-2 sm:ms-1 flex flex-col justify-center items-start">
              <span className="text-gray-400 text-xs sm:text-[10px]">
                {blog.blog_date}
              </span>
              <h6 className="text-sm sm:text-xs line-clamp-2">
                {blog.blog_title}
              </h6>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
