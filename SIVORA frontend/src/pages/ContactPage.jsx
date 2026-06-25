import { useState } from 'react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-stone mb-3 text-center">Get in Touch</p>
      <h1 className="font-semibold text-2xl text-charcoal mb-12 text-center">Contact Us</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Info */}
        <div>
          <p className="font-sans text-sm text-stone leading-relaxed mb-8">
            We'd love to hear from you. Whether you have a question about an order, sizing, or just want to say hello — our team is here to help.
          </p>
          <div className="space-y-6">
            {[
              { label: 'Email', value: 'hello@SIVORAfashion.com', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
              { label: 'Phone', value: '+1 (555) 234-5678', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
              { label: 'Address', value: '123 Navora, Suite 400, Phnom Penh, NY 10001', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z' },
              { label: 'Hours', value: 'Mon–Fri: 9am–6pm EST', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
            ].map((item) => (
              <div key={item.label} className="flex gap-4">
                <div className="w-10 h-10 border border-sand flex items-center justify-center flex-shrink-0">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d={item.icon}/></svg>
                </div>
                <div>
                  <p className="font-sans text-[10px] tracking-widest uppercase text-stone mb-1">{item.label}</p>
                  <p className="font-sans text-sm text-charcoal">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white p-8 border border-sand">
          {sent ? (
            <div className="text-center py-12">
              <p className="font-semibold text-2xl text-charcoal mb-2">Thank you!</p>
              <p className="font-sans text-sm text-stone">We've received your message and will get back to you within 1–2 business days.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="font-sans text-[10px] tracking-widest uppercase text-stone block mb-1.5">Name</label>
                <input required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full border border-sand px-3 py-3 font-sans text-sm outline-none focus:border-charcoal transition-colors"/>
              </div>
              <div>
                <label className="font-sans text-[10px] tracking-widest uppercase text-stone block mb-1.5">Email</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full border border-sand px-3 py-3 font-sans text-sm outline-none focus:border-charcoal transition-colors"/>
              </div>
              <div>
                <label className="font-sans text-[10px] tracking-widest uppercase text-stone block mb-1.5">Message</label>
                <textarea required rows={5} value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} className="w-full border border-sand px-3 py-3 font-sans text-sm outline-none focus:border-charcoal transition-colors resize-none"/>
              </div>
              <button type="submit" className="w-full bg-charcoal text-cream font-sans text-xs tracking-widest uppercase py-4 hover:bg-espresso transition-colors">Send Message</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
