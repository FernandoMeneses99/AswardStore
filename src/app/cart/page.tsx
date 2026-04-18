'use client';

import { useCart } from '@/src/ui/hooks/use-cart';
import { Header } from '@/src/ui/components/header';
import Image from 'next/image';
import Link from 'next/link';

export default function CartPage() {
  const { items, updateQuantity, removeItem, total, itemCount } = useCart();

  const shipping = total > 150000 ? 0 : 15000;
  const tax = total * 0.19;
  const grandTotal = total + shipping + tax;

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="pt-20 min-h-screen bg-void">
          <div className="max-w-2xl mx-auto px-4 py-16 text-center">
            <svg className="w-20 h-20 mx-auto text-shade-70 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h1 className="text-2xl font-light text-white mb-4">Tu carrito está vacío</h1>
            <p className="text-muted mb-8">Descubre nuestros productos y añade los que te gusten</p>
            <Link href="/products" className="btn-primary inline-flex">
              Ver productos
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-void">
        <div className="bg-deep-teal py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-light text-white">
              Carrito de Compras ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="flex-1">
              <div className="space-y-4">
                {items.map((item) => (
                  <div 
                    key={item.variantId}
                    className="bg-deep-teal border border-dark-card-border rounded-xl p-4 flex gap-4"
                  >
                    {/* Image */}
                    <div className="w-24 h-24 bg-forest rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-4xl">
                        {item.productName.includes('Zapato') ? '👟' : 
                         item.productName.includes('Pantalon') ? '👖' : '👕'}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate">{item.productName}</h3>
                      {item.variantName && (
                        <p className="text-shade-50 text-sm">{item.variantName}</p>
                      )}
                      <p className="text-shade-50 text-sm">SKU: {item.sku}</p>
                      <p className="text-white font-semibold mt-2">
                        ${item.price.toLocaleString()}
                      </p>
                    </div>

                    {/* Quantity & Remove */}
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="text-shade-50 hover:text-red-400 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="flex items-center gap-2 bg-forest rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-muted hover:text-white transition-colors"
                        >
                          -
                        </button>
                        <span className="text-white text-sm w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-muted hover:text-white transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-white font-medium">
                        ${(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:w-96">
              <div className="bg-deep-teal border border-dark-card-border rounded-xl p-6 sticky top-24">
                <h2 className="text-white font-semibold text-lg mb-6">Resumen del Pedido</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Subtotal</span>
                    <span className="text-white">${total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Envío</span>
                    <span className="text-white">
                      {shipping === 0 ? 'Gratis' : `$${shipping.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">IVA (19%)</span>
                    <span className="text-white">${tax.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-dark-card-border pt-3 flex justify-between">
                    <span className="text-white font-medium">Total</span>
                    <span className="text-white font-semibold text-lg">${grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                {total < 150000 && (
                  <p className="text-neon-green text-sm mb-4">
                    ¡Añade ${(150000 - total).toLocaleString()} más para obtener envío gratis!
                  </p>
                )}

                <Link
                  href="/checkout"
                  className="btn-primary w-full text-center block"
                >
                  Proceder al Pago
                </Link>

                <Link
                  href="/products"
                  className="btn-secondary w-full text-center block mt-3"
                >
                  Seguir Comprando
                </Link>

                {/* Payment methods */}
                <div className="mt-6 pt-6 border-t border-dark-card-border">
                  <p className="text-shade-50 text-xs mb-3">Métodos de pago aceptados</p>
                  <div className="flex items-center gap-2 text-shade-50">
                    <span className="text-2xl">💳</span>
                    <span className="text-sm">Visa, Mastercard, PSE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}