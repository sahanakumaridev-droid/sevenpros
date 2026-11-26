import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import client from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import Logo from "../brand/Logo";
import GoogleSignIn from "./GoogleSignIn";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.98 10.72A5.41 5.41 0 0 1 3.7 9c0-.6.1-1.18.28-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.05l3.02-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.02 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
      <path d="M12.7 9.4c0-1.7 1.4-2.5 1.5-2.6-0.8-1.2-2.1-1.3-2.5-1.4-1.1-.1-2 .6-2.6.6-.6 0-1.4-.6-2.3-.6-1.2 0-2.3.7-2.9 1.8-1.3 2.2-.3 5.4 0.9 7.2.6.9 1.3 1.9 2.2 1.8.9 0 1.2-.6 2.3-.6s1.4.6 2.3.6c1 0 1.6-.9 2.2-1.8.7-1 .9-2 1-2-.02-.01-1.7-.7-1.7-2.8zM11.1 4.3c.5-.6.8-1.4.7-2.3-.7 0-1.6.5-2.1 1.1-.5.5-.9 1.4-.8 2.2.8.1 1.6-.4 2.2-1z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 13.5c0-2.4 2.2-4 5-4s5 1.6 5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CustomerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 15c0-2.8 2.4-4.5 5.5-4.5s5.5 1.7 5.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ProIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M4 14.5 9 4.5l5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.2 10.5h5.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" className="text-[#94A3B8]">
      <rect x="2.5" y="4.5" width="13" height="9.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3.2 5.2 9 9.4l5.8-4.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FieldLockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" className="text-[#94A3B8]">
      <rect x="4" y="8" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6.2 8V6.2a2.8 2.8 0 0 1 5.6 0V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

const press = "transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.98]";

const DEMOS = {
  hire: { email: "claire@sevenpros-demo.com", password: "password123" },
  offer: { email: "lucas@sevenpros-demo.com", password: "password123" },
};

const SIGNIN_FEATURES = [
  {
    label: "Access Your Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M9.5 2.5 4 10h5l-.5 5.5L14 8H9l.5-5.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Manage Your Projects",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M9 14.5c2.8-1.4 4.8-3.4 4.8-6.2V5.2L9 3.2 4.2 5.2v3.1c0 2.8 2 4.8 4.8 6.2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Grow Your Business",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M3.5 13.5V9.5M7.5 13.5V6.5M11.5 13.5V8.5M14.5 13.5V4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

const SIGNUP_FEATURES = [
  {
    label: "Fast & Easy Signup",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M9.5 2.5 4 10h5l-.5 5.5L14 8H9l.5-5.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Trusted Community",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M9 2.5 3.5 5v4.2c0 3.3 2.3 5.6 5.5 6.8 3.2-1.2 5.5-3.5 5.5-6.8V5L9 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M6.8 9.1 8.3 10.6 11.4 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Grow Your Business",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M5.5 10.5c1.2 1.4 2.8 2.2 4.5 2.2h1.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M4 8.2c.8-.9 1.9-1.4 3.1-1.4h.6c1.4 0 2.5-.9 2.8-2.2l.2-.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12.2 5.5c1.4.3 2.5 1.4 2.8 2.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="5" cy="12.5" r="1.4" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="13" cy="4.8" r="1.4" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    ),
  },
];

/**
 * @param {{ mode: "signin" | "signup", hubPath?: string }} props
 * hubPath: when set (e.g. /get-started), Sign in / Sign up stay on one friendly page.
 */
export default function AuthPage({ mode, hubPath = "" }) {
  const isSignup = mode === "signup";
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login } = useAuth();

  const initialIntent = useMemo(() => {
    const role = params.get("role");
    const intent = params.get("intent");
    if (role === "pro" || intent === "offer") return "offer";
    return "hire";
  }, [params]);

  const nextPath =
    params.get("next") || (initialIntent === "offer" ? "/pro/dashboard" : "/account/dashboard");

  const [intent, setIntent] = useState(initialIntent);
  const isPro = intent === "offer";
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(true);
  const [demoLoading, setDemoLoading] = useState(null);
  const [signupForm, setSignupForm] = useState({ full_name: "", email: "", phone: "", password: "" });
  const [signinForm, setSigninForm] = useState(DEMOS[initialIntent]);
  const [signinStep, setSigninStep] = useState("credentials");
  const [emailOtp, setEmailOtp] = useState("");
  const [devOtpHint, setDevOtpHint] = useState("");
  const [signinBusy, setSigninBusy] = useState(false);
  const googleId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  const rules = {
    length: signupForm.password.length >= 8,
    number: /\d/.test(signupForm.password),
    special: /[^A-Za-z0-9]/.test(signupForm.password),
  };
  const passwordReady = rules.length && rules.number && rules.special;

  const qs = (extra = {}) => {
    const q = new URLSearchParams();
    if (nextPath && nextPath !== "/") q.set("next", nextPath);
    if (intent === "offer") q.set("intent", "offer");
    Object.entries(extra).forEach(([k, v]) => {
      if (v != null && v !== "") q.set(k, v);
    });
    const s = q.toString();
    return s ? `?${s}` : "";
  };

  const switchAuthTo = (nextMode) => {
    if (hubPath) {
      return `${hubPath}${qs({ mode: nextMode === "signin" ? "signin" : "signup" })}`;
    }
    return nextMode === "signin" ? `/login${qs()}` : `/signup${qs()}`;
  };

  const chooseIntent = (next) => {
    setIntent(next);
    setError("");
    if (!isSignup) setSigninForm(DEMOS[next]);
  };

  const finish = (res) => {
    login(res.data.access_token, res.data.user, isSignup ? true : remember);
    const user = res.data.user;
    const explicitNext = params.get("next");
    if (explicitNext) {
      navigate(explicitNext);
      return;
    }
    if (intent === "offer") {
      navigate(user.is_provider ? "/pro/dashboard" : "/become-a-pro");
      return;
    }
    navigate("/account/dashboard");
  };

  const onGoogleSuccess = (res) => {
    setError("");
    setNotice("");
    finish(res);
  };

  const onGoogleError = (message) => {
    setNotice("");
    setError(message);
  };

  const googleFallback = () => {
    setError("");
    setNotice(
      "Add VITE_GOOGLE_CLIENT_ID (frontend) and GOOGLE_CLIENT_ID (API) from Google Cloud → OAuth Web client. Origins: http://localhost:5173 and https://sevenpros.vercel.app",
    );
  };

  const continueApple = () => {
    setNotice("Apple Sign In is coming soon — use Google or email for now.");
  };

  const submitSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (!passwordReady) {
      setError("Use at least 8 characters, one number, and one special character.");
      return;
    }
    if (isPro && !signupForm.phone.trim()) {
      setError("Professionals need a business phone for customer calls.");
      return;
    }
    try {
      const res = await client.post("/auth/signup", signupForm);
      finish(res);
    } catch (err) {
      setError(err.response?.data?.detail || "Signup failed");
    }
  };

  const submitSignin = async (e) => {
    e.preventDefault();
    setError("");
    setSigninBusy(true);
    try {
      if (signinStep === "credentials") {
        const res = await client.post("/auth/email/login-start", signinForm);
        setDevOtpHint(res.data.dev_otp || "");
        setSigninStep("otp");
        setNotice(res.data.message || "Check your email for a verification code.");
        setEmailOtp("");
        return;
      }
      const res = await client.post("/auth/email/login-verify", {
        email: signinForm.email,
        code: emailOtp.trim(),
      });
      finish(res);
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setSigninBusy(false);
    }
  };

  const resendEmailOtp = async () => {
    setError("");
    setSigninBusy(true);
    try {
      const res = await client.post("/auth/email/login-start", signinForm);
      setDevOtpHint(res.data.dev_otp || "");
      setNotice("We sent a new code to your email.");
    } catch (err) {
      setError(err.response?.data?.detail || "Could not resend code");
    } finally {
      setSigninBusy(false);
    }
  };

  const demoLogin = async (role) => {
    setError("");
    setDemoLoading(role);
    try {
      const res = await client.post("/auth/demo-login", { role });
      login(res.data.access_token, res.data.user, remember);
      const explicitNext = params.get("next");
      if (explicitNext) {
        navigate(explicitNext);
        return;
      }
      navigate(role === "provider" ? "/pro/dashboard" : "/account/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Demo login failed");
    } finally {
      setDemoLoading(null);
    }
  };

  const field =
    "h-12 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-11 pr-3.5 text-[15px] text-[#0b1220] outline-none transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-[#94A3B8] focus:border-[#5b46f5] focus:bg-white focus:shadow-[0_0_0_3px_rgba(91,70,245,0.14)]";

  const tabActive =
    "bg-[linear-gradient(100deg,#5b46f5_0%,#3b82f6_100%)] text-white shadow-[0_10px_22px_rgba(91,70,245,0.28)]";
  const tabIdle = "bg-transparent text-[#64748b] hover:text-[#0b1220]";
  const features = isSignup ? SIGNUP_FEATURES : SIGNIN_FEATURES;
  const heroSrc = isSignup ? "/auth-signup-hero.jpg?v=2" : "/auth-signin-hero.jpg?v=2";

  return (
    <div className="relative min-h-[calc(100dvh-4rem)] overflow-x-clip bg-[#071028] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: isSignup
            ? "radial-gradient(circle at 18% 18%, rgba(91,70,245,0.34), transparent 42%), radial-gradient(circle at 82% 72%, rgba(59,130,246,0.2), transparent 40%)"
            : "radial-gradient(ellipse at 15% 40%, rgba(34,211,238,0.18), transparent 45%), radial-gradient(ellipse at 70% 20%, rgba(167,139,250,0.22), transparent 40%), radial-gradient(circle at 85% 80%, rgba(59,130,246,0.16), transparent 42%)",
        }}
      />

      <div className="relative mx-auto grid min-h-[calc(100dvh-4rem)] w-full max-w-[1120px] lg:grid-cols-[1.05fr_440px] lg:items-center lg:gap-10 lg:px-8">
        <aside className="hidden px-10 py-10 lg:flex lg:flex-col lg:justify-center xl:px-4">
          <div className="motion-safe:[animation:rise-in_480ms_var(--ease-out)_both]">
            {isSignup ? (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white/90 backdrop-blur-sm">
                  🚀 New here?
                </span>
                <h1 className="mt-5 max-w-[16ch] text-[2.45rem] font-bold leading-[1.08] tracking-[-0.045em]">
                  Join the{" "}
                  <span className="bg-[linear-gradient(90deg,#60a5fa,#a78bfa)] bg-clip-text text-transparent">
                    SevenPros
                  </span>{" "}
                  crew
                </h1>
                <p className="mt-3 max-w-[40ch] text-[15px] leading-relaxed text-white/70">
                  Create an account once. Then hire help or grow as a pro — pick Customer or Professional on the form.
                </p>
              </>
            ) : (
              <>
                <h1 className="max-w-[12ch] text-[2.7rem] font-bold leading-[1.05] tracking-[-0.045em]">
                  Welcome{" "}
                  <span className="bg-[linear-gradient(90deg,#22d3ee,#a78bfa)] bg-clip-text text-transparent">
                    Back!
                  </span>
                </h1>
                <p className="mt-3 max-w-[36ch] text-[15px] leading-relaxed text-white/70">
                  Sign in to your SevenPros account and continue your journey.
                </p>
              </>
            )}

            <div className="mt-7 grid grid-cols-3 gap-3">
              {features.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3.5 text-center backdrop-blur-sm"
                >
                  <div className="mx-auto flex size-9 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#5b46f5,#3b82f6)] text-white">
                    {item.icon}
                  </div>
                  <p className="mt-2.5 text-[11px] font-semibold leading-snug text-white/80">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mt-8 max-w-[500px]">
            <div
              aria-hidden="true"
              className="absolute -inset-3 rounded-[36px] bg-[radial-gradient(circle_at_40%_40%,rgba(91,70,245,0.32),transparent_60%)] blur-2xl"
            />
            <div className="relative overflow-hidden rounded-[28px] bg-transparent">
              <img
                src={heroSrc}
                alt={isSignup ? "SevenPros crew of professionals" : "SevenPros pros ready to help"}
                className="auth-crew-float relative z-[1] w-full object-contain object-bottom"
              />
            </div>
          </div>
        </aside>

        <section className="flex items-center px-4 py-8 sm:px-6 lg:px-0 lg:py-10">
          <div className="w-full rounded-[24px] bg-white p-6 text-[#0b1220] shadow-[0_24px_60px_rgba(0,0,0,0.28)] sm:p-8 motion-safe:[animation:rise-in_420ms_var(--ease-out)_60ms_both]">
            <div className="mb-5 flex items-center justify-between lg:hidden">
              <Logo compact tone="light" showTagline={false} />
              <Link to="/" className="text-[12px] font-semibold text-[#5b46f5]">
                Back home
              </Link>
            </div>

            {/* Sign in first, then Sign up */}
            <div className="grid grid-cols-2 gap-1.5 rounded-2xl bg-[#F1F5F9] p-1.5" role="tablist" aria-label="Sign in or sign up">
              <Link
                to={switchAuthTo("signin")}
                role="tab"
                aria-selected={!isSignup}
                className={`${press} flex h-12 items-center justify-center gap-2 rounded-xl text-[14px] font-bold ${
                  !isSignup ? tabActive : tabIdle
                }`}
              >
                <UserIcon />
                Sign in
              </Link>
              <Link
                to={switchAuthTo("signup")}
                role="tab"
                aria-selected={isSignup}
                className={`${press} flex h-12 items-center justify-center gap-2 rounded-xl text-[14px] font-bold ${
                  isSignup ? tabActive : tabIdle
                }`}
              >
                <UserIcon />
                Sign up
              </Link>
            </div>

            {isSignup ? (
              <>
                <h2 className="mt-5 text-[1.45rem] font-bold tracking-[-0.04em]">Create your account</h2>
                <p className="mt-1 text-[13px] text-[#64748b]">New to SevenPros? Fill this in — takes about a minute.</p>

                <div className="mt-4 grid grid-cols-2 gap-2" role="tablist" aria-label="Account type">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={!isPro}
                    onClick={() => chooseIntent("hire")}
                    className={`${press} flex h-12 items-center justify-center gap-2 rounded-xl border text-[13px] font-semibold ${
                      !isPro
                        ? "border-[#5b46f5] bg-[#F5F3FF] text-[#5b46f5]"
                        : "border-[#E2E8F0] bg-white text-[#64748b]"
                    }`}
                  >
                    <CustomerIcon />
                    Customer
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isPro}
                    onClick={() => chooseIntent("offer")}
                    className={`${press} flex h-12 items-center justify-center gap-2 rounded-xl border text-[13px] font-semibold ${
                      isPro
                        ? "border-[#5b46f5] bg-[#F5F3FF] text-[#5b46f5]"
                        : "border-[#E2E8F0] bg-white text-[#64748b]"
                    }`}
                  >
                    <ProIcon />
                    Professional
                  </button>
                </div>

                {googleId ? (
                  <div className="mt-5">
                    <GoogleSignIn
                      mode="signup"
                      onSuccess={onGoogleSuccess}
                      onError={onGoogleError}
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={googleFallback}
                    className={`${press} mt-5 flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[14px] font-semibold text-[#0b1220] hover:bg-[#F8FAFC]`}
                  >
                    <GoogleIcon /> Continue with Google
                  </button>
                )}

                <div className="my-4 flex items-center gap-3 text-[12px] text-[#94A3B8]">
                  <span className="h-px flex-1 bg-[#E2E8F0]" />
                  or email
                  <span className="h-px flex-1 bg-[#E2E8F0]" />
                </div>

                <form onSubmit={submitSignup} className="space-y-3.5">
                  <label className="block text-[13px] font-medium text-[#334155]">
                    Email
                    <span className="relative mt-1.5 block">
                      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2">
                        <EnvelopeIcon />
                      </span>
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="you@email.com"
                        value={signupForm.email}
                        onChange={(e) => setSignupForm((f) => ({ ...f, email: e.target.value }))}
                        className={field}
                      />
                    </span>
                  </label>
                  <label className="block text-[13px] font-medium text-[#334155]">
                    Full name
                    <input
                      required
                      autoComplete="name"
                      placeholder="Your name"
                      value={signupForm.full_name}
                      onChange={(e) => setSignupForm((f) => ({ ...f, full_name: e.target.value }))}
                      className="mt-1.5 h-12 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 text-[15px] text-[#0b1220] outline-none transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-[#94A3B8] focus:border-[#5b46f5] focus:bg-white focus:shadow-[0_0_0_3px_rgba(91,70,245,0.14)]"
                    />
                  </label>
                  {isPro && (
                    <label className="block text-[13px] font-medium text-[#334155]">
                      Business phone
                      <input
                        type="tel"
                        required
                        autoComplete="tel"
                        placeholder="+1 415 555 0100"
                        value={signupForm.phone}
                        onChange={(e) => setSignupForm((f) => ({ ...f, phone: e.target.value }))}
                        className="mt-1.5 h-12 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 text-[15px] text-[#0b1220] outline-none transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-[#94A3B8] focus:border-[#5b46f5] focus:bg-white focus:shadow-[0_0_0_3px_rgba(91,70,245,0.14)]"
                      />
                    </label>
                  )}
                  <label className="block text-[13px] font-medium text-[#334155]">
                    Password
                    <span className="relative mt-1.5 block">
                      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2">
                        <FieldLockIcon />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="new-password"
                        placeholder="Create a password"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm((f) => ({ ...f, password: e.target.value }))}
                        className={`${field} pr-11`}
                      />
                      <button
                        type="button"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                        onClick={() => setShowPassword((v) => !v)}
                      >
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                          <path d="M1.6 9S4.2 4.2 9 4.2 16.4 9 16.4 9 13.8 13.8 9 13.8 1.6 9 1.6 9Z" stroke="currentColor" strokeWidth="1.4" />
                          <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.4" />
                          {showPassword && <path d="M3 15 15 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />}
                        </svg>
                      </button>
                    </span>
                  </label>
                  <p className={`text-[12px] ${passwordReady || !signupForm.password ? "text-[#94A3B8]" : "text-[#9a3412]"}`}>
                    8+ characters, one number, one symbol
                  </p>
                  <button
                    type="submit"
                    className={`${press} h-12 w-full rounded-xl bg-[linear-gradient(100deg,#5b46f5_0%,#3b82f6_100%)] text-[14px] font-semibold text-white shadow-[0_12px_28px_rgba(91,70,245,0.28)]`}
                  >
                    {isPro ? "Create pro account →" : "Create customer account →"}
                  </button>
                </form>

                <p className="mt-5 text-center text-[13px] text-[#64748b]">
                  Already registered? Use the <span className="font-semibold text-[#0b1220]">Sign in</span> tab above.
                </p>
              </>
            ) : (
              <>
                <h2 className="mt-5 text-[1.45rem] font-bold tracking-[-0.04em]">
                  Sign in to{" "}
                  <span className="bg-[linear-gradient(90deg,#5b46f5,#3b82f6)] bg-clip-text text-transparent">
                    SevenPros
                  </span>
                </h2>
                <p className="mt-1 text-[13px] text-[#64748b]">
                  {signinStep === "otp"
                    ? "Enter the 6-digit code we emailed you."
                    : "Welcome back! Sign in with email, then verify with a one-time code."}
                </p>

                <form onSubmit={submitSignin} className="mt-5 space-y-3.5">
                  {signinStep === "otp" ? (
                    <>
                      <p className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-[13px] text-[#475569]">
                        Code sent to <span className="font-semibold text-[#0b1220]">{signinForm.email}</span>
                      </p>
                      {devOtpHint ? (
                        <p className="rounded-xl border border-dashed border-[#c4b5fd] bg-[#F5F3FF] px-3.5 py-2.5 text-[12px] text-[#5b46f5]">
                          Demo / dev code: <span className="font-mono font-bold tracking-widest">{devOtpHint}</span>
                        </p>
                      ) : null}
                      <label className="block text-[13px] font-medium text-[#334155]">
                        Verification code
                        <input
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          required
                          maxLength={6}
                          placeholder="000000"
                          value={emailOtp}
                          onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          className="mt-1.5 h-12 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 text-center text-[20px] font-semibold tracking-[0.35em] text-[#0b1220] outline-none transition-[border-color,box-shadow,background-color] duration-150 focus:border-[#5b46f5] focus:bg-white focus:shadow-[0_0_0_3px_rgba(91,70,245,0.14)]"
                        />
                      </label>
                      <div className="flex items-center justify-between gap-2 text-[13px]">
                        <button
                          type="button"
                          disabled={signinBusy}
                          onClick={() => {
                            setSigninStep("credentials");
                            setEmailOtp("");
                            setDevOtpHint("");
                            setNotice("");
                          }}
                          className="font-semibold text-[#64748b] hover:text-[#0b1220] disabled:opacity-60"
                        >
                          ← Back
                        </button>
                        <button
                          type="button"
                          disabled={signinBusy}
                          onClick={resendEmailOtp}
                          className="font-semibold text-[#5b46f5] hover:underline disabled:opacity-60"
                        >
                          Resend code
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                  <label className="block text-[13px] font-medium text-[#334155]">
                    Email
                    <span className="relative mt-1.5 block">
                      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2">
                        <EnvelopeIcon />
                      </span>
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="Email address"
                        value={signinForm.email}
                        onChange={(e) => setSigninForm((f) => ({ ...f, email: e.target.value }))}
                        className={field}
                      />
                    </span>
                  </label>
                  <label className="block text-[13px] font-medium text-[#334155]">
                    Password
                    <span className="relative mt-1.5 block">
                      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2">
                        <FieldLockIcon />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="current-password"
                        placeholder="Password"
                        value={signinForm.password}
                        onChange={(e) => setSigninForm((f) => ({ ...f, password: e.target.value }))}
                        className={`${field} pr-11`}
                      />
                      <button
                        type="button"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                        onClick={() => setShowPassword((v) => !v)}
                      >
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                          <path d="M1.6 9S4.2 4.2 9 4.2 16.4 9 16.4 9 13.8 13.8 9 13.8 1.6 9 1.6 9Z" stroke="currentColor" strokeWidth="1.4" />
                          <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.4" />
                          {showPassword && <path d="M3 15 15 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />}
                        </svg>
                      </button>
                    </span>
                  </label>

                  <div className="flex items-center justify-between gap-3 pt-0.5">
                    <label className="flex items-center gap-2 text-[13px] text-[#475569]">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="size-4 accent-[#5b46f5]"
                      />
                      Remember me
                    </label>
                    <button
                      type="button"
                      onClick={() => setNotice("Password reset link coming soon — email support@sevenpros.com for help.")}
                      className="text-[13px] font-semibold text-[#5b46f5] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={signinBusy}
                    className={`${press} flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(100deg,#5b46f5_0%,#3b82f6_100%)] text-[14px] font-semibold text-white shadow-[0_12px_28px_rgba(91,70,245,0.28)] disabled:opacity-70`}
                  >
                    {signinStep === "otp" ? (signinBusy ? "Verifying…" : "Verify & sign in") : signinBusy ? "Sending code…" : "Continue"}
                    <span aria-hidden="true">→</span>
                  </button>
                </form>

                <div className="my-4 flex items-center gap-3 text-[12px] text-[#94A3B8]">
                  <span className="h-px flex-1 bg-[#E2E8F0]" />
                  or
                  <span className="h-px flex-1 bg-[#E2E8F0]" />
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {googleId ? (
                    <div className="sm:col-span-1 google-login-shell">
                      <GoogleSignIn mode="signin" onSuccess={onGoogleSuccess} onError={onGoogleError} />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={googleFallback}
                      className={`${press} flex h-11 items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white text-[13px] font-semibold text-[#0b1220] hover:bg-[#F8FAFC]`}
                    >
                      <GoogleIcon /> Google
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={continueApple}
                    className={`${press} flex h-11 items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white text-[13px] font-semibold text-[#0b1220] hover:bg-[#F8FAFC]`}
                  >
                    <AppleIcon /> Apple
                  </button>
                </div>

                <p className="mt-5 text-center text-[13px] text-[#64748b]">
                  Don&apos;t have an account?{" "}
                  <Link to={switchAuthTo("signup")} className="font-semibold text-[#5b46f5] hover:underline">
                    Create one →
                  </Link>
                </p>

                <div className="mt-5 grid grid-cols-2 gap-2 border-t border-[#EEF2F7] pt-4">
                  <button
                    type="button"
                    disabled={!!demoLoading}
                    onClick={() => demoLogin("customer")}
                    className={`${press} h-9 rounded-lg text-[12px] font-semibold text-[#64748b] hover:bg-[#F8FAFC] disabled:opacity-60`}
                  >
                    {demoLoading === "customer" ? "Loading…" : "Demo customer"}
                  </button>
                  <button
                    type="button"
                    disabled={!!demoLoading}
                    onClick={() => demoLogin("provider")}
                    className={`${press} h-9 rounded-lg text-[12px] font-semibold text-[#64748b] hover:bg-[#F8FAFC] disabled:opacity-60`}
                  >
                    {demoLoading === "provider" ? "Loading…" : "Demo pro"}
                  </button>
                </div>
              </>
            )}

            {notice && <p className="mt-3 text-center text-[13px] text-[#475569]">{notice}</p>}
            {error && (
              <p className="mt-3 text-center text-[13px] text-[#9a3412]" role="alert">
                {error}
              </p>
            )}

            <p className="mt-4 text-center text-[11px] leading-relaxed text-[#94A3B8]">
              By continuing, you agree to the{" "}
              <Link to="/info/terms" className="underline underline-offset-2">
                Terms
              </Link>{" "}
              and{" "}
              <Link to="/info/privacy" className="underline underline-offset-2">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
