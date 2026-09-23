import { FinalResearchReport } from '../../report/types';

export function SingleStockReport({ report }: { report: FinalResearchReport }) {
  const {
    symbol, currentPrice, dailyChange, week52High, week52Low, volume,
    bullishFactors, riskFactors, technicalView, recommendation, confidence,
    thesisSummary, volatility, disclaimer
  } = report;

  const colorMap: Record<string, string> = {
    BUY: 'bg-green-100 text-green-800 border-green-200',
    HOLD: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    WATCHLIST: 'bg-blue-100 text-blue-800 border-blue-200',
    AVOID: 'bg-red-100 text-red-800 border-red-200'
  };

  const recStyle = colorMap[recommendation] || 'bg-slate-100 text-slate-800 border-slate-200';

  const formatVal = (val: number | null, prefix = '') => val !== null ? `${prefix}${val.toFixed(2)}` : 'Not available';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-800 text-white p-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold">{symbol}</h2>
            <div className="text-slate-300 mt-1">Single Stock Research Report</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold">{formatVal(currentPrice)}</div>
            <div className={`text-sm ${dailyChange && dailyChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatVal(dailyChange, dailyChange && dailyChange > 0 ? '+' : '')}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Recommendation & Confidence */}
        <div className="flex gap-4 mb-8">
          <div className={`px-6 py-4 rounded-lg border ${recStyle} flex-1 text-center`}>
            <div className="text-sm font-semibold uppercase tracking-wider opacity-80 mb-1">Recommendation</div>
            <div className="text-2xl font-bold">{recommendation}</div>
          </div>
          <div className="px-6 py-4 rounded-lg border border-slate-200 bg-slate-50 flex-1 text-center">
            <div className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-1">Confidence</div>
            <div className="text-2xl font-bold text-slate-800">{confidence}%</div>
            <div className="text-xs text-slate-400 mt-1">Data completeness/evidence strength</div>
          </div>
        </div>

        {/* Market Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-slate-50 rounded border border-slate-100">
            <div className="text-xs text-slate-500 uppercase">52W High</div>
            <div className="font-semibold">{formatVal(week52High)}</div>
          </div>
          <div className="p-4 bg-slate-50 rounded border border-slate-100">
            <div className="text-xs text-slate-500 uppercase">52W Low</div>
            <div className="font-semibold">{formatVal(week52Low)}</div>
          </div>
          <div className="p-4 bg-slate-50 rounded border border-slate-100">
            <div className="text-xs text-slate-500 uppercase">Volume</div>
            <div className="font-semibold">{volume !== null ? volume.toLocaleString() : 'Not available'}</div>
          </div>
          <div className="p-4 bg-slate-50 rounded border border-slate-100">
            <div className="text-xs text-slate-500 uppercase">Technical View</div>
            <div className="font-semibold text-sm">{technicalView}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-slate-50 rounded border border-slate-100">
            <div className="text-xs text-slate-500 uppercase mb-1">Volatility</div>
            <div className="font-bold text-xl text-slate-800">
              {volatility !== null ? `${(volatility * 100).toFixed(1)}%` : 'Not available'}
            </div>
            <div className="text-xs text-slate-400 mt-1">20-day annualized</div>
          </div>
        </div>

        {/* Signals */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="border border-green-100 rounded-lg overflow-hidden">
            <div className="bg-green-50 p-3 font-semibold text-green-800 border-b border-green-100">Bullish Factors</div>
            <ul className="p-4 list-disc list-inside text-sm text-slate-700 space-y-2">
              {bullishFactors.length > 0 ? bullishFactors.map((f, i) => <li key={i}>{f}</li>) : <li>No significant bullish factors identified.</li>}
            </ul>
          </div>
          <div className="border border-red-100 rounded-lg overflow-hidden">
            <div className="bg-red-50 p-3 font-semibold text-red-800 border-b border-red-100">Risk Factors</div>
            <ul className="p-4 list-disc list-inside text-sm text-slate-700 space-y-2">
              {riskFactors.length > 0 ? riskFactors.map((f, i) => <li key={i}>{f}</li>) : <li>No significant risk factors identified.</li>}
            </ul>
          </div>
        </div>

        {/* Thesis */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-800 mb-3 border-b pb-2">Investment Thesis</h3>
          <p className="text-slate-700 whitespace-pre-wrap">{thesisSummary}</p>
        </div>

        {/* Disclaimer */}
        <div className="bg-slate-100 text-slate-500 text-xs p-4 rounded text-center">
          {disclaimer}
        </div>
      </div>
    </div>
  );
}
