"use client";

import { useRef, useEffect, useState } from "react";
interface RadioStation {
  id: string;
  name: string;
  logo: string;
}

const STATIONS: RadioStation[] = [
  { id: "afro_beat", name: "International Funk 99", logo: "/build/games/assets/afro_beat-DG46T5pG.png" },
  { id: "babylon", name: "Tuff Gong Radio", logo: "/build/games/assets/babylon-DFPNbeje.png" },
  { id: "the_vibe", name: "The Vibe 98.8", logo: "/build/games/assets/the_vibe-8G0n8AgW.png" },
  { id: "liberty_rock", name: "Liberty Rock Radio 97.8", logo: "/build/games/assets/liberty_rock-_KkSFRMc.png" },
  { id: "jazz_nation", name: "Jazz Nation Radio 108.5", logo: "/build/games/assets/jazz_nation-xihCJ2LH.png" },
  { id: "bobby_konders", name: "Massive B Soundsystem 96.9", logo: "/build/games/assets/bobby_konders-BakHYsXc.png" },
  { id: "meditation", name: "Self Actualization FM", logo: "/build/games/assets/meditation-BFYAG2d3.png" },
  { id: "k109_the_studio", name: "K109 The Studio", logo: "/build/games/assets/k109_the_studio-jSHMlYLJ.png" },
  { id: "vcfm", name: "Vice City FM", logo: "/build/games/assets/vcfm-C2GwzKEn.png" },
  { id: "wktt", name: "We Know The Truth", logo: "/build/games/assets/wktt-DXPQ0n7t.png" },
  { id: "hardcore", name: "Liberty City Hardcore", logo: "/build/games/assets/hardcore-DX5ZNchq.png" },
  { id: "classical_ambient", name: "The Journey", logo: "/build/games/assets/classical_ambient-IIXQZhsa.png" },
  { id: "fusion_fm", name: "Fusion FM", logo: "/build/games/assets/fusion_fm-Be5GtpDw.png" },
  { id: "beat_95", name: "The Beat 102.7", logo: "/build/games/assets/beat_95-Vka9ahZu.png" },
  { id: "ramjamfm", name: "Ram Jam FM", logo: "/build/games/assets/ramjamfm-Bd4L2rme.png" },
  { id: "dance_rock", name: "Radio Broker", logo: "/build/games/assets/dance_rock-DWpXjK7P.png" },
  { id: "vladivostok", name: "Vladivostok FM", logo: "/build/games/assets/vladivostok-BkOA1X3o.png" },
  { id: "plr", name: "Public Liberty Radio", logo: "/build/games/assets/plr-chB_Uny6.png" },
  { id: "san_juan_sounds", name: "San Juan Sounds", logo: "/build/games/assets/san_juan_sounds-YeApARPs.png" },
  { id: "dance_mix", name: "Electro Choc", logo: "/build/games/assets/dance_mix-DSnkVSVs.png" },
  { id: "ny_classics", name: "The Classics 104.1", logo: "/build/games/assets/ny_classics-DOFK-p55.png" },
  { id: "lazlow", name: "Integrity 2.0", logo: "/build/games/assets/lazlow-CVZww43x.png" },
];

interface MidiPlayerProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function MidiPlayer({ isOpen: isOpenProp, onClose }: MidiPlayerProps = {}) {
  // support either prop-driven open state or an internal one
  const [internalIsOpen, setInternalIsOpen] = useState(true);
  const isOpen = typeof isOpenProp === "boolean" ? isOpenProp : internalIsOpen;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStationIndex, setCurrentStationIndex] = useState(0);
  const [alignment, setAlignment] = useState<"left" | "right">("left");
  const audioRef = useRef<HTMLAudioElement>(null);
  const shouldAutoPlayRef = useRef(false);

  const currentStation = STATIONS[currentStationIndex];
  const audioUrl = `https://audio.gtaradio.net/4/${currentStation.id}`;

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("openchaos:radio-layout", {
        detail: {
          side: alignment,
          isCollapsed,
          isOpen,
        },
      })
    );
  }, [alignment, isCollapsed, isOpen]);

  // Default to collapsed on smaller screens so the radio doesn't take up all space
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const mq = window.matchMedia("(max-width: 640px)");
        if (mq.matches) {
          setIsCollapsed(true);
        }
      } catch (e) {
        // ignore if matchMedia not available
      }
    }
  }, []);

  const changeStation = (index: number) => {
    shouldAutoPlayRef.current = isPlaying;
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setCurrentStationIndex(index);
  };

  const nextStation = () => {
    changeStation((currentStationIndex + 1) % STATIONS.length);
  };

  const previousStation = () => {
    changeStation((currentStationIndex - 1 + STATIONS.length) % STATIONS.length);
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        setIsLoading(false);
      } else {
        setIsLoading(true);
        // Only set src if it's not already set for this station
        if (audioRef.current.src !== audioUrl) {
          audioRef.current.src = audioUrl;
        }
        audioRef.current.play().catch((error) => {
          console.error("Playback failed:", error);
          setIsLoading(false);
        });
      }
    }
  };

  const stopMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Set up event listeners (only once)
    const handleEnded = () => {
      setIsPlaying(false);
      setIsLoading(false);
    };
    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };
    const handleError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      console.error("Audio error");
    };
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("error", handleError);
    
    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("error", handleError);
    };
  }, []);

  // Handle station changes with auto-play
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !shouldAutoPlayRef.current) return;

    shouldAutoPlayRef.current = false;
    audio.src = audioUrl;
    
    // Use a microtask to defer state update
    Promise.resolve().then(() => {
      setIsLoading(true);
      audio.play().catch((error) => {
        console.error("Playback failed:", error);
        setIsLoading(false);
      });
    });
  }, [currentStationIndex, audioUrl]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={`gta-radio-container gta-radio-${alignment} ${isCollapsed ? "gta-radio-collapsed" : ""}`}
      data-chaos-side={alignment}
      data-collapsed={isCollapsed ? "true" : "false"}
    >
      <div className="gta-radio-overlay">
        <div className="gta-radio-header">
          <span className="gta-radio-title">RADIO</span>
            <div className="gta-radio-header-buttons">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="gta-radio-header-btn"
              title={isCollapsed ? "Expand" : "Collapse"}
            >
              {isCollapsed ? "□" : "−"}
            </button>
            <button
              onClick={() => setAlignment(alignment === "right" ? "left" : "right")}
              className="gta-radio-header-btn"
              title="Move to other side"
            >
              ↔
            </button>
            <button
              onClick={() => {
                stopMusic();
                if (onClose) onClose();
                else setInternalIsOpen(false);
              }}
              className="gta-radio-close-btn"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <>
            <div className="gta-radio-display">
              <div className="gta-radio-logo-container">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://gtaradio.net${currentStation.logo}`}
                  alt={currentStation.name}
                  className="gta-radio-logo"
                />
              </div>
              <div className="gta-radio-info">
                <div className="gta-radio-station-name">{currentStation.name}</div>
                <div className="gta-radio-status">
                  {isLoading ? (
                    <span className="gta-radio-loading">
                      <span className="gta-radio-equalizer">
                        <span></span>
                        <span></span>
                        <span></span>
                      </span>
                      LOADING...
                    </span>
                  ) : isPlaying ? (
                    <span className="gta-radio-playing">
                      <span className="gta-radio-equalizer">
                        <span></span>
                        <span></span>
                        <span></span>
                      </span>
                      NOW PLAYING
                    </span>
                  ) : (
                    <span className="gta-radio-stopped">STOPPED</span>
                  )}
                </div>
              </div>
            </div>

            <div className="gta-radio-controls">
              <button
                onClick={previousStation}
                className="gta-radio-control-btn gta-radio-nav-btn"
                title="Previous Station"
              >
                ◀ PREV
              </button>
              <button
                onClick={togglePlay}
                className="gta-radio-control-btn gta-radio-play-btn"
              >
                {isPlaying ? "⏸ PAUSE" : "▶ PLAY"}
              </button>
              <button
                onClick={stopMusic}
                className="gta-radio-control-btn gta-radio-stop-btn"
              >
                ⏹ STOP
              </button>
              <button
                onClick={nextStation}
                className="gta-radio-control-btn gta-radio-nav-btn"
                title="Next Station"
              >
                NEXT ▶
              </button>
            </div>

            <div className="gta-radio-station-list">
              <div className="gta-radio-list-label">STATION</div>
              <div className="gta-radio-list-items">
                {STATIONS.map((station, index) => (
                  <button
                    key={station.id}
                    onClick={() => changeStation(index)}
                    className={`gta-radio-list-item ${
                      index === currentStationIndex ? "active" : ""
                    }`}
                  >
                    {station.name}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <audio ref={audioRef} crossOrigin="anonymous" />
    </div>
  );
}
