import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ShieldCheck, Wallet, LineChart } from 'lucide-react';

export default function Home() {
  const { token } = useAuth();
  const [imgError, setImgError] = React.useState(false);
  return (
    <div className="bg-gradient-to-b from-green-50 to-white">
      <section className="py-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div className="text-center md:text-left px-4">
            <motion.h1 initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.6}} className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
              Simplify Your Finances with <span className="text-primary">Finora</span>
            </motion.h1>
            <motion.p initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.6, delay:0.1}} className="text-gray-600 text-lg mb-6">
              Track your income, expenses, and investments — all in one smart dashboard.
            </motion.p>
            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.6, delay:0.2}} className="flex flex-wrap gap-3 justify-center md:justify-start">
              {!token ? (
                <>
                  <Link to="/signup" className="px-5 py-2.5 rounded bg-primary text-white shadow hover:shadow-md">Get Started</Link>
                  <a href="#features" className="px-5 py-2.5 rounded border">Learn More</a>
                </>
              ) : (
                <Link to="/dashboard" className="px-5 py-2.5 rounded bg-accent text-white shadow hover:shadow-md">Go to Dashboard</Link>
              )}
            </motion.div>
          </div>
          <div className="relative px-4">
            <div className="relative mx-auto w-[280px] md:w-[360px]">
              {!imgError ? (
                <img src={process.env.PUBLIC_URL + '/images/hero.png'} alt="Finora Hero" className="rounded-xl shadow-2xl" onError={()=>setImgError(true)} />
              ) : (
                <div className="rounded-xl shadow-2xl bg-gradient-to-br from-green-100 to-white h-[420px] flex items-center justify-center text-gray-500">
                  Illustration
                </div>
              )}
              <span className="absolute -left-6 top-8 text-2xl">💰</span>
              <span className="absolute -right-5 top-1/3 text-2xl">✅</span>
              <span className="absolute left-1/4 -bottom-4 text-2xl">📈</span>
              <span className="absolute inset-0 rounded-full pointer-events-none" style={{boxShadow:'0 0 80px 20px rgba(16,185,129,0.25)'}}></span>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4 text-center">Powerful features to master your money</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
            <FeatureCard icon={<Wallet className="w-6 h-6" />} title="Smart Budgeting" desc="Track spending with categories and visual charts." />
            <FeatureCard icon={<LineChart className="w-6 h-6" />} title="Portfolio Tracking" desc="Monitor stocks, crypto, and funds." />
            <FeatureCard icon={<ShieldCheck className="w-6 h-6" />} title="Secure & Private" desc="Your data is encrypted and safe." />
            <FeatureCard icon={<span className="text-xl">🎯</span>} title="Goals & Savings" desc="Set goals and watch progress grow." />
          </div>

          <div className="mt-10 grid md:grid-cols-3 gap-4 text-sm text-gray-700">
            <div className="bg-white rounded-lg p-4 shadow">
              <b>Why Finora is Better</b>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Simple & intuitive design</li>
                <li>Detailed analytics and visual reports</li>
                <li>Built for students, freelancers, and professionals</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 shadow">
              <b>Income & Expense Tracker</b>
              <p className="mt-2">Custom categories, recurring entries, and savings insights.</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow">
              <b>Portfolio Tracker</b>
              <p className="mt-2">Composition and growth charts with an easy holdings table.</p>
            </div>
          </div>
        </div>
      </section>

      <ContactUs />
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="snap-start min-w-[240px] bg-white rounded-xl p-4 shadow hover:shadow-lg transition shadow-green-100 hover:scale-[1.02]">
      <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center mb-3">{icon}</div>
      <div className="font-semibold mb-1">{title}</div>
      <div className="text-gray-600 text-sm">{desc}</div>
    </div>
  );
}

// Contact section appended to the end of Home
// (Kept minimal: stores locally; you can wire to backend /api/contact if needed)
function ContactUs() {
  const [sent, setSent] = React.useState(false);
  return (
    <section className="py-12 bg-white border-t">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-4 text-center">Contact Us</h2>
        {sent ? (
          <div className="p-3 bg-green-100 text-green-700 rounded text-center">Thanks! We received your message.</div>
        ) : (
          <form onSubmit={(e)=>{e.preventDefault(); setSent(true);}} className="grid gap-3">
            <input className="border rounded px-3 py-2" placeholder="Name" required />
            <input type="email" className="border rounded px-3 py-2" placeholder="Email" required />
            <textarea rows="4" className="border rounded px-3 py-2" placeholder="Message" required />
            <button className="px-4 py-2 bg-primary text-white rounded w-max">Send</button>
          </form>
        )}
      </div>
    </section>
  );
}


