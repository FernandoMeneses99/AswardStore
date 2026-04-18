# AswardStore - E-commerce Platform

## Configuración del Proyecto

### Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# Database - PostgreSQL (required)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/asward_store

# Authentication
NEXTAUTH_SECRET=your-secret-key-here-change-in-production
NEXTAUTH_URL=http://localhost:3000

# Bold Payment Gateway
BOLD_API_KEY=your-bold-api-key
BOLD_API_URL=https://api.boldcheckout.com
BOLD_WEBHOOK_URL=http://localhost:3000/api/payments/webhook

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Optional: Additional services
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Configuración de Base de Datos

1. Asegúrate de tener PostgreSQL instalado y ejecutándose
2. Crea la base de datos: `createdb asward_store`
3. Ejecuta las migraciones: `npm run db:push`

### Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Iniciar en producción
npm start
```

## Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── (admin)/           # Rutas del panel administrativo
│   ├── (auth)/            # Rutas de autenticación
│   ├── (shop)/            # Rutas de la tienda pública
│   ├── api/               # API routes
│   └── dashboard/         # Dashboard del admin
├── domain/                # Entidades y lógica de negocio
│   ├── entities/
│   ├── repositories/
│   └── services/
├── application/           # Casos de uso
│   └── use-cases/
├── infrastructure/        # Implementaciones externas
│   ├── database/          # Drizzle ORM + PostgreSQL
│   ├── auth/              # Servicios de autenticación
│   ├── payments/          # Integración Bold
│   ├── storage/          # Almacenamiento
│   └── validators/        # Validación Zod
├── ui/                    # Componentes reutilizables
│   ├── components/
│   ├── layouts/
│   ├── hooks/
│   └── contexts/
└── types/                 # Tipos TypeScript
```

## Módulos Implementados

### ✅ Completado
- [x] Estructura de Clean Architecture
- [x] Schema de base de datos PostgreSQL
- [x] Sistema de autenticación (JWT + sesiones)
- [x] Catálogo de productos con variantes
- [x] Sistema de inventario con múltiples bodegas
- [x] Gestión de pedidos y pagos
- [x] Integración con pasarela Bold
- [x] Sistema de roles y permisos (RBAC)
- [x] Auditoría y logs de seguridad
- [x] UI con diseño Shopify (Dark-first)

### 🔄 Pendiente
- [ ] Panel administrativo completo
- [ ] Wishlist y reseñas
- [ ] Cupones y promociones
- [ ] Notifications
- [ ] SEO técnico completo

## Seguridad Implementada

- ✅ Protección contra XSS, CSRF, SQL Injection
- ✅ Rate limiting
- ✅ Hash de contraseñas con bcrypt
- ✅ Tokens JWT con expiry
- ✅ Rate limiting en endpoints sensibles
- ✅ Logs de auditoría
- ✅ Detección de fraude básica

## Tecnologías

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4
- **Backend**: Next.js API Routes, Drizzle ORM
- **Base de datos**: PostgreSQL 15+
- **Autenticación**: JWT, NextAuth.js
- **Pagos**: Bold Checkout
- **UI**: Radix UI, Flowbite React

## Contribución

1. Fork del proyecto
2. Crear branch feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Add nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## Licencia

MIT License - © 2026 AswardStore