"use client";

import { useState } from "react";

export function Web2DiggCounter() {
  const [dugg, setDugg] = useState(false);
  const [count, setCount] = useState(1337);

  const handleDigg = () => {
    if (!dugg) {
      setCount(count + 1);
      setDugg(true);
    } else {
      setCount(count - 1);
      setDugg(false);
    }
  };

  return (
    <div className="web2-widget">
      <div className="web2-widget-header">Community Score</div>
      <div className="web2-widget-body">
        <button
          className={`digg-counter ${dugg ? "digg-counter-dugg" : ""}`}
          onClick={handleDigg}
        >
          <div className="digg-counter-count">{count}</div>
          <div className="digg-counter-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4l-8 8h5v8h6v-8h5z" />
            </svg>
          </div>
          <div className="digg-counter-label">
            {dugg ? "dugg!" : "digg it"}
          </div>
        </button>
      </div>
    </div>
  );
}
