
import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

import {
  Menu,
  ChevronDown,
  Sun,
  Moon,
  Check,
  Sparkles,
  Settings,
  LogOut,
  User,
} from "lucide-react";

import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

function Header({
  currentMode = "assistant",
  onSelectMode,
  collapsed = false,
  setCollapsed,
}) {
  const [showModes, setShowModes] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const modeRef = useRef(null);
  const profileRef = useRef(null);

  const navigate = useNavigate();

  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();

  const isDark = theme === "dark";

  const modes = [
    { value: "assistant", label: "Assistant" },
    { value: "python_interview", label: "Python Interview" },
    { value: "java_interview", label: "Java Interview" },
    { value: "react_interview", label: "React Interview" },
    { value: "hr_interview", label: "HR Interview" },
    { value: "debugger", label: "Debugger" },
    { value: "resume_review", label: "Resume Review" },
    { value: "career", label: "Career Coach" },
  ];

  const selectedMode = modes.find(
    (mode) => mode.value === currentMode
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modeRef.current && !modeRef.current.contains(event.target)) {
        setShowModes(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setShowProfile(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowModes(false);
        setShowProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = () => {
    setShowProfile(false);
    logout();
    navigate("/", { replace: true });
  };

  const getInitials = () => {
    if (!user?.name) return "U";

    return user.name
      .trim()
      .split(/\s+/)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const handleModeSelect = (mode) => {
    onSelectMode?.(mode);
    setShowModes(false);
  };

  const buttonStyle = {
    backgroundColor: "var(--surface)",
    borderColor: "var(--border)",
    color: "var(--text-secondary)",
  };

  return (
    <header
      className="h-[64px] shrink-0 flex items-center justify-between px-3 sm:px-5 border-b relative z-30"
      style={{
        backgroundColor: "var(--surface)",
        borderColor: "var(--border)",
        color: "var(--text-primary)",
      }}
    >
      {/* LEFT SECTION */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setCollapsed?.(!collapsed)}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition hover:bg-[var(--surface-hover)]"
          style={{ color: "var(--text-secondary)" }}
          title="Toggle Sidebar"
        >
          <Menu size={21} />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg, #06b6d4, #2563eb)",
            }}
          >
            <Sparkles size={17} color="white" />
          </div>

          <h1 className="font-semibold text-base sm:text-lg whitespace-nowrap">
            DevMind AI
          </h1>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-2">

        {/* AI MODE SELECTOR */}
        <div className="relative" ref={modeRef}>
          <button
            onClick={() => {
              setShowModes((prev) => !prev);
              setShowProfile(false);
            }}
            className="h-10 flex items-center gap-2 px-3 rounded-xl border transition hover:border-cyan-500"
            style={buttonStyle}
          >
            <Sparkles size={15} className="text-cyan-500" />

            <span className="text-xs sm:text-sm font-medium max-w-[105px] truncate">
              {selectedMode?.label || "Assistant"}
            </span>

            <ChevronDown
              size={14}
              className={`transition-transform ${
                showModes ? "rotate-180" : ""
              }`}
            />
          </button>

          {showModes && (
            <div
              className="absolute right-0 top-full mt-2 w-64 rounded-2xl border shadow-2xl overflow-hidden z-50"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <div
                className="px-4 py-3 border-b text-xs font-bold uppercase tracking-wider"
                style={{
                  color: "var(--text-muted)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-cyan-500" />
                  Choose AI Mode
                </div>
              </div>

              <div className="p-2 max-h-80 overflow-y-auto">
                {modes.map((mode) => {
                  const selected = currentMode === mode.value;

                  return (
                    <button
                      key={mode.value}
                      onClick={() => handleModeSelect(mode.value)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-left transition hover:bg-[var(--surface-hover)]"
                      style={{
                        backgroundColor: selected
                          ? "var(--message-user)"
                          : "transparent",
                        color: selected
                          ? "var(--accent)"
                          : "var(--text-secondary)",
                      }}
                    >
                      <span>{mode.label}</span>
                      {selected && (
                        <Check size={16} className="text-cyan-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* THEME TOGGLE */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-xl border flex items-center justify-center transition hover:border-cyan-500 hover:text-cyan-500"
          style={buttonStyle}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* GUEST AUTH BUTTONS */}
        {!isAuthenticated ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/login")}
              className="px-3 sm:px-4 h-10 rounded-xl text-sm font-medium border transition hover:border-cyan-500"
              style={buttonStyle}
            >
              Login
            </button>

            <button
              onClick={() => navigate("/signup")}
              className="px-3 sm:px-4 h-10 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
              style={{
                background: "linear-gradient(110deg, #7650ed, #347eea)",
              }}
            >
              Sign Up
            </button>
          </div>
        ) : (

          /* LOGGED-IN PROFILE */
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setShowProfile((prev) => !prev);
                setShowModes(false);
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition hover:ring-2 hover:ring-cyan-500"
              style={{
                background: "linear-gradient(135deg, #0891b2, #2563eb)",
                color: "#ffffff",
              }}
              title="Account Menu"
            >
              {getInitials()}
            </button>

            {showProfile && (
              <div
                className="absolute right-0 top-full mt-3 w-64 rounded-2xl border shadow-2xl overflow-hidden z-50"
                style={{
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--border)",
                }}
              >
                <div
                  className="p-4 border-b"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                      style={{
                        background: "linear-gradient(135deg, #0891b2, #2563eb)",
                        color: "white",
                      }}
                    >
                      {getInitials()}
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {user?.name || "User"}
                      </p>

                      <p
                        className="text-xs mt-1 truncate"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {user?.email || ""}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <button
                    onClick={() => {
                      setShowProfile(false);
                      navigate("/settings");
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition hover:bg-[var(--surface-hover)]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <Settings size={17} />
                    Settings
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition hover:bg-red-500/10"
                    style={{ color: "#ef4444" }}
                  >
                    <LogOut size={17} />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
