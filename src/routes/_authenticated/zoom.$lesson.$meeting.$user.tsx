import { createFileRoute, useParams } from '@tanstack/react-router'
import { useEffect } from 'react';
import { baseUrl } from "@/config/authConfig";
import { useAuth } from "@/api/useAuth";
import uitoolkit from "@zoom/videosdk-ui-toolkit";
import { useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_authenticated/zoom/$lesson/$meeting/$user',
)({
  component: RouteComponent,
})

interface ZoomStartClassResponse {
  sdkKey: string;
  session_name: string;
  [key: string]: unknown;
}

interface ZoomTokenResponse {
  signature: string;
  [key: string]: unknown;
}

function RouteComponent() {
  const { lesson, meeting, user } = useParams({ from: '/_authenticated/zoom/$lesson/$meeting/$user' });
  const userName = localStorage.getItem('user_name');
  const { token } = useAuth();
  const navigate = useNavigate();

  const sessionClosed = () => {
    console.log("session closed");
    document.getElementById('zoom-ui-toolkit-root')?.remove();
    uitoolkit.destroy();
    navigate({ to: '/' });
  };

  const sessionDestroyed = () => {
    console.log("session destroyed");
    document.getElementById('zoom-ui-toolkit-root')?.remove();
    uitoolkit.destroy();
    navigate({ to: '/' });
  };

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/src/css/videosdk-ui-toolkit.css'; // or use Vite alias if needed
    link.id = 'zoom-css';
    document.head.appendChild(link);
    // Hide navigation bar
    const navbar = document.querySelector('nav');
    if (navbar) {
      navbar.style.display = 'none';
    }

    return () => {
      document.getElementById('zoom-css')?.remove();
      const navbar = document.querySelector('nav');
      if (navbar) {
        navbar.style.display = 'block';
      }
    };
  }, []);

  const startClass = async () => {
    try {
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);

      const formdata = new FormData();
      formdata.append("lesson_id", lesson);
      formdata.append("meeting_id", meeting);
      formdata.append("user_id", user);

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: formdata,
        redirect: "follow" as RequestRedirect
      };

      const response = await fetch(`${baseUrl}student/start-zoom-class`, requestOptions);
      const result: ZoomStartClassResponse = await response.json();

      console.log("Zoom start class response:", result);

      if (!result.sdkKey) {
        console.error("SDK Key missing from response:", result);
        return;
      }

      // Ensure SDK key is properly formatted (trim any whitespace)
      const sdkKey = result.sdkKey.trim();
      console.log("Using SDK Key:", sdkKey);

      const myHeaders2 = new Headers();
      myHeaders2.append("Authorization", `Bearer ${token}`);

      const formdata2 = new FormData();
      formdata2.append("sdk_key", sdkKey);
      formdata2.append("sessionName", result.session_name);

      const requestOptions2 = {
        method: "POST",
        headers: myHeaders2,
        body: formdata2,
        redirect: "follow" as RequestRedirect
      };

      const tokenResponse = await fetch(`${baseUrl}student/generate_zoom_token`, requestOptions2);
      const result2: ZoomTokenResponse = await tokenResponse.json();

      console.log("Zoom token response:", result2);

      if (!result2.signature) {
        console.error("Signature missing from token response:", result2);
        return;
      }

      const config = {
        videoSDKJWT: result2.signature,          // this is your actual JWT
        sessionName: result.session_name,        // dynamic session name
        userName: userName,                // you can make this dynamic
        role_type: 0,
        features: ['video', 'audio', 'settings', 'users', 'chat', 'share'],
        options: {
          init: {
            'enforceMultipleVideos': true,
            // 'enforceVirtualBackground' : true,
          },
          audio: {
            'backgroundNoiseSuppression': true,
            'mute': true,
            // 'speakerOnly':true
          },
          video: {
            'virtualBackground': true,
            'originalRatio': true,
          },
        },
        featuresOptions: {
          preview: {
            enable: true,
          },
          virtualBackground: {
            enable: true,
            virtualBackgrounds: [
              {
                url: "https://images.unsplash.com/photo-1715490187538-30a365fa05bd?q=80&w=1945&auto=format&fit=crop",
              },
            ],
          },
        },
      };

      try {
        const sessionContainer = document.getElementById('sessionContainer');
        if (sessionContainer) {
          console.log("Joining Zoom with config:", config);

          uitoolkit.joinSession(sessionContainer, config as any);
          sessionContainer && uitoolkit.onSessionClosed(sessionClosed);
          uitoolkit.onSessionDestroyed(sessionDestroyed)
        } else {
          console.error("Session container not found");
        }
      } catch (err) {
        console.error("Error while joining Zoom session", err);
      }

    } catch (error) {
      console.error("Error in Zoom meeting setup:", error);
    }
  }

  useEffect(() => {
    console.log(lesson, meeting, user);
    if (lesson && meeting && user) {
      startClass();
    }
  }, [])

  return (
    <div id="sessionContainer"></div>
  )
}
