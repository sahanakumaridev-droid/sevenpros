import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const nextPath = params.get("next") || "/";
  const { login } = useAuth();
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await client.post("/auth/signup", form);
      login(res.data.access_token, res.data.user);
      navigate(nextPath);
    } catch (err) {
      setError(err.response?.data?.detail || "Signup failed");
    }
  };

  return (
    <div className="container-page py-16 max-w-md">
      <h1 className="text-2xl font-semibold text-ink mb-1">Create your account</h1>
      <p className="text-muted mb-6">Book trusted local pros in minutes.</p>

      {error && (
        <div className="bg-[#2a1c14] text-danger text-sm rounded-[3px] px-4 py-3 mb-4" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted">Full name</label>
          <input
            required
            value={form.full_name}
            onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
            className="mt-1 w-full border px-3 py-2.5 text-base"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-muted">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="mt-1 w-full border px-3 py-2.5 text-base"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-muted">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className="mt-1 w-full border px-3 py-2.5 text-base"
          />
        </div>
        <button type="submit" className="btn btn-primary w-full h-11">
          Create Account
        </button>
      </form>

      <p className="text-sm text-muted mt-6 text-center">
        Already have an account?{" "}
        <Link to={`/login?next=${encodeURIComponent(nextPath)}`} className="text-brand-400 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
