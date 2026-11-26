import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
      <p className="text-gray-500 mb-6">Page not found.</p>
      <Link to="/" className="font-semibold text-[#5b46f5] hover:underline">
        Go back home
      </Link>
    </div>
  );
}
