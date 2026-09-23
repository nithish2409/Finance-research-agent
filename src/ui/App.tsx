import { useFlueAgent } from '@flue/react';
import { useState, useEffect } from 'react';
import { SingleStockReport } from './components/SingleStockReport';
import { ComparisonReport } from './components/ComparisonReport';
import { LoadingState, ErrorState } from './components/CommonStates';
import { extractStructuredData, validateSingleInput, validateComparisonInput } from './logic';
import { useRef } from 'react';

export function App() {
  const [mode, setMode] = useState<'single' | 'compare'>('single');
  const [symbolA, setSymbolA] = useState('');
  const [symbolB, setSymbolB] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Generate a unique session ID on mount, and allow resetting
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID());

  const agent = useFlueAgent({
    url: `/api/agents/researcher/${sessionId}`
  });

  // Extract structured data from agent's messages
  const { finalReport, comparisonResult } = extractStructuredData(agent.messages);

  // Clear agent state if user switches mode
  useEffect(() => {
    setValidationError(null);
    setSessionId(crypto.randomUUID());
  }, [mode]);

  const loggedReport = useRef<any>(null);
  useEffect(() => {
    if (finalReport && loggedReport.current !== finalReport) {
      loggedReport.current = finalReport;
      fetch('/api/log', { method: 'POST', body: JSON.stringify({ message: 'report rendered' }) }).catch(() => {});
    }
  }, [finalReport]);

  const loggedComparison = useRef<any>(null);
  useEffect(() => {
    if (comparisonResult && loggedComparison.current !== comparisonResult) {
      loggedComparison.current = comparisonResult;
      fetch('/api/log', { method: 'POST', body: JSON.stringify({ message: 'comparison rendered' }) }).catch(() => {});
    }
  }, [comparisonResult]);

  const handleResetSession = () => {
    setSessionId(crypto.randomUUID());
    setSymbolA('');
    setSymbolB('');
    setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (mode === 'single') {
      const err = validateSingleInput(symbolA);
      if (err) return setValidationError(err);
      await agent.sendMessage(`Analyze ${symbolA.trim()}`);
    } else {
      const err = validateComparisonInput(symbolA, symbolB);
      if (err) return setValidationError(err);
      await agent.sendMessage(`Compare ${symbolA.trim()} and ${symbolB.trim()}`);
    }
  };

  const isRunning = agent.status === 'streaming';

    const lastAgentMessage = agent.messages
      .filter((m: any) => m.role === 'assistant' || m.role === 'model')
      .pop();

    let fallbackText = "The agent completed its execution, but the structured report could not be extracted from the response.";
    if (lastAgentMessage && Array.isArray((lastAgentMessage as any).parts)) {
      const textParts = (lastAgentMessage as any).parts.filter((p: any) => p.type === 'text' || p.type === 'reasoning' || typeof p.text === 'string');
      if (textParts.length > 0) {
        fallbackText = "Extraction Failed. Final agent message: " + textParts[textParts.length - 1].text;
      }
    } else if (lastAgentMessage && typeof (lastAgentMessage as any).content === 'string') {
      fallbackText = (lastAgentMessage as any).content;
    }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Finance Research Agent</h1>
          <p className="text-slate-600">Deterministic quantitative analysis and comparison</p>
        </header>

        {/* Control Panel */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8">
          <div className="flex justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
            <div className="flex gap-4">
              <button
                onClick={() => setMode('single')}
                className={`px-4 py-2 font-medium rounded-md transition-colors ${mode === 'single' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Single Stock Analysis
              </button>
              <button
                onClick={() => setMode('compare')}
                className={`px-4 py-2 font-medium rounded-md transition-colors ${mode === 'compare' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Two-Stock Comparison
              </button>
            </div>
            <button
              type="button"
              onClick={handleResetSession}
              disabled={isRunning}
              className="px-4 py-2 text-sm font-medium rounded-md text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              New Session
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  {mode === 'single' ? 'Stock Symbol' : 'Stock A'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. RELIANCE"
                  value={symbolA}
                  onChange={(e) => setSymbolA(e.target.value)}
                  disabled={isRunning}
                  className="w-full border border-slate-300 rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400 uppercase"
                />
              </div>

              {mode === 'compare' && (
                <div className="flex-1 w-full">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Stock B</label>
                  <input
                    type="text"
                    placeholder="e.g. TCS"
                    value={symbolB}
                    onChange={(e) => setSymbolB(e.target.value)}
                    disabled={isRunning}
                    className="w-full border border-slate-300 rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400 uppercase"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isRunning}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed h-[42px] w-full md:w-auto"
              >
                {mode === 'single' ? 'Analyze' : 'Compare'}
              </button>
            </div>
          </form>

          {validationError && (
            <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-2 rounded">
              {validationError}
            </div>
          )}
        </div>

        {/* Results Area */}
        <div className="space-y-6">
          {isRunning && <LoadingState />}

          {agent.status === 'error' && (
            <ErrorState message="Connection to the research agent failed. Check network or API keys." />
          )}

          {!isRunning && mode === 'single' && finalReport && (
            <SingleStockReport report={finalReport} />
          )}

          {!isRunning && mode === 'compare' && comparisonResult && (
            <ComparisonReport result={comparisonResult} />
          )}

          {/* Debug raw output fallback if agent completes but returns no structure (malformed) */}
          {!isRunning && agent.messages.length > 0 && !finalReport && !comparisonResult && !validationError && agent.status !== 'error' && (
             <ErrorState message={fallbackText} />
          )}
        </div>
      </div>
    </div>
  );
}
