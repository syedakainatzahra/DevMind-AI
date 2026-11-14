
import React, { useRef, useEffect, useState } from "react";
import {
  Copy,
  Bot,
  Sparkles,
  Check,
  Code2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

function ChatArea({ messages = [], loading, onAction }) {
  const messagesEndRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <div
    className="relative isolate flex-1 min-w-0 overflow-y-auto h-full transition-colors duration-300"
      style={{
        backgroundColor: "var(--bg)",
        color: "var(--text-primary)",
      }}
    >
      {/* Animated Aurora Background */}
<div className="chat-ambient" aria-hidden="true">
  <div className="chat-orb chat-orb-one" />
  <div className="chat-orb chat-orb-two" />
  <div className="chat-orb chat-orb-three" />
</div>
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-6 min-h-full flex flex-col">
        {/* Welcome Screen */}
        {messages.length === 0 && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center text-center pb-16">

            <div className="mb-6">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <Bot size={30} className="text-cyan-500" />
              </div>
            </div>

            <h1
              className="text-3xl sm:text-4xl font-semibold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              What can I help you with?
            </h1>

            <p
              className="text-sm mt-3"
              style={{ color: "var(--text-muted)" }}
            >
              Ask anything about development.
            </p>
          </div>
        )}

        {/* Conversation */}
        {messages.length > 0 && (
          <div className="space-y-8 pb-8">
            {messages.map((msg, idx) => {
              const isUser = msg.role === "user";

              if (isUser) {
                return (
                  <div key={idx} className="flex justify-end">
                    <div
                      className="max-w-[90%] sm:max-w-[80%] rounded-3xl px-5 py-3.5 text-[15px] leading-7"
                      style={{
                        backgroundColor: "var(--message-user)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {msg.image && (
                        <img
                          src={
                            msg.image.startsWith("blob:") ||
                            msg.image.startsWith("http")
                              ? msg.image
                              : `http://127.0.0.1:8000${msg.image}`
                          }
                          alt={msg.fileName || "Uploaded file"}
                          className="max-w-full sm:max-w-sm max-h-72 object-contain rounded-xl mb-3"
                        />
                      )}

                      {msg.fileName && !msg.image && (
                        <div className="mb-2 text-sm">
                          📎 {msg.fileName}
                        </div>
                      )}

                      {msg.content && (
                        <p className="whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <div key={idx} className="flex items-start gap-3 sm:gap-4">

                  {/* AI Avatar */}
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: "linear-gradient(135deg, #06b6d4, #2563eb)",
                    }}
                  >
                    <Sparkles size={17} color="white" />
                  </div>

                  <div className="flex-1 min-w-0 pt-1">

                    <div
                      className="font-semibold text-sm mb-3"
                      style={{ color: "var(--text-primary)" }}
                    >
                      DevMind
                    </div>

                    {/* AI Response */}
                    <div
                      className="text-[15px] leading-7 break-words markdown-content"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <ReactMarkdown
                        components={{
                          code({ inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(
                              className || ""
                            );

                            const codeText = String(children).replace(
                              /\n$/,
                              ""
                            );

                            return !inline ? (
                              <div
                                className="my-5 rounded-xl overflow-hidden border"
                                style={{ borderColor: "var(--border)" }}
                              >
                                <div
                                  className="px-4 py-3 flex justify-between items-center border-b"
                                  style={{
                                    backgroundColor: "var(--surface)",
                                    borderColor: "var(--border)",
                                  }}
                                >
                                  <div className="flex items-center gap-2">
                                    <Code2 size={15} className="text-cyan-500" />
                                    <span
                                      className="text-xs font-semibold uppercase"
                                      style={{ color: "var(--text-secondary)" }}
                                    >
                                      {match ? match[1] : "Code"}
                                    </span>
                                  </div>

                                  <button
                                    onClick={() => handleCopy(codeText)}
                                    className="flex items-center gap-2 text-xs hover:text-cyan-500"
                                    style={{ color: "var(--text-muted)" }}
                                  >
                                    <Copy size={14} />
                                    Copy code
                                  </button>
                                </div>

                                <pre
                                  className="p-5 overflow-x-auto text-sm font-mono leading-6"
                                  style={{
                                    backgroundColor: "var(--surface-secondary)",
                                    color: "var(--text-primary)",
                                  }}
                                >
                                  <code>{codeText}</code>
                                </pre>
                              </div>
                            ) : (
                              <code
                                className="px-1.5 py-0.5 rounded-md font-mono text-[13px] border"
                                style={{
                                  backgroundColor: "var(--surface)",
                                  color: "var(--accent)",
                                  borderColor: "var(--border)",
                                }}
                                {...props}
                              >
                                {children}
                              </code>
                            );
                          },

                          p({ children }) {
                            return <p className="mb-4 last:mb-0">{children}</p>;
                          },

                          ul({ children }) {
                            return (
                              <ul className="list-disc pl-6 mb-5 space-y-2">
                                {children}
                              </ul>
                            );
                          },

                          ol({ children }) {
                            return (
                              <ol className="list-decimal pl-6 mb-5 space-y-2">
                                {children}
                              </ol>
                            );
                          },

                          h1({ children }) {
                            return (
                              <h1
                                className="text-2xl font-bold mt-7 mb-4"
                                style={{ color: "var(--text-primary)" }}
                              >
                                {children}
                              </h1>
                            );
                          },

                          h2({ children }) {
                            return (
                              <h2
                                className="text-xl font-bold mt-6 mb-3"
                                style={{ color: "var(--text-primary)" }}
                              >
                                {children}
                              </h2>
                            );
                          },

                          h3({ children }) {
                            return (
                              <h3
                                className="text-lg font-semibold mt-5 mb-3"
                                style={{ color: "var(--text-primary)" }}
                              >
                                {children}
                              </h3>
                            );
                          },

                          blockquote({ children }) {
                            return (
                              <blockquote
                                className="border-l-4 pl-4 py-1 my-4"
                                style={{
                                  borderColor: "var(--accent)",
                                  color: "var(--text-muted)",
                                }}
                              >
                                {children}
                              </blockquote>
                            );
                          },

                          hr() {
                            return (
                              <hr
                                className="my-6"
                                style={{ borderColor: "var(--border)" }}
                              />
                            );
                          },

                          table({ children }) {
                            return (
                              <div className="overflow-x-auto my-5">
                                <table className="w-full text-sm border-collapse">
                                  {children}
                                </table>
                              </div>
                            );
                          },

                          th({ children }) {
                            return (
                              <th
                                className="border px-3 py-2 text-left font-semibold"
                                style={{
                                  backgroundColor: "var(--surface)",
                                  borderColor: "var(--border)",
                                  color: "var(--text-primary)",
                                }}
                              >
                                {children}
                              </th>
                            );
                          },

                          td({ children }) {
                            return (
                              <td
                                className="border px-3 py-2"
                                style={{ borderColor: "var(--border)" }}
                              >
                                {children}
                              </td>
                            );
                          },
                        }}
                      >
                        {msg.content || ""}
                      </ReactMarkdown>
                    </div>

                    {/* Response Actions */}
                    {msg.content && (
                      <div className="flex items-center gap-3 mt-4">
                        <button
                          onClick={() => handleCopy(msg.content)}
                          className="flex items-center gap-1.5 text-xs hover:text-cyan-500 transition"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {copied ? <Check size={14} /> : <Copy size={14} />}
                          {copied ? "Copied" : "Copy"}
                        </button>

                        {["Explain", "Test", "Optimize", "Review"].map(
                          (btn) => (
                            <button
                              key={btn}
                              onClick={() => onAction?.(btn, msg.content)}
                              className="text-xs hover:text-cyan-500 transition"
                              style={{ color: "var(--text-muted)" }}
                            >
                              {btn}
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-start gap-3 mt-6">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, #06b6d4, #2563eb)",
              }}
            >
              <Sparkles size={17} color="white" />
            </div>

            <div className="pt-2">
              <p className="text-sm font-semibold mb-3">DevMind</p>

              <div className="flex gap-1">
                {[0, 1, 2].map((dot) => (
                  <span
                    key={dot}
                    className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce"
                    style={{ animationDelay: `${dot * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

export default ChatArea;
