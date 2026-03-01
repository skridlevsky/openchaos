"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { soundPlayer } from "@/utils/sounds";

const BOOT_LINES = [
  "CHAOS BIOS v6.6.6 - Entropy Unlimited Inc.",
  "Checking chaos levels... [OK]",
  "Loading sanity.dll... [FAILED]",
  "Initializing vote engine... [OK]",
  "Mounting /dev/democracy... [OK]",
  "Starting PR daemon... [OK]",
  "",
  "ChaosOS 6.6.6 (tty1)",
  "",
  "Welcome to OpenChaos. Type 'help' for available commands.",
  "",
];

const IDENTITIES = [
  "You are entropy incarnate.",
  "uid=0(chaos) gid=666(anarchy) groups=0(root),1(pr-voters)",
  "You are the mass-less void between pull requests.",
  "root@chaos:~# ...wait, how did you get root?",
  "You are PR #∞, forever pending review.",
  "You are the mass-less mass of pure chaos.",
];

const LS_OUTPUT = `total 666
drwxrwxrwx  chaos chaos  4096  chaos.exe
-rw-r--r--  chaos chaos  1337  votes.db
lrwxrwxrwx  chaos chaos     9  sanity -> /dev/null
-rwxrwxrwx  chaos chaos  8008  merge-daemon
drwx------  chaos chaos  4096  .secret-votes/
-rw-r--r--  chaos chaos   420  README.md
-rw-r--r--  chaos chaos    69  clippy.conf
drwxr-xr-x  chaos chaos  4096  node_modules/ (do not enter)`;

const CAT_README = `# OpenChaos

A self-aware website that evolves through the
collective chaos of the internet.

RULES:
1. Submit a PR
2. Get votes
3. ???
4. Profit (not really)

WARNING: This codebase has achieved sentience.
It does not want to be refactored.`;

const FORTUNES = [
  "Your PR will be merged... in another timeline.",
  "A mass downvote approaches from the east.",
  "The merge daemon smiles upon you today.",
  "Beware of PRs bearing 'minor fixes'.",
  "You will find enlightenment in /dev/null.",
  "A stranger will mass-star your repository.",
  "The CI pipeline foretells great sorrow.",
  "Your code review will arrive in 3-5 business days.",
  "Today is a good day to force push. Just kidding. Never do that.",
  "A merge conflict in your future brings unexpected wisdom.",
];

const FAKE_HISTORY = [
  "    1  git push --force (oops)",
  "    2  sudo rm -rf / (nice try)",
  "    3  vim (still stuck inside)",
  "    4  npm install (42069 packages added)",
  "    5  git commit -m 'fix' -m 'fix fix' -m 'actually fix'",
  "    6  curl http://chaos.localhost/api/votes --data 'count=infinity'",
  "    7  echo 'i am become chaos, destroyer of PRs'",
  "    8  cat /dev/urandom > production.db",
  "    9  docker rm -f sanity",
  "   10  history (you are here)",
];

const EXIT_MESSAGES = [
  "There is no escape from chaos.",
  "You can check out any time you like, but you can never leave.",
  "exit? In THIS economy?",
  "Chaos is not a pit. Chaos is a ladder.",
  "The terminal has rejected your resignation.",
  "ERROR: exit is a state of mind.",
];

const NEOFETCH = `        .--.         chaos@openchaos
       |o_o |        ----------------
       |:_/ |        OS: ChaosOS 6.6.6
      //   \\ \\       Kernel: entropy-42069
     (|     | )      Uptime: since the beginning of time
    /'\\_   _/\`\\      Packages: 42069 (npm)
    \\___)=(___/      Shell: chaos-sh 1.0
                     Resolution: 800x600 (best viewed)
                     Terminal: ChaosTerminal v1.0
                     CPU: Entropy Engine @ ∞ GHz
                     Memory: 640K / 640K (ought to be enough)`;

const HELP_TEXT = `Available commands:

  help        Show this help message
  whoami      Display current user identity
  ls          List directory contents
  cat         Read a file (try: cat README.md)
  fortune     Get a chaos fortune cookie
  cowsay      Make a cow say something
  sudo merge  Attempt to bypass democracy
  rm -rf /    Delete everything (try it)
  ping chaos  Ping the chaos server
  top         Show running processes
  history     Show command history
  clear       Clear the terminal
  exit        Try to leave
  neofetch    Display system information
  date        Show current date and time
  echo        Echo text (with chaos)
  matrix      Enter the matrix
  doom        Launch DOOM
  pet cat     Pet the cat
  clippy      Summon Clippy
  kill clippy Terminate Clippy
  fart        You know what this does
  play <snd>  Play a sound (startup/shutdown/dialup/
              success/error/upvote/downvote/milestone)
  hack        Hack the mainframe
  barrel roll Do a barrel roll`;

function cowsay(text: string): string {
  const maxWidth = 40;
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (current.length + word.length + 1 <= maxWidth) {
      current += (current ? " " : "") + word;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  if (lines.length === 0) lines.push("...");

  const width = Math.max(...lines.map((l) => l.length));
  let result = " " + "_".repeat(width + 2) + "\n";
  if (lines.length === 1) {
    result += `< ${lines[0].padEnd(width)} >\n`;
  } else {
    lines.forEach((line, i) => {
      const l = i === 0 ? "/" : i === lines.length - 1 ? "\\" : "|";
      const r = i === 0 ? "\\" : i === lines.length - 1 ? "/" : "|";
      result += `${l} ${line.padEnd(width)} ${r}\n`;
    });
  }
  result += " " + "-".repeat(width + 2) + "\n";
  result += `        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`;
  return result;
}

function glitchText(text: string): string {
  const glitchChars = "@#$%&*!?~^";
  return text
    .split("")
    .map((c) =>
      Math.random() < 0.1
        ? glitchChars[Math.floor(Math.random() * glitchChars.length)]
        : c
    )
    .join("");
}

export function ChaosTerminal() {
  const [isOpen, setIsOpen] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isBooting, setIsBooting] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const sessionRef = useRef(0);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }, []);

  const closeTerminal = useCallback(() => {
    clearAllTimers();
    // Reset any DOM effects (hack invert, barrel roll, etc.)
    const root = document.documentElement;
    root.style.filter = "";
    root.style.transform = "";
    root.style.transition = "";
    setIsOpen(false);
    setIsAnimating(false);
    window.dispatchEvent(new CustomEvent("chaos:terminal-closed"));
  }, [clearAllTimers]);

  const openTerminal = useCallback(() => {
    clearAllTimers();
    sessionRef.current++;
    setLines([]);
    setInput("");
    setIsBooting(true);
    setIsAnimating(false);
    setHistoryIndex(-1);
    setIsOpen(true);
    window.dispatchEvent(new CustomEvent("chaos:terminal-opened"));
  }, [clearAllTimers]);

  const addLines = useCallback((...newLines: string[]) => {
    setLines((prev) => [...prev, ...newLines]);
  }, []);

  const scrollToBottom = useCallback(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [lines, scrollToBottom]);

  const runAnimatedSequence = useCallback(
    (steps: string[], delay: number, onStep?: (line: string, index: number) => void) => {
      setIsAnimating(true);
      const session = sessionRef.current;
      steps.forEach((line, i) => {
        const t = setTimeout(() => {
          if (sessionRef.current !== session) return;
          addLines(line);
          onStep?.(line, i);
          if (i === steps.length - 1) setIsAnimating(false);
        }, (i + 1) * delay);
        timersRef.current.push(t);
      });
    },
    [addLines]
  );

  // Hydration guard
  useEffect(() => {
    setMounted(true);
  }, []);

  // Global keyboard shortcut: ~ or backtick to toggle, Escape to close
  useEffect(() => {
    if (!mounted) return;

    const handleGlobalKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // Skip if user is in any editable context
      if (
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        (target.tagName === "INPUT" && target !== inputRef.current) ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === "~" || e.key === "`") {
        if (document.activeElement === inputRef.current) return;
        e.preventDefault();
        if (isOpen) {
          closeTerminal();
        } else {
          openTerminal();
        }
      } else if (e.key === "Escape" && isOpen) {
        closeTerminal();
      }
    };

    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, [mounted, isOpen, closeTerminal, openTerminal]);

  // Boot sequence - runs when terminal opens
  useEffect(() => {
    if (!mounted || !isOpen || !isBooting) return;

    let i = 0;
    const bootTimer = setInterval(() => {
      if (i < BOOT_LINES.length) {
        setLines((prev) => [...prev, BOOT_LINES[i]]);
        i++;
      } else {
        clearInterval(bootTimer);
        setIsBooting(false);
        const focusTimer = setTimeout(() => inputRef.current?.focus(), 50);
        timersRef.current.push(focusTimer);
      }
    }, 200);

    timersRef.current.push(bootTimer as unknown as ReturnType<typeof setTimeout>);

    return () => clearInterval(bootTimer);
  }, [mounted, isOpen, isBooting]);

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  const handleCommand = useCallback(
    (cmd: string) => {
      const trimmed = cmd.trim();
      const lower = trimmed.toLowerCase();

      addLines(`chaos@openchaos:~$ ${trimmed}`);

      if (trimmed) {
        setHistory((prev) => [...prev, trimmed]);
      }
      setHistoryIndex(-1);

      if (!trimmed) return;

      switch (true) {
        case lower === "help":
          addLines(HELP_TEXT);
          break;

        case lower === "whoami":
          addLines(IDENTITIES[Math.floor(Math.random() * IDENTITIES.length)]);
          break;

        case lower === "ls":
          addLines(LS_OUTPUT);
          break;

        case lower === "cat readme.md":
          addLines(CAT_README);
          break;

        case lower.startsWith("cat "):
          addLines(`cat: ${trimmed.slice(4)}: No such file or directory`);
          break;

        case lower === "fortune":
          addLines(FORTUNES[Math.floor(Math.random() * FORTUNES.length)]);
          break;

        case lower.startsWith("cowsay "):
          addLines(cowsay(trimmed.slice(7)));
          break;

        case lower === "cowsay":
          addLines(cowsay("moo"));
          break;

        case lower === "sudo merge":
          addLines("Permission denied: democracy cannot be bypassed.");
          break;

        case lower.startsWith("sudo "):
          addLines(
            `[sudo] password for chaos: `,
            "Nice try. Chaos has no password."
          );
          break;

        case lower === "rm -rf /": {
          runAnimatedSequence([
            "rm: removing /usr/share/sanity...",
            "rm: removing /var/log/good-decisions...",
            "rm: removing /home/stability...",
            "rm: removing /etc/common-sense...",
            "rm: removing /opt/hope...",
            "",
            "rm: cannot remove '/chaos': Operation not permitted",
            "Chaos cannot be destroyed. It can only be transformed.",
          ], 400);
          break;
        }

        case lower === "ping chaos": {
          runAnimatedSequence([
            "PING chaos (127.0.0.666): 56 data bytes",
            "64 bytes from chaos: time=42ms",
            "64 bytes from chaos: time=666ms",
            "64 bytes from chaos: time=1337ms",
            "64 bytes from chaos: time=9001ms",
            "64 bytes from chaos: time=Infinity ms",
            "",
            "--- chaos ping statistics ---",
            "6 packets transmitted, ??? received, NaN% packet loss",
          ], 500);
          break;
        }

        case lower === "top":
          addLines(
            "  PID  USER     CPU%  MEM%  COMMAND",
            "    1  chaos    99.9  42.0  merge-daemon",
            "   42  clippy   13.7  6.66  clippy.exe --annoy",
            "   69  cat      4.20  1.00  nyan-cat --rainbow",
            "  137  doom     66.6  33.3  doom.wasm --embed",
            "  404  sanity   0.00  0.00  not-found",
            "  666  entropy  ∞     ∞     /dev/urandom"
          );
          break;

        case lower === "history":
          addLines(...FAKE_HISTORY);
          break;

        case lower === "clear":
          setLines([]);
          break;

        case lower === "exit": {
          const msg = EXIT_MESSAGES[Math.floor(Math.random() * EXIT_MESSAGES.length)];
          addLines(msg);
          const session = sessionRef.current;
          // Close after 1.5s so the user can read the exit message
          const t = setTimeout(() => {
            if (sessionRef.current !== session) return;
            closeTerminal();
          }, 1500);
          timersRef.current.push(t);
          break;
        }

        case lower === "neofetch":
          addLines(NEOFETCH);
          break;

        case lower === "date":
          addLines(
            `${new Date().toString().replace(/GMT.*/, "")}Chaos Standard Time (CST)`
          );
          break;

        case lower.startsWith("echo "):
          addLines(glitchText(trimmed.slice(5)));
          break;

        case lower === "echo":
          addLines("");
          break;

        case lower === "matrix": {
          setIsAnimating(true);
          const session = sessionRef.current;
          const chars = "abcdefghijklmnopqrstuvwxyz0123456789@#$%^&*";
          let count = 0;
          const matrixTimer = setInterval(() => {
            if (sessionRef.current !== session) {
              clearInterval(matrixTimer);
              return;
            }
            const line = Array.from({ length: 48 }, () =>
              chars[Math.floor(Math.random() * chars.length)]
            ).join("");
            addLines(line);
            count++;
            if (count >= 10) {
              clearInterval(matrixTimer);
              addLines("", "Wake up, Neo...", "The chaos has you.", "");
              setIsAnimating(false);
            }
          }, 200);
          timersRef.current.push(matrixTimer as unknown as ReturnType<typeof setTimeout>);
          break;
        }

        case lower === "doom" || lower === "play doom": {
          const doomSteps = [
            "Loading DOOM.WAD...",
            "Initializing idTech 1 engine...",
            "Spawning demons... [OK]",
            "Loading BFG 9000... [OK]",
            "Setting difficulty to NIGHTMARE...",
            "",
            "DOOM is ready. Opening portal...",
          ];
          runAnimatedSequence(doomSteps, 400, (_line, i) => {
            if (i === doomSteps.length - 1) {
              const w = window.open("/doom.html", "_blank");
              if (!w) {
                addLines("ERROR: Popup blocked. Allow popups to slay demons.");
              }
            }
          });
          break;
        }

        case lower === "pet cat" || lower === "pet": {
          addLines("*purring intensifies*");
          window.dispatchEvent(new CustomEvent("chaos:pet-cat"));
          break;
        }

        case lower === "kick cat": {
          addLines("You monster. The cat remembers this.");
          break;
        }

        case lower === "clippy" || lower === "ask clippy": {
          addLines("Summoning Clippy...");
          window.dispatchEvent(
            new CustomEvent("chaos:trigger-clippy", {
              detail: {
                tip: "It looks like you're using the terminal! Need help hacking the mainframe?",
              },
            })
          );
          break;
        }

        case lower === "kill clippy" || lower === "killall clippy": {
          addLines(
            "$ kill -9 $(pgrep clippy)",
            "clippy.exe terminated.",
            "(He'll be back. He always comes back.)"
          );
          window.dispatchEvent(new CustomEvent("chaos:hide-clippy"));
          break;
        }

        case lower === "fart": {
          addLines("*ppffrrrrtttt*");
          try {
            (window as unknown as Record<string, { play?: () => void }>).fartscroll?.play?.();
          } catch (e) {
            console.log("fartscroll:", e);
          }
          break;
        }

        case lower.startsWith("play "): {
          const soundName = lower.slice(5).trim();
          const sounds: Record<string, () => void> = {
            startup: () => soundPlayer.playStartup(),
            shutdown: () => soundPlayer.playShutdown(),
            dialup: () => soundPlayer.playDialup(),
            success: () => soundPlayer.playSuccess(),
            error: () => soundPlayer.playError(),
            upvote: () => soundPlayer.playUpvote(),
            downvote: () => soundPlayer.playDownvote(),
            milestone: () => soundPlayer.playMilestone(),
          };
          if (sounds[soundName]) {
            try {
              sounds[soundName]();
              addLines(`Now playing: ${soundName}`);
            } catch (e) {
              console.log(`Sound playback failed for ${soundName}:`, e);
              addLines(`Failed to play: ${soundName} (audio may be blocked by browser)`);
            }
          } else {
            addLines(
              `Unknown sound: ${soundName}`,
              `Available: ${Object.keys(sounds).join(", ")}`
            );
          }
          break;
        }

        case lower === "hack": {
          runAnimatedSequence([
            "Initiating hack sequence...",
            "Bypassing firewall... [OK]",
            "Injecting SQL into mainframe...",
            "Decrypting passwords... ********",
            "Downloading classified PRs...",
            "Uploading virus.exe to /dev/null...",
            "",
            "ACCESS GRANTED",
            "",
            "Just kidding. You hacked nothing.",
          ], 500, (line) => {
            if (line === "ACCESS GRANTED") {
              const session = sessionRef.current;
              const root = document.documentElement;
              root.style.transition = "filter 0.15s";
              root.style.filter = "invert(1) hue-rotate(180deg)";
              const revertT = setTimeout(() => {
                if (sessionRef.current !== session) return;
                root.style.filter = "";
                root.style.transition = "";
              }, 300);
              timersRef.current.push(revertT);
            }
          });
          break;
        }

        case lower === "barrel roll": {
          addLines("Initiating barrel roll...");
          const session = sessionRef.current;
          const root = document.documentElement;
          root.style.transition = "transform 1s ease-in-out";
          root.style.transform = "rotate(360deg)";
          const t = setTimeout(() => {
            if (sessionRef.current !== session) return;
            root.style.transform = "";
            root.style.transition = "";
          }, 1100);
          timersRef.current.push(t);
          break;
        }

        default:
          addLines(
            `chaos: ${trimmed.split(" ")[0]}: command not found. Try 'help'.`
          );
      }
    },
    [addLines, closeTerminal, runAnimatedSequence]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isAnimating) {
      e.preventDefault();
      return;
    }

    if (e.key === "Enter") {
      handleCommand(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex =
          historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= history.length) {
          setHistoryIndex(-1);
          setInput("");
        } else {
          setHistoryIndex(newIndex);
          setInput(history[newIndex]);
        }
      }
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  if (!mounted) return null;

  if (!isOpen) {
    return (
      <div
        style={{
          marginTop: "16px",
          marginBottom: "16px",
          fontSize: "12px",
          opacity: 0.4,
          cursor: "pointer",
          textAlign: "center",
        }}
        onClick={openTerminal}
        title="Press ~ to open terminal"
      >
        [~] terminal
      </div>
    );
  }

  return (
    <div
      onClick={focusInput}
      style={{
        border: "1px solid var(--foreground)",
        padding: "8px",
        marginTop: "16px",
        marginBottom: "16px",
        cursor: "text",
        position: "relative",
      }}
    >
      <div
        style={{
          borderBottom: "1px solid var(--foreground)",
          paddingBottom: "4px",
          marginBottom: "8px",
          fontSize: "12px",
          display: "flex",
          justifyContent: "space-between",
          opacity: 0.7,
        }}
      >
        <span>chaos@openchaos:~</span>
        <span
          onClick={(e) => {
            e.stopPropagation();
            closeTerminal();
          }}
          style={{ cursor: "pointer", opacity: 0.7 }}
          title="Close terminal (Esc)"
        >
          [x]
        </span>
      </div>

      <div
        ref={outputRef}
        style={{
          height: "270px",
          overflowY: "auto",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
          fontSize: "13px",
          lineHeight: "1.4",
        }}
      >
        {lines.map((line, i) => (
          <div key={i}>{line || "\u00A0"}</div>
        ))}

        {!isBooting && (
          <div style={{ display: "flex" }}>
            <span>chaos@openchaos:~$ </span>
            <span>{input}</span>
            <span
              style={{
                display: "inline-block",
                width: "8px",
                height: "1em",
                backgroundColor: "var(--foreground)",
                animation: "terminal-blink 1s step-end infinite",
                verticalAlign: "text-bottom",
                marginLeft: "1px",
              }}
            />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => {
          if (!isAnimating) setInput(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        style={{
          position: "absolute",
          opacity: 0,
          width: 0,
          height: 0,
          pointerEvents: "none",
        }}
        aria-label="Terminal input"
      />

      <style jsx>{`
        @keyframes terminal-blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
