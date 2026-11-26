import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LandingNavbar from "./components/LandingNavbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Services from "./pages/Services";
import CategoryRedirect from "./pages/CategoryRedirect";
import ProviderProfile from "./pages/ProviderProfile";
import Booking from "./pages/Booking";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import GetStarted from "./pages/GetStarted";
import CustomerServices from "./pages/CustomerServices";
import ProServices from "./pages/ProServices";
import StaticInfo from "./pages/StaticInfo";
import NotFound from "./pages/NotFound";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import CustomerBookings from "./pages/customer/CustomerBookings";
import BookingDetail from "./pages/customer/BookingDetail";
import CustomerFavorites from "./pages/customer/CustomerFavorites";
import CustomerProfile from "./pages/customer/CustomerProfile";
import CustomerMessages from "./pages/customer/CustomerMessages";
import CustomerNotifications from "./pages/customer/CustomerNotifications";
import ProviderOnboarding from "./pages/provider/ProviderOnboarding";
import ProviderDashboardHome from "./pages/provider/ProviderDashboardHome";
import ProviderServices from "./pages/provider/ProviderServices";
import ProviderBookings from "./pages/provider/ProviderBookings";
import ProviderProfileEdit from "./pages/provider/ProviderProfileEdit";
import ProAnalytics from "./pages/provider/ProAnalytics";
import ProUsers from "./pages/provider/ProUsers";
import ProProjects from "./pages/provider/ProProjects";
import ProSubscription from "./pages/provider/ProSubscription";
import ProPayments from "./pages/provider/ProPayments";
import ProReports from "./pages/provider/ProReports";
import ProNotifications from "./pages/provider/ProNotifications";
import ProProfile from "./pages/provider/ProProfile";
import ProSettings from "./pages/provider/ProSettings";
import ProMessages from "./pages/provider/ProMessages";
import Leads from "./pages/provider/Leads";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import Credits from "./pages/Credits";
import PostJob from "./pages/PostJob";
import MyPosts from "./pages/MyPosts";
import Listing from "./pages/Listing";
import Pay from "./pages/Pay";
import AiAssistant from "./components/AiAssistant";
import PageStage from "./components/PageStage";
import MaybeAppShell from "./components/MaybeAppShell";
import CustomerPayments from "./pages/customer/CustomerPayments";

function Layout() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const isHome = pathname === "/";
  const marketHome = isHome && Boolean(user);
  const customerShell =
    Boolean(user) &&
    user.active_mode !== "provider" &&
    (pathname.startsWith("/account/") ||
      pathname === "/search" ||
      pathname === "/post" ||
      pathname.startsWith("/listings/"));
  const isAppDash = pathname.startsWith("/account/") || pathname.startsWith("/pro/") || customerShell;
  const hideChrome =
    isAppDash ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/get-started";
  return (
    <div className={`min-h-dvh flex flex-col overflow-x-clip ${isHome && !marketHome ? "bg-white" : "bg-white text-[#14181d]"}`}>
      {!isAppDash && <LandingNavbar overlay={isHome && !user} />}
      <main className="flex-1">
        <PageStage />
      </main>
      {!hideChrome && <Footer />}
      {!hideChrome && <AiAssistant />}
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

function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!user.is_admin) return <Navigate to="/admin/login" replace />;
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
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <Admin />
          </RequireAdmin>
        }
      />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route
          path="/search"
          element={
            <MaybeAppShell prefer="customer">
              <Search />
            </MaybeAppShell>
          }
        />
        <Route path="/credits" element={<Credits />} />
        <Route path="/pay" element={<Pay />} />
        <Route
          path="/post"
          element={
            <RequireAuth>
              <MaybeAppShell prefer="customer">
                <PostJob />
              </MaybeAppShell>
            </RequireAuth>
          }
        />
        <Route path="/account/posts" element={<RequireAuth><MyPosts /></RequireAuth>} />
        <Route
          path="/listings/:id"
          element={
            <MaybeAppShell prefer="customer">
              <Listing />
            </MaybeAppShell>
          }
        />
        <Route path="/categories/:slug" element={<CategoryRedirect />} />
        <Route path="/providers/:providerId" element={<ProviderProfile />} />
        <Route path="/book/:providerId/:serviceId" element={<Booking />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/get-started" element={<GetStarted />} />
        <Route path="/services/customer" element={<CustomerServices />} />
        <Route path="/services/pro" element={<ProServices />} />
        <Route path="/info/:slug" element={<StaticInfo />} />

        <Route
          path="/account/dashboard"
          element={
            <RequireAuth>
              <CustomerDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/account/bookings"
          element={
            <RequireAuth>
              <CustomerBookings />
            </RequireAuth>
          }
        />
        <Route
          path="/account/bookings/:bookingId"
          element={
            <RequireAuth>
              <BookingDetail />
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
        <Route
          path="/account/messages"
          element={
            <RequireAuth>
              <CustomerMessages />
            </RequireAuth>
          }
        />
        <Route
          path="/account/notifications"
          element={
            <RequireAuth>
              <CustomerNotifications />
            </RequireAuth>
          }
        />
        <Route
          path="/account/payments"
          element={
            <RequireAuth>
              <CustomerPayments />
            </RequireAuth>
          }
        />

        <Route path="/become-a-pro" element={<ProviderOnboarding />} />
        <Route
          path="/pro/leads"
          element={
            <RequireProvider>
              <Leads />
            </RequireProvider>
          }
        />
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
              <ProProfile />
            </RequireProvider>
          }
        />
        <Route
          path="/pro/settings"
          element={
            <RequireProvider>
              <ProSettings />
            </RequireProvider>
          }
        />
        <Route path="/pro/business-profile" element={<RequireProvider><ProviderProfileEdit /></RequireProvider>} />
        <Route
          path="/pro/analytics"
          element={
            <RequireProvider>
              <ProAnalytics />
            </RequireProvider>
          }
        />
        <Route
          path="/pro/users"
          element={
            <RequireProvider>
              <ProUsers />
            </RequireProvider>
          }
        />
        <Route
          path="/pro/projects"
          element={
            <RequireProvider>
              <ProProjects />
            </RequireProvider>
          }
        />
        <Route
          path="/pro/subscription"
          element={
            <RequireProvider>
              <ProSubscription />
            </RequireProvider>
          }
        />
        <Route
          path="/pro/payments"
          element={
            <RequireProvider>
              <ProPayments />
            </RequireProvider>
          }
        />
        <Route
          path="/pro/reports"
          element={
            <RequireProvider>
              <ProReports />
            </RequireProvider>
          }
        />
        <Route
          path="/pro/notifications"
          element={
            <RequireProvider>
              <ProNotifications />
            </RequireProvider>
          }
        />
        <Route
          path="/pro/messages"
          element={
            <RequireProvider>
              <ProMessages />
            </RequireProvider>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
