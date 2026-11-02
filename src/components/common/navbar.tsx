import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { VscAccount } from "react-icons/vsc";
import { IoMdNotificationsOutline } from "react-icons/io";
import { IoLogOutOutline, IoCloseOutline, IoRefreshOutline } from "react-icons/io5";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import image from "@/assets/images/dummy.jpg";
import { useState, useEffect } from "react";
import GoogleAuthButton from "@/components/tutor/GoogleAuthButton";
import { clearAuthCookie } from "@/lib/auth-cookie";
import { baseUrl, frontendUrl } from "@/config/authConfig";

const SearchIcon = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 17 17"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0_1452_723)">
      <path
        d="M6.96587 13.3735C8.39596 13.3735 9.78517 12.8964 10.9134 12.0176L15.1699 16.2741C15.4879 16.5812 15.9946 16.5724 16.3017 16.2544C16.6012 15.9442 16.6012 15.4525 16.3017 15.1424L12.0452 10.8858C14.2258 8.07881 13.718 4.03555 10.9109 1.85494C8.10392 -0.325664 4.06069 0.182124 1.88009 2.98915C-0.300517 5.79618 0.20727 9.83944 3.01430 12.02C4.14439 12.898 5.53484 13.3742 6.96587 13.3735ZM3.54580 3.51819C5.43467 1.62928 8.49713 1.62925 10.3860 3.51812C12.2749 5.40699 12.2750 8.46945 10.3861 10.3584C8.49724 12.2473 5.43477 12.2473 3.54587 10.3584C1.65693 8.48325 1.64580 5.43195 3.52091 3.54308L3.54580 3.51819Z"
        fill="#1E1E1E"
      />
    </g>
    <defs>
      <clipPath id="clip0_1452_723">
        <rect
          width="16"
          height="16"
          fill="white"
          transform="translate(0.526367 0.5)"
        />
      </clipPath>
    </defs>
  </svg>
);

export default function Navbar() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] =
    useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [hardRefreshLoading, setHardRefreshLoading] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<{
    name: string | null;
    email: string | null;
    image: string | null;
  }>({ name: null, email: null, image: null });

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const firstName =
    typeof window !== "undefined" ? localStorage.getItem("first_name") : null;
  const lastName =
    typeof window !== "undefined" ? localStorage.getItem("last_name") : null;

  // Read from localStorage on mount and when we hydrate from API
  useEffect(() => {
    if (typeof window === "undefined") return;
    setRole(localStorage.getItem("role"));
    setUserDetails({
      name: localStorage.getItem("user_name"),
      email: localStorage.getItem("user_email"),
      image: localStorage.getItem("user_image"),
    });
  }, []);

  // When we have token but incomplete user details (e.g. restored from cookie / hash without profile), fetch /me
  useEffect(() => {
    if (!token || (userDetails.name && userDetails.email)) return;
    const url = `${baseUrl.replace(/\/$/, "")}/me`;
    fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        const u = data?.userDetails;
        if (!u) return;
        localStorage.setItem("user_name", u.name ?? "");
        localStorage.setItem("user_email", u.email ?? "");
        localStorage.setItem("user_image", u.image_url ?? "");
        localStorage.setItem("user_phone", u.phone_number ?? "");
        localStorage.setItem("user_id", String(u.id ?? ""));
        if (u.student) {
          localStorage.setItem("first_name", u.student.first_name ?? "");
          localStorage.setItem("last_name", u.student.last_name ?? "");
          localStorage.setItem("gender", u.student.gender ?? "");
          localStorage.setItem("country_id", String(u.student.country_id ?? ""));
          localStorage.setItem("address", u.student.address ?? "");
          localStorage.setItem("postal_code", u.student.postal_code ?? "");
          localStorage.setItem("biography", u.student.about_me ?? "");
        }
        if (data.role != null) localStorage.setItem("role", String(data.role));
        setRole(localStorage.getItem("role"));
        setUserDetails({
          name: u.name ?? null,
          email: u.email ?? null,
          image: u.image_url ?? null,
        });
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("cef-user-details-hydrated"));
        }
      })
      .catch((err) => {
        console.warn("[CEF] /me fetch failed", err?.status ?? err);
      });
  }, [token, userDetails.name, userDetails.email]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onProfileImageUpdated = (e: Event) => {
      const detail = (e as CustomEvent<{ image_url?: string }>).detail;
      const url =
        typeof detail?.image_url === "string" && detail.image_url
          ? detail.image_url
          : localStorage.getItem("user_image");
      if (url) setUserDetails((prev) => ({ ...prev, image: url }));
    };
    window.addEventListener("cef-profile-image-updated", onProfileImageUpdated);
    return () =>
      window.removeEventListener(
        "cef-profile-image-updated",
        onProfileImageUpdated
      );
  }, []);

  const userEmail = userDetails.email;
  const userImage = userDetails.image;
  const userName = userDetails.name;

  const basePath = role === "2" ? "/tutor" : "";
  const dashboardPath = role === "2" ? "/tutor" : "/";
  const currentPath = routerState.location.pathname;

  const isActive = (path: string) => {
    if (path === dashboardPath && currentPath === dashboardPath) return true;
    if (path !== dashboardPath) {
      return (
        currentPath === path ||
        (currentPath.startsWith(path) &&
          (currentPath === path || currentPath[path.length] === "/"))
      );
    }
    return false;
  };

  const handleProfileClick = () => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
    navigate({ to: `${basePath}/myprofile` });
  };

  const handleHardRefresh = async () => {
    if (typeof window === "undefined" || hardRefreshLoading) return;
    setHardRefreshLoading(true);
    try {
      if ("caches" in window) {
        const names = await caches.keys();
        await Promise.all(names.map((name) => caches.delete(name)));
      }
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
    } catch (e) {
      console.warn("[CEF] Hard refresh cache clear", e);
    }
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_image");
    localStorage.removeItem("first_name");
    localStorage.removeItem("last_name");
    clearAuthCookie();
    window.location.replace(frontendUrl);
  };

  if (!token) return null;

  const navLinks =
    role === "2"
      ? [
          { to: "https://cefonlineacademy.com/", label: "Home" },
          { to: dashboardPath, label: "Dashboard" },
          { to: `${basePath}/mycourses`, label: "My Courses" },
          { to: `${basePath}/ClassSchedule`, label: "Class Schedule" },
          { to: `${basePath}/ClassHistory`, label: "Class History" },
          { to: "/tutor/Discussion", label: "Discussions" },
        ]
      : [
          { to: "https://cefonlineacademy.com/", label: "Home" },
          { to: dashboardPath, label: "Dashboard" },
          { to: `/mycourses`, label: "My Courses" },
          { to: `/ClassSchedule`, label: "Class Schedule" },
          { to: `/ClassHistory`, label: "Class History" },
          { to: `/myproducts`, label: "My Products" },
          { to: `/billing`, label: "Billing" },
        ];

  return (
    <nav className="w-full bg-white shadow z-50 relative md:min-h-20" id="navbar">
      <div className="flex min-h-16 items-center justify-between gap-4 container mx-auto p-2 md:min-h-20 md:py-2.5">
        <Link
          to="/"
          className="flex h-16 w-auto shrink-0 items-center md:h-20"
        >
          <img
            src="https://web-admin.cefonlineacademy.com/uploads/7c659eaece9c42a98b7030d402f04074/CEF%20Logo-01.png"
            alt="CEF Online Academy Logo"
            className="h-full w-auto object-contain object-left"
          />
        </Link>
        <div className="hidden md:flex flex-1 items-center justify-start gap-6 p-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`navbar-link whitespace-nowrap text-sm ${isActive(link.to) ? "!text-secondary !font-bold" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 shrink-0">
          {/* Desktop Google Auth Button - hidden on mobile */}
          {role === "2" && (
            <div className="hidden md:block">
              <GoogleAuthButton />
            </div>
          )}
          <div className="relative w-full max-w-[120px] sm:max-w-[200px] md:max-w-[240px]">
            <Input
              type="search"
              placeholder="Search"
              className="search pr-8 text-sm sm:text-base"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer">
              <SearchIcon />
            </div>
          </div>
          <div className="hidden sm:block">
            <DropdownMenu
              open={isNotificationDropdownOpen}
              onOpenChange={setIsNotificationDropdownOpen}
            >
              <DropdownMenuTrigger className="w-10 h-10 border border-tertiary rounded-full p-2 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
                <IoMdNotificationsOutline size={20} />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[320px] sm:w-[360px] p-0 shadow-lg mr-4 sm:mr-10 bg-white overflow-hidden">
                <div className="p-3 sm:p-4 text-base sm:text-lg font-semibold">
                  Notifications
                </div>
                <div className="px-3 sm:px-4 py-2 text-xs text-gray-500 font-medium">
                  April 18, 2025
                </div>
                <div className="space-y-2 px-3 sm:px-4 pb-2">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <img
                      src={image}
                      alt="User"
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full"
                    />
                    <div className="flex-1 text-xs sm:text-sm">
                      <span className="font-medium">Muhammad Ibrahim</span>{" "}
                      started new online class
                      <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                        12:15 pm
                      </div>
                    </div>
                    <div className="mt-1">
                      <span className="w-2 h-2 bg-[#013370] rounded-full block"></span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <img
                      src={image}
                      alt="User"
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full"
                    />
                    <div className="flex-1 text-xs sm:text-sm">
                      You purchased new course
                      <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                        11:10 am
                      </div>
                    </div>
                    <div className="mt-1">
                      <span className="w-2 h-2 bg-[#013370] rounded-full block"></span>
                    </div>
                  </div>
                </div>
                <div className="px-3 sm:px-4 py-2 text-xs text-gray-500 font-medium">
                  April 17, 2025
                </div>
                <div className="space-y-2 px-3 sm:px-4 pb-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <img
                      src={image}
                      alt="User"
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full"
                    />
                    <div className="flex-1 text-xs sm:text-sm">
                      <span className="font-medium">Hafiza Sarah</span> started
                      new online class
                      <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                        12:15 pm
                      </div>
                    </div>
                    <div className="mt-1">
                      <span className="w-2 h-2 bg-gray-300 rounded-full block"></span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <img
                      src={image}
                      alt="User"
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full"
                    />
                    <div className="flex-1 text-xs sm:text-sm">
                      You paid April invoice
                      <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                        11:10 am
                      </div>
                    </div>
                    <div className="mt-1">
                      <span className="w-2 h-2 bg-gray-300 rounded-full block"></span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-400 p-2 sm:p-3">
                  <button className="w-full bg-[#013370] text-white text-xs sm:text-sm font-medium py-2 rounded-md hover:bg-[#013370]/90">
                    Mark all as read
                  </button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="hidden sm:block">
            <button
              type="button"
              onClick={handleHardRefresh}
              disabled={hardRefreshLoading}
              title="Clear site cache and reload"
              aria-label="Clear site cache and reload"
              className="w-10 h-10 border border-tertiary rounded-full p-2 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors disabled:opacity-60 disabled:cursor-wait"
            >
              <IoRefreshOutline
                size={20}
                className={hardRefreshLoading ? "animate-spin" : ""}
              />
            </button>
          </div>
          <div className="hidden md:block">
            <DropdownMenu
              open={isProfileDropdownOpen}
              onOpenChange={setIsProfileDropdownOpen}
            >
              <DropdownMenuTrigger className="w-10 h-10 border border-tertiary rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                <img
                  src={userImage || "https://via.placeholder.com/150"}
                  alt="Display Picture"
                  className="w-full h-full object-cover rounded-full"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60 sm:w-60 bg-white border-0 mr-4 shadow-lg">
                <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3">
                  <img
                    src={userImage || "https://via.placeholder.com/150"}
                    alt="Display Picture"
                    className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded-full"
                  />
                  <div className="flex flex-col">
                    {firstName !== null ? (
                      <span className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-1">
                        {firstName} {lastName}
                      </span>
                    ) : (
                      <span className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-1">
                        {userName}
                      </span>
                    )}
                    <span className="text-[10px] sm:text-xs text-gray-500 line-clamp-1">
                      {userEmail}
                    </span>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-gray-200" />
                <DropdownMenuItem
                  className="gap-2 text-xs sm:text-sm cursor-pointer focus:bg-gray-100 px-3 sm:px-4 py-2"
                  onClick={handleProfileClick}
                >
                  <VscAccount className="text-base sm:text-lg" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2 text-xs sm:text-sm cursor-pointer focus:bg-gray-100 px-3 sm:px-4 py-2"
                  onClick={handleLogout}
                >
                  <IoLogOutOutline className="text-base sm:text-lg" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-10 h-10 border border-tertiary rounded-full flex items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <img
                src={userImage || "https://via.placeholder.com/150"}
                alt="Menu"
                className="w-full h-full object-cover rounded-full"
              />
            </button>
          </div>
        </div>
      </div>
      <div
        className={`fixed top-0 right-0 h-full w-3/5  max-w-[300px] bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        } md:hidden`}
      >
        <div className="flex justify-end p-3 sm:p-4">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <IoCloseOutline size={32} />
          </button>
        </div>
        <div className="flex flex-col p-3 sm:p-4 gap-3">
          <div className="flex items-center gap-2 sm:gap-3 pb-3 sm:pb-4 border-b border-gray-200">
            <img
              src={userImage || "https://via.placeholder.com/150"}
              alt="Display Picture"
              className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-full"
            />
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-medium text-gray-900 line-clamp-1">
                {firstName} {lastName}
              </span>
              <span className="text-xs sm:text-sm text-gray-500 line-clamp-1">
                {userEmail}
              </span>
            </div>
          </div>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`block text-sm sm:text-base py-2 px-3 rounded hover:bg-gray-100 transition-colors ${
                isActive(link.to) ? "text-secondary font-bold" : "text-gray-800"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {/* Add this for mobile - will only show for tutor role (role === "2") */}
          {role === "2" && (
            <div className="md:hidden">
              <GoogleAuthButton />
            </div>
          )}
          <DropdownMenuSeparator className="bg-gray-200 mt-36" />
          <Link
            to={`${basePath}/myprofile`}
            className="flex items-center gap-2 text-sm sm:text-base py-2 px-3 rounded text-gray-800 hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <VscAccount className="text-base sm:text-xl" />
            <span>Profile</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm sm:text-base py-2 px-3 rounded text-gray-800 hover:bg-gray-100 transition-colors w-full text-left"
          >
            <IoLogOutOutline className="text-base sm:text-xl" />
            <span>Logout</span>
          </button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0  z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </nav>
  );
}

// OLD NAVBAR CODE IS KEPT HERE FOR REFERENCE

// import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
// import { Input } from "@/components/ui/input";
// import { VscAccount } from "react-icons/vsc";
// import { IoLogOutOutline } from "react-icons/io5";
// import { IoMdNotificationsOutline } from "react-icons/io";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import image from "@/assets/images/dummy.jpg";
// import { useState, useEffect } from "react";

// const SearchIcon = () => {
//   return (
//     <svg
//       width="17"
//       height="17"
//       viewBox="0 0 17 17"
//       fill="none"
//       xmlns="http://www.w3.org/2000/svg"
//     >
//       <g clipPath="url(#clip0_1452_723)">
//         <path
//           d="M6.96587 13.3735C8.39596 13.3735 9.78517 12.8964 10.9134 12.0176L15.1699 16.2741C15.4879 16.5812 15.9946 16.5724 16.3017 16.2544C16.6012 15.9442 16.6012 15.4525 16.3017 15.1424L12.0452 10.8858C14.2258 8.07881 13.718 4.03555 10.9109 1.85494C8.10392 -0.325664 4.06069 0.182124 1.88009 2.98915C-0.300517 5.79618 0.20727 9.83944 3.0143 12.02C4.14439 12.898 5.53484 13.3742 6.96587 13.3735ZM3.5458 3.51819C5.43467 1.62928 8.49713 1.62925 10.386 3.51812C12.2749 5.40699 12.275 8.46945 10.3861 10.3584C8.49724 12.2473 5.43477 12.2473 3.54587 10.3584C1.65693 8.48325 1.6458 5.43195 3.52091 3.54308L3.5458 3.51819Z"
//           fill="#1E1E1E"
//         />
//       </g>
//       <defs>
//         <clipPath id="clip0_1452_723">
//           <rect
//             width="16"
//             height="16"
//             fill="white"
//             transform="translate(0.526367 0.5)"
//           />
//         </clipPath>
//       </defs>
//     </svg>
//   );
// };

// export default function Navbar() {
//   const navigate = useNavigate();
//   const routerState = useRouterState();
//   const [openDropdown, setOpenDropdown] = useState(false);
//   const [role, setRole] = useState<string | null>(null);
//   const userEmail = localStorage.getItem("user_email");
//   const userImage = localStorage.getItem("user_image");
//   const token = localStorage.getItem("token");
//   const firstName = localStorage.getItem("first_name");
//   const lastName = localStorage.getItem("last_name");

//   useEffect(() => {
//     const storedRole = localStorage.getItem("role");
//     setRole(storedRole);
//   }, []);

//   const basePath = role === "2" ? "/tutor" : "";
//   const dashboardPath = role === "2" ? "/tutor" : "/";

//   const currentPath = routerState.location.pathname;

//   const isActive = (path: string) => {
//     if (path === dashboardPath && currentPath === dashboardPath) {
//       return true;
//     }

//     if (path !== dashboardPath) {
//       return currentPath === path || (currentPath.startsWith(path) && (currentPath === path || currentPath[path.length] === '/'));
//     }

//     return false;
//   };

//   const handleProfileClick = () => {
//     setOpenDropdown(false);
//     navigate({ to: `${basePath}/myprofile` });
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("role");
//     localStorage.removeItem("user_name");
//     localStorage.removeItem("user_email");
//     localStorage.removeItem("user_image");
//     navigate({ to: "/login", replace: true });
//   };

//   if (!token) {
//     return null;
//   }

//   return (
//     <nav className="w-full h-18 bg-white shadow">
//       <div className="flex items-center justify-between gap-4 container mx-auto p-2">
//         <Link to="/" className="w-[10%]">
//           <img
//             src="https://cefonlineacademy.com/uploads/setting/1735290064-THrvPmL1tU.png"
//             alt=""
//             className="w-full h-14 object-contain"
//           />
//         </Link>
//         <div className="flex w-[55%] items-center justify-start gap-6 container mx-auto p-2">
//           <Link
//             to={dashboardPath}
//             className={`navbar-link ${isActive(dashboardPath) ? "!text-secondary !font-bold" : ""}`}
//           >
//             Dashboard
//           </Link>

//           {role === "2" ? ( // Tutor Links
//             <>
//               <Link
//                 to={`${basePath}/mycourses`}
//                 className={`navbar-link ${isActive(`${basePath}/mycourses`) ? "!text-secondary !font-bold" : ""}`}
//               >
//                 My Courses
//               </Link>
//               <Link
//                 to={`${basePath}/ClassSchedule`}
//                 className={`navbar-link ${isActive(`${basePath}/ClassSchedule`) ? "!text-secondary !font-bold" : ""}`}
//               >
//                 Class Schedule
//               </Link>
//               <Link
//                 to={`${basePath}/ClassHistory`}
//                 className={`navbar-link ${isActive(`${basePath}/ClassHistory`) ? "!text-secondary !font-bold" : ""}`}
//               >
//                 Class History
//               </Link>
//               <Link to="/tutor/Discussion" className="navbar-link">
//                 Discussions
//               </Link>
//             </>
//           ) : (
//             // Student Links (default if role is not "2")
//             <>
//               <Link
//                 to={`/mycourses`}
//                 className={`navbar-link ${isActive('/mycourses') ? "!text-secondary !font-bold" : ""}`}
//               >
//                 My Courses
//               </Link>
//               <Link
//                 to={`/ClassSchedule`}
//                 className={`navbar-link ${isActive('/ClassSchedule') ? "!text-secondary !font-bold" : ""}`}
//               >
//                 Class Schedule
//               </Link>
//               <Link
//                 to={`/ClassHistory`}
//                 className={`navbar-link ${isActive('/ClassHistory') ? "!text-secondary !font-bold" : ""}`}
//               >
//                 Class History
//               </Link>
//               <Link
//                 to={`/myproducts`}
//                 className={`navbar-link ${isActive('/myproducts') ? "!text-secondary !font-bold" : ""}`}
//               >
//                 My Products
//               </Link>
//               <Link
//                 to={`/billing`}
//                 className={`navbar-link ${isActive('/billing') ? "!text-secondary !font-bold" : ""}`}
//               >
//                 Billing
//               </Link>
//             </>
//           )}
//         </div>
//         <div className="flex w-[30%] items-center justify-between">
//           <div className="flex w-[74%] items-center justify-end">
//             <div className="relative w-full">
//               <Input type="search" placeholder="Search" className="search" />
//               <div className="absolute right-3 top-1/2 -translate-y-1/2">
//                 <SearchIcon />
//               </div>
//             </div>
//           </div>
//           <div className="flex w-[10%] items-center justify-center">
//             <DropdownMenu>
//               <DropdownMenuTrigger className="w-[2.5rem] h-[2.5rem] border border-tertiary rounded-full p-2 flex items-center justify-center cursor-pointer">
//                 <IoMdNotificationsOutline size={24} />
//               </DropdownMenuTrigger>
//               <DropdownMenuContent className="w-[360px] p-0 shadow-lg mr-10 bg-white overflow-hidden">
//                 <div className="p-4 text-lg font-semibold">Notifications</div>

//                 {/* April 18 Section */}
//                 <div className="px-4 py-2 text-xs text-gray-500 font-medium">
//                   April 18, 2025
//                 </div>
//                 <div className="space-y-2 px-4 pb-2">
//                   <div className="flex items-start gap-3">
//                     <img
//                       src={image}
//                       alt="User"
//                       className="w-9 h-9 rounded-full"
//                     />
//                     <div className="flex-1 text-sm">
//                       <span className="font-medium">Muhammad Ibrahim</span>{" "}
//                       started new online class
//                       <div className="text-xs text-gray-500 mt-0.5">
//                         12:15 pm
//                       </div>
//                     </div>
//                     <div className="mt-1">
//                       <span className="w-2 h-2 bg-[#013370] rounded-full block"></span>
//                     </div>
//                   </div>

//                   <div className="flex items-start gap-3">
//                     <img
//                       src={image}
//                       alt="User"
//                       className="w-9 h-9 rounded-full"
//                     />
//                     <div className="flex-1 text-sm">
//                       You purchased new course
//                       <div className="text-xs text-gray-500 mt-0.5">
//                         11:10 am
//                       </div>
//                     </div>
//                     <div className="mt-1">
//                       <span className="w-2 h-2 bg-[#013370] rounded-full block"></span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* April 17 Section */}
//                 <div className="px-4 py-2 text-xs text-gray-500 font-medium">
//                   April 17, 2025
//                 </div>
//                 <div className="space-y-2 px-4 pb-4">
//                   <div className="flex items-start gap-3">
//                     <img
//                       src={image}
//                       alt="User"
//                       className="w-9 h-9 rounded-full"
//                     />
//                     <div className="flex-1 text-sm">
//                       <span className="font-medium">Hafiza Sarah</span> started
//                       new online class
//                       <div className="text-xs text-gray-500 mt-0.5">
//                         12:15 pm
//                       </div>
//                     </div>
//                     <div className="mt-1">
//                       <span className="w-2 h-2 bg-gray-300 rounded-full block"></span>
//                     </div>
//                   </div>

//                   <div className="flex items-start gap-3">
//                     <img
//                       src={image}
//                       alt="User"
//                       className="w-9 h-9 rounded-full"
//                     />
//                     <div className="flex-1 text-sm">
//                       You paid April invoice
//                       <div className="text-xs text-gray-500 mt-0.5">
//                         11:10 am
//                       </div>
//                     </div>
//                     <div className="mt-1">
//                       <span className="w-2 h-2 bg-gray-300 rounded-full block"></span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="border-t border-gray-400 p-3">
//                   <button className="w-full bg-[#013370] text-white items-start text-sm font-medium py-2 rounded-md hover:bg-[#013370]/90">
//                     Mark all as read
//                   </button>
//                 </div>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>

//           <div className="flex w-[10%] items-center justify-center">
//             <DropdownMenu open={openDropdown} onOpenChange={setOpenDropdown}>
//               <DropdownMenuTrigger className="w-[2.5rem] h-[2.5rem] border border-tertiary rounded-full flex items-center justify-center cursor-pointer">
//                 <img
//                   src={userImage ? userImage : ""}
//                   alt="Display Picture"
//                   className="w-full h-full object-cover rounded-full"
//                 />
//               </DropdownMenuTrigger>
//               <DropdownMenuContent className="w-60 bg-white border-0 mr-4">
//                 <div className="flex items-center gap-3 px-4 py-3">
//                   <img
//                     src={userImage ? userImage : ""}
//                     alt="Display Picture"
//                     className="w-10 h-10 object-contain"
//                   />
//                   <div className="flex flex-col">
//                     <span className="text-sm font-medium text-gray-900">
//                       {firstName} {lastName}
//                     </span>
//                     <span className="text-xs text-gray-500">{userEmail}</span>
//                   </div>
//                 </div>

//                 <DropdownMenuSeparator className="bg-gray-200" />

//                 <DropdownMenuItem
//                   className="gap-2 text-sm cursor-pointer"
//                   onClick={handleProfileClick}
//                 >
//                   <VscAccount className="text-lg" />
//                   <span>Profile</span>
//                 </DropdownMenuItem>

//                 <DropdownMenuItem className="gap-2 text-sm cursor-pointer">
//                   <IoLogOutOutline className="text-lg" />
//                   <span onClick={handleLogout}>Logout</span>
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// }
