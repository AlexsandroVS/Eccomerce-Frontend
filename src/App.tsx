import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ChatbotContainer from './components/Landing/Chatbot';

// Páginas públicas
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Páginas de productos
import ProductCatalogPage from './pages/products/ProductCatalogPage';
import ProductDetailPage from './pages/products/ProductDetailPage';

// Páginas de cliente
import ProfilePage from './pages/customer/ProfilePage';
import OrdersPage from './pages/customer/OrdersPage';
import WishlistPage from './pages/customer/WishlistPage';
import AddressesPage from './pages/customer/AddressesPage';

// Layouts
import CustomerLayout from './components/customer/layouts/CustomerLayout';
import AdminLayout from './components/admin/layouts/AdminLayout';

// Páginas de admin
import AdminDashboardPage from './pages/admin/DashboardPage';
import AdminProductsPage from './pages/admin/ProductsPage';
import AdminUsersPage from './pages/admin/UsersPage';
import AdminCategoriesPage from './pages/admin/CategoriesPage';
import AdminCategoryFormPage from './pages/admin/CategoryFormPage';
import AdminProductFormPage from './pages/admin/ProductFormPage';
import ProductEditPage from './pages/admin/ProductEditPage';
import ProductVariantCreatePage from './pages/admin/ProductVariantCreatePage';
import ProductVariantsPage from './pages/admin/ProductVariantsPage';
import ProductVariantEditPage from './pages/admin/ProductVariantEditPage';
import EmployeesPage from './pages/admin/employees/EmployeesPage';

// Componente para rutas públicas
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  // Si está autenticado y está intentando acceder a login/register, redirigir
  if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Componente para rutas protegidas
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Guardar la ubicación actual para redirigir después del login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole) {
    const hasRequiredRole = user?.roles?.some(role => {
      const roleName = typeof role === 'string' ? role : role.role;
      return roleName === requiredRole;
    });

    if (!hasRequiredRole) {
      console.log('Role check failed:', { userRoles: user?.roles, requiredRole });
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { isLoading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Rutas públicas - Sin verificación de autenticación */}
      <Route path="/" element={<HomePage />} />
      
      {/* Rutas de productos - Con CustomerLayout */}
      <Route path="/products" element={
        <CustomerLayout>
          <ProductCatalogPage />
        </CustomerLayout>
      } />
      <Route path="/products/:id" element={
        <CustomerLayout>
          <ProductDetailPage />
        </CustomerLayout>
      } />
      
      {/* Rutas de autenticación - Solo redirigir si ya está autenticado */}
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <RegisterPage />
        </PublicRoute>
      } />

      {/* Rutas de cliente - Requieren autenticación */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <CustomerLayout>
            <ProfilePage />
          </CustomerLayout>
        </ProtectedRoute>
      } />
      <Route path="/orders" element={
        <ProtectedRoute>
          <CustomerLayout>
            <OrdersPage />
          </CustomerLayout>
        </ProtectedRoute>
      } />
      <Route path="/wishlist" element={
        <ProtectedRoute>
          <CustomerLayout>
            <WishlistPage />
          </CustomerLayout>
        </ProtectedRoute>
      } />
      <Route path="/addresses" element={
        <ProtectedRoute>
          <CustomerLayout>
            <AddressesPage />
          </CustomerLayout>
        </ProtectedRoute>
      } />

      {/* Rutas de admin - Requieren autenticación y rol ADMIN */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminLayout>
              <Outlet />
            </AdminLayout>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/create" element={<AdminProductFormPage />} />
        <Route path="products/edit/:id" element={<ProductEditPage />} />
        <Route path="products/:productId/variants" element={<ProductVariantsPage />} />
        <Route path="products/:productId/variants/create" element={<ProductVariantCreatePage />} />
        <Route path="products/variants/edit/:variantId" element={<ProductVariantEditPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="categories/create" element={<AdminCategoryFormPage />} />
      </Route>

      {/* Ruta específica para el dashboard de admin */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminLayout>
              <AdminDashboardPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppRoutes />
          {/* Chatbot flotante global, solo para vistas cliente */}
          {window.location.pathname.startsWith('/admin') ? null : <ChatbotContainer />}
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;