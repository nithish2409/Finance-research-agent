# Finance Research Agent

## Project Objective
This project implements a small finance-focused agent that accepts an Indian stock symbol, retrieves market data, calculates indicators, analyzes bullish/risk factors, and generates an investment thesis and structured report.

## Current Phase
Phase 2 — Market Data Layer

**Note:** Phase 2 implements market data retrieval via a provider abstraction. It does NOT yet implement technical indicators, recommendations, comparison, or the final research report.

## Architecture
```
React/Vite Frontend
        ↓
@flue/react (useFlueAgent) + @flue/sdk
        ↓
Hono Router (/api/agents/researcher)
        ↓
Flue 2.x Agent Layer (Researcher)
        ↓
fetch_market_data Tool
        ↓
MarketDataService
        ↓
MarketDataProvider
        ↓
Concrete Provider (yahoo-finance2)
```

## Market Data Layer
Phase 2 introduces a deterministic market data layer. It normalizes provider data into a stable `OHLCV` structure.

**Key Features:**
- Abstract `MarketDataProvider` interface.
- Concrete `YahooFinanceProvider` using `yahoo-finance2`.
- `MarketDataService` handling validation, invariant checks, and chronological ordering.
- `fetch_market_data` Flue tool mapped to the Researcher agent.

**Capabilities:**
- Indian equity symbols use canonical symbols such as RELIANCE and the Yahoo Finance provider internally maps them to NSE identifiers such as RELIANCE.NS.
- Supported periods: `1mo`, `3mo`, `6mo`, `1y`.
- Supported interval: `1d`.

**Testing Strategy:**
- Unit tests run using a mock provider.
- A live provider test is included but clearly separated.

## Technology Stack
- **Node.js**: v22.20.0
- **TypeScript**: ^7.0.2
- **Flue**: @flue/runtime v2.1.0, @flue/cli v2.1.0
- **React**: ^19.0.0 (via @flue/react)
- **Vite**: ^6.2.0
- **Hono**: ^4.7.2
- **Valibot**: ^1.0.0-rc.3
- **Tailwind CSS**: ^4.0.9
- **Yahoo Finance 2**: ^4.0.2 (market data provider)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the example environment variables and configure your model API key:
   ```bash
   cp .env.example .env
   ```
   *(No specific API key is required for `yahoo-finance2` as it uses public endpoints, but rate limiting applies).*

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Run tests or typechecks:
   ```bash
   npm run test
   npm run typecheck
   ```

## Current Limitations
This phase (Phase 2) does NOT yet implement:
- Technical indicators
- Recommendations
- Stock comparison
- Final research reports
