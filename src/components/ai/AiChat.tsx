 "use client";

import { FormEvent, useEffect, useState } from "react";
import { puter } from "@heyputer/puter.js";

type ChatMessage = {
  role: "user" | "assistant";
  // We store whatever the model gives us, but always render as text.
  content: unknown;
};

interface AiChatProps {
  prContextMarkdown?: string;
}

export function AiChat({ prContextMarkdown }: AiChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkSignIn() {
      try {
        if (!puter.auth?.isSignedIn) {
          setIsSignedIn(null);
          return;
        }
        const signed = await puter.auth.isSignedIn();
        if (!cancelled) {
          setIsSignedIn(signed);
        }
      } catch {
        if (!cancelled) {
          setIsSignedIn(false);
        }
      }
    }

    void checkSignIn();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    // If the user isn't signed in yet, try to sign them in first,
    // then proceed with the same prompt.
    if (isSignedIn === false && puter.auth?.signIn) {
      try {
        setError(null);
        await puter.auth.signIn();
        if (puter.auth.isSignedIn) {
          try {
            const signed = await puter.auth.isSignedIn();
            setIsSignedIn(signed);
          } catch {
            setIsSignedIn(true);
          }
        } else {
          setIsSignedIn(true);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Sign-in with Puter failed.";
        setError(message);
        return;
      }
    }

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];

    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      if (!puter.ai?.chat) {
        throw new Error(
          "Global `puter.ai.chat` is not available yet. Please wait a moment.",
        );
      }

      const systemPrompt =
        "You are the OpenChaos.dev AI assistant. " +
        "You only answer questions about PRs submitted to the OpenChaos project" +
        "If a user asks about anything else, briefly redirect them back to OpenChaos.\n\n";

      const contextSection = prContextMarkdown
        ? `Here is the latest snapshot of open pull requests and voting context, in markdown format:\n\n${prContextMarkdown}\n\n`
        : "";

      const userTurn = nextMessages[nextMessages.length - 1]?.content ?? trimmed;
      const prompt = `${systemPrompt}${contextSection}User question:\n${userTurn}`;
      console.log(prompt)
      const result = await puter.ai.chat(prompt, {
        model: "gpt-5-nano",
        stream: false,
      });

      let content: string;
      if (typeof result === "string") {
        content = result;
      } else if (result && typeof result === "object") {
        // Try a few common Puter ChatResponse shapes.
        const anyResult = result as {
          text?: string;
          message?: unknown;
        };

        if (typeof anyResult.text === "string") {
          content = anyResult.text;
        } else if (
          anyResult.message &&
          typeof anyResult.message === "object" &&
          "content" in anyResult.message &&
          typeof (anyResult.message as { content?: unknown }).content === "string"
        ) {
          content = (anyResult.message as { content?: string }).content ?? "";
        } else {
          content = JSON.stringify(result, null, 2);
        }
      } else {
        content =
          "The Puter AI response was in an unexpected format. Check the console for details.";
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content },
      ]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unexpected error occurred.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section
      style={{
        maxWidth: "960px",
        margin: "0 auto",
        padding: "24px 24px 22px",
        borderRadius: "24px",
        border: "1px solid rgba(148, 163, 184, 0.45)",
        background:
          "linear-gradient(135deg, rgba(15,23,42,0.82), rgba(15,23,42,0.64))",
        boxShadow:
          "0 28px 80px rgba(15,23,42,0.95), 0 0 0 1px rgba(15,23,42,0.9), 0 0 0 1px rgba(59,130,246,0.18) inset",
        backdropFilter: "blur(26px)",
        WebkitBackdropFilter: "blur(26px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* glass highlight ring */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "-1px",
          borderRadius: "inherit",
          border: "1px solid rgba(248, 250, 252, 0.04)",
          pointerEvents: "none",
        }}
      />

      <h1
        style={{
          fontSize: "26px",
          fontWeight: 800,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: "10px",
          color: "#f9fafb",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "24px",
            height: "24px",
            borderRadius: "999px",
            background:
              "radial-gradient(circle at 30% 0%, #f97316, rgba(15,23,42,0.7) 55%)",
            boxShadow: "0 0 0 1px rgba(251,146,60,0.35)",
          }}
        >
          <span
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "999px",
              background:
                "conic-gradient(from 180deg, #38bdf8, #a855f7, #f97316, #38bdf8)",
              boxShadow: "0 0 16px rgba(251,146,60,0.9)",
            }}
          />
        </span>
        OpenChaosAI
      </h1>
      <p
        style={{
          fontSize: "13px",
          color: "#9ca3af",
          marginBottom: "18px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "999px",
            backgroundColor: "#22c55e",
            boxShadow: "0 0 12px rgba(34,197,94,0.9)",
          }}
        />
        Ask anything about the latest <code>openchaos</code> PRs and voting stats.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          marginBottom: "16px",
        }}
      >
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={4}
          placeholder="What do you want to know?"
          style={{
            width: "100%",
            fontSize: "15px",
            lineHeight: 1.55,
            padding: "12px 14px",
            borderRadius: "16px",
            border: "1px solid rgba(148, 163, 184, 0.7)",
            background:
              "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(15,23,42,0.84))",
            color: "#e5e7eb",
            outline: "none",
            boxShadow:
              "0 0 0 1px rgba(15,23,42,0.9), 0 18px 38px rgba(15,23,42,0.85)",
            resize: "vertical",
            minHeight: "112px",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            marginTop: "4px",
          }}
        >
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            style={{
              padding: "10px 18px",
              borderRadius: "999px",
              border: "none",
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor:
                isLoading || !input.trim() ? "not-allowed" : "pointer",
              background:
                "linear-gradient(135deg, #38bdf8, #6366f1, #a855f7, #ec4899)",
              color: "#020617",
              opacity: isLoading || !input.trim() ? 0.6 : 1,
              boxShadow:
                "0 16px 40px rgba(59,130,246,0.75), 0 0 0 1px rgba(15,23,42,1)",
            }}
          >
            {isLoading ? "Thinking…" : "Ask the LLM"}
          </button>
        </div>
      </form>

      {error && (
        <p
          style={{
            fontSize: "12px",
            color: "#fecaca",
            marginBottom: "8px",
          }}
        >
          {error}
        </p>
      )}

      <div
        style={{
          maxHeight: "320px",
          overflowY: "auto",
          padding: "12px",
          borderRadius: "18px",
          background:
            "linear-gradient(145deg, rgba(15,23,42,0.96), rgba(15,23,42,0.88))",
          border: "1px solid rgba(30, 64, 175, 0.8)",
          boxShadow:
            "0 18px 45px rgba(15,23,42,0.92), 0 0 0 1px rgba(15,23,42,0.95)",
          backdropFilter: "blur(22px)",
          WebkitBackdropFilter: "blur(22px)",
        }}
      >
        {messages.length === 0 && (
          <p
            style={{
              fontSize: "13px",
              color: "#9ca3af",
              margin: 0,
            }}
          >
            Conversation will appear here. Try asking: &ldquo;What is the top voted PR?&rdquo;
          </p>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              marginBottom: "12px",
              fontSize: "13px",
              lineHeight: 1.6,
              display: "flex",
              flexDirection: "column",
              alignItems: message.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "80%",
                padding: "9px 12px",
                borderRadius:
                  message.role === "user"
                    ? "14px 4px 14px 14px"
                    : "4px 14px 14px 14px",
                background:
                  message.role === "user"
                    ? "linear-gradient(135deg, rgba(56,189,248,0.22), rgba(129,140,248,0.28))"
                    : "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(15,23,42,0.9))",
                border:
                  message.role === "user"
                    ? "1px solid rgba(129, 140, 248, 0.9)"
                    : "1px solid rgba(30, 64, 175, 0.85)",
                boxShadow:
                  message.role === "user"
                    ? "0 12px 26px rgba(37,99,235,0.8)"
                    : "0 10px 24px rgba(15,23,42,0.9)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
              }}
            >
              <span
                style={{
                  display: "block",
                  fontWeight: 700,
                  color: message.role === "user" ? "#e5e7eb" : "#a5b4fc",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontSize: "10px",
                  marginBottom: "2px",
                  opacity: 0.9,
                }}
              >
                {message.role === "user" ? "You" : "OpenChaos LLM"}
              </span>
              <div
                style={{
                  marginTop: "2px",
                  whiteSpace: "pre-wrap",
                  color: "#e5e7eb",
                }}
              >
                {typeof message.content === "string"
                  ? message.content
                  : JSON.stringify(message.content, null, 2)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

