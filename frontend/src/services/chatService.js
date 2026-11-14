
import api from "../api/api";

const GUEST_THREAD_KEY = "devmind_guest_thread";
const GUEST_MESSAGES_KEY = "devmind_guest_messages";

// ======================================
// Guest Chat Helpers
// ======================================

export const getGuestThread = () => {
  try {
    const saved = sessionStorage.getItem(GUEST_THREAD_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export const getGuestMessages = () => {
  try {
    const saved = sessionStorage.getItem(GUEST_MESSAGES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const clearGuestChat = () => {
  sessionStorage.removeItem(GUEST_THREAD_KEY);
  sessionStorage.removeItem(GUEST_MESSAGES_KEY);
};

// ======================================
// Thread APIs (Logged-in Users)
// ======================================

export const createThread = async () => {
  const res = await api.post("/threads");
  return res.data;
};

export const getThreads = async () => {
  const res = await api.get("/threads");
  return res.data;
};

export const deleteThread = async (id) => {
  const res = await api.delete(`/threads/${id}`);
  return res.data;
};

export const renameThread = async (id, title) => {
  const res = await api.put(`/threads/${id}`, { title });
  return res.data;
};

export const getThreadMessages = async (id) => {
  const res = await api.get(`/chat/${id}`);
  return res.data;
};

// ======================================
// Streaming Chat + File Upload
// ======================================

export const sendMessage = async (data, onChunk) => {
  const formData = new FormData();

  formData.append("thread_id", data.thread_id || "");
  formData.append("message", data.message || "");
  formData.append("mode", data.mode || "assistant");

  if (data.file) {
    formData.append("file", data.file);
  }

  const token = localStorage.getItem("token");

  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    "http://127.0.0.1:8000/chat",
    {
      method: "POST",
      headers,
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      error?.detail || "Failed to connect to backend."
    );
  }

  const threadId = response.headers.get("X-Thread-ID");

  if (!response.body) {
    throw new Error("Streaming response is not supported.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let fullResponse = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    fullResponse += decoder.decode(value, { stream: true });

    if (onChunk) {
      onChunk(fullResponse);
    }
  }

  // Flush remaining decoded content
  fullResponse += decoder.decode();

  // ======================================
  // Save Guest Chat
  // ======================================

  if (!token && threadId) {
    const guestThread = {
      thread_id: threadId,
      title:
        data.message?.trim().substring(0, 40) ||
        data.file?.name ||
        "New Chat",
      mode: data.mode || "assistant",
    };

    sessionStorage.setItem(
      GUEST_THREAD_KEY,
      JSON.stringify(guestThread)
    );

    const messages = getGuestMessages();

    messages.push(
      {
        role: "user",
        content: data.message || "",
        fileName: data.file?.name || null,
        fileType: data.file?.type || null,
      },
      {
        role: "assistant",
        content: fullResponse,
      }
    );

    sessionStorage.setItem(
      GUEST_MESSAGES_KEY,
      JSON.stringify(messages)
    );
  }

  return {
    thread_id: threadId,
    bot: fullResponse,
  };
};
