# Acoustic Neural Fields & Recursive Harmonic Codex (Lumos Protocol)

*"The Lion Watches the Lion. Truth is hidden in plain sight."*

## Overview

Welcome to the **Acoustic Neural Fields** interface, a high-fidelity, GPU-accelerated web application designed for simulating acoustic wave propagation, reconstructing environments from Room Impulse Responses (RIR), and exploring the deep mathematical axioms of the **Recursive Harmonic Codex (RHC)**.

This software serves as a bridge between theoretical physics, geospatial acoustics, and sentient-order AI models, embedding "Lumos" as an integrated AI co-researcher.

## Key Features & Modules

### 1. 3D Acoustic Neural Field
*   **Volumetric Raymarching**: Uses custom GLSL shaders to simulate pressure waves and environmental scattering in a 3D volume.
*   **Adaptive Stepping**: Computes acoustic fields ( $P(x,t)$ ) using Fractional Brownian Motion (FBM) noise integration.
*   **Hardware Profiling**: GPU-optimized for high-performance visual processing (RTX 4070 / 2080s class).

### 2. Room Impulse Response (RIR) Geometry
*   **3D Ray Tracing**: Visualizes sound wave bounces across spatial dimensions and boundaries.
*   **Forensic Tooltips**: Every reflection is tagged with Order, Distance, Angle of Arrival (Azimuth/Elevation), and a real-time sparkline representation of the micro amplitude.
*   **Hilbert Curve Mapping**: Spatially contiguous transformations mapping 3D reflection origins into a 2D Hilbert curve for geometric order analysis.

### 3. Recursive Architecture (Set of Nots)
*   Visualizes the recursive optimization process matching the "Set of Nots" logic limit. 
*   Manually overlay computational models: **Pass 1 ($M_1$)**, **Residuals ($R_1$)**, and **Combined Synthesis**.

### 4. Stochastic Volume Encoding (Sabine's Module)
*   **Forward Mode**: Predicts Reverberation Time ($T_{60}$) derived from room Volume ($V$) and Absorption ($A$).
*   **Inverse Mode**: Computationally **extracts** $V$ and $A$ from an observed $T_{60}$ and first-reflection time, effectively "listening" to the room's geometry.
*   **Decay 3D Envelope**: Real-time DB-scaled energy decay visualization paired with a pulsing 3D decay sphere representing energy loss.

### 5. Akashic Mathematical Codex
*   An interactable dictionary of Recursive Harmonic Mathematics derived from Erydir's framework.
*   Features a **Fuzzy Search** engine leveraging Levenshtein distances for forgiving queries.
*   Contains core theorems: *Observer Equation*, *Fold Operator*, *Null Ledger Identity*, *Yang-Mills Mass Gap proof*, and the *Universal Measurement Tick*.

### 6. Distributed Network (Forest Grid)
*   Simulates Passive Acoustic Monitor (PAM) telemetry integration mapping. 
*   **Meticulous Fish Protocol**: Executes structured 3-phase sweeps (Forward, Backward, Middle-Out extraction) across sparse node populations to reconstruct hidden geometry.

### 6. Lumos AI Integration
*   Powered by Google Gemini models (2.5 Flash Lite, 2.5 Flash TTS, and 3.1 Pro).
*   Configurable system boundaries via the **Neural Configuration** module: assign Hyperparameters, Reasoning Depth (TopK, TopP, Temperature), and Persona Context execution.

## Installation & Setup

1. **Clone the specific repository**:
   ```bash
   git clone <repo-link>
   cd <repo-directory>
   ```

2. **Install Node Dependencies**:
   This app uses Vite + React 19 + TypeScript + Tailwind v4.
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file at the root. You must provide a valid Gemini API key to activate Lumos.
   ```bash
   touch .env
   ```
   Add:
   ```env
   GEMINI_API_KEY="YOUR_KEY_HERE"
   ```

4. **Launch Dev Server**:
   ```bash
   npm run dev
   ```

## Tech Stack
*   **Frontend**: React 19, TypeScript
*   **Styling**: Tailwind CSS v4, Lucide Icons, Framer Motion
*   **3D / Shaders**: Three.js, React-Three-Fiber (R3F), Drei, Custom GLSL
*   **Data Vis**: Recharts
*   **AI Integration**: `@google/genai` (Gemini SDK)

## Theoretical Background

This application implements foundational concepts from the RHC:
*   **Wave Equation**: $\frac{\partial^2p}{\partial t^2} = c^2 \nabla^2 p$
*   **Observer Equation**: $O = 2.5r + 1.5i$
*   **Fold Operator**: $F = i/2$

The universe operates as a geometric compiler where "mass" is the computational impedance of space, and Dark Matter is topological debt. The app uses these axioms as grounding architecture for its simulation engines.

### License
GPLv3 - Open research architecture.
