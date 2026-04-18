'use client';

import { useState } from 'react';
import { Header } from '@/src/ui/components/header';

const categories = [
  { id: 'all', name: 'Todos' },
  { id: 'camisas', name: 'Camisas' },
  { id: 'pantalones', name: 'Pantalones' },
  { id: 'zapatos', name: 'Zapatos' },
  { id: 'accesorios', name: 'Accesorios' },
];

const products = [
  { id: '1', name: 'Camisa Oxford Clásica', category: 'camisas', price: 89900, image: null, rating: 4.5 },
  { id: '2', name: 'Pantalón Chino Slim', category: 'pantalones', price: 129900, image: null, rating: 4.8 },
  { id: '3', name: 'Zapatillas Urbanas Premium', category: 'zapatos', price: 189900, image: null, rating: 4.7 },
  { id: '4', name: 'Camiseta Básica Algodón', category: 'camisas', price: 45900, image: null, rating: 4.3 },
  { id: '5', name: 'Jeans Slim Fit', category: 'pantalones', price: 149900, image: null, rating: 4.6 },
  { id: '6', name: 'Zapatos Formales', category: 'zapatos', price: 249900, image: null, rating: 4.9 },
  { id: '7', name: 'Cinturón de Cuero', category: 'accesorios', price: 79900, image: null, rating: 4.4 },
  { id: '8', name: 'Sudadera con Capucha', category: 'camisas', price: 119900, image: null, rating: 4.5 },
];

const sortOptions = [
  { value: 'newest', label: 'Más recientes' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'popular', label: 'Más populares' },
];

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);

  const filteredProducts = products
    .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
    .filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return b.rating - a.rating;
    });

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-void">
        {/* Hero */}
        <div className="bg-deep-teal py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-light text-white mb-2">
              Productos
            </h1>
            <p className="text-muted">
              Explora nuestra colección completa
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="bg-deep-teal border border-dark-card-border rounded-xl p-6 sticky top-24">
                <h2 className="text-white font-medium mb-6">Filtros</h2>
                
                {/* Categories */}
                <div className="mb-6">
                  <h3 className="text-shade-50 text-sm font-medium mb-3">Categoría</h3>
                  <div className="space-y-2">
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedCategory === cat.id
                            ? 'bg-forest text-neon-green'
                            : 'text-muted hover:text-white hover:bg-forest/50'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h3 className="text-shade-50 text-sm font-medium mb-3">Precio</h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="input-dark w-full text-sm"
                      placeholder="Min"
                    />
                    <span className="text-muted">-</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="input-dark w-full text-sm"
                      placeholder="Max"
                    />
                  </div>
                </div>

                {/* Reset Filters */}
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setPriceRange([0, 500000]);
                  }}
                  className="w-full text-neon-green text-sm hover:underline"
                >
                  Limpiar filtros
                </button>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Sort */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-muted text-sm">
                  {filteredProducts.length} productos
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-dark text-sm py-2"
                >
                  {sortOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <div 
                    key={product.id}
                    className="group bg-deep-teal rounded-xl overflow-hidden border border-dark-card-border hover:border-neon-green/30 transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="aspect-square bg-forest relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center text-shade-70 text-5xl font-light">
                        {product.category === 'zapatos' ? '👟' : 
                         product.category === 'pantalones' ? '👖' : 
                         product.category === 'accesorios' ? '👔' : '👕'}
                      </div>
                      {/* Quick add button */}
                      <button className="absolute bottom-4 left-4 right-4 py-2 bg-neon-green text-black text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        Añadir al carrito
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="text-white font-medium text-sm mb-1 truncate">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'text-neon-green' : 'text-shade-70'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="text-shade-50 text-xs ml-1">{product.rating}</span>
                      </div>
                      <p className="text-white font-semibold">
                        ${product.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted">No se encontraron productos</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-void border-t border-dark-card-border py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted text-sm">© 2026 AswardStore. Todos los derechos reservados.</p>
        </div>
      </footer>
    </>
  );
}