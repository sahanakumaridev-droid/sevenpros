import { useSearchParams } from "react-router-dom";
import AuthPage from "../components/auth/AuthPage";

/**
 * Friendly entry: Sign in first, then Sign up — no extra Customer vs Pro page.
 * Account type (Customer / Pro) is a simple toggle on the auth form.
 */
export default function GetStarted() {
  const [params] = useSearchParams();
  const mode = params.get("mode") === "signup" ? "signup" : "signin";
  return <AuthPage mode={mode} hubPath="/get-started" />;
}
