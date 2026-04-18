import { AdminLayout } from '@/src/ui/components/admin-layout';
import { Suspense } from 'react';

async function getStats() {
  // In a real app, fetch from API
  return {
    totalOrders: 156,
    totalRevenue: 45678900,
    totalProducts: 89,
    totalCustomers: 234,
    recentOrders: [],
    lowStockProducts: [],
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Pedidos" 
            value={stats.totalOrders.toLocaleString()} 
            change="+12%"
            trend="up"
            icon="orders"
          />
          <StatCard 
            title="Ingresos" 
            value={`$${(stats.totalRevenue / 1000000).toFixed(1)}M`} 
            change="+8%"
            trend="up"
            icon="revenue"
          />
          <StatCard 
            title="Productos" 
            value={stats.totalProducts.toString()} 
            change="+3"
            trend="up"
            icon="products"
          />
          <StatCard 
            title="Clientes" 
            value={stats.totalCustomers.toString()} 
            change="+18%"
            trend="up"
            icon="customers"
          />
        </div>

        {/* Recent Orders */}
        <div className="bg-deep-teal border border-dark-card-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-semibold text-lg">Pedidos Recientes</h2>
            <a href="/dashboard/orders" className="text-neon-green text-sm hover:underline">
              Ver todos
            </a>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-card-border">
                  <th className="text-left text-shade-50 text-sm font-medium pb-3">Pedido</th>
                  <th className="text-left text-shade-50 text-sm font-medium pb-3">Cliente</th>
                  <th className="text-left text-shade-50 text-sm font-medium pb-3">Estado</th>
                  <th className="text-left text-shade-50 text-sm font-medium pb-3">Total</th>
                  <th className="text-left text-shade-50 text-sm font-medium pb-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-dark-card-border/50">
                  <td className="py-3 text-white font-medium">ORD260001</td>
                  <td className="py-3 text-muted">Juan Pérez</td>
                  <td className="py-3">
                    <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                      Completado
                    </span>
                  </td>
                  <td className="py-3 text-white">$189.900</td>
                  <td className="py-3 text-muted">18/04/2026</td>
                </tr>
                <tr className="border-b border-dark-card-border/50">
                  <td className="py-3 text-white font-medium">ORD260002</td>
                  <td className="py-3 text-muted">María García</td>
                  <td className="py-3">
                    <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
                      Pendiente
                    </span>
                  </td>
                  <td className="py-3 text-white">$299.900</td>
                  <td className="py-3 text-muted">18/04/2026</td>
                </tr>
                <tr className="border-b border-dark-card-border/50">
                  <td className="py-3 text-white font-medium">ORD260003</td>
                  <td className="py-3 text-muted">Carlos López</td>
                  <td className="py-3">
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400">
                      Enviado
                    </span>
                  </td>
                  <td className="py-3 text-white">$149.900</td>
                  <td className="py-3 text-muted">17/04/2026</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-deep-teal border border-dark-card-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-semibold text-lg">Alerta de Stock Bajo</h2>
            <a href="/dashboard/inventory" className="text-neon-green text-sm hover:underline">
              Ver inventario
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Zapatillas Nike Air Max', sku: 'ZK-NIKE-001', stock: 5 },
              { name: 'Camisa Polo Ralph Lauren', sku: 'CM-POLO-002', stock: 3 },
              { name: 'Jeans Levis 501', sku: 'JN-LEV-003', stock: 8 },
            ].map((product) => (
              <div key={product.sku} className="bg-forest rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium text-sm">{product.name}</p>
                  <p className="text-shade-50 text-xs">{product.sku}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${product.stock <= 5 ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                  {product.stock} unidades
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value, change, trend, icon }: {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: string;
}) {
  return (
    <div className="bg-deep-teal border border-dark-card-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-shade-50 text-sm">{title}</span>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          icon === 'orders' ? 'bg-blue-500/20' :
          icon === 'revenue' ? 'bg-green-500/20' :
          icon === 'products' ? 'bg-purple-500/20' :
          'bg-orange-500/20'
        }`}>
          <svg className={`w-5 h-5 ${
            icon === 'orders' ? 'text-blue-400' :
            icon === 'revenue' ? 'text-green-400' :
            icon === 'products' ? 'text-purple-400' :
            'text-orange-400'
          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-white text-2xl font-semibold">{value}</span>
        <span className={`text-sm ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
          {change}
        </span>
      </div>
    </div>
  );
}