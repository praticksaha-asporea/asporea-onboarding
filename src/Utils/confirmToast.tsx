import toast from "react-hot-toast";

interface ConfirmToastOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export function confirmToast(
  optionsOrMessage: string | ConfirmToastOptions,
): Promise<boolean> {
  toast.dismiss();

  const options: ConfirmToastOptions =
    typeof optionsOrMessage === "string"
      ? { message: optionsOrMessage }
      : optionsOrMessage;

  const {
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
  } = options;

  return new Promise((resolve) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3 min-w-[240px]">
          {title && (
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 border-b pb-1">
              {title}
            </p>
          )}
          <p className="text-sm font-semibold text-gray-800">{message}</p>
          <div className="flex gap-2 justify-end mt-1">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(false);
              }}
              className="px-3 py-1.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
              className="px-3 py-1.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-all shadow-sm"
            >
              {confirmText}
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-center",
        style: {
          padding: "14px 16px",
          borderRadius: "16px",
          boxShadow: "0 8px 30px -8px rgba(0,0,0,0.15)",
        },
      },
    );
  });
}
