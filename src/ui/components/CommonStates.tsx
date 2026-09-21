export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-blue-600 mb-4"></div>
      <h3 className="text-lg font-semibold text-slate-800">Research in progress...</h3>
      <p className="text-slate-500 mt-2 text-center max-w-sm">
        Gathering market data, calculating indicators, analyzing signals, and preparing the report.
      </p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="p-6 bg-red-50 rounded-lg border border-red-100 flex flex-col items-center">
      <div className="text-red-500 mb-3 text-4xl">⚠</div>
      <h3 className="text-lg font-semibold text-red-800 mb-2">Analysis Failed</h3>
      <p className="text-red-700 text-center">{message}</p>
    </div>
  );
}
