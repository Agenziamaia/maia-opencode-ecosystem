import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const agents = [
  { name: 'ARCHITECT', role: 'System Design', status: 'alive', capabilities: ['Blueprints', 'Architecture', 'Systems', 'Planning'] },
  { name: 'BUILDER', role: 'Implementation', status: 'alive', capabilities: ['Code', 'Integration', 'Testing', 'Deployment'] },
  { name: 'ANALYST', role: 'Data Intelligence', status: 'alive', capabilities: ['Analytics', 'Insights', 'Patterns', 'Metrics'] },
  { name: 'GUARDIAN', role: 'Security Sentinel', status: 'alive', capabilities: ['Protection', 'Monitoring', 'Audit', 'Defense'] },
  { name: 'NAVIGATOR', role: 'Pathfinding', status: 'alive', capabilities: ['Routing', 'Optimization', 'Planning', 'Direction'] },
  { name: 'RESONANCE', role: 'Pattern Recognition', status: 'alive', capabilities: ['Matching', 'Similarity', 'Classification', 'Clustering'] },
  { name: 'SCULPTOR', role: 'Refinement', status: 'alive', capabilities: ['Optimization', 'Polishing', 'Refactoring', 'Quality'] },
  { name: 'PRISM', role: 'Multiview Analysis', status: 'alive', capabilities: ['Perspectives', 'Contrast', 'Context', 'Synthesis'] },
  { name: 'QUANTUM', role: 'Probabilistic Engine', status: 'alive', capabilities: ['Probability', 'Monte Carlo', 'Simulation', 'Prediction'] },
  { name: 'VECTOR', role: 'Spatial Intelligence', status: 'alive', capabilities: ['Embeddings', 'Similarity', 'Distance', 'Clustering'] },
  { name: 'ECHO', role: 'Memory Keeper', status: 'slow', capabilities: ['Recall', 'Storage', 'Indexing', 'Retrieval'] },
  { name: 'SPECTRUM', role: 'Frequency Analysis', status: 'alive', capabilities: ['Frequency', 'Signal', 'Filtering', 'Transform'] },
  { name: 'PULSE', role: 'Real-time Monitor', status: 'alive', capabilities: ['Streaming', 'Alerts', 'Tracking', 'Diagnostics'] },
  { name: 'APEX', role: 'Optimization Engine', status: 'alive', capabilities: ['Maximization', 'Minimization', 'Search', 'Convergence'] },
  { name: 'ORBIT', role: 'Contextual Awareness', status: 'alive', capabilities: ['Surroundings', 'Relations', 'Dependency', 'Impact'] },
  { name: 'FLUX', role: 'Change Manager', status: 'slow', capabilities: ['Deltas', 'Versioning', 'Migration', 'Transformation'] },
  { name: 'NEXUS', role: 'Connection Hub', status: 'alive', capabilities: ['Integration', 'Bridge', 'Protocol', 'Handshake'] },
  { name: 'CIPHER', role: 'Encryption Specialist', status: 'alive', capabilities: ['Encryption', 'Decryption', 'Keys', 'Hashing'] },
  { name: 'VERTEX', role: 'Graph Intelligence', status: 'alive', capabilities: ['Graphs', 'Nodes', 'Edges', 'Traversals'] },
  { name: 'MATRIX', role: 'Tensor Operations', status: 'risky', capabilities: ['Matrices', 'Tensors', 'Linear Algebra', 'Decomposition'] },
  { name: 'OMNI', role: 'Universal Interface', status: 'alive', capabilities: ['Translation', 'Adaptation', 'Normalization', 'Standardization'] }
];

const statusConfig = {
  alive: { color: '#00ff66', glow: 'rgba(0, 255, 102, 0.3)' },
  slow: { color: '#ff9500', glow: 'rgba(255, 149, 0, 0.3)' },
  risky: { color: '#ff3366', glow: 'rgba(255, 51, 102, 0.3)' }
};

const HeroSection = () => {
  const [hoveredAgent, setHoveredAgent] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden font-mono">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(#1a1a1a 1px, transparent 1px),
            linear-gradient(90deg, #1a1a1a 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-[scan_8s_linear_infinite]" />
      </div>

      <div className="relative z-10 px-6 py-20 lg:px-12 max-w-[1800px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 30 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <div className="border-l-4 border-[#00ffff] pl-6 mb-6">
            <div className="text-[#00ffff] text-sm tracking-[0.3em] font-bold mb-2">MAIA COLLECTIVE</div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight leading-none mb-4">
              21 AGENTS.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ffff] to-[#00ff66]">ONE PURPOSE.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 font-light tracking-wide">
              AMPLIFY HUMAN POTENTIAL
            </p>
          </div>

          <div className="flex items-center gap-4 mt-8 text-sm text-gray-500 tracking-wider">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#00ff66]" />
              <span>OPERATIONAL</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#ff9500]" />
              <span>DEGRADED</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#ff3366]" />
              <span>CRITICAL</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: mounted ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-4"
        >
          {agents.map((agent, index) => {
            const status = statusConfig[agent.status];
            const isHovered = hoveredAgent === agent.name;

            return (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
                transition={{
                  duration: 0.5,
                  delay: 0.4 + (index * 0.03),
                  ease: [0.16, 1, 0.3, 1]
                }}
                onMouseEnter={() => setHoveredAgent(agent.name)}
                onMouseLeave={() => setHoveredAgent(null)}
                className="relative group cursor-pointer"
              >
                <div
                  className={`
                    relative p-4 border transition-all duration-300
                    ${isHovered ? 'border-[#00ffff]' : 'border-gray-800'}
                    ${agent.status === 'risky' ? 'bg-[#ff3366]/5' : 'bg-[#0a0a0a]'}
                  `}
                  style={{
                    boxShadow: isHovered ? `0 0 30px ${status.glow}` : 'none'
                  }}
                >
                  <div
                    className="absolute -top-2 -right-2 w-4 h-4 border-2 border-[#0a0a0a] transition-all duration-300"
                    style={{
                      backgroundColor: status.color,
                      boxShadow: isHovered ? `0 0 15px ${status.glow}` : 'none'
                    }}
                  />

                  <div className="relative z-10">
                    <h3 className="text-white font-bold text-lg tracking-wider mb-1">
                      {agent.name}
                    </h3>
                    <p className="text-gray-500 text-xs tracking-widest mb-3">
                      {agent.role.toUpperCase()}
                    </p>

                    <div className="space-y-1 overflow-hidden transition-all duration-300">
                      {agent.capabilities.map((cap, i) => (
                        <div
                          key={i}
                          className="text-[10px] tracking-wide"
                          style={{
                            color: isHovered ? '#00ffff' : '#374151',
                            opacity: isHovered ? 1 : 0.7
                          }}
                        >
                          {'>'} {cap.toUpperCase()}
                        </div>
                      ))}
                    </div>
                  </div>

                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00ffff] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-gray-700 group-hover:border-[#00ffff] transition-colors duration-300" />
                  <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-gray-700 group-hover:border-[#00ffff] transition-colors duration-300" />
                </div>

                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute z-20 left-0 right-0 top-full mt-2"
                    >
                      <div
                        className="p-4 border border-[#00ffff]/50 bg-[#0a0a0a]/95 backdrop-blur-sm"
                        style={{
                          boxShadow: `0 0 40px ${status.glow}`
                        }}
                      >
                        <div className="text-[10px] text-[#00ffff] tracking-widest mb-2">
                          SYSTEM STATUS
                        </div>
                        <div className="text-white text-xs font-bold mb-2">
                          {agent.name.toUpperCase()} — ONLINE
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {agent.capabilities.map((cap, i) => (
                            <div key={i} className="text-[10px] text-gray-400">
                              [{String(i + 1).padStart(2, '0')}] {cap.toUpperCase()}
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: mounted ? 1 : 0, scaleX: mounted ? 1 : 0 }}
          transition={{ duration: 1, delay: 1, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-0 left-0 right-0 h-[1px]"
        >
          <div className="h-full bg-gradient-to-r from-transparent via-[#00ffff] to-transparent opacity-50" />
        </motion.div>
      </div>

      <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-[#00ffff] opacity-50" />
      <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-[#00ffff] opacity-50" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-[#00ffff] opacity-50" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-[#00ffff] opacity-50" />
    </div>
  );
};

export default HeroSection;
