'use client';

import { useState } from 'react';
import { useCart } from '@/src/ui/hooks/use-cart';
import { Header } from '@/src/ui/components/header';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    department: '',
    paymentMethod: 'bold',
  });

  const shipping = total > 150000 ? 0 : 15000;
  const tax = total * 0.19;
  const grandTotal = total + shipping + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // In production, call API to create order and payment
      // const response = await fetch('/api/orders', {
      //   method: 'POST',
      //   body: JSON.stringify({ action: 'create', data: { ...formData, items } })
      // });
      
      // Simulate order creation
      setTimeout(() => {
        clearCart();
        router.push('/checkout/success?order=ORD260001');
      }, 2000);
    } catch (error) {
      console.error('Checkout error:', error);
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="pt-20 min-h-screen bg-void">
          <div className="max-w-2xl mx-auto px-4 py-16 text-center">
            <h1 className="text-2xl text-white mb-4">Tu carrito está vacío</h1>
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
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-light text-white">Checkout</h1>
            
            {/* Steps */}
            <div className="flex items-center gap-4 mt-4">
              <div className={`flex items-center gap-2 ${step === 'shipping' ? 'text-neon-green' : 'text-muted'}`}>
                <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-sm">1</span>
                <span className="text-sm">Envío</span>
              </div>
              <div className="flex-1 h-px bg-dark-card-border" />
              <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-neon-green' : 'text-muted'}`}>
                <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-sm">2</span>
                <span className="text-sm">Pago</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Form */}
              <div className="flex-1">
                {step === 'shipping' && (
                  <div className="bg-deep-teal border border-dark-card-border rounded-xl p-6">
                    <h2 className="text-white font-semibold text-lg mb-6">Información de Envío</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-shade-50 text-sm mb-2">Nombre completo</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="input-dark w-full"
                          placeholder="Juan Pérez"
                        />
                      </div>
                      <div>
                        <label className="block text-shade-50 text-sm mb-2">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="input-dark w-full"
                          placeholder="juan@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-shade-50 text-sm mb-2">Teléfono</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="input-dark w-full"
                          placeholder="300 123 4567"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-shade-50 text-sm mb-2">Dirección</label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                          className="input-dark w-full"
                          placeholder="Carrera 10 #20-30, Apartamento 101"
                        />
                      </div>
                      <div>
                        <label className="block text-shade-50 text-sm mb-2">Ciudad</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                          className="input-dark w-full"
                          placeholder="Bogotá"
                        />
                      </div>
                      <div>
                        <label className="block text-shade-50 text-sm mb-2">Departamento</label>
                        <select
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          required
                          className="input-dark w-full"
                        >
                          <option value="">Seleccionar</option>
                          <option value="Cundinamarca">Cundinamarca</option>
                          <option value="Antioquia">Antioquia</option>
                          <option value="Valle del Cauca">Valle del Cauca</option>
                          <option value="Atlántico">Atlántico</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep('payment')}
                      className="btn-primary w-full mt-6"
                    >
                      Continuar al Pago
                    </button>
                  </div>
                )}

                {step === 'payment' && (
                  <div className="bg-deep-teal border border-dark-card-border rounded-xl p-6">
                    <h2 className="text-white font-semibold text-lg mb-6">Método de Pago</h2>
                    
                    <div className="space-y-3 mb-6">
                      <label className="flex items-center gap-3 p-4 bg-forest rounded-lg cursor-pointer border border-transparent hover:border-neon-green/30 transition-colors">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="bold"
                          checked={formData.paymentMethod === 'bold'}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-neon-green"
                        />
                        <div className="flex-1">
                          <p className="text-white font-medium">Tarjeta de crédito/débito</p>
                          <p className="text-shade-50 text-sm">Visa, Mastercard, American Express</p>
                        </div>
                        <span className="text-2xl">💳</span>
                      </label>

                      <label className="flex items-center gap-3 p-4 bg-forest rounded-lg cursor-pointer border border-transparent hover:border-neon-green/30 transition-colors">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cash_on_delivery"
                          checked={formData.paymentMethod === 'cash_on_delivery'}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-neon-green"
                        />
                        <div className="flex-1">
                          <p className="text-white font-medium">Pago contraentrega</p>
                          <p className="text-shade-50 text-sm">Paga cuando recibas tu pedido</p>
                        </div>
                        <span className="text-2xl">💵</span>
                      </label>

                      <label className="flex items-center gap-3 p-4 bg-forest rounded-lg cursor-pointer border border-transparent hover:border-neon-green/30 transition-colors">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="transfer"
                          checked={formData.paymentMethod === 'transfer'}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-neon-green"
                        />
                        <div className="flex-1">
                          <p className="text-white font-medium">Transferencia bancaria</p>
                          <p className="text-shade-50 text-sm">PSE o transferencia directa</p>
                        </div>
                        <span className="text-2xl">🏦</span>
                      </label>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setStep('shipping')}
                        className="btn-secondary flex-1"
                      >
                        Volver
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary flex-1"
                      >
                        {loading ? 'Procesando...' : `Pagar $${grandTotal.toLocaleString()}`}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="lg:w-80">
                <div className="bg-deep-teal border border-dark-card-border rounded-xl p-6 sticky top-24">
                  <h3 className="text-white font-semibold mb-4">Resumen del Pedido</h3>
                  
                  <div className="space-y-3 mb-4">
                    {items.slice(0, 3).map((item) => (
                      <div key={item.variantId} className="flex justify-between text-sm">
                        <span className="text-muted truncate">{item.productName} x{item.quantity}</span>
                        <span className="text-white">${(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                    {items.length > 3 && (
                      <p className="text-shade-50 text-sm">+ {items.length - 3} más</p>
                    )}
                  </div>

                  <div className="border-t border-dark-card-border pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Subtotal</span>
                      <span className="text-white">${total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Envío</span>
                      <span className="text-white">{shipping === 0 ? 'Gratis' : `$${shipping.toLocaleString()}`}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">IVA</span>
                      <span className="text-white">${tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-2">
                      <span className="text-white">Total</span>
                      <span className="text-neon-green">${grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}