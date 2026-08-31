import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../../api/client";
import ProDashboardLayout from "../../components/ProDashboardLayout";
import { useAuth } from "../../context/AuthContext";

function buildChecklist(profile) {
  return [
    { done: !!profile.tagline, icon: "📝", title: "Complete your business profile", desc: "Add a tagline and about section so customers know what you offer.", to: "/pro/profile" },
    { done: (profile.about?.length || 0) > 20, icon: "📝", title: "Write a detailed About section", desc: "A clear description builds trust with new customers.", to: "/pro/profile" },
    { done: (profile.services?.length || 0) > 0, icon: "🛠️", title: "Add your first service", desc: "List a service with pricing so customers can find and book you.", to: "/pro/services" },
    { done: profile.is_licensed, icon: "📄", title: "Add your license info", desc: "Licensed pros get more trust and better search placement.", to: "/pro/profile" },
    { done: profile.is_insured, icon: "🛡️", title: "Confirm you're insured", desc: "Insurance status shows as a trust badge on your profile.", to: "/pro/profile" },
    { done: profile.is_background_checked, icon: "✔️", title: "Complete a background check", desc: "Background-checked pros earn the full Verified badge.", to: "/pro/profile" },
    { done: !!profile.city, icon: "📍", title: "Set your service area", desc: "Add your city so nearby customers can find you.", to: "/pro/profile" },
    { done: !!profile.cover_photo_url, icon: "🖼️", title: "Add a cover photo", desc: "Profiles with photos get noticed -- and booked -- more often.", to: "/pro/profile" },
  ];
}

export default function ProviderDashboardHome() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([client.get("/providers/me"), client.get("/bookings/provider")]).then(([pRes, bRes]) => {
      setProfile(pRes.data);
      setBookings(bRes.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <ProDashboardLayout title="Overview"><div className="text-gray-400">Loading...</div></ProDashboardLayout>;

  const pending = bookings.filter((b) => b.status === "pending").length;
  const completed = bookings.filter((b) => b.status === "completed").length;
  const earnings = bookings
    .filter((b) => b.payment_status === "paid")
    .reduce((sum, b) => sum + (b.final_price || 0), 0);

  const stats = [
    { label: "Total Bookings", value: bookings.length },
    { label: "Pending Requests", value: pending },
    { label: "Completed Jobs", value: completed },
    { label: "Total Earnings", value: `$${earnings.toFixed(2)}` },
    { label: "Avg. Rating", value: profile.avg_rating.toFixed(1) },
    { label: "Reviews", value: profile.review_count },
  ];

  const checklist = buildChecklist(profile);
  const doneCount = checklist.filter((c) => c.done).length;
  const todo = checklist.filter((c) => !c.done);
  const recommended = todo.slice(0, 2);

  return (
    <ProDashboardLayout title="Overview">
      <div className="bg-gradient-to-br from-brand-50 to-brand-100 border border-brand-100 rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900">Welcome back, {user?.full_name?.split(" ")[0]}</h2>
        <p className="text-gray-600 text-sm mt-1">Here's what's happening with your business today.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          {recommended.length > 0 ? (
            recommended.map((item) => (
              <Link
                key={item.title}
                to={item.to}
                className="lift card p-4"
              >
                <div className="text-xs font-semibold text-gray-400 uppercase mb-2">Recommended for you</div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-lg shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{item.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="card p-4 md:col-span-2">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-lg shrink-0">🎉</div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">Your profile is fully set up!</div>
                  <div className="text-xs text-gray-500 mt-0.5">Keep responding quickly to booking requests to stay top-ranked in search.</div>
                </div>
              </div>
            </div>
          )}

          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-gray-400 uppercase">Profile Strength</div>
              <div className="text-sm font-bold text-gray-900">{doneCount}/{checklist.length}</div>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full origin-left"
                style={{ width: `${(doneCount / checklist.length) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {doneCount === checklist.length ? "Nice work -- fully complete!" : "Complete it to show up higher in search."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="border border-gray-200 rounded-xl p-4">
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="border border-gray-200 rounded-xl p-5">
        <h3 className="font-semibold text-gray-900 mb-3">Recent booking requests</h3>
        {bookings.length === 0 ? (
          <p className="text-sm text-gray-400">No bookings yet.</p>
        ) : (
          <div className="space-y-3">
            {bookings.slice(0, 5).map((b) => (
              <div key={b.id} className="flex items-center justify-between text-sm border-b border-gray-100 pb-2">
                <div>
                  <span className="font-medium text-gray-800">{b.customer.full_name}</span>
                  <span className="text-gray-400"> &middot; {b.service.title}</span>
                </div>
                <span className="capitalize text-gray-500">{b.status.replace("_", " ")}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProDashboardLayout>
  );
}
