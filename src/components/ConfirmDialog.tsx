interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  danger = false,
}: Props) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center text-xl ${
              danger ? "bg-rose-100 text-rose-600" : "bg-indigo-100 text-indigo-600"
            }`}
          >
            {danger ? "!" : "?"}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            <p className="text-sm text-slate-500 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-sm transition"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg font-semibold text-sm text-white transition ${
              danger
                ? "bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200"
                : "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
