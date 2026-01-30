'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, ChevronDown } from 'lucide-react'
import Modal from './Modal'
import { jsPDF } from 'jspdf'

const reportTemplates = [
  {
    id: 'weekly',
    name: 'Weekly Status Report',
    icon: '📊',
  },
  {
    id: 'sprint',
    name: 'Sprint Summary',
    icon: '🎯',
  },
  {
    id: 'incident',
    name: 'Incident Report',
    icon: '🚨',
  },
]

export default function InternalCommsDemo() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('weekly')
  const [formData, setFormData] = useState({
    projectName: 'MAIA Skill Development',
    author: 'Agentic Team',
    date: new Date().toISOString().split('T')[0],
    summary: 'This week we implemented 5 interactive skill demo cards showcasing MAIA capabilities. All components are production-ready with modern styling.',
    achievements: [
      'Created React Component live editor',
      'Built Algorithmic Art generator with p5.js',
      'Developed Internal Comms template system',
      'Implemented PDF form filler demo',
      'Created interactive Vibe Kanban board',
    ],
    blockers: 'None currently. Development proceeding smoothly.',
    nextSteps: [
      'Integrate all demos into main showcase page',
      'Add unit tests for each component',
      'Optimize performance and bundle size',
      'Prepare documentation for deployment',
    ],
  })

  const handleGeneratePDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    let y = margin

    doc.setFontSize(24)
    doc.setTextColor(255, 107, 53)
    doc.text('MAIA ECOSYSTEM', margin, y)
    y += 15

    doc.setFontSize(16)
    doc.setTextColor(100, 100, 100)
    doc.text(`Report: ${reportTemplates.find(t => t.id === selectedTemplate)?.name}`, margin, y)
    y += 10

    doc.setFontSize(10)
    doc.setTextColor(128, 128, 128)
    doc.text(`Date: ${formData.date} | Author: ${formData.author}`, margin, y)
    y += 20

    doc.setFontSize(14)
    doc.setTextColor(255, 255, 255)
    doc.text('Executive Summary', margin, y)
    y += 8

    doc.setFontSize(10)
    doc.setTextColor(200, 200, 200)
    const summaryLines = doc.splitTextToSize(formData.summary, pageWidth - margin * 2)
    doc.text(summaryLines, margin, y)
    y += summaryLines.length * 5 + 15

    doc.setFontSize(14)
    doc.setTextColor(255, 255, 255)
    doc.text('Key Achievements', margin, y)
    y += 8

    doc.setFontSize(10)
    doc.setTextColor(200, 200, 200)
    formData.achievements.forEach((achievement, i) => {
      doc.text(`${i + 1}. ${achievement}`, margin + 5, y)
      y += 6
    })
    y += 10

    doc.setFontSize(14)
    doc.setTextColor(255, 255, 255)
    doc.text('Blockers & Issues', margin, y)
    y += 8

    doc.setFontSize(10)
    doc.setTextColor(200, 200, 200)
    const blockerLines = doc.splitTextToSize(formData.blockers || 'None', pageWidth - margin * 2)
    doc.text(blockerLines, margin, y)
    y += blockerLines.length * 5 + 15

    doc.setFontSize(14)
    doc.setTextColor(255, 255, 255)
    doc.text('Next Steps', margin, y)
    y += 8

    doc.setFontSize(10)
    doc.setTextColor(200, 200, 200)
    formData.nextSteps.forEach((step, i) => {
      doc.text(`${i + 1}. ${step}`, margin + 5, y)
      y += 6
    })

    doc.save(`maia-report-${formData.date}.pdf`)
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -5 }}
        className="card-glass rounded-2xl p-6 transition-all hover:shadow-2xl hover:shadow-maia-accent/20"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Internal Comms</h3>
            <p className="text-white/60 text-sm">Professional report template generator</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <FileText className="w-5 h-5" />
          Try It
        </button>
      </motion.div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Internal Communications">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-maia-accent mb-2">
              Select Template
            </label>
            <div className="grid grid-cols-3 gap-3">
              {reportTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedTemplate === template.id
                      ? 'border-maia-primary bg-maia-primary/20'
                      : 'border-white/20 hover:border-maia-primary/50 bg-white/5'
                  }`}
                >
                  <div className="text-2xl mb-2">{template.icon}</div>
                  <div className="text-sm font-medium">{template.name}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-maia-accent mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-maia-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-maia-accent mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-maia-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-maia-accent mb-2">
              Summary
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              rows={3}
              className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-maia-primary resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-maia-accent mb-2">
              Achievements (one per line)
            </label>
            <textarea
              value={formData.achievements.join('\n')}
              onChange={(e) => setFormData({ ...formData, achievements: e.target.value.split('\n').filter(a => a.trim()) })}
              rows={4}
              className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-maia-primary resize-none font-mono text-sm"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-maia-accent mb-2">
                Blockers
              </label>
              <input
                type="text"
                value={formData.blockers}
                onChange={(e) => setFormData({ ...formData, blockers: e.target.value })}
                className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-maia-primary"
                placeholder="None"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-maia-accent mb-2">
                Next Steps (one per line)
              </label>
              <textarea
                value={formData.nextSteps.join('\n')}
                onChange={(e) => setFormData({ ...formData, nextSteps: e.target.value.split('\n').filter(a => a.trim()) })}
                rows={4}
                className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-maia-primary resize-none font-mono text-sm"
              />
            </div>
          </div>

          <button
            onClick={handleGeneratePDF}
            className="w-full btn-secondary flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Generate PDF Report
          </button>
        </div>
      </Modal>
    </>
  )
}
