'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Code2, Play, Copy, Check } from 'lucide-react'
import Modal from './Modal'

const defaultCode = `export function WelcomeCard() {
  return (
    <div className="p-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white">
      <h2 className="text-2xl font-bold mb-2">Welcome to MAIA!</h2>
      <p className="opacity-90">Agentic AI that builds for you.</p>
    </div>
  )
}`

export default function ReactComponentDemo() {
  const [isOpen, setIsOpen] = useState(false)
  const [code, setCode] = useState(defaultCode)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -5 }}
        className="card-glass rounded-2xl p-6 transition-all hover:shadow-2xl hover:shadow-maia-primary/20"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
            <Code2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">React Component</h3>
            <p className="text-white/60 text-sm">Live code editor with instant preview</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5" />
          Try It
        </button>
      </motion.div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="React Component Generator">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-maia-accent">Code Editor</label>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 min-h-[400px] bg-black/50 border border-white/20 rounded-xl p-4 font-mono text-sm text-green-400 resize-none focus:outline-none focus:border-maia-primary"
              spellCheck={false}
            />
          </div>
          <div className="flex flex-col gap-3">
            <label className="font-semibold text-maia-accent">Live Preview</label>
            <div className="flex-1 bg-white/5 border border-white/20 rounded-xl p-6">
              <div className="text-sm text-white/60 mb-4 pb-4 border-b border-white/10">
                Preview Area
              </div>
              <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                {code.split('\n').map((line, i) => (
                  <div key={i} className="hover:bg-white/5 px-2 -mx-2">
                    <span className="text-white/30 mr-4">{i + 1}</span>
                    <span className="text-purple-400">{line}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}
