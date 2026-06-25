import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  return (
    <footer className="bg-charcoal text-cream mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
        <div className="col-span-2 md:col-span-1">
          <p className="font-serif text-xl tracking-widest uppercase font-bold mb-0.5">SIVORA</p>
          <p className="font-sans text-[9px] tracking-[0.3em] text-stone uppercase mb-4">Fashion</p>
          <p className="font-sans text-xs text-stone leading-relaxed mb-5">Timeless fashion for every moment. Designed with you in mind.</p>
          <div className="flex gap-3">
            {['IG','FB','PT','TK'].map(s => (
              <a key={s} href="#" className="w-7 h-7 border border-white/20 flex items-center justify-center font-sans text-[9px] tracking-widest text-stone hover:text-cream hover:border-white/40 transition-colors">{s}</a>
            ))}
          </div>
        </div>

        {[
          { title: 'Shop', links: [['All Products','/shop'],['New Arrivals','/shop'],['Women','/shop'],['Men','/shop'],['Sale','/shop']] },
          { title: 'Customer Care', links: [['Contact Us','/contact'],['Shipping & Delivery','#'],['Returns & Exchanges','#'],['Size Guide','#'],['FAQs','#']] },
          { title: 'About Us', links: [['Our Story','/about'],['Sustainability','#'],['Careers','#'],['Press','#'],['Store Locator','#']] },
        ].map(col => (
          <div key={col.title}>
            <p className="font-sans text-[10px] tracking-[0.25em] uppercase text-cream mb-4">{col.title}</p>
            {col.links.map(([l, p]) => (
              <Link key={l} to={p} className="block font-sans text-xs text-stone hover:text-cream transition-colors mb-2">{l}</Link>
            ))}
          </div>
        ))}

        <div>
          <p className="font-sans text-[10px] tracking-[0.25em] uppercase text-cream mb-4">Stay Connected</p>
          <p className="font-sans text-xs text-stone mb-4 leading-relaxed">Get 10% off your first order.</p>
          {done ? (
            <p className="font-sans text-xs text-stone">✓ Thanks for subscribing!</p>
          ) : (
            <div className="flex">
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Your email"
                className="flex-1 bg-white/10 border border-white/15 px-3 py-2 font-sans text-xs text-cream placeholder:text-stone/50 outline-none focus:border-white/30 min-w-0"/>
              <button onClick={() => email && setDone(true)}
                className="bg-cream text-charcoal px-3 hover:bg-sand transition-colors">
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="font-sans text-[10px] text-stone">© 2026 SIVORA Fashion. All rights reserved.</p>
          <div className="flex gap-4">
            {['Privacy Policy','Terms of Service','Cookies'].map(l => (
              <a key={l} href="#" className="font-sans text-[10px] text-stone hover:text-cream transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
