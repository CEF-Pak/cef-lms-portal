import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import Banner from "@/components/banner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Select from "react-select";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { baseUrl } from "@/config/authConfig";
import { useAuth } from "@/api/useAuth";

export const Route = createFileRoute("/_authenticated/tutor/myprofile")({
  component: RouteComponent,
});

function RouteComponent() {
  const { token } = useAuth();
  const [userName, setUserName] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("user_name") : null
  );
  const [userEmail, setUserEmail] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("user_email") : null
  );
  const [userImage, setUserImage] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("user_image") : null
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onHydrated = () => {
      setUserName(localStorage.getItem("user_name"));
      setUserEmail(localStorage.getItem("user_email"));
      setUserImage(localStorage.getItem("user_image"));
    };
    window.addEventListener("cef-user-details-hydrated", onHydrated);
    return () => window.removeEventListener("cef-user-details-hydrated", onHydrated);
  }, []);

  // When we have token but no user details, fetch /api/me and populate localStorage
  useEffect(() => {
    if (!token || typeof window === "undefined" || localStorage.getItem("user_name")) return;
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
        if (data.role != null) localStorage.setItem("role", String(data.role));
        setUserName(u.name ?? null);
        setUserEmail(u.email ?? null);
        setUserImage(u.image_url ?? null);
        window.dispatchEvent(new CustomEvent("cef-user-details-hydrated"));
      })
      .catch(() => {});
  }, [token]);

  const countryOptions = [
    { value: "pakistan", label: "Pakistan" },
    { value: "usa", label: "USA" },
    { value: "uk", label: "UK" },
    { value: "india", label: "India" },
    { value: "canada", label: "Canada" },
    { value: "australia", label: "Australia" },
    { value: "germany", label: "Germany" },
    { value: "france", label: "France" },
    { value: "brazil", label: "Brazil" },
    { value: "china", label: "China" },
    { value: "japan", label: "Japan" },
    { value: "south_korea", label: "South Korea" },
    { value: "italy", label: "Italy" },
    { value: "spain", label: "Spain" },
    { value: "mexico", label: "Mexico" },
    { value: "russia", label: "Russia" },
    { value: "south_africa", label: "South Africa" },
    { value: "argentina", label: "Argentina" },
    { value: "netherlands", label: "Netherlands" },
    { value: "sweden", label: "Sweden" },
    { value: "switzerland", label: "Switzerland" },
    { value: "belgium", label: "Belgium" },
    { value: "norway", label: "Norway" },
    { value: "finland", label: "Finland" },
    { value: "denmark", label: "Denmark" },
    { value: "poland", label: "Poland" },
    { value: "turkey", label: "Turkey" },
    { value: "saudi_arabia", label: "Saudi Arabia" },
    { value: "uae", label: "UAE" },
    { value: "egypt", label: "Egypt" },
    { value: "indonesia", label: "Indonesia" },
    { value: "thailand", label: "Thailand" },
    { value: "malaysia", label: "Malaysia" },
    { value: "philippines", label: "Philippines" },
    { value: "singapore", label: "Singapore" },
    { value: "vietnam", label: "Vietnam" },
    { value: "bangladesh", label: "Bangladesh" },
    { value: "new_zealand", label: "New Zealand" },
    { value: "south_korea", label: "South Korea" },
  ];

  return (
    <div className="p-4 space-y-8 container mx-auto">
      <Banner />

      {/* Profile Header */}
      <div className="flex items-center gap-4 relative">
        <div className="relative group w-16 h-16">
          <img
            src={userImage ? userImage : ""}
            alt="Profile"
            className="w-16 h-16 rounded-full object-cover transition duration-300 ease-in-out"
          />

          {/* Image Overlay */}
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 rounded-full flex items-center justify-center transition duration-300 ease-in-out">
            <span className="text-white font-semibold text-sm opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out">
              Remove
            </span>
          </div>
        </div>

        <div>
          <p className="text-lg font-semibold">{userName}</p>
          <p className="text-sm text-gray-500">{userEmail}</p>
        </div>
      </div>

      {/* Account Settings */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Account Settings</h2>

        <div className="flex flex-wrap gap-6">
          <div className="flex flex-col w-full lg:w-70">
            <label className="text-sm font-medium">Full Name</label>
            <Input placeholder={userName || ""} />
          </div>

          <div className="flex flex-col w-full lg:w-70">
            <label className="text-sm font-medium">Email</label>
            <Input placeholder={userEmail || ""} className="text-gray-500" />
          </div>

          <div className="flex flex-col w-full lg:w-70">
            <label className="text-sm font-medium">Phone Number</label>
            <PhoneInput
              country={"pk"} // Default country
              enableSearch={false}
              inputStyle={{
                width: "100%",
                height: "38px",
                borderRadius: "0.375rem",
                borderColor: "#d1d5db",
                paddingLeft: "48px",
              }}
              buttonStyle={{
                borderTopLeftRadius: "0.375rem",
                borderBottomLeftRadius: "0.375rem",
              }}
            />
          </div>

          <div className="flex flex-col w-full lg:w-70">
            <label className="text-sm font-medium">Country</label>
            <Select options={countryOptions} />
          </div>
        </div>
      </div>

      {/* Biography */}
      <div className="space-y-2">
        <h2 className="text-lg font-bold">Biography</h2>
        <Textarea
          placeholder="Write a short bio about yourself..."
          className="min-h-[120px]"
        />
      </div>

      {/* Password Settings */}
      <div className="space-y-2">
        <h2 className="text-lg font-bold">Password Settings</h2>
        <label className="text-sm font-medium">Password</label>
        <div className="relative w-full lg:w-70">
          <Input type="password" value="************" disabled />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#013370] font-medium hover:underline">
            Change
          </button>
        </div>
      </div>

      {/* Update Button */}
      <button className="bg-[#013370] text-white px-4 py-2 text-sm rounded-md mt-4 w-full lg:w-auto">
        Update Profile
      </button>
    </div>
  );
}
