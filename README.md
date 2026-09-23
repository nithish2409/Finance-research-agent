# Finance Research Agent

## Project Overview
This project implements a deterministic, quantitative finance-focused agent that accepts an Indian stock symbol (or two symbols for comparison), retrieves market data, calculates indicators, analyzes bullish/risk factors, and generates an investment thesis and structured report.

## Architecture

**Single-Stock Workflow**
```
User
 ↓
React UI
 ↓
Flue Researcher Agent
 ↓
Phase 2: Market Data
 ↓
Phase 3: Indicators
 ↓
Phase 4: Signals
 ↓
Phase 5: Recommendation
 ↓
Phase 6: Thesis + Final Report
```

**Two-Stock Comparison Workflow**
```
User
 ↓
React UI
 ↓
Flue Researcher Agent
 ↓
compare_stocks Tool
 ↓
Two independent single-stock research pipelines
 ↓
Deterministic comparison engine
```

## Technology Stack
- **Node.js**: v22.20.0
- **TypeScript**: ^7.0.2
- **Flue Framework**:
  - `@flue/runtime` v2.1.0 (Agent, tool orchestration, Hono routing)
  - `@flue/cli` v2.1.0
  - `@flue/react` v2.1.0 (`useFlueAgent` for UI integration)
  - `@flue/sdk` v2.1.0
  - `@flue/vite` v2.1.0
- **Frontend**: React ^19.3.0, Vite ^8.3.0, Tailwind CSS ^4.3.3
- **Validation**: Valibot ^1.5.0
- **Testing**: Vitest ^5.0.1
- **Market Data**: `yahoo-finance2` ^4.0.2

## Deterministic Finance Logic
All financial calculations are purely deterministic and executed via TypeScript business logic offline.
- **Indicators**: SMA20, SMA50, RSI(14), Momentum (daily change %), Volatility (standard deviation).
- **Signals**: Price vs SMA crossovers, RSI thresholds (oversold < 30, overbought > 70), Volume spikes.
- **Recommendation Scoring**:
  - Starts at 50 points.
  - +10 for bullish signals, -10 for risk signals.
  - **Thresholds**: BUY (≥70), HOLD (40-69), WATCHLIST (30-39), AVOID (<30).
- **Confidence Score**: Represents data completeness and evidence strength, not the probability of future price movement.
  - Base confidence is determined by the availability of OHLCV data.
  - Deductions are applied for missing indicators.
- **Comparison Engine**: Identifies the `strongerProfile` by comparing Recommendation Score, then Confidence (tie-breaker), and then Risk Signal Count.

## Data Source
- The application exclusively uses `yahoo-finance2` to pull real, live EOD market data.
- If live data is incomplete (e.g. recent IPOs), the system natively supports incomplete-data paths.
- For unit testing, the data provider is mocked at the test-runner level (Vitest) to ensure deterministic test pipelines without hitting external APIs.

## Setup and Commands

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Copy the example environment variables and configure your Anthropic/OpenAI API key for the Flue agent.
   ```bash
   cp .env.example .env
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Verification / Testing:**
   ```bash
   npm run typecheck
   npm run test
   npm run build
   ```

## Deliverables Mapping
This repository successfully fulfills all assignment deliverables:
1. **Working code in a separate branch**: Delivered via the `phase-8/ui-submission` branch (now merged to `main`).
2. **README with setup instructions**: Covered in the [Setup and Commands](#setup-and-commands) section above.
3. **At least 3 sample stock reports**: Located in `examples/reports/` (e.g., `single-stock-HDFCBANK.json`, `single-stock-RELIANCE.json`, `single-stock-TCS.json`).
4. **One comparison report**: Located at `examples/reports/comparison-RELIANCE-TCS.json`.
5. **Basic tests for indicator calculations**: Located in `src/tests/indicators/engine.test.ts`.
6. **Short explanation of your agent workflow**: Covered in the [Architecture](#architecture) section above.
7. **Notes on what is live data and what is mocked**: Covered in the [Data Source](#data-source) section above.

## Limitations
- **No Trading/Execution**: The system cannot place orders or manage portfolios.
- **No Intraday Analysis**: Data is strictly daily (EOD).
- **Live Data Rate Limits**: The Yahoo Finance API may impose rate limits; mock data fallback is recommended for high-volume automated testing.

## Disclaimer
> **This application and all generated reports are for educational purposes only and do not constitute financial advice.** The recommendation is generated deterministically based on static technical signals and does not guarantee future performance. Do not use this tool for actual trading decisions.
