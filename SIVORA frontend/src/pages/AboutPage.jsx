export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      {/* <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-stone mb-3 text-center">Our Story</p> */}
      <h1 className="font-semibold text-2xl text-charcoal mb-7 text-center">About Sivora</h1>

      {/* <div className="aspect-[16/7] bg-sand overflow-hidden mb-12">
        <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80" alt="Atelier" className="w-full h-full object-cover"/>
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="font-style: normal; text-2xl text-charcoal mb-4">Timeless design, made for today</h2>
          <p className="font-sans text-sm text-stone leading-relaxed mb-4">
            SIVORA was founded with a simple idea: clothing should be both beautiful and built to last. We work with small ateliers around the world to create pieces using natural fibers, considered silhouettes, and a muted, versatile palette that moves easily between seasons.
          </p>
          <p className="font-style: normal;text-sm text-stone leading-relaxed">
            Every collection is designed to be worn for years, not seasons. We believe that fewer, better things lead to a calmer, more intentional wardrobe.
          </p>
        </div>
        <div>
          <h2 className="font-style: normal; text-2xl text-charcoal mb-4">Crafted with care</h2>
          <p className="font-sans text-sm text-stone leading-relaxed mb-4">
            From sourcing to stitching, our small team oversees each step of production. We partner with family-run workshops that share our commitment to quality construction and fair working conditions.
          </p>
          <p className="font-sans text-sm text-stone leading-relaxed">
            Thank you for being part of our journey — we can't wait to see how you make these pieces your own.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Quality First', desc: 'Premium materials, considered construction, made to last.', img: 'https://i.pinimg.com/736x/2d/cd/c8/2dcdc877503041d5ef9d8291dd62868d.jpg' },
          { title: 'Sustainable Sourcing', desc: 'Responsibly sourced fabrics and ethical production partners.', img: 'https://i.pinimg.com/1200x/a8/0d/53/a80d533d7a7fec765b2a27efc5444447.jpg' },
          { title: 'Timeless Design', desc: 'Pieces designed to be worn season after season.',img: 'https://i.pinimg.com/736x/55/88/3d/55883dcad20c9dfebd98a8a48e23299c.jpg'},
        ].map((item) => (
          <div key={item.title}>
            <div className="aspect-square bg-sand overflow-hidden mb-4">
              <img src={item.img} alt={item.title} className="w-full h-full object-cover"/>
            </div>
            <h3 className="font-semibold text-lg text-charcoal mb-2">{item.title}</h3>
            <p className="font-sans text-xs text-stone leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
