import Link from 'next/link';

export default function CheckoutSuccessPage() {
  const orderNumber = 'ORD260001';

  return (
    <div className="min-h-screen bg-void flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-neon-green/20 flex items-center justify-center">
          <svg className="w-10 h-10 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-light text-white mb-2">¡Pedido Confirmado!</h1>
        <p className="text-muted mb-8">
          Gracias por tu compra. Recibirás un email con los detalles de tu pedido.
        </p>

        {/* Order Details */}
        <div className="bg-deep-teal border border-dark-card-border rounded-xl p-6 mb-8">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-dark-card-border">
            <span className="text-shade-50">Número de pedido</span>
            <span className="text-white font-medium">{orderNumber}</span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-shade-50">Estado</span>
            <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
              Confirmado
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-shade-50">Tiempo de entrega</span>
            <span className="text-white">3-5 días hábiles</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link href="/account/orders" className="btn-primary block">
            Ver mis pedidos
          </Link>
          <Link href="/products" className="btn-secondary block">
            Continuar comprando
          </Link>
        </div>
      </div>
    </div>
  );
}