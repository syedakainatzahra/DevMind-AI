
import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ChatArea from "../components/ChatArea";
import ChatInput from "../components/ChatInput";

import { useAuth } from "../context/AuthContext";
import api from "../api/api";

import {
  getThreads,
  getThreadMessages,
  sendMessage,
  deleteThread,
  renameThread,
  getGuestThread,
  getGuestMessages,
  clearGuestChat,
} from "../services/chatService";

function Home() {
  const { user, isAuthenticated } = useAuth();

  const isLoggedIn = isAuthenticated;

  const [threads, setThreads] = useState([]);

  const [currentThread, setCurrentThread] = useState(() => {
    return localStorage.getItem("token")
      ? null
      : getGuestThread();
  });

  const [messages, setMessages] = useState(() => {
    return localStorage.getItem("token")
      ? []
      : getGuestMessages();
  });

  const [currentMode, setCurrentMode] = useState("assistant");
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // ======================================
  // Authentication Change
  // ======================================

  useEffect(() => {
    setThreads([]);
    setCurrentThread(null);
    setMessages([]);
    setInputValue("");
    setCurrentMode("assistant");

    if (isLoggedIn) {
      loadThreads();
    } else {
      clearGuestChat();
    }
  }, [user?.email, isLoggedIn]);

  // ======================================
  // Load Threads
  // ======================================

  const loadThreads = async () => {
    try {
      const data = await getThreads();
      setThreads(data);
    } catch (err) {
      console.log("Threads error:", err);
    }
  };

  // ======================================
  // Load Messages
  // ======================================

  useEffect(() => {
    if (!currentThread?.thread_id) {
      setMessages([]);
      return;
    }

    if (!isLoggedIn) {
      setMessages(getGuestMessages());
      return;
    }

    loadMessages(currentThread.thread_id);
  }, [currentThread?.thread_id, isLoggedIn]);

  const loadMessages = async (threadId) => {
    try {
      setLoading(true);

      const data = await getThreadMessages(threadId);

      const formatted = [];

      data.forEach((chat) => {
        formatted.push({
          role: "user",
          content: chat.user_message,
          image: chat.file_url
            ? `${api.defaults.baseURL.replace(/\/+$/, "")}${chat.file_url}`
            : null,
          fileName: chat.file_name || null,
          fileType: chat.file_type || null,
        });

        formatted.push({
          role: "assistant",
          content: chat.bot_response,
        });
      });

      setMessages(formatted);
    } catch (err) {
      console.log("Messages error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ======================================
  // New Chat
  // ======================================

  const handleNewChat = () => {
    if (!isLoggedIn) {
      clearGuestChat();
    }

    setCurrentThread(null);
    setMessages([]);
    setInputValue("");
    setCurrentMode("assistant");
  };

  // ======================================
  // Select Thread
  // ======================================

  const handleSelectThread = (thread) => {
    setInputValue("");
    setCurrentThread(thread);

    if (thread.mode) {
      setCurrentMode(thread.mode);
    }
  };

  // ======================================
  // Select AI Mode
  // ======================================

  const handleSelectMode = (mode) => {
    setCurrentMode(mode);

    if (currentThread) {
      setCurrentThread((prev) => ({
        ...prev,
        mode,
      }));
    }
  };

  // ======================================
  // Delete Thread
  // ======================================

  const handleDeleteThread = async (threadId) => {
    if (!isLoggedIn) return;

    try {
      await deleteThread(threadId);

      setThreads((prev) =>
        prev.filter((t) => t.thread_id !== threadId)
      );

      if (currentThread?.thread_id === threadId) {
        handleNewChat();
      }
    } catch (err) {
      console.log("Delete error:", err);
    }
  };

  // ======================================
  // Rename Thread
  // ======================================

  const handleRenameThread = async (threadId, title) => {
    if (!isLoggedIn) return;

    try {
      await renameThread(threadId, title);

      setThreads((prev) =>
        prev.map((t) =>
          t.thread_id === threadId
            ? { ...t, title }
            : t
        )
      );

      if (currentThread?.thread_id === threadId) {
        setCurrentThread((prev) => ({
          ...prev,
          title,
        }));
      }
    } catch (err) {
      console.log("Rename error:", err);
    }
  };

  // ======================================
  // Chat Actions
  // ======================================

  const handleAction = (action, responseText) => {
    const prompt = `${action} this response:\n\n${responseText}`;
    handleSendMessage(prompt);
  };

  // ======================================
  // Send Message
  // ======================================

  const handleSendMessage = async (text, file = null) => {
    if ((!text.trim() && !file) || loading) return;

    const imagePreview =
      file && file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null;

    const userMessage = {
      role: "user",
      content: text,
      fileName: file?.name || null,
      fileType: file?.type || null,
      image: imagePreview,
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
      {
        role: "assistant",
        content: "",
      },
    ]);

    setInputValue("");
    setLoading(true);

    try {
      const response = await sendMessage(
        {
          thread_id: currentThread?.thread_id || null,
          message: text,
          mode: currentMode,
          file,
        },
        (streamText) => {
          setMessages((prev) => {
            const updated = [...prev];

            updated[updated.length - 1] = {
              role: "assistant",
              content: streamText,
            };

            return updated;
          });
        }
      );

      if (!currentThread && response.thread_id) {
        const newThread = {
          thread_id: response.thread_id,
          title:
            text.trim().substring(0, 30) ||
            file?.name ||
            "New Chat",
          mode: currentMode,
        };

        setCurrentThread(newThread);
      }

      if (isLoggedIn) {
        await loadThreads();
      }
    } catch (err) {
      console.log("Send message error:", err);

      setMessages((prev) => {
        const updated = [...prev];

        updated[updated.length - 1] = {
          role: "assistant",
          content: "Error connecting to backend. Please try again.",
        };

        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  // ======================================
  // UI
  // ======================================

  return (
    <div
      className="h-screen w-full flex overflow-hidden"
      style={{
        backgroundColor: "var(--bg)",
        color: "var(--text-primary)",
      }}
    >
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        threads={threads}
        currentThread={currentThread}
        onNewChat={handleNewChat}
        onSelectThread={handleSelectThread}
        onDeleteThread={handleDeleteThread}
        onRenameThread={handleRenameThread}
        currentMode={currentMode}
        onSelectMode={handleSelectMode}
      />

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <Header
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          currentMode={currentMode}
          onSelectMode={handleSelectMode}
        />

        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <ChatArea
            messages={messages}
            loading={loading}
            onAction={handleAction}
          />
        </div>

        <ChatInput
          onSendMessage={handleSendMessage}
          loading={loading}
          currentMode={currentMode}
          text={inputValue}
          setText={setInputValue}
        />
      </div>
    </div>
  );
}

export default Home;
