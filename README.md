# 🛒 E-commerce Frontend

Aplicación frontend del sistema Ecommerce construida con **React 18**, **TypeScript** y **Tailwind CSS**.  
Implementa un panel de administración completo y una interfaz de cliente moderna.

## 🏗️ Arquitectura de la Aplicación

### Estructura de Carpetas
```
src/
├── components/           # Componentes reutilizables
│   ├── admin/           # Componentes del panel admin
│   │   ├── layouts/     # Layouts administrativos
│   │   ├── ProductForm.tsx
│   │   ├── CategoryForm.tsx
│   │   └── ...
│   ├── customer/        # Componentes del cliente
│   │   ├── layouts/     # Layouts del cliente
│   │   ├── Navbar/      # Navegación
│   │   ├── Cart/        # Carrito de compras
│   │   └── ...
│   ├── products/        # Componentes de productos
│   ├── reviews/         # Componentes de reseñas
│   └── Landing/         # Componentes de la landing
├── pages/               # Páginas de la aplicación
│   ├── admin/           # Páginas del panel admin
│   │   ├── DashboardPage.tsx
│   │   ├── ProductsPage.tsx
│   │   ├── CategoriesPage.tsx
│   │   └── ...
│   ├── auth/            # Páginas de autenticación
│   ├── customer/        # Páginas del cliente
│   └── products/        # Páginas de productos
├── contexts/            # Contextos de React
│   └── AuthContext.tsx  # Contexto de autenticación
├── hooks/               # Custom hooks
│   ├── useProducts.ts
│   ├── useCategories.ts
│   └── ...
├── services/            # Servicios de API
│   ├── api.service.ts
│   ├── auth.service.ts
│   └── ...
├── types/               # Definiciones de tipos
├── utils/               # Utilidades
└── assets/              # Recursos estáticos
```

## 🎨 Tecnologías y Librerías

### Core
- **React 18** con TypeScript
- **Vite** como bundler
- **React Router** para navegación
- **Tailwind CSS** para estilos

### UI/UX
- **Lucide Icons** para iconografía
- **Framer Motion** para animaciones
- **React Hook Form** para formularios
- **React Query** para gestión de estado

### Utilidades
- **Axios** para HTTP requests
- **Zod** para validación
- **date-fns** para manejo de fechas
- **clsx** para clases condicionales

## 🗄️ Modelos de Datos

### Product
```typescript
interface Product {
  id: string;
  name: string;
  sku: string;
  slug: string;
  description?: string;
  type: 'SIMPLE' | 'VARIABLE';
  base_price?: number;
  is_active: boolean;
  stock_alert: boolean;
  created_at: string;
  updated_at: string;
  
  // Relaciones
  attributes: ProductAttribute[];
  images: ProductImage[];
  variants: ProductVariant[];
  categories: Category[];
}
```

### ProductVariant
```typescript
interface ProductVariant {
  id: string;
  product_id: string;
  sku_suffix: string;
  stock: number;
  price: number;
  min_stock: number;
  is_active: boolean;
  attributes?: Record<string, any>;
  images?: ProductImage[];
}
```

### User
```typescript
interface User {
  id: string;
  email: string;
  role: 'CUSTOMER' | 'EMPLOYEE' | 'ADMIN';
  is_active: boolean;
  profile?: UserProfile;
}
```

## 🚀 Instalación y Configuración

### 1. Prerrequisitos
- Node.js 18+
- npm o yarn

### 2. Instalación
```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/ecommerce-project.git
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
```

### 3. Variables de Entorno
```env
# API
VITE_API_URL="http://localhost:3000/api"
VITE_APP_NAME="E-commerce"

# Características
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false
```

### 4. Desarrollo
```bash
# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build            # Build para producción
npm run preview          # Preview del build

# Linting y formateo
npm run lint             # ESLint
npm run lint:fix         # ESLint con auto-fix
npm run format           # Prettier

# Testing
npm run test             # Tests unitarios
npm run test:ui          # Tests con interfaz
npm run test:coverage    # Coverage de tests

# Type checking
npm run type-check       # Verificar tipos TypeScript
```

## 🎯 Funcionalidades Implementadas

### Panel de Administración
- [x] **Dashboard** con estadísticas
- [x] **Gestión de Productos** (CRUD completo)
- [x] **Sistema de Variantes** con formularios especializados
- [x] **Gestión de Categorías**
- [x] **Upload de Imágenes** con preview
- [x] **Filtros y Búsqueda** avanzados
- [x] **Gestión de Usuarios** y roles

### Interfaz de Cliente
- [x] **Catálogo de Productos** con filtros
- [x] **Detalle de Producto** con galería
- [x] **Sistema de Autenticación**
- [x] **Perfil de Usuario**
- [x] **Navegación Responsive**

### Características Técnicas
- [x] **TypeScript** con tipos estrictos
- [x] **Responsive Design** con Tailwind
- [x] **Optimización de Performance**
- [x] **Manejo de Estados** con Context
- [x] **Validación de Formularios**
- [x] **Manejo de Errores** global

## 🎨 Sistema de Diseño

### Colores
```css
/* Primarios */
--color-primary: #3B82F6;
--color-primary-dark: #2563EB;
--color-primary-light: #60A5FA;

/* Secundarios */
--color-secondary: #10B981;
--color-secondary-dark: #059669;

/* Neutros */
--color-gray-50: #F9FAFB;
--color-gray-900: #111827;
```

### Componentes Base
- **Botones**: Primary, Secondary, Danger, Ghost
- **Inputs**: Text, Select, Textarea, File
- **Cards**: Product, Category, User
- **Modals**: Confirm, Form, Image Gallery
- **Tables**: Sortable, Filterable, Paginated

### Responsive Breakpoints
```css
/* Tailwind CSS */
sm: 640px   /* Mobile */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large Desktop */
2xl: 1536px /* Extra Large */
```

## 🔐 Sistema de Autenticación

### Context de Autenticación
```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
}
```

### Rutas Protegidas
```typescript
// Rutas que requieren autenticación
const protectedRoutes = [
  '/admin/*',
  '/customer/profile',
  '/customer/orders',
  '/customer/wishlist'
];

// Rutas que requieren rol específico
const adminRoutes = ['/admin/*'];
const employeeRoutes = ['/admin/products', '/admin/categories'];
```

## 📡 Integración con API

### Servicios de API
```typescript
// api.service.ts
class ApiService {
  private baseURL: string;
  private token: string | null;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL;
    this.token = localStorage.getItem('token');
  }

  async get<T>(endpoint: string): Promise<T> {
    // Implementación
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    // Implementación
  }
}
```

### Hooks Personalizados
```typescript
// useProducts.ts
export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (filters?: ProductFilters) => {
    // Implementación
  }, []);

  return { products, loading, error, fetchProducts };
};
```

## 🧪 Testing

### Estructura de Tests
```
tests/
├── components/          # Tests de componentes
│   ├── ProductCard.test.tsx
│   ├── ProductForm.test.tsx
│   └── ...
├── hooks/              # Tests de hooks
│   ├── useProducts.test.ts
│   └── ...
├── pages/              # Tests de páginas
│   ├── ProductsPage.test.tsx
│   └── ...
└── utils/              # Tests de utilidades
    └── product.utils.test.ts
```

### Ejecutar Tests
```bash
# Todos los tests
npm run test

# Tests en modo watch
npm run test:watch

# Tests con coverage
npm run test:coverage

# Tests específicos
npm run test -- --grep "ProductCard"
```

## 🚀 Despliegue

### Build de Producción
```bash
# Build optimizado
npm run build

# Los archivos se generan en dist/
```

### Variables de Entorno de Producción
```env
VITE_API_URL="https://api.tudominio.com/api"
VITE_APP_NAME="E-commerce"
NODE_ENV=production
```

### Docker
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 📈 Performance y Optimización

### Lazy Loading
```typescript
// Carga diferida de páginas
const AdminDashboard = lazy(() => import('./pages/admin/DashboardPage'));
const ProductForm = lazy(() => import('./components/admin/ProductForm'));
```

### Memoización
```typescript
// Componentes memorizados
const ProductCard = memo(({ product }: ProductCardProps) => {
  // Componente optimizado
});

// Hooks con dependencias optimizadas
const memoizedValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);
```

### Bundle Optimization
- **Code Splitting** por rutas
- **Tree Shaking** automático
- **Compresión** de assets
- **CDN** para librerías externas

## 🔧 Configuración de Desarrollo

### VS Code Extensions
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag"
  ]
}
```

### ESLint Configuración
```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

## 🤝 Contribuir

### Flujo de Trabajo
1. Fork el repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Hacer commits descriptivos
4. Push y crear Pull Request

### Convenciones
- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/)
- **Branches**: `feature/`, `fix/`, `hotfix/`, `docs/`
- **Code Style**: ESLint + Prettier
- **Tests**: Requeridos para nuevas funcionalidades

## 📚 Documentación Adicional

- [Component Library](./docs/components.md)
- [API Integration](./docs/api.md)
- [State Management](./docs/state.md)
- [Testing Guide](./docs/testing.md)

## 🆘 Soporte

- **Issues**: Crear issue en GitHub
- **Discussions**: Usar GitHub Discussions
- **Documentation**: Revisar docs/ folder

---

**Desarrollado con ❤️ por el equipo de E-commerce Frontend**
