import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CATEGORY_SLUG_MAP } from "../data/popularCategories";

export default function CategoryRedirect() {
  const { slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const apiSlug = CATEGORY_SLUG_MAP[slug] || slug;
    navigate(`/search?category=${encodeURIComponent(apiSlug)}`, { replace: true });
  }, [slug, navigate]);

  return null;
}
