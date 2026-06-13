"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export default function AdminLoginPage() {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggingIn) return;

    setIsLoggingIn(true);
    let shouldResetLoading = true;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ loginId, password }),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.token, data.user);
        shouldResetLoading = false;
        window.location.assign("/admin");
      } else {
        alert(data.error || "Login failed");
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please try again.");
    } finally {
      if (shouldResetLoading) {
        setIsLoggingIn(false);
      }
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ background: "linear-gradient(135deg, #e8edf5 0%, #dce4f0 100%)" }}
    >
      {/* Decorative background dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          style={{
            position: "absolute",
            top: "10%",
            right: "8%",
            width: 180,
            height: 180,
            borderRadius: "50%",
            border: "1.5px dashed #b0bcd4",
            opacity: 0.5,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "14%",
            right: "11%",
            width: 100,
            height: 100,
            borderRadius: "50%",
            border: "1.5px dashed #b0bcd4",
            opacity: 0.5,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "12%",
            left: "7%",
            width: 140,
            height: 140,
            borderRadius: "50%",
            border: "1.5px dashed #b0bcd4",
            opacity: 0.5,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "16%",
            left: "10%",
            width: 70,
            height: 70,
            borderRadius: "50%",
            border: "1.5px dashed #b0bcd4",
            opacity: 0.5,
          }}
        />
      </div>

      {/* Card */}
      <div
        style={{
          background: "#fff",
          borderRadius: 24,
          padding: "52px 56px 44px",
          width: 520,
          boxShadow: "0 8px 40px rgba(60,80,140,0.10)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Shield Icon */}
        <div className="flex justify-center mb-5">
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #e8edf8 60%, #d0d9f0 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(60,90,180,0.10)",
            }}
          >
            <svg width="26" height="28" viewBox="0 0 26 28" fill="none">
              <path
                d="M13 2L3 6.5V13.5C3 19.2 7.4 24.5 13 26C18.6 24.5 23 19.2 23 13.5V6.5L13 2Z"
                fill="none"
                stroke="#3b5bdb"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M9 14l2.5 2.5L17 11"
                stroke="#3b5bdb"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2
          style={{
            textAlign: "center",
            fontSize: 24,
            fontWeight: 700,
            color: "#1a2340",
            marginBottom: 6,
            letterSpacing: "-0.3px",
            fontFamily: "inherit",
          }}
        >
          Admin Login
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "#8a94a8",
            fontSize: 14,
            marginBottom: 28,
            lineHeight: 1.5,
          }}
        >
          Welcome back! Please login to access
          <br />
          the admin panel.
        </p>

        <form onSubmit={handleLogin}>
          {/* Login ID */}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#2d3a54",
                marginBottom: 6,
              }}
            >
              Login ID
            </label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: 13,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#b0bac8",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="#b0bac8" strokeWidth="1.8" />
                  <path
                    d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
                    stroke="#b0bac8"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Enter your login ID"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                disabled={isLoggingIn}
                style={{
                  width: "100%",
                  border: "1.5px solid #e2e7f0",
                  borderRadius: 10,
                  padding: "11px 12px 11px 38px",
                  fontSize: 14,
                  color: "#2d3a54",
                  outline: "none",
                  background: "#fff",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                  opacity: isLoggingIn ? 0.75 : 1,
                }}
                onFocus={(e) => (e.target.style.borderColor = "#3b5bdb")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e7f0")}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#2d3a54",
                marginBottom: 6,
              }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: 13,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#b0bac8",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <svg width="16" height="17" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="5"
                    y="11"
                    width="14"
                    height="10"
                    rx="2"
                    stroke="#b0bac8"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M8 11V7a4 4 0 018 0v4"
                    stroke="#b0bac8"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoggingIn}
                style={{
                  width: "100%",
                  border: "1.5px solid #e2e7f0",
                  borderRadius: 10,
                  padding: "11px 40px 11px 38px",
                  fontSize: 14,
                  color: "#2d3a54",
                  outline: "none",
                  background: "#fff",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                  opacity: isLoggingIn ? 0.75 : 1,
                }}
                onFocus={(e) => (e.target.style.borderColor = "#3b5bdb")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e7f0")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#b0bac8",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"
                      stroke="#b0bac8"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <line
                      x1="1"
                      y1="1"
                      x2="23"
                      y2="23"
                      stroke="#b0bac8"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                      stroke="#b0bac8"
                      strokeWidth="1.8"
                    />
                    <circle cx="12" cy="12" r="3" stroke="#b0bac8" strokeWidth="1.8" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember me + Forgot Password */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 22,
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                cursor: "pointer",
                fontSize: 13,
                color: "#6b7590",
              }}
            >
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoggingIn}
                style={{
                  width: 15,
                  height: 15,
                  accentColor: "#3b5bdb",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              />
              Remember me
            </label>
            
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoggingIn}
            style={{
              width: "100%",
              background: "linear-gradient(90deg, #3b5bdb 0%, #2244c4 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "13px 0",
              fontSize: 15,
              fontWeight: 600,
              cursor: isLoggingIn ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              letterSpacing: "0.2px",
              boxShadow: "0 4px 14px rgba(59,91,219,0.30)",
              transition: "opacity 0.2s",
              opacity: isLoggingIn ? 0.82 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isLoggingIn) {
                (e.currentTarget as HTMLButtonElement).style.opacity = "0.92";
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoggingIn) {
                (e.currentTarget as HTMLButtonElement).style.opacity = "1";
              }
            }}
          >
            {isLoggingIn ? (
              <>
                <span
                  style={{
                    width: 18,
                    height: 18,
                    border: "2px solid rgba(255,255,255,0.45)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "login-spin 0.8s linear infinite",
                  }}
                />
                Logging in...
              </>
            ) : (
              <>
                Login
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </>
            )}
          </button>
        </form>

        <style jsx>{`
          @keyframes login-spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>

        {/* Security notice */}
        <div
          style={{
            marginTop: 22,
            background: "#f0f4fb",
            borderRadius: 12,
            padding: "13px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "#e0e8f8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect
                x="5"
                y="11"
                width="14"
                height="10"
                rx="2"
                stroke="#3b5bdb"
                strokeWidth="1.8"
              />
              <path
                d="M8 11V7a4 4 0 018 0v4"
                stroke="#3b5bdb"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p style={{ fontSize: 12.5, color: "#6b7590", lineHeight: 1.5, margin: 0 }}>
            This is a secure area and is intended
            <br />
            for authorized administrators only.
          </p>
        </div>
      </div>
    </div>
  );
}
