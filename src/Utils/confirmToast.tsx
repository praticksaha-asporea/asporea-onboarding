import toast from "react-hot-toast";

/**
 * Shows an inline confirm toast using react-hot-toast.
 * Returns a promise that resolves to true (confirmed) or false (cancelled).
 *
 * Usage:
 *   const ok = await confirmToast("Delete this item?");
 *   if (!ok) return;
 */
export function confirmToast(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3 min-w-[220px]">
          <p className="text-sm font-bold text-gray-800">{message}</p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { toast.dismiss(t.id); resolve(false); }}
              className="px-4 py-1.5 text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => { toast.dismiss(t.id); resolve(true); }}
              className="px-4 py-1.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all"
            >
              Confirm
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,   // stays until user clicks
        position: "top-center",
        style: {
          padding: "14px 16px",
          borderRadius: "16px",
          boxShadow: "0 8px 30px -8px rgba(0,0,0,0.15)",
        },
      }
    );
  });
}
