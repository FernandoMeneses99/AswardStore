import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-void overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-dark-teal-wash opacity-50" />
      <div className="absolute inset-0 bg-spotlight" />
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-green/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-neon-green/3 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-forest/50 border border-dark-card-border mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
          <span className="text-shade-30 text-sm font-medium">Nueva colección disponible</span>
        </div>

        {/* Main headline - Display XL Light */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-tight text-white mb-6 animate-slide-up" style={{ fontWeight: 330 }}>
          Descubre tu estilo
          <span className="block text-neon-green">perfecto</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Moda premium y calzado exclusivo para quienes marcan tendencia. 
          Envíos a todo el país.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Link
            href="/products"
            className="btn-primary inline-flex items-center gap-2 text-base font-medium"
          >
            Ver colección
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          
          <Link
            href="/categories"
            className="btn-secondary inline-flex items-center gap-2 text-base font-medium"
          >
            Explorar categorías
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 mt-16 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-semibold text-white">500+</div>
            <div className="text-sm text-muted mt-1">Productos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-semibold text-white">50+</div>
            <div className="text-sm text-muted mt-1">Marcas</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-semibold text-white">15+</div>
            <div className="text-sm text-muted mt-1">Ciudades</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}