import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Researcher } from '../../agents/researcher';

// Mock Flue runtime to test the enforcement logic in isolation
const mockPersistentState = new Map<string, any>();
let agentFinishCallback: ((ctx: any) => void) | null = null;
let agentStartCallback: ((ctx: any) => void) | null = null;

vi.mock('@flue/runtime', () => ({
  useModel: vi.fn(),
  useTool: vi.fn(),
  setProvider: vi.fn(),
  usePersistentState: vi.fn((key: string, defaultValue: any) => {
    if (!mockPersistentState.has(key)) {
      mockPersistentState.set(key, defaultValue);
    }
    const state = mockPersistentState.get(key);
    const setter = (val: any) => mockPersistentState.set(key, val);
    return [state, setter];
  }),
  useAgentStart: vi.fn((cb) => {
    agentStartCallback = cb;
  }),
  useAgentFinish: vi.fn((cb) => {
    agentFinishCallback = cb;
  }),
  defineTool: vi.fn(),
  __flueBindAgentModule: vi.fn(),
}));

describe('Researcher Agent Enforcement Logic', () => {
  let cumulativeTools: any[] = [];

  beforeEach(() => {
    mockPersistentState.clear();
    cumulativeTools = [];
    agentFinishCallback = null;
    agentStartCallback = null;
    vi.clearAllMocks();

    // Call Researcher to register the hooks and populate mockPersistentState
    Researcher();
    (agentStartCallback as any)?.({}); // Simulate agent start to reset state
  });

  const runFinishCycle = (toolNames: string[], setupContext?: any) => {
    cumulativeTools.push(...toolNames.map(t => ({ tool: t })));
    const ctx = {
      response: {
        toolCalls: [...cumulativeTools]
      },
      append: vi.fn(),
      ...setupContext
    };
    if (agentFinishCallback) {
      agentFinishCallback(ctx);
    }
    // Re-run Researcher to pick up the updated persistent state for the next turn
    Researcher();
    return ctx;
  };

  it('enforces starting a workflow if nothing is called (step 0)', () => {
    const ctx = runFinishCycle([]);
    expect(ctx.append).toHaveBeenCalledWith(expect.objectContaining({
      body: expect.stringContaining('You must call a tool to begin the analysis')
    }));
    expect(mockPersistentState.get('enforceCount')).toBe(1);
  });

  it('enforces if stopped after fetch_market_data (step 1)', () => {
    const ctx = runFinishCycle(['fetch_market_data']);
    expect(ctx.append).toHaveBeenCalledWith(expect.objectContaining({
      body: expect.stringContaining('calculate_indicators')
    }));
    expect(mockPersistentState.get('enforceCount')).toBe(1);
  });

  it('enforces if stopped after generate_recommendation (step 5)', () => {
    const ctx = runFinishCycle([
      'fetch_market_data',
      'calculate_indicators',
      'analyze_bullish_factors',
      'analyze_risk_factors',
      'generate_recommendation'
    ]);
    expect(ctx.append).toHaveBeenCalledWith(expect.objectContaining({
      body: expect.stringContaining('generate_investment_thesis')
    }));
    expect(mockPersistentState.get('enforceCount')).toBe(1);
  });

  it('enforces if stopped after generate_investment_thesis (step 6)', () => {
    const ctx = runFinishCycle([
      'fetch_market_data',
      'calculate_indicators',
      'analyze_bullish_factors',
      'analyze_risk_factors',
      'generate_recommendation',
      'generate_investment_thesis'
    ]);
    expect(ctx.append).toHaveBeenCalledWith(expect.objectContaining({
      body: expect.stringContaining('produce_final_report')
    }));
    expect(mockPersistentState.get('enforceCount')).toBe(1);
  });

  it('does not enforce once produce_final_report occurs (step 7)', () => {
    const ctx = runFinishCycle([
      'fetch_market_data',
      'calculate_indicators',
      'analyze_bullish_factors',
      'analyze_risk_factors',
      'generate_recommendation',
      'generate_investment_thesis',
      'produce_final_report'
    ]);
    expect(ctx.append).not.toHaveBeenCalled();
  });

  it('does not enforce for compare_stocks workflow', () => {
    runFinishCycle(['compare_stocks']);
    const ctx = runFinishCycle([]); // Model finishes with text
    expect(ctx.append).not.toHaveBeenCalled();
  });

  it('stops enforcement after retry bound is reached', () => {
    // Fail 3 times at step 0
    runFinishCycle([]);
    runFinishCycle([]);
    runFinishCycle([]);

    // 4th time, it should NOT append and just return
    const ctx = runFinishCycle([]);
    expect(ctx.append).not.toHaveBeenCalled();
    expect(mockPersistentState.get('enforceCount')).toBe(3);
  });
});
