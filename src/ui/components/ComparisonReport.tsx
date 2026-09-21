import { ComparisonResult, StockComparisonSnapshot } from '../../comparison/types';

function SnapshotCard({ snapshot, isWinner }: { snapshot: StockComparisonSnapshot, isWinner: boolean }) {
  const { symbol, currentPrice, recommendation, score, confidence, bullishSignalCount, riskSignalCount, sma20, sma50 } = snapshot;

  const colorMap: Record<string, string> = {
    BUY: 'text-green-700 bg-green-50 border-green-200',
    HOLD: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    WATCHLIST: 'text-blue-700 bg-blue-50 border-blue-200',
    AVOID: 'text-red-700 bg-red-50 border-red-200'
  };

  const formatVal = (val: number | null) => val !== null ? val.toFixed(2) : 'Not available';

  return (
    <div className={`flex-1 rounded-lg border p-5 ${isWinner ? 'border-blue-400 shadow-md bg-blue-50/10' : 'border-slate-200 bg-white'}`}>
      <div className="flex justify-between items-center mb-4 border-b pb-3">
        <h3 className="text-2xl font-bold text-slate-800">{symbol}</h3>
        {isWinner && <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-bold">STRONGER PROFILE</span>}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-slate-500 text-sm">Price</span>
          <span className="font-semibold">{formatVal(currentPrice)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-500 text-sm">Recommendation</span>
          <span className={`px-2 py-1 rounded text-xs font-bold border ${colorMap[recommendation] || 'bg-slate-100 text-slate-800'}`}>
            {recommendation} (Score: {score})
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-500 text-sm">Confidence</span>
          <span className="font-semibold">{confidence}%</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-500 text-sm">Bullish Signals</span>
          <span className="font-semibold text-green-600">{bullishSignalCount}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-500 text-sm">Risk Signals</span>
          <span className="font-semibold text-red-600">{riskSignalCount}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
          <div>
            <div className="text-xs text-slate-400">SMA20</div>
            <div className="text-sm font-medium">{formatVal(sma20)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">SMA50</div>
            <div className="text-sm font-medium">{formatVal(sma50)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ComparisonReport({ result }: { result: ComparisonResult }) {
  const { stockA, stockB, strongerProfile, reasoning } = result;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-800 text-white p-6 text-center">
        <h2 className="text-2xl font-bold mb-1">Two-Stock Comparison</h2>
        <div className="text-slate-300">{stockA.symbol} vs {stockB.symbol}</div>
      </div>

      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <SnapshotCard snapshot={stockA} isWinner={strongerProfile === stockA.symbol} />
          <div className="hidden md:flex items-center justify-center text-slate-300 font-bold text-xl">VS</div>
          <SnapshotCard snapshot={stockB} isWinner={strongerProfile === stockB.symbol} />
        </div>

        <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Comparison Conclusion</h3>
          {strongerProfile === null ? (
            <div className="text-lg font-medium text-slate-800 mb-2">
              Tie: Both stocks have an equal calculated signal profile.
            </div>
          ) : (
            <div className="text-lg font-medium text-slate-800 mb-2">
              <span className="font-bold text-blue-700">{strongerProfile}</span> has the stronger calculated signal profile.
            </div>
          )}
          <p className="text-slate-600 leading-relaxed">{reasoning}</p>
        </div>
      </div>
    </div>
  );
}
