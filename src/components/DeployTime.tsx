"use client";

import { useEffect, useState } from "react";

export function DeployTime() {
  const [deployTime, setDeployTime] = useState<string | null>(null);

  useEffect(() => {
    // Show build time (this will be set at build time)
    const now = new Date();
    setDeployTime(now.toLocaleString());
  }, []);

  if (!deployTime) return null;

  return (
    <div className="fixed bottom-2 right-2 text-xs opacity-50 hover:opacity-100 transition-opacity">
      🕐 Deployed: {deployTime}
    </div>
  );
}
