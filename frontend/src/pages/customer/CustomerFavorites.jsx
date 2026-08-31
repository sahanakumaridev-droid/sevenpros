import { useEffect, useState } from "react";
import client from "../../api/client";
import AccountLayout from "../../components/AccountLayout";
import ProviderCard from "../../components/ProviderCard";

export default function CustomerFavorites() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get("/favorites").then((res) => {
      setProviders(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <AccountLayout title="Favorites">
      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : providers.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No favorite pros saved yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {providers.map((p) => (
            <ProviderCard key={p.id} provider={p} />
          ))}
        </div>
      )}
    </AccountLayout>
  );
}
