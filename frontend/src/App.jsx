import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Search from "./pages/Search";
import CategoryRedirect from "./pages/CategoryRedirect";
import ProviderProfile from "./pages/ProviderProfile";
import Booking from "./pages/Booking";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StaticInfo from "./pages/StaticInfo";
import NotFound from "./pages/NotFound";
import CustomerBookings from "./pages/customer/CustomerBookings";
import CustomerFavorites from "./pages/customer/CustomerFavorites";
import CustomerProfile from "./pages/customer/CustomerProfile";
import ProviderOnboarding from "./pages/provider/ProviderOnboarding";
import ProviderDashboardHome from "./pages/provider/ProviderDashboardHome";
import ProviderServices from "./pages/provider/ProviderServices";
import ProviderBookings from "./pages/provider/ProviderBookings";
import ProviderProfileEdit from "./pages/provider/ProviderProfileEdit";
import AiAssistant from "./components/AiAssistant";
import PageStage from "./components/PageStage";

function Layout() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const isLight =
    pathname.startsWith("/search") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/become-a-pro") ||
    pathname.startsWith("/info");
  return (
    <div
      className={`min-h-dvh flex flex-col overflow-x-clip ${
        isHome || isLight ? "bg-canvas text-navy" : "bg-surface text-ink"
      }`}
    >
      <Navbar overlay={isHome} light={isLight} />
      <main className="flex-1">
        <PageStage />
      </main>
      <Footer />
      <AiAssistant />
    </div>
  );
}

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  return children;
}

function RequireProvider({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.is_provider) return <Navigate to="/become-a-pro" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/categories/:slug" element={<CategoryRedirect />} />
        <Route path="/providers/:providerId" element={<ProviderProfile />} />
        <Route
          path="/book/:providerId/:serviceId"
          element={
            <RequireAuth>
              <Booking />
            </RequireAuth>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/info/:slug" element={<StaticInfo />} />

        <Route
          path="/account/bookings"
          element={
            <RequireAuth>
              <CustomerBookings />
            </RequireAuth>
          }
        />
        <Route
          path="/account/favorites"
          element={
            <RequireAuth>
              <CustomerFavorites />
            </RequireAuth>
          }
        />
        <Route
          path="/account/profile"
          element={
            <RequireAuth>
              <CustomerProfile />
            </RequireAuth>
          }
        />

        <Route path="/become-a-pro" element={<ProviderOnboarding />} />
        <Route
          path="/pro/dashboard"
          element={
            <RequireProvider>
              <ProviderDashboardHome />
            </RequireProvider>
          }
        />
        <Route
          path="/pro/services"
          element={
            <RequireProvider>
              <ProviderServices />
            </RequireProvider>
          }
        />
        <Route
          path="/pro/bookings"
          element={
            <RequireProvider>
              <ProviderBookings />
            </RequireProvider>
          }
        />
        <Route
          path="/pro/profile"
          element={
            <RequireProvider>
              <ProviderProfileEdit />
            </RequireProvider>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
