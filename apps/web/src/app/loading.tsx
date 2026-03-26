/**
 * Loading state — shown while pages are loading.
 */
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
      </div>
    </div>
  );
}
