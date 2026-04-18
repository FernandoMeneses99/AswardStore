'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

interface SidebarProps {
  children: React.ReactNode;
}

const menuItems = [
  {
    section: 'General',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: 'grid' },
      { href: '/dashboard/orders', label: 'Pedidos', icon: 'shopping-bag' },
      { href: '/dashboard/customers', label: 'Clientes', icon: 'users' },
    ]
  },
  {
    section: 'Catálogo',
    items: [
      { href: '/dashboard/products', label: 'Productos', icon: 'box' },
      { href: '/dashboard/categories', label: 'Categorías', icon: 'folder' },
      { href: '/dashboard/inventory', label: 'Inventario', icon: 'package' },
    ]
  },
  {
    section: 'Marketing',
    items: [
      { href: '/dashboard/coupons', label: 'Cupones', icon: 'tag' },
      { href: '/dashboard/promotions', label: 'Promociones', icon: 'megaphone' },
    ]
  },
  {
    section: 'Configuración',
    items: [
      { href: '/dashboard/settings', label: 'Ajustes', icon: 'settings' },
      { href: '/dashboard/users', label: 'Usuarios', icon: 'user-check' },
    ]
  }
];

const icons: Record<string, JSX.Element> = {
  grid: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />,
  'shopping-bag': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />,
  users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
  box: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />,
  folder: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />,
  package: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />,
  tag: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />,
  megaphone: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />,
  settings: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />,
  'user-check': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
};

export function AdminLayout({ children }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-void flex">
      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full bg-deep-teal border-r border-dark-card-border transition-all duration-300 z-40 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-dark-card-border">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neon-green flex items-center justify-center">
              <span className="text-black font-bold text-xl">A</span>
            </div>
            {sidebarOpen && (
              <span className="text-white font-semibold">Admin</span>
            )}
          </Link>
        </div>

        {/* Menu */}
        <nav className="p-4 space-y-6">
          {menuItems.map((section) => (
            <div key={section.section}>
              {sidebarOpen && (
                <h3 className="text-shade-50 text-xs font-medium uppercase tracking-wider mb-3">
                  {section.section}
                </h3>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                          isActive 
                            ? 'bg-forest text-neon-green' 
                            : 'text-muted hover:text-white hover:bg-forest/50'
                        }`}
                      >
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {icons[item.icon]}
                        </svg>
                        {sidebarOpen && (
                          <span className="font-medium text-sm">{item.label}</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Toggle button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-forest border border-dark-card-border rounded-full flex items-center justify-center text-muted hover:text-white"
        >
          <svg className={`w-4 h-4 transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </aside>

      {/* Main content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top bar */}
        <header className="h-16 bg-deep-teal border-b border-dark-card-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-white font-medium">
              {menuItems.find(s => s.items.some(i => i.href === pathname))?.section || 'Admin'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="p-2 rounded-lg hover:bg-forest text-muted hover:text-white transition-colors relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-neon-green rounded-full" />
            </button>
            
            {/* User menu */}
            <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-forest transition-colors">
              <div className="w-8 h-8 rounded-full bg-forest flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
              {sidebarOpen && (
                <span className="text-white text-sm">Admin</span>
              )}
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}