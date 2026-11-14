
import { useState, useRef, useEffect } from "react";
import {
  Send,
  Paperclip,
  X,
  FileText,
} from "lucide-react";

function ChatInput({
  onSendMessage,
  loading,
  currentMode = "assistant",
  text = "",
  setText,
}) {
  const [selectedFile, setSelectedFile] = useState(null);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [text]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if ((!text.trim() && !selectedFile) || loading) return;

    onSendMessage(text, selectedFile);
    setText("");
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);

    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height =
      `${Math.min(textarea.scrollHeight, 180)}px`;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div
      className="shrink-0 px-4 sm:px-6 pt-3 pb-4 transition-colors duration-300"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div className="max-w-3xl mx-auto">

        {/* File Preview */}
        {selectedFile && (
          <div
            className="mb-3 flex items-center gap-3 max-w-sm border rounded-xl p-3"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <FileText
              size={20}
              className="text-cyan-500 shrink-0"
            />

            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {selectedFile.name}
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>

            <button
              type="button"
              onClick={removeFile}
              className="p-1 hover:text-red-500 transition"
              style={{ color: "var(--text-muted)" }}
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Chat Composer */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border shadow-sm transition-all duration-200 focus-within:border-cyan-500 focus-within:shadow-md"
          style={{
            backgroundColor: "var(--input-bg)",
            borderColor: "var(--border)",
          }}
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            disabled={loading}
            rows={1}
            placeholder={
              currentMode === "assistant"
                ? "Message DevMind..."
                : `Message DevMind (${currentMode.replace(/_/g, " ")})...`
            }
            className="w-full bg-transparent outline-none resize-none px-5 pt-4 pb-2 text-[15px] leading-7 placeholder:opacity-60"
            style={{
              color: "var(--text-primary)",
              maxHeight: "180px",
              minHeight: "48px",
            }}
          />

          <input
            ref={fileInputRef}
            type="file"
            hidden
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.csv"
          />

          <div className="flex items-center justify-between px-3 pb-3">

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="w-9 h-9 rounded-full flex items-center justify-center transition hover:bg-cyan-500/10 hover:text-cyan-500 disabled:opacity-40"
              style={{ color: "var(--text-muted)" }}
              title="Attach file"
            >
              <Paperclip size={19} />
            </button>

            <button
              type="submit"
              disabled={loading || (!text.trim() && !selectedFile)}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "var(--accent)",
                color: "#ffffff",
              }}
              title="Send message"
            >
              <Send size={17} />
            </button>

          </div>
        </form>

        <p
          className="text-[11px] text-center mt-2"
          style={{ color: "var(--text-muted)" }}
        >
          DevMind AI can make mistakes. Check important information.
        </p>

      </div>
    </div>
  );
}

export default ChatInput;
