
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { signup } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft } from "lucide-react";

function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await signup(form);

      login(
        {
          name: form.name,
          email: form.email,
        },
        response.token
      );

      navigate("/");
    } catch (error) {
      alert(error.response?.data?.detail || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    height: "49px",
    padding: "0 15px",
    background: "#0d1120",
    border: "1px solid #ffffff19",
    borderRadius: "10px",
    outline: "none",
    color: "#fff",
    fontSize: "13px",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080b16",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "35px 20px",
        position: "relative",
        overflow: "hidden",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "#6d3bff",
          filter: "blur(130px)",
          opacity: 0.2,
          top: "-180px",
          left: "-100px",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "#087dce",
          filter: "blur(130px)",
          opacity: 0.2,
          bottom: "-180px",
          right: "-100px",
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: "1050px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "60px",
          position: "relative",
          zIndex: 1,
          flexWrap: "wrap",
        }}
      >
        {/* Branding */}
        <div
          style={{
            flex: "1 1 300px",
            padding: "20px",
          }}
        >
          <button
  type="button"
  onClick={() => navigate("/", { replace: true })}
  className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition mb-6"
>
  <ArrowLeft size={18} />
  Back to Guest Chat
</button>
          <div
            style={{
              width: "58px",
              height: "58px",
              borderRadius: "17px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "29px",
              fontWeight: "800",
              background: "linear-gradient(135deg, #8254ff, #2589ff)",
              boxShadow: "0 8px 35px #704cff55",
              marginBottom: "22px",
            }}
          >
            D
          </div>

          <h1 style={{ fontSize: "36px", margin: 0 }}>
            DevMind<span style={{ color: "#9270ff" }}> AI</span>
          </h1>

          <p style={{ color: "#9299ad", fontSize: "15px" }}>
            Your intelligent coding companion.
          </p>

          <div style={{ marginTop: "55px", maxWidth: "350px" }}>
            <h3 style={{ fontSize: "19px" }}>
              Start building something amazing.
            </h3>

            <p
              style={{
                color: "#9299ad",
                fontSize: "14px",
                lineHeight: 1.8,
              }}
            >
              Create your account and explore a smarter
              way to learn, code, debug and grow with AI.
            </p>
          </div>
        </div>

        {/* Signup Card */}
        <div
          style={{
            flex: "1 1 350px",
            maxWidth: "440px",
            padding: "40px",
            border: "1px solid #ffffff17",
            borderRadius: "23px",
            background: "rgba(19, 23, 40, 0.88)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 25px 80px #00000055",
          }}
        >
          <span
            style={{
              color: "#a58aff",
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "2px",
            }}
          >
            GET STARTED
          </span>

          <h2 style={{ fontSize: "27px", margin: "13px 0 9px" }}>
            Create your account
          </h2>

          <p
            style={{
              color: "#9299ad",
              fontSize: "13px",
              marginBottom: "30px",
            }}
          >
            Join DevMind AI and start your journey.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  marginBottom: "9px",
                  color: "#dce0ed",
                }}
              >
                Full Name
              </label>

              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  marginBottom: "9px",
                  color: "#dce0ed",
                }}
              >
                Email Address
              </label>

              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: "22px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  marginBottom: "9px",
                  color: "#dce0ed",
                }}
              >
                Password
              </label>

              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  style={{
                    ...inputStyle,
                    paddingRight: "65px",
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "13px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    color: "#a78bfa",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: "49px",
                border: "none",
                borderRadius: "10px",
                background: "linear-gradient(110deg, #7650ed, #347eea)",
                color: "#fff",
                fontSize: "14px",
                fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Creating Account..." : "Create Account →"}
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              color: "#9299ad",
              fontSize: "13px",
              marginTop: "25px",
            }}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              style={{
                color: "#a78bfa",
                textDecoration: "none",
                fontWeight: "600",
              }}
            >
              Sign In
            </Link>
          </p>

          <div
            style={{
              borderTop: "1px solid #ffffff12",
              textAlign: "center",
              paddingTop: "20px",
              marginTop: "25px",
              color: "#646d83",
              fontSize: "11px",
            }}
          >
            Powered by DevMind AI
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
