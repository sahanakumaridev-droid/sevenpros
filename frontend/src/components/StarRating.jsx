export default function StarRating({ rating = 0, count, size = 14 }) {
  return (
    <span className="inline-flex items-center gap-1 tabular-nums">
      <span className="text-warn" style={{ fontSize: size }}>
        ★
      </span>
      <span className="font-semibold text-ink" style={{ fontSize: size }}>
        {rating.toFixed(1)}
      </span>
      {count !== undefined && <span className="text-faint" style={{ fontSize: size }}>({count})</span>}
    </span>
  );
}
