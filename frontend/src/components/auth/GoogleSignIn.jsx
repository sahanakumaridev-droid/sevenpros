import { GoogleLogin } from "@react-oauth/google";
import client from "../../api/client";

/**
 * Official Google button — posts the ID token to /auth/google.
 * Requires GoogleOAuthProvider in main.jsx and VITE_GOOGLE_CLIENT_ID.
 */
export default function GoogleSignIn({ mode = "signin", onSuccess, onError }) {
  const text = mode === "signup" ? "signup_with" : "signin_with";

  return (
    <div className="w-full google-login-shell">
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          const idToken = credentialResponse?.credential;
          if (!idToken) {
            onError?.("Google did not return a sign-in token.");
            return;
          }
          try {
            const res = await client.post("/auth/google", { id_token: idToken });
            onSuccess?.(res);
          } catch (err) {
            onError?.(err.response?.data?.detail || "Google sign-in failed.");
          }
        }}
        onError={() => onError?.("Google sign-in was cancelled or blocked.")}
        text={text}
        theme="outline"
        shape="rectangular"
        size="large"
        width="400"
      />
    </div>
  );
}