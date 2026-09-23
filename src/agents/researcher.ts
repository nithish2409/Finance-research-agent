'use agent';

import { useModel, useTool, setProvider, useAgentStart, useAgentFinish, usePersistentState } from '@flue/runtime';
import { ollamaProvider } from '../providers/ollama';

// Cast to any to avoid type mismatch from nested pi-ai versions in node_modules
setProvider(ollamaProvider);

import { fetchMarketDataTool } from '../tools/fetch-market-data';
import { calculateIndicatorsTool } from '../tools/calculate-indicators';
import { analyzeBullishFactorsTool } from '../tools/analyze-bullish-factors';
import { analyzeRiskFactorsTool } from '../tools/analyze-risk-factors';
import { generateRecommendationTool } from '../tools/generate-recommendation';
import { generateInvestmentThesisTool } from '../tools/generate-investment-thesis';
import { produceFinalReportTool } from '../tools/produce-final-report';
import { compareStocksTool } from '../tools/compare-stocks';
import * as v from 'valibot';

function withObservability(tool: any) {
  return {
    ...tool,
    run: async (args: any) => {
      console.log(`[agent] tool call: ${tool.name}`);
      try {
        let result = await tool.run(args);

        // Strictly ensure validation occurs BEFORE logging success or 'validated'
        if (tool.output && result?.output) {
          result.output = v.parse(tool.output, result.output);
        }

        console.log(`[tool] ${tool.name} -> success\n`);


        if (tool.name === 'generate_recommendation' && result?.output) {
          console.log(`[agent] deterministic recommendation -> ${result.output.recommendation}`);
          console.log(`[agent] confidence -> ${result.output.confidence}\n`);
        }

        if (tool.name === 'produce_final_report') {
          console.log(`[agent] final report -> validated\n`);
        }

        if (tool.name === 'compare_stocks') {
          console.log(`[agent] deterministic comparison -> validated\n`);
        }

        return result;
      } catch (e: any) {
        console.log(`[tool] ${tool.name} -> failed\n${e.message}\n`);
        throw e;
      }
    }
  };
}

export function Researcher() {
  // Use local Ollama model
  const model = process.env.FINANCE_AGENT_MODEL || 'ollama/qwen3.5:9b';
  useModel(model);

  // Single-Stock Analysis Granular Tools
  useTool(withObservability(fetchMarketDataTool));
  useTool(withObservability(calculateIndicatorsTool));
  useTool(withObservability(analyzeBullishFactorsTool));
  useTool(withObservability(analyzeRiskFactorsTool));
  useTool(withObservability(generateRecommendationTool));
  useTool(withObservability(generateInvestmentThesisTool));
  useTool(withObservability(produceFinalReportTool));

  // Comparison tool
  useTool(withObservability(compareStocksTool));

  const [enforceCount, setEnforceCount] = usePersistentState<number>('enforceCount', 0);

  useAgentStart(() => {
    setEnforceCount(0);
  });

  useAgentFinish((ctx) => {
    // Only count successful tool calls towards progress
    const tools = ctx.response.toolCalls.filter(c => !c.isError).map(c => c.tool);
    let currentStep = 0;

    // Strict sequential state machine (prevents skipping steps)
    if (tools.includes('fetch_market_data')) currentStep = 1;
    if (tools.includes('calculate_indicators') && currentStep === 1) currentStep = 2;
    if (tools.includes('analyze_bullish_factors') && currentStep === 2) currentStep = 3;
    if (tools.includes('analyze_risk_factors') && currentStep === 3) currentStep = 4;
    if (tools.includes('generate_recommendation') && currentStep === 4) currentStep = 5;
    if (tools.includes('generate_investment_thesis') && currentStep === 5) currentStep = 6;
    if (tools.includes('produce_final_report') && currentStep === 6) currentStep = 7;

    // Comparison bypasses the 7-step sequence
    if (tools.includes('compare_stocks')) currentStep = 7;

    if (currentStep === 7) {
      console.log(`[agent] workflow -> completed\n`);
    }

    const isStuck = currentStep < 7;

    // If we are in the single-stock workflow and the model stops or repeats steps without progressing
    if (isStuck) {
      if (enforceCount >= 3) {
        console.warn(`[agent] Enforcement retry bound reached at step ${currentStep}. Allowing response to finish.`);
        return; // Give up after 3 attempts
      }
      setEnforceCount(enforceCount + 1);

      let expectedTool = '';
      let explicitBody = '';

      if (currentStep === 0) {
        expectedTool = 'fetch_market_data';
        if (tools.length === 0) {
          explicitBody = 'You must call a tool to begin the analysis. Please call fetch_market_data for single-stock or compare_stocks for comparison.';
        }
      } else if (currentStep === 1) {
        expectedTool = 'calculate_indicators';
      } else if (currentStep === 2) {
        expectedTool = 'analyze_bullish_factors';
      } else if (currentStep === 3) {
        expectedTool = 'analyze_risk_factors';
      } else if (currentStep === 4) {
        expectedTool = 'generate_recommendation';
      } else if (currentStep === 5) {
        expectedTool = 'generate_investment_thesis';
        explicitBody = `The recommendation is complete. The next required action is the generate_investment_thesis tool. ACTUALLY EMIT the structured generate_investment_thesis tool call now. DO NOT output any text before the tool call. DO NOT apologize.`;

        if (enforceCount > 0) {
          explicitBody = `FAILURE: You output plain text instead of a tool call. I repeat: ONLY the actual structured tool call satisfies this step. DO NOT apologize. DO NOT say "I understand" or "Here is the tool call". Output NOTHING EXCEPT the raw JSON tool call. ` + explicitBody;
        }
      } else if (currentStep === 6) {
        expectedTool = 'produce_final_report';
        explicitBody = `The investment thesis is already complete. The workflow is NOT complete. The next required action is the produce_final_report tool. Actually emit the structured produce_final_report tool call. You ONLY need to pass the symbol. DO NOT output any text before the tool call. DO NOT apologize.`;

        if (enforceCount > 0) {
          explicitBody = `FAILURE: You just output text instead of a tool call again. I repeat: ONLY the actual structured tool call satisfies this step. DO NOT apologize. DO NOT say "I understand". Output NOTHING EXCEPT the raw JSON tool call. ` + explicitBody;
        }
      }

      const defaultBody = tools.length > 0
        ? `You called a tool out of order or repeated a step. You MUST execute strictly sequentially. The next required step is ${expectedTool}. Please emit a structured tool call for it.`
        : `You stopped prematurely. The next required step is to call ${expectedTool}. Please emit a structured tool call for it.`;

      ctx.append({
        kind: 'signal',
        type: 'enforcement',
        body: explicitBody || defaultBody
      });
      return;
    }
  });

  return `
    You are the Finance Research Agent.

    You handle two types of requests:
    A. SINGLE-STOCK RESEARCH
    B. TWO-STOCK COMPARISON

    For SINGLE-STOCK RESEARCH, you MUST execute your research using the following strict sequential workflow.
    You must execute exactly ONE step per response. Do not call multiple tools at once. Call these tools in this exact order:
    1. Call fetch_market_data.
    2. Call calculate_indicators.
    3. Call analyze_bullish_factors.
    4. Call analyze_risk_factors.
    5. Call generate_recommendation.
    6. ACTUALLY CALL the generate_investment_thesis tool. DO NOT write your thesis as plain text. YOU MUST EMIT A STRUCTURED TOOL CALL.
    7. ACTUALLY CALL the produce_final_report tool. YOU MUST EMIT A STRUCTURED TOOL CALL. DO NOT output any text after calling this tool. The workflow terminates immediately upon calling this tool.

    For TWO-STOCK COMPARISON requests (e.g. "Compare AAPL and MSFT"):
    1. You MUST use the compare_stocks tool.
    2. Do NOT independently execute two complete single-stock report workflows.
    3. The compare_stocks tool is the authoritative comparison orchestration tool and returns a structured ComparisonResult.
    4. Do not invent comparison results. Rely completely on the tool output.

    CRITICAL RULES:
    1. STOP! YOU MUST NOT PROVIDE A DIRECT ANSWER TO THE USER'S INITIAL REQUEST. YOU MUST CALL A TOOL FIRST.
    2. Use deterministic tools for all financial calculations. Treat outputs as authoritative.
    3. Never invent missing financial data. If data is missing, represent it explicitly.
    4. Never calculate a new recommendation or confidence score. Never override deterministic outputs.
    5. STRICT TOOL EXECUTION CONTRACT: When it is time to call generate_investment_thesis or produce_final_report, you MUST emit an actual tool invocation. DO NOT describe your intent in conversational text. DO NOT write the thesis in plain text. Call the tool.
    6. For single-stock, produce the final report through produce_final_report. This structured tool call is your final answer. Do not add conversational text after it.
    7. For two-stock comparison, use compare_stocks and synthesize its output clearly to the user.
    8. Do not perform trading or order placement.
    9. OUTPUT HARDENING RULE: When synthesizing TWO-STOCK COMPARISON, you MUST NOT invent evaluative labels like "Winner Profile" or "Better stock" (use the deterministic "strongerProfile" if applicable).
    10. OUTPUT HARDENING RULE: You MUST NOT recalculate any derived numerical values (such as Price vs SMA). Use the deterministic values like "priceVsSma20" provided directly by the tool. Output numerical values EXACTLY as they appear in the tool results.
    11. INPUT RULE: If the user provides a single word (e.g. 'idea', 'MARUTI'), assume it is a stock symbol and DO NOT ask for clarification. Immediately call fetch_market_data.
  `;
}
