const posts = [
  { title: 'Building a Capsule Wardrobe for Spring', excerpt: 'A few timeless pieces that mix and match effortlessly through the season.', img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80', date: 'May 12, 2026', tag: 'Style Guide' },
  { title: 'The Story Behind Our Linen Sourcing', excerpt: 'A look at the family-run mills we partner with across Europe.', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80', date: 'Apr 28, 2026', tag: 'Sustainability' },
  { title: 'How to Style Oversized Blazers', excerpt: 'Three ways to wear our best-selling blazer this season.', img: 'https://i.pinimg.com/736x/3d/2a/94/3d2a94ab544eba07ca26c3b2a14b004e.jpg?w=600&auto=format&fit=crop&q=80', date: 'Apr 10, 2026', tag: 'Style Guide' },
  { title: 'Caring for Your Knitwear', excerpt: 'Simple steps to keep your favorite sweaters looking new for years.', img: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=600&auto=format&fit=crop&q=80', date: 'Mar 30, 2026', tag: 'Care Guide' },
  { title: 'Meet the Makers: Our Leather Workshop', excerpt: 'An inside look at the artisans behind our bag collection.', img: 'https://i.pinimg.com/1200x/49/be/f9/49bef9df632e9d10d9cbaee46d5ff768.jpg?w=600&auto=format&fit=crop&q=80', date: 'Mar 15, 2026', tag: 'Behind the Scenes' },
  { title: 'Five Ways to Wear Neutral Tones', excerpt: 'Make the most of your wardrobe staples with these combinations.', img: 'https://i.pinimg.com/1200x/0d/5b/fb/0d5bfba9230312a7d3708c094cf8601c.jpg?w=600&auto=format&fit=crop&q=80', date: 'Feb 22, 2026', tag: 'Style Guide' },
];

export default function BlogPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-stone mb-3 text-center">Journal</p>
      <h1 className="font-serif text-5xl text-charcoal mb-12 text-center">From the SIVORA Blog</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <article key={post.title} className="group cursor-pointer">
            <div className="aspect-[4/3] bg-sand overflow-hidden mb-4">
              <img src={post.img} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
            </div>
            <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-stone mb-2">{post.tag} · {post.date}</p>
            <h2 className="font-serif text-xl text-charcoal mb-2 group-hover:text-stone transition-colors">{post.title}</h2>
            <p className="font-sans text-sm text-stone leading-relaxed">{post.excerpt}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
