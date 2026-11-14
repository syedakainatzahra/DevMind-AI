
import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  User,
  Moon,
  Sun,
  Bell,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getMyProfile, updateMySettings } from "../services/authService";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

function Settings() {
  const navigate = useNavigate();

  const { theme, setTheme } = useTheme();
  const { updateUser } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notifications, setNotifications] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ======================================
  // Load User Settings
  // ======================================

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);

        const data = await getMyProfile();

        setName(data.name || "");
        setEmail(data.email || "");
        setTheme(data.preferences?.theme || "dark");
        setNotifications(
          data.preferences?.notifications ?? true
        );

        updateUser({
          name: data.name,
          email: data.email,
        });

      } catch (err) {
        setError(
          err.response?.data?.detail ||
          "Unable to load your settings."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // ======================================
  // Save Settings
  // ======================================

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      if (!name.trim()) {
        setError("Name cannot be empty.");
        return;
      }

      const response = await updateMySettings({
        name: name.trim(),
        theme,
        notifications,
      });

      const updatedUser = response.user;

      setName(updatedUser.name);
      setEmail(updatedUser.email);

      setTheme(updatedUser.preferences.theme);
      setNotifications(
        updatedUser.preferences.notifications
      );

      updateUser({
        name: updatedUser.name,
        email: updatedUser.email,
      });

      setMessage("Settings saved successfully!");

    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Failed to save settings. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // ======================================
  // Loading Screen
  // ======================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1018] text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="animate-spin text-cyan-400" size={25} />
          <span>Loading settings...</span>
        </div>
      </div>
    );
  }

  // ======================================
  // Main UI
  // ======================================

  return (
    <div className="min-h-screen bg-[#0B1018] text-white">

      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-[#1E293B]">

        <div className="flex items-center gap-4">

          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-lg hover:bg-[#182233] transition"
          >
            <ArrowLeft size={22} />
          </button>

          <h1 className="text-3xl font-bold">
            Settings
          </h1>

        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-black font-semibold px-5 py-2 rounded-lg transition"
        >
          {saving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Save size={18} />
          )}

          {saving ? "Saving..." : "Save"}
        </button>

      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto p-8 space-y-8">

        {/* Success Message */}
        {message && (
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg p-4">
            <CheckCircle size={19} />
            {message}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-4">
            <AlertCircle size={19} />
            {error}
          </div>
        )}

        {/* Profile */}
        <div className="bg-[#111827] rounded-2xl p-6 border border-[#1E293B]">

          <div className="flex items-center gap-3 mb-6">

            <User className="text-cyan-400" />

            <h2 className="text-xl font-semibold">
              Profile
            </h2>

          </div>

          <div className="space-y-5">

            <div>
              <label className="block mb-2 text-gray-400">
                Name
              </label>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0B1018] border border-[#243041] rounded-lg px-4 py-3 outline-none focus:border-cyan-500"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-400">
                Email
              </label>

              <input
                value={email}
                readOnly
                className="w-full bg-[#0B1018] border border-[#243041] rounded-lg px-4 py-3 outline-none text-gray-500 cursor-not-allowed"
              />

              <p className="text-xs text-gray-500 mt-2">
                Your registered email cannot be changed here.
              </p>
            </div>

          </div>

        </div>

        {/* Appearance */}
        <div className="bg-[#111827] rounded-2xl p-6 border border-[#1E293B]">

          <h2 className="text-xl font-semibold mb-5">
            Appearance
          </h2>

          <div className="flex gap-4">

            <button
              onClick={() => setTheme("dark")}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg transition ${
                theme === "dark"
                  ? "bg-cyan-500 text-black"
                  : "bg-[#182233] text-white"
              }`}
            >
              <Moon size={18} />
              Dark
            </button>

            <button
              onClick={() => setTheme("light")}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg transition ${
                theme === "light"
                  ? "bg-yellow-400 text-black"
                  : "bg-[#182233] text-white"
              }`}
            >
              <Sun size={18} />
              Light
            </button>

          </div>

        </div>

        {/* Notifications */}
        <div className="bg-[#111827] rounded-2xl p-6 border border-[#1E293B]">

          <div className="flex items-center justify-between">

            <div>

              <div className="flex items-center gap-3">

                <Bell className="text-cyan-400" />

                <h2 className="text-xl font-semibold">
                  Notifications
                </h2>

              </div>

              <p className="text-gray-500 mt-2">
                Receive updates from DevMind AI
              </p>

            </div>

            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="w-6 h-6 accent-cyan-500 cursor-pointer"
            />

          </div>

        </div>

      </div>

    </div>
  );
}

export default Settings;
