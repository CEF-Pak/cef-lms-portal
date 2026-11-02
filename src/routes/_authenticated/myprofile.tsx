import { createFileRoute } from "@tanstack/react-router";
import Banner from "@/components/banner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Select from "react-select";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/api/useAuth";
import { baseUrl } from "@/config/authConfig";
import { Loader2 } from "lucide-react";

/** Full URL from API, data URL from preview, or absolute path from legacy storage — never a bare filename. */
function resolveProfileImageSrc(stored: string | null | undefined): string {
  const s = stored?.trim() ?? "";
  if (!s) return "";
  if (s.startsWith("data:") || /^https?:\/\//i.test(s)) return s;
  const origin = baseUrl.replace(/\/?api\/?$/i, "").replace(/\/$/, "");
  if (s.startsWith("/")) return `${origin}${s}`;
  if (s.includes("/")) return `${origin}/${s.replace(/^\//, "")}`;
  return "";
}

export const Route = createFileRoute("/_authenticated/myprofile")({
  component: RouteComponent,
});

type OptionType = {
  value: string;
  label: string;
};

function RouteComponent() {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [biography, setBiography] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [countryList, setCountryList] = useState<OptionType[]>([]);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const [addressLoading, setAddressLoading] = useState<boolean>(false);
  const [postalCode, setPostalCode] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [passwordLoading, setPasswordLoading] = useState<boolean>(false);
  const [profileMsg, setProfileMsg] = useState<string>("");
  const [addressMsg, setAddressMsg] = useState<string>("");
  const [passwordMsg, setPasswordMsg] = useState<string>("");
  const [imageError, setImageError] = useState<string>("");
  const { token } = useAuth();

  /** Read all profile fields from localStorage into form state. */
  const syncFormFromLocalStorage = () => {
    setFirstName(localStorage.getItem("first_name") || "");
    setLastName(localStorage.getItem("last_name") || "");
    setEmail(localStorage.getItem("user_email") || "");
    setPhone(localStorage.getItem("user_phone") || "");
    setGender(localStorage.getItem("gender") || "");
    setCountry(localStorage.getItem("country_id") || "");
    setAddress(localStorage.getItem("address") || "");
    setPostalCode(localStorage.getItem("postal_code") || "");
    setBiography(localStorage.getItem("biography") || "");
    const img = localStorage.getItem("user_image");
    const resolved = resolveProfileImageSrc(img);
    if (resolved) setPreviewImage(resolved);
  };

  // Populate form from localStorage on mount
  useEffect(() => {
    syncFormFromLocalStorage();
  }, []);

  // When the navbar's /me fetch completes it dispatches this event — refresh form fields from the now-populated localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onHydrated = () => syncFormFromLocalStorage();
    window.addEventListener("cef-user-details-hydrated", onHydrated);
    return () => window.removeEventListener("cef-user-details-hydrated", onHydrated);
  }, []);

  // When we have token but no user details in localStorage (e.g. landed via hash with no profile), fetch /api/me ourselves
  useEffect(() => {
    if (!token || typeof window === "undefined") return;
    if (localStorage.getItem("first_name") || localStorage.getItem("user_name")) return;
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
        const resolvedImg =
          resolveProfileImageSrc(u.image_url) || (u.image_url as string) || "";
        localStorage.setItem("user_image", resolvedImg);
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
        syncFormFromLocalStorage();
        window.dispatchEvent(new CustomEvent("cef-user-details-hydrated"));
      })
      .catch((err) => {
        console.warn("[CEF] myprofile /me fetch failed", err?.status ?? err);
      });
  }, [token]);

  const genderOptions: OptionType[] = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Others", label: "Others" },
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageError("");
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setPreviewImage(null);
    setImageError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const displayImage =
    previewImage ||
    resolveProfileImageSrc(localStorage.getItem("user_image")) ||
    "";

  const handleUpdateProfile = () => {
    setProfileLoading(true);
    setProfileMsg("");

    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    const formdata = new FormData();
    if (firstName) formdata.append("first_name", firstName);
    if (lastName) formdata.append("last_name", lastName);
    if (email) formdata.append("email", email);
    if (phone) formdata.append("phone_number", phone);
    if (gender) formdata.append("gender", gender);
    if (biography) formdata.append("about_me", biography);

    const file = fileInputRef.current?.files?.[0];
    if (file) {
      formdata.append("image", file, file.name);
    }
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow" as RequestRedirect,
    };

    fetch(`${baseUrl}student/update-profile`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        setProfileLoading(false);
        if (firstName) {
          localStorage.setItem("first_name", firstName);
        }
        if (lastName) {
          localStorage.setItem("last_name", lastName);
        }
        if (email) {
          localStorage.setItem("user_email", email);
        }
        if (phone) {
          localStorage.setItem("user_phone", phone);
        }
        if (gender) {
          localStorage.setItem("gender", gender);
        }
        if (biography) {
          localStorage.setItem("biography", biography);
        }

        if (result.status === 0 && result.error) {
          if (result.error.image && Array.isArray(result.error.image)) {
            setImageError(result.error.image[0]);
          } else if (typeof result.error === "string") {
            setProfileMsg(result.error);
          } else {
            setProfileMsg("An error occurred while updating your profile");
          }
        } else {
          if (typeof result.image_url === "string" && result.image_url) {
            localStorage.setItem("user_image", result.image_url);
            setPreviewImage(result.image_url);
            if (file) {
              window.dispatchEvent(
                new CustomEvent("cef-profile-image-updated", {
                  detail: { image_url: result.image_url },
                })
              );
            }
          }
          if (fileInputRef.current) fileInputRef.current.value = "";
          setProfileMsg(result.message || "Profile updated successfully");
        }
      })
      .catch((error) => {
        console.error(error);
        setProfileLoading(false);
        setProfileMsg(
          error.message || "An error occurred while updating your profile"
        );
      });
  };

  const handleUpdateAddress = () => {
    setAddressLoading(true);
    setAddressMsg("");

    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    const formdata = new FormData();
    formdata.append("country_id", country);
    formdata.append("postal_code", postalCode);
    formdata.append("address", address);

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow" as RequestRedirect,
    };

    fetch(`${baseUrl}student/update-address-location`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        setAddressLoading(false);
        if (country) {
          localStorage.setItem("country_id", country);
        }
        if (postalCode) {
          localStorage.setItem("postal_code", postalCode);
        }
        if (address) {
          localStorage.setItem("address", address);
        }
        if (result.status === 0 && result.error) {
          if (typeof result.error === "string") {
            setAddressMsg(result.error);
          } else {
            setAddressMsg("An error occurred while updating your address");
          }
        } else {
          setAddressMsg(result.message || "Address updated successfully");
        }
      })
      .catch((error) => {
        console.error(error);
        setAddressLoading(false);
        setAddressMsg(
          error.message || "An error occurred while updating your address"
        );
      });
  };

  const handleUpdatePassword = () => {
    setPasswordLoading(true);
    setPasswordMsg("");

    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    const formdata = new FormData();
    formdata.append("old_password", oldPassword);
    formdata.append("new_password", newPassword);

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow" as RequestRedirect,
    };

    fetch(`${baseUrl}student/update-password`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        setPasswordLoading(false);

        if (result.status === 0 && result.error) {
          if (typeof result.error === "string") {
            setPasswordMsg(result.error);
          } else {
            setPasswordMsg("An error occurred while updating your password");
          }
        } else {
          setPasswordMsg(result.message || "Password updated successfully");
          setOldPassword("");
          setNewPassword("");
        }
      })
      .catch((error) => {
        console.error(error);
        setPasswordLoading(false);
        setPasswordMsg(error.message);
      });
  };

  useEffect(() => {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow" as RequestRedirect,
    };

    fetch(`${baseUrl}student/update-address-location`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        if (result.data.country && typeof result.data.country === "object") {
          const countryOptions = Object.entries(result.data.country).map(
            ([id, name]) => ({
              value: id,
              label: name as string,
            })
          );
          setCountryList(countryOptions);
        }
      })
      .catch((error) => console.error(error));
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 container mx-auto">
      {" "}
      {/* Adjusted padding */}
      <Banner />
      {/* Profile Header */}
      <div className="flex items-center gap-4 relative">
        <div className="relative group w-14 h-14 sm:w-16 sm:h-16">
          {" "}
          {/* Adjusted image size */}
          <img
            src={displayImage}
            alt="Profile"
            className="w-full h-full rounded-full object-cover transition duration-300 ease-in-out"
          />
          {!previewImage && (
            <div
              className="absolute bottom-0 right-0 bg-[#013370] rounded-full p-1 cursor-pointer shadow-md hover:bg-[#01234d] transition-colors duration-200"
              onClick={triggerFileInput}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z"></path>
              </svg>
            </div>
          )}
          {previewImage && (
            <div
              className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 rounded-full flex items-center justify-center transition duration-300 ease-in-out cursor-pointer"
              onClick={removeImage}
            >
              <span className="text-white font-semibold text-xs sm:text-sm opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out">
                Remove
              </span>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
        </div>

        <div>
          <p className="text-base sm:text-lg font-semibold">
            {firstName} {lastName}
          </p>{" "}
          {/* Adjusted text size */}
          <p className="text-xs sm:text-sm text-gray-500">{email}</p>{" "}
          {/* Adjusted text size */}
        </div>
      </div>
      {imageError && (
        <div
          className="bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm px-4 py-2 rounded relative w-full sm:w-max"
          role="alert"
        >
          {" "}
          {/* Adjusted text size and width */}
          <span className="block sm:inline">{imageError}</span>
        </div>
      )}
      {/* Account Settings */}
      <div className="space-y-4 flex flex-col">
        <h2 className="text-base sm:text-lg font-bold">Account Settings</h2>{" "}
        {/* Adjusted text size */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
          {" "}
          {/* Changed to flex-col for mobile */}
          <div className="flex flex-col w-full sm:w-[19.3%]">
            {" "}
            {/* Full width on mobile */}
            <label className="text-xs sm:text-sm font-medium">
              First Name
            </label>{" "}
            {/* Adjusted text size */}
            <Input
              placeholder={""}
              type="text"
              onChange={(e) => setFirstName(e.target.value)}
              value={firstName}
            />
          </div>
          <div className="flex flex-col w-full sm:w-[19.3%]">
            <label className="text-xs sm:text-sm font-medium">Last Name</label>
            <Input
              placeholder={""}
              type="text"
              onChange={(e) => setLastName(e.target.value)}
              value={lastName}
            />
          </div>
          <div className="flex flex-col w-full sm:w-[19.3%]">
            <label className="text-xs sm:text-sm font-medium">Email</label>
            <Input
              placeholder={email || ""}
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </div>
          <div className="flex flex-col w-full sm:w-[19.3%]">
            <label className="text-xs sm:text-sm font-medium">
              Phone Number
            </label>
            <PhoneInput
              country={"pk"}
              enableSearch={true}
              inputStyle={{
                width: "100%",
                height: "36px",
                borderRadius: "0.375rem",
                borderColor: "#d1d5db",
                paddingLeft: "48px",
                marginTop: "0.5rem !important",
              }}
              buttonStyle={{
                borderTopLeftRadius: "0.375rem",
                borderBottomLeftRadius: "0.375rem",
              }}
              onChange={(phone) => setPhone(phone)}
              value={phone}
            />
          </div>
          <div className="flex flex-col w-full sm:w-[19.3%]">
            <label className="text-xs sm:text-sm font-medium">Gender</label>
            <Select<OptionType>
              options={genderOptions}
              onChange={(selectedOption) => {
                if (selectedOption) {
                  setGender(selectedOption.value);
                }
              }}
              value={genderOptions.find((option) => option.value === gender)}
            />
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <label className="text-xs sm:text-sm font-semibold">Biography</label>
          <Textarea
            placeholder="Write a short bio about yourself..."
            className="min-h-[100px] sm:text-sm"
            onChange={(e) => setBiography(e.target.value)}
            value={biography}
          />
        </div>
        {profileMsg && (
          <div
            className={`${profileMsg.toLowerCase().includes("success") ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"} px-4 py-3 rounded relative text-xs sm:text-sm`}
            role="alert"
          >
            {" "}
            {/* Adjusted text size */}
            <span className="block sm:inline">{profileMsg}</span>
          </div>
        )}
        <button
          onClick={handleUpdateProfile}
          className="bg-[#013370] ms-auto text-white px-4 py-2 text-xs sm:text-sm rounded-md cursor-pointer"
          disabled={profileLoading}
        >
          {" "}
          {/* Adjusted text size */}
          {profileLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Update Profile"
          )}
        </button>
      </div>
      <hr className="text-gray-300" />
      <div className="flex flex-col gap-6 mt-6 sm:mt-8">
        {" "}
        {/* Changed to flex-col for mobile */}
        <div className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold">
            Address Information
          </h2>{" "}
          {/* Adjusted text size */}
          <form
            action=""
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateAddress();
            }}
            className="flex flex-col"
          >
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
              {" "}
              {/* Changed to flex-col for mobile */}
              <div className="flex flex-col w-full sm:w-[49%]">
                {" "}
                {/* Full width on mobile */}
                <label className="text-xs sm:text-sm font-medium">
                  Country
                </label>{" "}
                {/* Adjusted text size */}
                <Select<OptionType>
                  options={countryList}
                  onChange={(selectedOption) => {
                    if (selectedOption) {
                      setCountry(selectedOption.value);
                    }
                  }}
                  value={countryList.find((option) => option.value === country)}
                  required
                />
              </div>
              <div className="flex flex-col w-full sm:w-[49%]">
                <label className="text-xs sm:text-sm font-medium">
                  Postal Code
                </label>
                <Input
                  placeholder={""}
                  type="text"
                  onChange={(e) => setPostalCode(e.target.value)}
                  value={postalCode}
                  required
                />
              </div>
              <div className="flex flex-col w-full">
                <label className="text-xs sm:text-sm font-medium">
                  Address
                </label>
                <Textarea
                  placeholder="Enter your address..."
                  className="min-h-[100px] text-xs sm:text-sm"
                  onChange={(e) => setAddress(e.target.value)}
                  value={address}
                  required
                />
              </div>
            </div>
            {addressMsg && (
              <div
                className={`${addressMsg.toLowerCase().includes("success") ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"} px-4 py-3 rounded relative mt-4 text-xs sm:text-sm`}
                role="alert"
              >
                {" "}
                {/* Adjusted text size */}
                <span className="block sm:inline">{addressMsg}</span>
              </div>
            )}
            <button
              type="submit"
              className="bg-[#013370] ms-auto text-white px-4 py-2 text-xs sm:text-sm rounded-md cursor-pointer mt-4 sm:mt-6 mb-4"
              disabled={addressLoading}
            >
              {" "}
              {/* Adjusted text size and margin */}
              {addressLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Update Address"
              )}
            </button>
          </form>
        </div>
        <div className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold">Password Settings</h2>{" "}
          {/* Adjusted text size */}
          <form
            action=""
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdatePassword();
            }}
            className="flex flex-col"
          >
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
              {" "}
              {/* Changed to flex-col for mobile */}
              <div className="flex flex-col w-full sm:w-[49%]">
                {" "}
                {/* Full width on mobile */}
                <label className="text-xs sm:text-sm font-medium">
                  Old Password
                </label>{" "}
                {/* Adjusted text size */}
                <Input
                  placeholder={""}
                  type="password"
                  onChange={(e) => setOldPassword(e.target.value)}
                  value={oldPassword}
                  required
                />
              </div>
              <div className="flex flex-col w-full sm:w-[49%]">
                <label className="text-xs sm:text-sm font-medium">
                  New Password
                </label>
                <Input
                  placeholder={""}
                  type="password"
                  onChange={(e) => setNewPassword(e.target.value)}
                  value={newPassword}
                  required
                />
              </div>
            </div>
            {passwordMsg && (
              <div
                className={`${passwordMsg.toLowerCase().includes("success") ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"} px-4 py-3 rounded relative mt-4 text-xs sm:text-sm`}
                role="alert"
              >
                {" "}
                {/* Adjusted text size */}
                <span className="block sm:inline">{passwordMsg}</span>
              </div>
            )}
            <button
              type="submit"
              className="bg-[#013370] ms-auto text-white px-4 py-2 text-xs sm:text-sm rounded-md cursor-pointer mt-4 sm:mt-6"
              disabled={passwordLoading}
            >
              {" "}
              {/* Adjusted text size and margin */}
              {passwordLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
