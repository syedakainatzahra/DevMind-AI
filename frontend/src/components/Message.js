import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Bot, User } from "lucide-react";

function Message({ message }) {
  // Agar message null ya undefined ho to display issue prevent karne ke liye check
  if (!message) return null;

  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3 max-w-3xl mx-auto my-3 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* AI Icon Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
          <Bot size={18} className="text-white" />
        </div>
      )}

      {/* Message Text Bubble */}
      <div
        className={`p-3.5 rounded-xl max-w-[85%] text-sm leading-relaxed ${
          isUser
            ? "bg-indigo-600 text-white rounded-tr-none"
            : "bg-[#161F2E] text-slate-200 border border-slate-800 rounded-tl-none"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  <div className="my-2 rounded-md overflow-hidden border border-slate-700">
                    <div className="bg-slate-900 px-3 py-1 text-xs font-mono text-slate-400 border-b border-slate-700">
                      {match[1]}
                    </div>
                    <SyntaxHighlighter
                      style={atomDark}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{
                        margin: 0,
                        padding: "0.75rem",
                        background: "#0D1117",
                        fontSize: "0.85rem",
                      }}
                      {...props}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code
                    className="bg-slate-800 text-indigo-300 px-1 py-0.5 rounded font-mono text-xs border border-slate-700"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>

      {/* User Icon Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
          <User size={18} className="text-slate-300" />
        </div>
      )}
    </div>
  );
}

export default Message;