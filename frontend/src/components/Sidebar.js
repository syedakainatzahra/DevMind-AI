
import React, { useState, useEffect } from "react";

import {
  Plus,
  Settings,
  Trash2,
  Edit2,
  Check,
  X,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  MessageSquare,
  Sparkles,
  Search,
  LogOut,
  User,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar({
  threads = [],
  currentThread,
  onNewChat,
  onSelectThread,
  onDeleteThread,
  onRenameThread,
  collapsed = false,
  setCollapsed,
}) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [isMobile, setIsMobile] = useState(
    window.innerWidth < 768
  );

  const [mobileOpen, setMobileOpen] = useState(false);
  const [editingThreadId, setEditingThreadId] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (!mobile) setMobileOpen(false);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleStartRename = (e, thread) => {
    e.stopPropagation();
    setEditingThreadId(thread.thread_id || thread.id);
    setNewTitle(thread.title || "");
  };

  const handleSaveRename = async (e, threadId) => {
    e.stopPropagation();

    if (newTitle.trim() && onRenameThread) {
      await onRenameThread(threadId, newTitle.trim());
    }

    setEditingThreadId(null);
    setNewTitle("");
  };

  const handleCancelRename = (e) => {
    e.stopPropagation();
    setEditingThreadId(null);
    setNewTitle("");
  };

  const handleDelete = (e, threadId) => {
    e.stopPropagation();
    onDeleteThread?.(threadId);
  };

  const handleSelect = (thread) => {
    onSelectThread?.(thread);
    setMobileOpen(false);
  };

  const handleNewChatClick = () => {
    onNewChat?.();
    setMobileOpen(false);
  };

  const handleSettings = () => {
    navigate("/settings");
    setMobileOpen(false);
    setShowProfile(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const getInitials = () => {
    if (!user?.name) return "U";

    return user.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const sidebarWidth = collapsed ? "w-[76px]" : "w-[280px]";

  const filteredThreads = threads.filter((thread) =>
    (thread.title || "New Chat")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const sidebarStyle = {
    backgroundColor: "var(--surface)",
    borderColor: "var(--border)",
    color: "var(--text-primary)",
  };

  const mutedStyle = {
    color: "var(--text-muted)",
  };

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-3 z-40 p-2.5 rounded-xl border"
          style={sidebarStyle}
          title="Open Sidebar"
        >
          <Menu size={21} />
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          h-screen flex flex-col shrink-0 border-r
          transition-all duration-300 ease-in-out
          z-50 overflow-hidden
          ${
            isMobile
              ? `fixed top-0 left-0 w-[285px] ${
                  mobileOpen ? "translate-x-0" : "-translate-x-full"
                }`
              : sidebarWidth
          }
        `}
        style={sidebarStyle}
      >
        {/* Logo */}
        <div
          className={`h-[64px] flex items-center shrink-0 ${
            collapsed && !isMobile
              ? "justify-center px-2"
              : "justify-between px-4"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, #06b6d4, #2563eb)",
              }}
            >
              <Sparkles size={19} color="white" />
            </div>

            {(!collapsed || isMobile) && (
              <div>
                <h1 className="font-bold text-base whitespace-nowrap">
                  DevMind AI
                </h1>
                <p className="text-[10px] text-cyan-500">
                  Your AI Workspace
                </p>
              </div>
            )}
          </div>

          {!isMobile && !collapsed && (
            <button
              onClick={() => setCollapsed?.(true)}
              className="p-2 rounded-lg hover:bg-[var(--surface-hover)]"
              style={mutedStyle}
              title="Collapse Sidebar"
            >
              <PanelLeftClose size={19} />
            </button>
          )}

          {isMobile && (
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 rounded-lg"
              style={mutedStyle}
              title="Close Sidebar"
            >
              <X size={19} />
            </button>
          )}
        </div>

        {/* Expand Button */}
        {collapsed && !isMobile && (
          <div className="flex justify-center py-3">
            <button
              onClick={() => setCollapsed?.(false)}
              className="p-3 rounded-xl hover:bg-[var(--surface-hover)]"
              style={mutedStyle}
              title="Expand Sidebar"
            >
              <PanelLeftOpen size={21} />
            </button>
          </div>
        )}

        {/* New Chat */}
        <div className={`shrink-0 ${collapsed && !isMobile ? "p-3" : "px-3 pt-4 pb-3"}`}>
          <button
            onClick={handleNewChatClick}
            title="New Chat"
            className="w-full flex items-center justify-center gap-3 rounded-xl py-3 transition hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #0891b2, #2563eb)",
              color: "#ffffff",
            }}
          >
            <Plus size={19} />

            {(!collapsed || isMobile) && (
              <span className="text-sm font-semibold">
                New Chat
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        {(!collapsed || isMobile) && (
          <div className="px-3 pb-4">
            <div
              className="flex items-center gap-2 px-3 rounded-xl border"
              style={{
                backgroundColor: "var(--surface-secondary)",
                borderColor: "var(--border)",
              }}
            >
              <Search size={17} style={mutedStyle} />

              <input
                type="text"
                placeholder="Search chats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2.5 text-sm bg-transparent outline-none"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
          </div>
        )}

        {/* Chat History */}
        {(!collapsed || isMobile) && (
          <>
            <div className="px-5 mb-2 shrink-0">
              <p
                className="uppercase tracking-wider text-[10px] font-bold"
                style={mutedStyle}
              >
                Your Chats
              </p>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-4 space-y-1">

              {filteredThreads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageSquare size={24} style={mutedStyle} />

                  <p className="text-sm mt-3" style={mutedStyle}>
                    {searchTerm ? "No matching chats" : "No conversations yet"}
                  </p>
                </div>
              ) : (
                filteredThreads.map((thread) => {
                  const threadId = thread.thread_id || thread.id;

                  const isSelected =
                    (currentThread?.thread_id || currentThread?.id) === threadId;

                  const isEditing = editingThreadId === threadId;

                  return (
                    <div
                      key={threadId}
                      onClick={() => !isEditing && handleSelect(thread)}
                      className="group relative rounded-xl px-3 py-3 cursor-pointer transition"
                      style={{
                        backgroundColor: isSelected
                          ? "var(--message-user)"
                          : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor =
                            "var(--surface-hover)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor =
                            "transparent";
                        }
                      }}
                    >
                      {isEditing ? (
                        <div
                          className="flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleSaveRename(e, threadId);
                              }

                              if (e.key === "Escape") {
                                handleCancelRename(e);
                              }
                            }}
                            className="border border-cyan-500 rounded-lg px-2 py-2 flex-1 min-w-0 outline-none text-sm"
                            style={{
                              backgroundColor: "var(--input-bg)",
                              color: "var(--text-primary)",
                            }}
                            autoFocus
                          />

                          <button
                            onClick={(e) => handleSaveRename(e, threadId)}
                            className="text-cyan-500"
                            title="Save"
                          >
                            <Check size={16} />
                          </button>

                          <button
                            onClick={handleCancelRename}
                            style={mutedStyle}
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 pr-14">
                            <MessageSquare
                              size={15}
                              className="shrink-0"
                              style={mutedStyle}
                            />

                            <h2
                              className="font-medium text-sm truncate"
                              style={{
                                color: "var(--text-secondary)",
                              }}
                            >
                              {thread.title || "New Chat"}
                            </h2>
                          </div>

                          <div
                            className={`absolute right-2 top-2 items-center gap-1 ${
                              isSelected ? "flex" : "hidden group-hover:flex"
                            }`}
                          >
                            <button
                              onClick={(e) => handleStartRename(e, thread)}
                              className="p-1.5 rounded-md hover:text-cyan-500"
                              style={mutedStyle}
                              title="Rename"
                            >
                              <Edit2 size={14} />
                            </button>

                            <button
                              onClick={(e) => handleDelete(e, threadId)}
                              className="p-1.5 rounded-md hover:text-red-500"
                              style={mutedStyle}
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {collapsed && !isMobile && <div className="flex-1" />}

        {/* User Profile Footer */}
        <div
          className="border-t p-3 shrink-0"
          style={{ borderColor: "var(--border)" }}
        >
          {(!collapsed || isMobile) ? (
            <div className="relative">
              <button
                onClick={() => setShowProfile((prev) => !prev)}
                className="w-full flex items-center gap-3 p-2 rounded-xl text-left hover:bg-[var(--surface-hover)] transition"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #0891b2, #2563eb)",
                    color: "white",
                  }}
                >
                  {getInitials()}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs truncate" style={mutedStyle}>
                    {user?.email || ""}
                  </p>
                </div>

                <Settings size={17} style={mutedStyle} />
              </button>

              {showProfile && (
                <div
                  className="absolute bottom-full left-0 mb-2 w-full rounded-xl border shadow-2xl overflow-hidden"
                  style={{
                    backgroundColor: "var(--surface)",
                    borderColor: "var(--border)",
                  }}
                >
                  <button
                    onClick={handleSettings}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-[var(--surface-hover)]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <Settings size={17} />
                    Settings
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-red-500/10"
                    style={{ color: "#ef4444" }}
                  >
                    <LogOut size={17} />
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowProfile((prev) => !prev)}
              className="w-10 h-10 mx-auto rounded-full flex items-center justify-center font-bold text-sm"
              style={{
                background: "linear-gradient(135deg, #0891b2, #2563eb)",
                color: "white",
              }}
              title={user?.name || "Account"}
            >
              {getInitials()}
            </button>
          )}

          {collapsed && !isMobile && showProfile && (
            <div
              className="absolute left-[76px] bottom-3 w-48 rounded-xl border shadow-2xl overflow-hidden z-[60]"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <button
                onClick={handleSettings}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-[var(--surface-hover)]"
              >
                <Settings size={17} />
                Settings
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-red-500/10"
                style={{ color: "#ef4444" }}
              >
                <LogOut size={17} />
                Log out
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
