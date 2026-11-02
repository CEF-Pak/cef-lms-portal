import { useAuthLogin } from "@/api/useAuth";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Spinner } from "@/components/ui/spinner";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectFade } from "swiper/modules";
import "swiper/swiper-bundle.css";
import signin1 from "@/assets/images/signin-1.webp";
import signin2 from "@/assets/images/signin-2.webp";
import signin3 from "@/assets/images/signin-3.webp";
import signin4 from "@/assets/images/signin-4.webp";

const sliderImages = [
  signin1,
  signin2,
  signin3,
  signin4,
];

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [activeTab, ] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  
  const { data, isLoading, isError } = useAuthLogin(
    { email, password },
    { enabled: enabled }
  );

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email && password) {
      setEnabled(true);
    }
  };
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role === "3") {
      window.location.href = "/";
    }
    if (token && role === "2") {
      window.location.href = "/tutor";
    }
  }, [router, enabled]);

  useEffect(() => {
    if (data && data.token) {
      setEnabled(false);
    }
    if (isError) {
      setEnabled(false);
    }
  }, [data, isError, router]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-6xl flex rounded-lg overflow-hidden shadow-lg">
          {/* Left side - Form */}
          <div className="w-full md:w-1/2 bg-white p-8 flex justify-center items-center">
            <div className="w-[90%] mx-auto">
              <h1 className="text-2xl font-bold mb-1">Welcome to CEF</h1>
              <p className="text-gray-500 mb-6 text-sm">Please enter your credentials</p>
              
              {/* Tabs */}
              <div className="flex mb-6">
                <a 
                  href="/"
                  className={`flex-1 py-2 text-center border rounded-l text-sm ${activeTab === "signin" ? "border-gray-400 text-gray-500 font-medium shadow" : "border-gray-200 text-gray-500"}`}
                >
                  Sign In
                </a>
                <a 
                  href="https://cefonlineacademy.com/sign-up-as-student"
                  className={`flex-1 py-2 text-center border rounded-r text-sm ${activeTab === "signup" ? "border-gray-400 text-gray-500 font-medium shadow" : "border-gray-200 text-gray-500"}`}
                >
                  Sign Up
                </a>
              </div>

              {activeTab === "signin" && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Email or Phone</label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="text"
                      placeholder="Enter your email or phone"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-secondary"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Password</label>
                    <div className="relative">
                      <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type={showPassword ? "text" : "password"}
                        placeholder="********"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-secondary"
                        required
                      />
                      <button 
                        type="button" 
                        onClick={togglePasswordVisibility}
                        className="absolute cursor-pointer inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-500"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-500"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full cursor-pointer py-2 text-white bg-secondary hover:bg-secondary/90 rounded-md font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? <Spinner /> : "LOGIN"}
                  </button>
                  
                  <div className="text-center pt-2">
                    <a href="https://cefonlineacademy.com/forget-password" className="text-secondary hover:underline text-sm cursor-pointer">
                      Forgot Password?
                    </a>
                  </div>
                </form>
              )}
            </div>
          </div>
          {/* Right side - Swiper Slider */}
          <div className="hidden md:block md:w-1/2 relative">
              <div className="w-full h-full rounded-lg">
                <Swiper
                  modules={[Pagination, Autoplay, EffectFade]}
                  pagination={{ clickable: true }}
                  autoplay={{ delay: 5000, disableOnInteraction: false }}
                  loop={true}
                  className="w-full h-full rounded-lg"
                >
                  {sliderImages.map((image, index) => (
                    <SwiperSlide key={index} className="bg-white rounded-lg overflow-hidden">
                        <img 
                          src={image} 
                          alt={`Slide ${index + 1}`} 
                          className="w-full h-full object-cover rounded-lg"
                        />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div> 
          </div>
        </div>
      </div>
    </div>
  );
}
