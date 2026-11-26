import { useAuth } from "../context/AuthContext";
import DashboardShell from "./DashboardShell";

/**
 * Keeps logged-in customers/pros inside the dashboard chrome on marketplace pages
 * (post, search, credits, pay, listings) so the customer flow never drops the sidebar.
 */
export default function MaybeAppShell({ children, prefer = "customer" }) {
  const { user } = useAuth();
  if (!user) return children;
  const role = user.active_mode === "provider" || prefer === "pro" ? "pro" : "customer";
  return <DashboardShell role={role}>{children}</DashboardShell>;
}
