import { useState, useEffect } from "react";
import banner from "@/assets/images/bg.png";

export default function Banner() {
  const [userName, setUserName] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("user_name") : null
  );
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onHydrated = () => setUserName(localStorage.getItem("user_name"));
    window.addEventListener("cef-user-details-hydrated", onHydrated);
    return () => window.removeEventListener("cef-user-details-hydrated", onHydrated);
  }, []);

  return (
    <div className="w-full h-32 container mx-auto rounded-xl bg-gradient-to-r from-secondary-500 to-secondary-500 flex items-center justify-center relative overflow-hidden">
      <img
        src={banner}
        alt="Banner Image"
        className="absolute w-full h-full object-cover object-[85%_0%] opacity-20"
      />
      <div className="w-full h-full flex flex-col items-start justify-center gap-2 px-8 lg:px-2">
        <h1 className="text-white sm:text-4xl text-xl font-aileron2 font-light">
          Welcome to the CEF Online Academy
          <span className="font-aileron  sm:text-4xl text-xl font-bold">
            {" "}
            {userName}{" "}
          </span>
        </h1>
        <h2 className="text-white sm:text-md text-xs font-aileron2">
          Start Your Journey of Faith, Knowledge, and Character
        </h2>
      </div>
    </div>
  );
}
