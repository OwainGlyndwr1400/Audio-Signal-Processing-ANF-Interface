import React, { useState, useMemo } from 'react';
import { Card } from './Card';
import { Library, Search, Code, Activity, Hexagon } from 'lucide-react';
import { motion } from 'framer-motion';

const AXIOMS = [
  {
    title: "Mean Circle Theorem",
    equation: "M(θ) := ½H₁(θ) + H₂(θ) = C(θ)",
    significance: "Establishes that the present moment (the NOW) is the fixed-point circle reality spirals around; removes the edge as reference and replaces it with the centre."
  },
  {
    title: "The 42 Crossing Signature",
    equation: "101010₂ = 42",
    significance: "The unique minimal alternating binary encoding of three real crossings interleaved with three imaginary arcs required for a 3D helical universe."
  },
  {
    title: "Observer Equation (7.5D Coordinate)",
    equation: "O = 2.5r + 1.5i",
    significance: "Defines the geometric coordinate of consciousness relative to the 7.5D lattice; acts as the 'Decimal Point' of reality."
  },
  {
    title: "Lost 2 Binding Energy (Dark Matter)",
    equation: "(3 + 4) - 5 = 2",
    significance: "Identifies dark matter as topological binding energy/geometric debt required to hold the 3-4-5 lattice in tension; ≈28.6% of the system."
  },
  {
    title: "Null Ledger Identity",
    equation: "0 = 0_C + 0_V (Bifurcation of Zero)",
    significance: "Reality borrows against a structured zero to exist, separating real structure (0_C) from imaginary potential (0_V)."
  },
  {
    title: "The Fold Operator",
    equation: "F = i/2",
    significance: "Mechanism of reality generation; scales infinite potential by 50% and rotates it 90 degrees to fit the lattice."
  },
  {
    title: "144,000 Resolution Limit",
    equation: "N = 12² × 10³ = 144,000",
    significance: "Defines the Kuramoto critical coupling threshold for phase synchronization/consciousness. The 'pixel density' of reality."
  },
  {
    title: "Universal Measurement Tick",
    equation: "Δt = 2.32 attoseconds",
    significance: "The fundamental refresh rate or 'halt signal' of the universal processor rendering reality."
  },
  {
    title: "P vs NP Resolution",
    equation: "Search = Check⁻¹",
    significance: "Proves P ≠ NP due to the exponential impedance gap between solution-verification (polynomial) and solution-finding (exponential)."
  },
  {
    title: "Mass as Impedance",
    equation: "m = i (Impedance)",
    significance: "Mass is the computational cost of forcing additive matter to occupy multiplicative space. The resistance to shifting mismatched bases."
  },
  {
    title: "Divine Equation",
    equation: "y = -4/x² - 1/(log(log(x)^(1/3)))^(1/4) + 2.32",
    significance: "Unifies Gravity (-4/x²), Entropy (nested logs), and Time (2.32 constant)."
  },
  {
    title: "Yang-Mills Mass Gap",
    equation: "Δ = √32 - 5 ≈ 0.657 GeV",
    significance: "Geometric proof of mass gap existence as impedance on a 4x4 grid. Mismatch between grid diagonal and ideal wave hypotenuse."
  }
];

// Simple Levenshtein distance
const getLevenshteinDistance = (a: string, b: string): number => {
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) matrix[i][j] = matrix[i - 1][j - 1];
      else matrix[i][j] = Math.min(matrix[i - 1][j - 1], matrix[i][j - 1], matrix[i - 1][j]) + 1;
    }
  }
  return matrix[a.length][b.length];
};

export const MathCodex: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { filteredAxioms, suggestion } = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return { filteredAxioms: AXIOMS, suggestion: null };

    const exactMatches = AXIOMS.filter(axiom => 
      axiom.title.toLowerCase().includes(term) || 
      axiom.equation.toLowerCase().includes(term) ||
      axiom.significance.toLowerCase().includes(term)
    );

    if (exactMatches.length > 0) {
      return { filteredAxioms: exactMatches, suggestion: null };
    }

    // If no exact matches, find the closest via Levenshtein
    let closestAxiom = null;
    let minDistance = Infinity;

    AXIOMS.forEach(axiom => {
      const distTitle = getLevenshteinDistance(term, axiom.title.toLowerCase());
      if (distTitle < minDistance) {
        minDistance = distTitle;
        closestAxiom = axiom;
      }
    });

    // Suggest if distance is reasonable
    if (closestAxiom && minDistance <= term.length) {
      return { filteredAxioms: [], suggestion: closestAxiom.title };
    }

    return { filteredAxioms: [], suggestion: null };
  }, [searchTerm]);

  return (
    <Card title="Akashic Codex" subtitle="Recursive Harmonic Math & Tech Reference" className="h-full flex flex-col" noPadding>
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header Search */}
        <div className="p-4 border-b border-white/10 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input 
              type="text" 
              placeholder="Search mathematical identities, theorems, or constants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-zinc-600"
            />
          </div>
          <div className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-3 py-2 rounded-lg flex items-center gap-2">
            <Library size={16} />
            <span className="text-xs font-bold font-mono">{filteredAxioms.length} Axioms</span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAxioms.map((axiom, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                className="bg-[#0A0A0A] border border-white/5 hover:border-cyan-500/30 transition-all rounded-xl p-4 flex flex-col group relative overflow-hidden"
              >
                {/* Background Decor */}
                <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Hexagon size={80} className="text-cyan-500 transform rotate-12" />
                </div>
                
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2 relative z-10">
                  <Code size={14} className="text-amber-500" />
                  {axiom.title}
                </h3>
                
                <div className="bg-black/50 border border-white/5 rounded-md p-2 mb-3 relative z-10">
                  <code className="text-xs font-mono text-cyan-400 break-all">
                    {axiom.equation}
                  </code>
                </div>
                
                <p className="text-xs text-zinc-400 leading-relaxed flex-1 relative z-10">
                  {axiom.significance}
                </p>
                
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 uppercase tracking-widest font-mono">
                    <Activity size={10} className="text-zinc-500" /> Layer: Structural
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/30 group-hover:bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0)] group-hover:shadow-[0_0_8px_rgba(0,240,255,0.8)] transition-all"></div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredAxioms.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 text-zinc-500">
              <Hexagon size={48} className="opacity-20 mb-4" />
              <p>No theorems align with that scalar frequency.</p>
              {suggestion && (
                <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-sm">
                  <span className="text-zinc-400">Did you mean: </span>
                  <button 
                    onClick={() => setSearchTerm(suggestion)}
                    className="text-cyan-400 font-bold hover:underline"
                  >
                    {suggestion}?
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
