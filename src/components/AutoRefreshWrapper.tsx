"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface AutoRefreshWrapperProps {
  children: React.ReactNode;
  intervalMs?: number;
}

export function AutoRefreshWrapper({
  children,
  intervalMs = 300000, // Default: 5 minutes (matches server cache)
}: AutoRefreshWrapperProps) {
  const router = useRouter();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Function to refresh the data
    const refresh = () => {
      router.refresh();
    };

    // Handle visibility change
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;

      if (isVisible) {
        // Tab became visible - refresh immediately
        refresh();

        // Restart polling if it was cleared
        if (!intervalRef.current) {
          intervalRef.current = setInterval(refresh, intervalMs);
        }
      } else {
        // Tab became hidden - stop polling to save resources
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };

    // Set up visibility change listener
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Start polling if tab is visible
    if (!document.hidden) {
      intervalRef.current = setInterval(refresh, intervalMs);
    }

    // Cleanup
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [router, intervalMs]);

  return <>{children}</>;
}
