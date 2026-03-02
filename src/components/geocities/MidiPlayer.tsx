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

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const mq = window.matchMedia("(max-width: 640px)");
        if (mq.matches) {
          setIsCollapsed(true);
        }
      } catch {
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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !shouldAutoPlayRef.current) return;

    shouldAutoPlayRef.current = false;
    audio.src = audioUrl;

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
      className={`gta-radio-container midi-player-container gta-radio-${alignment}`}
      data-chaos-side={alignment}
      data-collapsed={isCollapsed ? "true" : "false"}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <table className="midi-player-table" cellPadding={0} cellSpacing={0}>
        <tbody>
          <tr>
            <td className="midi-player-header">
              <span className="midi-player-header-text">&#9835; TUNES &#9835;</span>
              <span className="midi-player-header-buttons">
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="midi-player-control-button"
                  title={isCollapsed ? "Expand" : "Collapse"}
                >
                  {isCollapsed ? "\u25A1" : "\u2212"}
                </button>
                <button
                  onClick={() => setAlignment(a => a === "right" ? "left" : "right")}
                  className="midi-player-control-button"
                  title="Move to other side"
                >
                  &#8596;
                </button>
                <button
                  onClick={() => {
                    stopMusic();
                    if (onClose) onClose();
                    else setInternalIsOpen(false);
                  }}
                  className="midi-player-close-button"
                  title="Close"
                >
                  &#10005;
                </button>
              </span>
            </td>
          </tr>
          {!isCollapsed && (
            <>
              <tr>
                <td className="midi-player-display">
                  <div className="midi-player-display-text">
                    {isLoading
                      ? "~ LOADING... ~"
                      : isPlaying
                        ? "\u266B NOW PLAYING \u266B"
                        : "~ STOPPED ~"}
                  </div>
                  <div className="midi-player-filename">
                    {currentStation.name}
                  </div>
                </td>
              </tr>
              <tr>
                <td className="midi-player-controls">
                  <button onClick={previousStation} className="midi-player-control-button">
                    &#9664; Prev
                  </button>
                  <button onClick={togglePlay} className="midi-player-control-button">
                    {isPlaying ? "\u23F8 Pause" : "\u25B6 Play"}
                  </button>
                  <button onClick={stopMusic} className="midi-player-control-button">
                    &#9209; Stop
                  </button>
                  <button onClick={nextStation} className="midi-player-control-button">
                    Next &#9654;
                  </button>
                </td>
              </tr>
              <tr>
                <td className="midi-player-station-list">
                  <div className="midi-player-station-list-label">&#9733; STATIONS &#9733;</div>
                  <div className="midi-player-station-list-items">
                    {STATIONS.map((station, index) => (
                      <button
                        key={station.id}
                        onClick={() => changeStation(index)}
                        className={`midi-player-station-item ${
                          index === currentStationIndex ? "active" : ""
                        }`}
                      >
                        {station.name}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            </>
          )}
        </tbody>
      </table>

      <audio ref={audioRef} crossOrigin="anonymous" />
    </div>
  );
}
