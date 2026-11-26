import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CATEGORY_SLUG_MAP, POPULAR_CATEGORIES } from "../data/popularCategories";

export default function CategoryRedirect() {
  const { slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!slug) {
      navigate("/search", { replace: true });
      return;
    }
    // Prefer the real marketplace slug; only map when we have a known alias.
    const mapped = CATEGORY_SLUG_MAP[slug];
    const popular = POPULAR_CATEGORIES.find((c) => c.slug === slug || c.apiSlug === slug);
    const category = mapped && mapped !== slug ? slug : slug;
    const q = popular?.name || slug.replace(/-/g, " ");
    const params = new URLSearchParams({
      category,
      q,
    });
    navigate(`/search?${params.toString()}`, { replace: true });
  }, [slug, navigate]);

  return null;
}
