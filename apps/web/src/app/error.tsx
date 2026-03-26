'use client';

/**
 * Error boundary — catches runtime errors in the app.
 * Displays a user-friendly error message with a retry button.
 */
export default function Error({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Đã xảy ra lỗi!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Something went wrong. Vui lòng thử lại.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          Thử lại
        </button>
      </div>
    </div>
  );
}
