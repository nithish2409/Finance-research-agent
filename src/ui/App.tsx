import { useFlueAgent } from '@flue/react';
import { useState } from 'react';

export function App() {
  const [stockSymbol, setStockSymbol] = useState('');
  const [inputMessage, setInputMessage] = useState('');

  // The local-dev suffix is the chosen conversation ID.
  // This matches the app.ts mount of '/api/agents/researcher' 
  // plus the conversational instance ID.
  const agent = useFlueAgent({
    url: '/api/agents/researcher/local-dev'
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    
    const message = inputMessage.trim();
    setInputMessage('');
    
    // Send message to the Flue agent
    await agent.sendMessage(message);
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-6 font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Finance Research Agent</h1>
        <p className="text-slate-600 mt-2">
          Phase 1 Foundation: UI and Agent connected. No finance functionality yet.
        </p>
      </header>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Stock Selection (Placeholder)</h2>
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="e.g. RELIANCE.NS" 
            value={stockSymbol}
            onChange={(e) => setStockSymbol(e.target.value)}
            className="border border-slate-300 rounded px-4 py-2 flex-1 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            type="button" 
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2 rounded transition-colors"
          >
            Select
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50">
          {agent.messages.length === 0 ? (
            <p className="text-slate-400 text-center mt-10">No messages yet. Say hello!</p>
          ) : (
            agent.messages.map((msg, i) => (
              <div key={msg.id || i} className={`mb-4 max-w-[80%] ${msg.role === 'user' ? 'ml-auto' : 'mr-auto'}`}>
                <div className="text-xs text-slate-500 mb-1 capitalize">{msg.role}</div>
                <div className={`p-4 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'}`}>
                  {msg.parts.map((part, index) => 
                    part.type === 'text' ? <p key={index}>{part.text}</p> : null
                  )}
                </div>
              </div>
            ))
          )}
          {agent.status === 'streaming' && (
            <div className="text-sm text-slate-500 italic mt-2">Agent is typing...</div>
          )}
          {agent.status === 'error' && (
            <div className="text-sm text-red-500 mt-2 p-2 bg-red-50 rounded">Connection Error. Is the Anthropic API key set?</div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200 bg-white flex gap-4">
          <input 
            type="text" 
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Send a message to test connectivity..."
            className="border border-slate-300 rounded px-4 py-2 flex-1 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            type="submit"
            disabled={!inputMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded font-medium transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
