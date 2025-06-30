import { Users, Package, ShoppingCart, TrendingUp } from 'lucide-react';

const DashboardPage = () => {
  // TODO: Implementar fetch real de estadísticas
  const stats = [
    {
      title: 'Total Usuarios',
      value: '1,234',
      icon: <Users className="w-6 h-6" />,
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Total Productos',
      value: '567',
      icon: <Package className="w-6 h-6" />,
      change: '+5%',
      trend: 'up'
    },
    {
      title: 'Pedidos Pendientes',
      value: '23',
      icon: <ShoppingCart className="w-6 h-6" />,
      change: '-2%',
      trend: 'down'
    },
    {
      title: 'Ingresos Mensuales',
      value: '$12,345',
      icon: <TrendingUp className="w-6 h-6" />,
      change: '+8%',
      trend: 'up'
    }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-accent/10 rounded-lg text-accent">
                {stat.icon}
              </div>
              <span
                className={`text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.change}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Placeholder para gráficos y tablas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Ventas Recientes
          </h2>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Gráfico de ventas (pendiente de implementar)
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Productos Populares
          </h2>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Tabla de productos (pendiente de implementar)
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 