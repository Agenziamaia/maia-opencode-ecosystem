'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Palette, RotateCcw, Download } from 'lucide-react'
import Modal from './Modal'

let P5: any = null

export default function AlgorithmicArtDemo() {
  const [isOpen, setIsOpen] = useState(false)
  const [seed, setSeed] = useState(Math.random())
  const canvasRef = useRef<HTMLDivElement>(null)
  const p5InstanceRef = useRef<any>(null)

  useEffect(() => {
    if (isOpen && !P5) {
      import('p5').then((mod) => {
        P5 = mod.default
        createSketch()
      })
    }
  }, [isOpen])

  const createSketch = () => {
    if (!P5 || !canvasRef.current) return

    const sketch = (p: any) => {
      p.setup = () => {
        const canvas = p.createCanvas(600, 500)
        canvas.parent(canvasRef.current)
        p.randomSeed(seed)
        drawArt(p)
      }

      p.draw = () => {
        p.background(15, 15, 25)
        drawArt(p)
      }
    }

    if (p5InstanceRef.current) {
      p5InstanceRef.current.remove()
    }
    p5InstanceRef.current = new P5(sketch)
  }

  useEffect(() => {
    if (isOpen) {
      createSketch()
    }
    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove()
      }
    }
  }, [isOpen, seed])

  const drawArt = (p: any) => {
    p.background(15, 15, 25)
    p.randomSeed(seed)

    const centerX = p.width / 2
    const centerY = p.height / 2

    for (let i = 0; i < 50; i++) {
      const x = p.random(p.width)
      const y = p.random(p.height)
      const size = p.random(20, 80)
      const hue = p.random(360)
      const alpha = p.random(30, 80)

      p.noStroke()
      p.fill(hue, 70, 80, alpha)
      p.ellipse(x, y, size, size)
    }

    for (let i = 0; i < 20; i++) {
      const x1 = p.random(p.width)
      const y1 = p.random(p.height)
      const x2 = p.random(p.width)
      const y2 = p.random(p.height)
      const hue = p.random(360)

      p.stroke(hue, 80, 90, 0.6)
      p.strokeWeight(p.random(1, 4))
      p.line(x1, y1, x2, y2)
    }

    for (let i = 0; i < 15; i++) {
      const x = p.random(p.width)
      const y = p.random(p.height)
      const size = p.random(30, 100)
      const sides = Math.floor(p.random(3, 8))
      const hue = p.random(360)
      const rotation = p.random(p.TWO_PI)

      p.push()
      p.translate(x, y)
      p.rotate(rotation)
      p.noFill()
      p.stroke(hue, 90, 70, 0.8)
      p.strokeWeight(2)
      p.beginShape()
      for (let j = 0; j < sides; j++) {
        const angle = (p.TWO_PI / sides) * j
        const sx = Math.cos(angle) * size
        const sy = Math.sin(angle) * size
        p.vertex(sx, sy)
      }
      p.endShape(p.CLOSE)
      p.pop()
    }
  }

  const handleRegenerate = () => {
    setSeed(Math.random())
  }

  const handleDownload = () => {
    if (!p5InstanceRef.current) return
    const canvas = document.querySelector('canvas')
    if (canvas instanceof HTMLCanvasElement) {
      const link = document.createElement('a')
      link.download = `maia-art-${Date.now()}.png`
      link.href = canvas.toDataURL()
      link.click()
    }
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -5 }}
        className="card-glass rounded-2xl p-6 transition-all hover:shadow-2xl hover:shadow-purple-500/20"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
            <Palette className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Algorithmic Art</h3>
            <p className="text-white/60 text-sm">p5.js generative art with seeded randomness</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Palette className="w-5 h-5" />
          Try It
        </button>
      </motion.div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Algorithmic Art Generator">
        <div className="flex flex-col gap-4">
          <div className="flex gap-3">
          <button
            onClick={handleRegenerate}
            className="flex-1 btn-secondary flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Regenerate
          </button>
            <button
              onClick={handleDownload}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Download className="w-5 h-5" />
              Save PNG
            </button>
          </div>
          <div className="bg-black/50 border border-white/20 rounded-xl p-4 flex items-center justify-center">
            <div ref={canvasRef} className="rounded-lg overflow-hidden" />
          </div>
          <p className="text-white/60 text-center text-sm">
            Using seed: {seed.toFixed(10)} — Click Regenerate to create unique artwork
          </p>
        </div>
      </Modal>
    </>
  )
}
