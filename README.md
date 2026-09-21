# Finance Research Agent

## Project Objective
This project implements a small finance-focused agent that accepts an Indian stock symbol, retrieves market data, calculates indicators, analyzes bullish/risk factors, and generates an investment thesis and structured report.

## Current Phase
Phase 1 — Project Foundation + Flue/React Skeleton

**Note:** Phase 1 focuses exclusively on establishing the core architecture. It does NOT yet implement market data, indicators, recommendations, comparison, or the final research report.

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
Typed Tools (Future phases)
        ↓
Deterministic Finance Engine (Future phases)
        ↓
Market Data Provider (Future phases)
```

## Technology Stack
- **Node.js**: v22.20.0
- **TypeScript**: ^7.0.2
- **Flue**: @flue/runtime v2.1.0, @flue/cli v2.1.0
- **React**: ^19.0.0 (via @flue/react)
- **Vite**: ^6.2.0
- **Hono**: ^4.7.2
- **Valibot**: ^1.0.0-rc.3
- **Tailwind CSS**: ^4.0.9

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the example environment variables and configure your model API key:
   ```bash
   cp .env.example .env
   ```

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
This phase (Phase 1) does NOT yet implement:
- Market data retrieval
- Technical indicators
- Recommendations
- Stock comparison
- Final research reports
