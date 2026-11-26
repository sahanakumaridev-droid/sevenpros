import { useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@sevenpros.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [devOtp, setDevOtp] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      let res;
      if (otpStep) {
        res = await client.post("/auth/email/login-verify", { email, code: otp.trim() });
      } else if (email === "admin@sevenpros.com" && password === "password123") {
        res = await client.post("/auth/demo-login", { role: "admin" });
      } else {
        const start = await client.post("/auth/email/login-start", { email, password });
        setDevOtp(start.data.dev_otp || "");
        setOtpStep(true);
        return;
      }
      if (!res.data.user?.is_admin) {
        setError("This sign-in is only for the operations team.");
        return;
      }
      login(res.data.access_token, res.data.user);
      navigate("/admin");
    } catch {
      setError("Email or password is not valid.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#0F172A] text-white grid place-items-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm">
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-white/50">SevenPros</p>
        <h1 className="mt-2 text-2xl font-bold tracking-[-0.03em]">Operations</h1>
        <p className="mt-1 text-sm text-white/60">Staff sign-in. Not a customer account.</p>
        {error && <p className="mt-4 text-sm text-[#FCA5A5]">{error}</p>}
        <label className="block mt-6 text-sm font-medium">
          Work email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg bg-white text-[#0F172A] px-3 py-2.5"
          />
        </label>
        {!otpStep ? (
          <label className="block mt-3 text-sm font-medium">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg bg-white text-[#0F172A] px-3 py-2.5"
            />
          </label>
        ) : (
          <label className="block mt-3 text-sm font-medium">
            Email verification code
            {devOtp ? <span className="ml-2 text-xs text-white/50">Dev: {devOtp}</span> : null}
            <input
              inputMode="numeric"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="mt-1 w-full rounded-lg bg-white text-[#0F172A] px-3 py-2.5 tracking-widest"
            />
          </label>
        )}
        <button type="submit" disabled={busy} className="mt-5 h-11 w-full rounded-lg bg-white text-[#0F172A] font-semibold">
          {busy ? "Signing in…" : otpStep ? "Verify & enter" : "Enter CRM"}
        </button>
      </form>
    </div>
  );
}
