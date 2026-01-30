'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import ReactComponentDemo from '../components/ReactComponentDemo'
import AlgorithmicArtDemo from '../components/AlgorithmicArtDemo'
import InternalCommsDemo from '../components/InternalCommsDemo'
import PdfDemo from '../components/PdfDemo'
import VibeKanbanDemo from '../components/VibeKanbanDemo'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
}

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-maia-dark via-maia-dark/95 to-maia-secondary/20" />

      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-72 h-72 bg-maia-primary/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-maia-secondary/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-maia-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-6"
          >
            <div className="p-4 bg-gradient-to-br from-maia-primary to-maia-accent rounded-2xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-white via-maia-accent to-white bg-clip-text text-transparent">
            MAIA Skills Demo
          </h1>

          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Interactive demonstrations showcasing the power of agentic AI
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
        >
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <ReactComponentDemo />
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-1">
            <AlgorithmicArtDemo />
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-1">
            <InternalCommsDemo />
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-1">
            <PdfDemo />
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-2">
            <VibeKanbanDemo />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="card-glass rounded-2xl p-8 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-maia-accent">
              Experience the Future of Development
            </h2>
            <p className="text-white/70 mb-6">
              These demos showcase just a fraction of what MAIA can do. Our agentic system
              can build complete applications, generate art, write documentation, and much more —
              all while maintaining production-quality code.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="px-4 py-2 bg-maia-primary/20 rounded-lg border border-maia-primary/30">
                <span className="text-maia-accent font-semibold">20+</span>
                <span className="text-white/60 ml-2">Specialized Agents</span>
              </div>
              <div className="px-4 py-2 bg-maia-secondary/20 rounded-lg border border-maia-secondary/30">
                <span className="text-maia-accent font-semibold">15+</span>
                <span className="text-white/60 ml-2">Loadable Skills</span>
              </div>
              <div className="px-4 py-2 bg-maia-accent/20 rounded-lg border border-maia-accent/30">
                <span className="text-maia-accent font-semibold">100%</span>
                <span className="text-white/60 ml-2">Type Safety</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-16 text-center text-white/50 text-sm"
        >
          <p>Built by MAIA Droids • Orchestrated by @MAIA • Engineered by @Coder</p>
        </motion.footer>
      </div>
    </main>
  )
}
