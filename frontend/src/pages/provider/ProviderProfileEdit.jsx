import { Navigate } from "react-router-dom";

/** @deprecated Use /pro/profile and /pro/settings */
export default function ProviderProfileEdit() {
  return <Navigate to="/pro/settings" replace />;
}