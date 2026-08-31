import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const nextPath = params.get("next") || "/";
  const { login } = useAuth();
  const [mode, setMode] = useState("email");
  const [error, setError] = useState("");

  const [emailForm, setEmailForm] = useState({ email: "", password: "" });
  const [phoneForm, setPhoneForm] = useState({ phone: "", code: "" });
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState("");
  const [demoLoading, setDemoLoading] = useState(null);

  const submitEmail = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await client.post("/auth/login", emailForm);
      login(res.data.access_token, res.data.user);
      navigate(nextPath);
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    }
  };

  const requestOtp = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await client.post("/auth/phone/request-otp", { phone: phoneForm.phone });
      setOtpSent(true);
      setDevOtp(res.data.dev_otp);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not send code");
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await client.post("/auth/phone/verify-otp", phoneForm);
      login(res.data.access_token, res.data.user);
      navigate(nextPath);
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid code");
    }
  };

  const demoLogin = async (role) => {
    setError("");
    setDemoLoading(role);
    try {
      const res = await client.post("/auth/demo-login", { role });
      login(res.data.access_token, res.data.user);
      navigate(role === "provider" && !params.get("next") ? "/pro/dashboard" : nextPath);
    } catch (err) {
      setError(err.response?.data?.detail || "Demo login failed");
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="container-page py-16 max-w-md">
      <div className="flex items-center gap-3 mb-6">
        <img src="/logo-mark.png" alt="" className="size-12 rounded-xl" />
        <div>
          <h1 className="text-2xl font-display font-bold tracking-[0.08em] uppercase text-ink">
            SEVEN<span className="text-brand-grad">PROS</span>
          </h1>
          <p className="text-muted text-sm">Sign in to book and manage services.</p>
        </div>
      </div>

      <div className="card p-4 mb-6">
        <p className="text-xs font-semibold text-faint uppercase mb-3">Quick demo login</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => demoLogin("customer")}
            disabled={demoLoading !== null}
            className="btn flex-1 border border-line text-ink hover:bg-overlay"
          >
            {demoLoading === "customer" ? "Signing in..." : "Try as Customer"}
          </button>
          <button
            onClick={() => demoLogin("provider")}
            disabled={demoLoading !== null}
            className="btn flex-1 border border-line text-ink hover:bg-overlay"
          >
            {demoLoading === "provider" ? "Signing in..." : "Try as Pro"}
          </button>
        </div>
      </div>

      <div className="flex bg-overlay rounded-[21px] p-1 mb-6 text-sm font-medium">
        <button
          onClick={() => setMode("email")}
          className={`flex-1 py-2 rounded-[21px] ${mode === "email" ? "bg-raised text-ink" : "text-faint"}`}
        >
          Email
        </button>
        <button
          onClick={() => setMode("phone")}
          className={`flex-1 py-2 rounded-[21px] ${mode === "phone" ? "bg-raised text-ink" : "text-faint"}`}
        >
          Phone (OTP)
        </button>
      </div>

      {error && (
        <div className="bg-[#2a1c14] text-danger text-sm rounded-[3px] px-4 py-3 mb-4" role="alert">
          {error}
        </div>
      )}

      {mode === "email" ? (
        <form onSubmit={submitEmail} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted">Email</label>
            <input
              type="email"
              required
              value={emailForm.email}
              onChange={(e) => setEmailForm((f) => ({ ...f, email: e.target.value }))}
              className="mt-1 w-full border px-3 py-2.5 text-base"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted">Password</label>
            <input
              type="password"
              required
              value={emailForm.password}
              onChange={(e) => setEmailForm((f) => ({ ...f, password: e.target.value }))}
              className="mt-1 w-full border px-3 py-2.5 text-base"
            />
          </div>
          <button type="submit" className="btn btn-primary w-full h-11">
            Sign In
          </button>
        </form>
      ) : (
        <form onSubmit={otpSent ? verifyOtp : requestOtp} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted">Phone number</label>
            <input
              required
              disabled={otpSent}
              value={phoneForm.phone}
              onChange={(e) => setPhoneForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+1 555 123 4567"
              className="mt-1 w-full border px-3 py-2.5 text-base disabled:opacity-50"
            />
          </div>
          {otpSent && (
            <div>
              <label className="text-sm font-medium text-muted">Verification code</label>
              <input
                required
                value={phoneForm.code}
                onChange={(e) => setPhoneForm((f) => ({ ...f, code: e.target.value }))}
                className="mt-1 w-full border px-3 py-2.5 text-base"
              />
              <p className="text-xs text-faint mt-1">
                Dev mode: your code is <span className="font-mono tabular-nums">{devOtp}</span> (SMS provider not connected)
              </p>
            </div>
          )}
          <button type="submit" className="btn btn-primary w-full h-11">
            {otpSent ? "Verify & Sign In" : "Send Code"}
          </button>
        </form>
      )}

      <p className="text-sm text-muted mt-6 text-center">
        Don&apos;t have an account?{" "}
        <Link to="/signup" className="text-brand-400 font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
