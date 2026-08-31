export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Dismiss dialog"
        onClick={onCancel}
        className="absolute inset-0 bg-black/60"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
        className="relative w-full max-w-md rounded-[6px] border border-line bg-raised p-6 shadow-2xl"
        style={{ transformOrigin: "center" }}
      >
        <h2 id="confirm-title" className="text-lg font-semibold text-ink text-balance">
          {title}
        </h2>
        <p id="confirm-desc" className="mt-2 text-sm text-muted text-pretty">
          {description}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="btn btn-ghost">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="btn bg-danger text-white">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
