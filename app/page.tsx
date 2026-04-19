import { Header } from '@/src/ui/components/header';
import { Hero } from '@/src/ui/components/hero';
import { Analytics } from "@vercel/analytics/next"

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        
        {/* Featured Products Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-deep-teal">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-light text-white mb-4">
                Productos Destacados
              </h2>
              <p className="text-muted max-w-xl mx-auto">
                Las piezas más exclusivas de nuestra colección
              </p>
            </div>
            
            {/* Product Grid - Placeholder */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div 
                  key={item} 
                  className="group bg-forest rounded-xl overflow-hidden border border-dark-card-border hover:border-neon-green/50 transition-all duration-300 hover:shadow-lg"
                >
                  {/* Image placeholder */}
                  <div className="aspect-square bg-dark-forest relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center text-shade-70 text-4xl font-light">
                      {item}
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-sm font-medium px-4 py-2 bg-neon-green text-black rounded-full">
                        Ver detalles
                      </span>
                    </div>
                  </div>
                  
                  {/* Product info */}
                  <div className="p-4">
                    <h3 className="text-white font-medium text-sm mb-1 truncate">
                      Producto {item}
                    </h3>
                    <p className="text-muted text-sm">Categoría</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-white font-semibold">$99.999</span>
                      <span className="text-neon-green text-xs">Añadir al carrito</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* View All Button */}
            <div className="text-center mt-12">
              <a 
                href="/products" 
                className="inline-flex items-center gap-2 text-white font-medium hover:text-neon-green transition-colors"
              >
                Ver todos los productos
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-void">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-light text-white mb-4">
                Explora por Categoría
              </h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: 'Camisas', icon: '👕' },
                { name: 'Pantalones', icon: '👖' },
                { name: 'Zapatos', icon: '👟' },
                { name: 'Accesorios', icon: '🎒' },
              ].map((category) => (
                <a
                  key={category.name}
                  href={`/categories/${category.name.toLowerCase()}`}
                  className="group relative aspect-square bg-forest rounded-2xl overflow-hidden border border-dark-card-border hover:border-neon-green/30 transition-all duration-300"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl">{category.icon}</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-medium text-lg">{category.name}</h3>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-dark-forest">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: '🚚',
                  title: 'Envío Gratis',
                  description: 'En pedidos superiores a $100.000'
                },
                {
                  icon: '🔒',
                  title: 'Pago Seguro',
                  description: 'Pasarela de pagos con Bold'
                },
                {
                  icon: '↩️',
                  title: 'Devolución',
                  description: '30 días para cambios y devoluciones'
                },
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-4 p-6 bg-forest rounded-xl border border-dark-card-border"
                >
                  <span className="text-3xl">{feature.icon}</span>
                  <div>
                    <h3 className="text-white font-medium mb-1">{feature.title}</h3>
                    <p className="text-muted text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-deep-teal">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-light text-white mb-4">
              Recibe nuestras ofertas
            </h2>
            <p className="text-muted mb-6">
              Suscríbete y obtén un 10% de descuento en tu primera compra
            </p>
            <form className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="input-dark flex-1"
              />
              <button 
                type="submit"
                className="btn-primary whitespace-nowrap"
              >
                Suscribirse
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-void border-t border-dark-card-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="text-white font-medium mb-4">Comprar</h4>
              <ul className="space-y-2">
                <li><a href="/products" className="text-muted text-sm hover:text-neon-green transition-colors">Todos los productos</a></li>
                <li><a href="/categories" className="text-muted text-sm hover:text-neon-green transition-colors">Categorías</a></li>
                <li><a href="/new" className="text-muted text-sm hover:text-neon-green transition-colors">Nuevos ingresos</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Ayuda</h4>
              <ul className="space-y-2">
                <li><a href="/faq" className="text-muted text-sm hover:text-neon-green transition-colors">Preguntas frecuentes</a></li>
                <li><a href="/shipping" className="text-muted text-sm hover:text-neon-green transition-colors">Envíos</a></li>
                <li><a href="/returns" className="text-muted text-sm hover:text-neon-green transition-colors">Devoluciones</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Empresa</h4>
              <ul className="space-y-2">
                <li><a href="/about" className="text-muted text-sm hover:text-neon-green transition-colors">Nosotros</a></li>
                <li><a href="/contact" className="text-muted text-sm hover:text-neon-green transition-colors">Contacto</a></li>
                <li><a href="/careers" className="text-muted text-sm hover:text-neon-green transition-colors">Trabaja con nosotros</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="/privacy" className="text-muted text-sm hover:text-neon-green transition-colors">Privacidad</a></li>
                <li><a href="/terms" className="text-muted text-sm hover:text-neon-green transition-colors">Términos</a></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-dark-card-border">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-full bg-neon-green flex items-center justify-center">
                <span className="text-black font-bold">A</span>
              </div>
              <span className="text-white font-semibold">AswardStore</span>
            </div>
            <p className="text-muted text-sm">
              © 2026 AswardStore. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}