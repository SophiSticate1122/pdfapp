'use client'
import { useState } from 'react'
import { FileText, Zap, MessageSquare, Shield, Check, ChevronRight, Star, Users, Clock, ArrowRight } from 'lucide-react'

export default function Landing() {
  const [email, setEmail] = useState('')

  const goToApp = () => {
    window.location.href = 'https://pdfsummarizer.store'
  }

  const goToAppWithEmail = () => {
    window.location.href = `https://pdfsummarizer.store?email=${encodeURIComponent(email)}`
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-gray-900">PDF Summarizer</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</a>
            <button onClick={goToApp}
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition font-semibold">
              Try Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Zap className="w-4 h-4" /> AI-Powered Document Analysis
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Understand Any PDF in<br />
            <span className="text-blue-600">Under 2 Minutes</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Upload any PDF and get a structured, page-by-page breakdown with key concepts, arguments, implications and more. Then ask questions and get instant answers.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="px-5 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-80" />
            <button onClick={email ? goToAppWithEmail : goToApp}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 whitespace-nowrap">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-gray-500">✅ First summary free — no credit card required</p>
        </div>

        {/* App Preview */}
        <div className="max-w-3xl mx-auto mt-12">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <span className="font-semibold">PDF Summarizer & Q&A</span>
                <span className="ml-auto text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">AI-powered</span>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="border-2 border-dashed border-blue-200 rounded-xl p-6 text-center bg-blue-50">
                <FileText className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-sm text-blue-600 font-medium">research-paper.pdf uploaded ✅</p>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Page 1', content: '**People:** Dr. James Smith, Research Team at MIT\n**Core Concepts:** Machine learning applications in healthcare diagnostics\n**Arguments:** The authors argue that AI-driven diagnostic tools can reduce misdiagnosis rates by up to 40%...' },
                  { label: 'Page 2', content: '**Methods:** Randomized controlled trial with 2,400 participants across 12 hospitals\n**Implications:** Could transform early cancer detection globally...' },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3 text-left">
                    <div className="text-xs font-bold text-blue-600 mb-1">{item.label}</div>
                    <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed">{item.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need to Understand Any Document</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Stop spending hours reading through dense documents. Get the insights you need in minutes.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <FileText className="w-6 h-6 text-blue-600" />,
                title: 'Page-by-Page Breakdown',
                desc: 'Every page analyzed with key people, concepts, arguments, methods, implications and critiques — nothing missed.'
              },
              {
                icon: <MessageSquare className="w-6 h-6 text-blue-600" />,
                title: 'Ask Any Question',
                desc: 'After summarizing, ask questions about the document and get instant, accurate answers based on the content.'
              },
              {
                icon: <Zap className="w-6 h-6 text-blue-600" />,
                title: 'Results in Minutes',
                desc: 'Parallel AI processing means even 50-page documents are summarized in under 2 minutes. No waiting around.'
              },
              {
                icon: <Shield className="w-6 h-6 text-blue-600" />,
                title: 'Secure & Private',
                desc: 'Your documents are processed securely and never stored. Your privacy is our priority.'
              },
              {
                icon: <Clock className="w-6 h-6 text-blue-600" />,
                title: 'Save Hours Every Week',
                desc: 'What used to take 3 hours of reading now takes 2 minutes. Reclaim your time for what matters.'
              },
              {
                icon: <Users className="w-6 h-6 text-blue-600" />,
                title: 'Works for Everyone',
                desc: 'Students, researchers, lawyers, doctors, business professionals — anyone who reads documents benefits.'
              }
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">{f.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Perfect For</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { emoji: '🎓', title: 'Students', desc: 'Research papers, textbooks, dissertations' },
              { emoji: '⚖️', title: 'Legal', desc: 'Contracts, case files, legal briefs' },
              { emoji: '🔬', title: 'Researchers', desc: 'Academic papers, journals, studies' },
              { emoji: '💼', title: 'Business', desc: 'Reports, proposals, white papers' },
              { emoji: '🏥', title: 'Healthcare', desc: 'Medical studies, clinical reports' },
              { emoji: '📊', title: 'Finance', desc: 'Annual reports, prospectuses, filings' },
              { emoji: '🏛️', title: 'Government', desc: 'Policy documents, regulations, briefs' },
              { emoji: '📚', title: 'Education', desc: 'Curriculum materials, lesson plans' },
            ].map((u, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 text-center border border-gray-100 hover:shadow-md transition">
                <div className="text-3xl mb-2">{u.emoji}</div>
                <div className="font-bold text-gray-900 text-sm mb-1">{u.title}</div>
                <div className="text-xs text-gray-500">{u.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What People Are Saying</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah M.', role: 'PhD Student', text: 'I used to spend 3 hours reading each research paper. Now I get the full breakdown in 2 minutes and can focus on what actually matters for my thesis.' },
              { name: 'James T.', role: 'Corporate Lawyer', text: 'Game changer for contract review. I can quickly identify key clauses and arguments before diving into the full document. Saves me hours every week.' },
              { name: 'Dr. Priya K.', role: 'Medical Researcher', text: 'The arguments section is incredibly thorough. It explains complex medical study findings in a way that helps me quickly assess whether a paper is relevant to my research.' },
            ].map((t, i) => (
              <div key={i} className="p-6 rounded-2xl bg-blue-50 border border-blue-100">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-600">Start free. Upgrade when you're ready.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="text-4xl font-bold text-gray-900 mb-1">$0</div>
              <p className="text-gray-500 text-sm mb-6">No credit card required</p>
              <ul className="space-y-3 mb-8">
                {['1 PDF summary', 'Full page-by-page breakdown', 'Q&A on your document', 'All 6 analysis categories'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <button onClick={goToApp}
                className="w-full border-2 border-blue-600 text-blue-600 py-3 rounded-xl font-semibold hover:bg-blue-50 transition">
                Get Started Free
              </button>
            </div>
            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">MOST POPULAR</div>
              <h3 className="text-xl font-bold mb-2">Pro</h3>
              <div className="flex items-end gap-1 mb-1">
                <div className="text-4xl font-bold">$2.99</div>
                <div className="text-blue-200 mb-1">/month</div>
              </div>
              <p className="text-blue-200 text-sm mb-6">Or $1.99/mo billed yearly</p>
              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited PDF summaries',
                  'Full page-by-page breakdown',
                  'Unlimited Q&A',
                  'All 6 analysis categories',
                  'Parallel processing for speed',
                  'Priority support'
                ].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white">
                    <Check className="w-4 h-4 text-green-300 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <button onClick={goToApp}
                className="w-full bg-white text-blue-600 py-3 rounded-xl font-semibold hover:bg-blue-50 transition flex items-center justify-center gap-2">
                Start Free Trial <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Save Hours Every Week?</h2>
          <p className="text-blue-100 mb-8 text-lg">Join thousands of students, researchers and professionals who use PDF Summarizer to work smarter.</p>
          <button onClick={goToApp}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition flex items-center gap-2 mx-auto">
            Try It Free Now <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-blue-200 text-sm mt-4">First summary free · No credit card needed · Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span className="font-semibold text-white">PDF Summarizer</span>
          </div>
          <p className="text-sm">© 2026 PDF Summarizer. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
            <a href="mailto:support@pdfsummarizer.store" className="hover:text-white transition">Support</a>
          </div>
        </div>
      </footer>

    </div>
  )
}