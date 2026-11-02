import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/api/useAuth";
import { baseUrl } from "@/config/authConfig";
import { Button } from "../ui/button";

const GoogleAuthButton = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    const checkAuthorization = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}instructor/check_authorization`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setIsAuthorized(response.data.isGoogleAuthorized);
      } catch (error) {
        console.error("Error checking authorization status:", error);
        // If there's an error, assume not authorized to show the button
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthorization();
  }, [token]); // Added token as dependency

  const handleAuthClick = async () => {
    try {
      const response = await axios.get(`${baseUrl}instructor/meet-redirect`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Store current path to return after authorization
      localStorage.setItem("preAuthPath", window.location.pathname);
      window.location.href = response.data.auth_url;
    } catch (error) {
      console.error("Error getting auth URL:", error);
      // Optional: Add user notification about the error
    }
  };

  // Don't show anything while loading or if authorized
  if (isLoading || isAuthorized) return null;

  return (
    <Button
      onClick={handleAuthClick}
      variant="primary"
      className="text-xs  gap-2"
      disabled={!token}
    >
      Authorize with Google
    </Button>
  );
};

export default GoogleAuthButton;
