"use client";

import { useState, useEffect, useRef } from "react";

export function TreeGame() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [keySequence, setKeySequence] = useState("");
  const lastToggleTime = useRef(0);

  // Handle "w-i-n" key sequence to toggle debug overlay
  useEffect(() => {
    // console.log("TreeGame effect mounted. isOpen:", isOpen, "showDebug:", showDebug);
    if (!isOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // console.log("Key pressed:", e.key);
      setKeySequence((prev) => {
        const newSequence = (prev + e.key.toLowerCase()).slice(-3);
        // console.log("Key sequence:", newSequence);
        
        if (newSequence === "win") {
          const now = Date.now();
          // Prevent double-toggling within 100ms
          if (now - lastToggleTime.current < 100) {
            // console.log("Ignoring duplicate win sequence");
            return "";
          }
          lastToggleTime.current = now;
          
          // console.log("Toggling debug overlay");
          setShowDebug((prevDebug) => {
            const newDebug = !prevDebug;
            // console.log("showDebug toggled to:", newDebug);
            return newDebug;
          });
          return "";
        }
        
        return newSequence;
      });
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isOpen]);

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate percentage position for responsiveness
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;
    
    // Winning zone: tiny section in upper-left quadrant
    if (xPercent >= 17 && xPercent <= 18.25 && yPercent >= 22 && yPercent <= 23.25) {
      alert("YOU WON! Click OK to enter your banking account information.");
    } else {
      alert("Sorry, try again!");
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="tree-game-button"
      >
        <b><span className="spin-horizontal">💲</span> Win Cash Now! <span className="spin-horizontal">💲</span></b>
      </button>

      {isOpen && (
        <div className="tree-game-overlay" onClick={() => setIsOpen(false)}>
          <div className="tree-game-modal" onClick={(e) => e.stopPropagation()}>
            <table width="100%" border={3} cellPadding={0} cellSpacing={0} className="tree-game-table">
              <tbody>
                <tr>
                  <td className="tree-game-header">
                    <span className="tree-game-header-text">
                      <b><span className="blink-text">💰 WIN $1 MILLION! 💰</span></b>
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="tree-game-instructions">
                    <span className="tree-game-instructions-text">
                      <b>FIND AND CLICK THE RIGHT LEAF TO WIN $1 MILLION!</b>
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="tree-game-image-container">
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img 
                        src="/tree.png" 
                        alt="Tree with leaves - find and click the winning leaf to win $1 million"
                        className="tree-game-image"
                        onClick={handleImageClick}
                        onError={(e) => {
                          e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23ccffcc'/%3E%3Ctext x='200' y='200' text-anchor='middle' font-family='Comic Sans MS' font-size='20' fill='%23ff0000'%3EImage failed to load!%3C/text%3E%3C/svg%3E";
                          e.currentTarget.style.cursor = 'default';
                        }}
                        style={{ cursor: 'pointer', maxWidth: '100%', display: 'block' }}
                      />
                      {/* Winning zone overlay - Type "w-i-n" to toggle */}
                      {showDebug && (
                        <>
                        {/* console.log("Rendering debug overlay!") */}
                        <div 
                          style={{
                            position: 'absolute',
                            left: '17%',
                            top: '22%',
                            width: '1.25%',
                            height: '1.25%',
                            backgroundColor: 'rgba(0, 255, 0, 0.3)',
                            border: '2px solid lime',
                            pointerEvents: 'none'
                          }}
                          title="Winning zone (17-18.25% x, 22-23.25% y)"
                        />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="tree-game-footer">
                    <button 
                      onClick={() => setIsOpen(false)}
                      className="tree-game-close-button"
                    >
                      <b>[X] CLOSE</b>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
