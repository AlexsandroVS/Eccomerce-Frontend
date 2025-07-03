import React, { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { LogOut, LayoutDashboard, Package, Users, Settings, Tag } from 'lucide-react';

interface AdminLayoutProps {
  children?: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { logout, user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Verificar autenticación y rol de admin
    if (!isLoading && (!isAuthenticated || !user?.roles?.some(role => {
      const roleName = typeof role === 'string' ? role : role.role;
      return roleName === 'ADMIN';
    }))) {
      console.log('Auth state:', { isAuthenticated, roles: user?.roles, isLoading });
      navigate('/login', { state: { from: location } });
    }
  }, [isAuthenticated, user, navigate, location, isLoading]);

  // Si está cargando, mostrar un estado de carga
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  // Si no está autenticado o no es admin, no renderizar nada
  if (!isAuthenticated || !user?.roles?.some(role => {
    const roleName = typeof role === 'string' ? role : role.role;
    return roleName === 'ADMIN';
  })) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Función para determinar si un enlace está activo
  const isActiveLink = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-sm z-30">
        <div className="flex flex-col h-full">
          {/* Logo y título */}
          <div className="flex items-center justify-center h-16 border-b">
            <h1 className="text-xl font-bold text-accent">Admin Panel</h1>
          </div>

          {/* Navegación */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <Link
              to="/admin/dashboard"
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActiveLink('/admin/dashboard')
                  ? 'bg-accent/10 text-accent'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard size={20} className="mr-3" />
              Dashboard
            </Link>

            <Link
              to="/admin/products"
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActiveLink('/admin/products')
                  ? 'bg-accent/10 text-accent'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Package size={20} className="mr-3" />
              Productos
            </Link>

            <Link
              to="/admin/categories"
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActiveLink('/admin/categories')
                  ? 'bg-accent/10 text-accent'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Tag size={20} className="mr-3" />
              Categorías
            </Link>

            <Link
              to="/admin/employees"
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActiveLink('/admin/employees')
                  ? 'bg-accent/10 text-accent'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Users size={20} className="mr-3" />
              Empleados
            </Link>

            <Link
              to="/admin/users"
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActiveLink('/admin/users')
                  ? 'bg-accent/10 text-accent'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Users size={20} className="mr-3" />
              Usuarios
            </Link>
          </nav>

          {/* Botón de logout */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut size={20} className="mr-3" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="ml-64 p-8">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default AdminLayout;