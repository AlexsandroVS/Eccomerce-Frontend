import React, { useEffect, useState } from 'react';
import { userService, User, UserListResponse } from '../../../services/user.service';
import { Edit2, Trash2, UserPlus, Search, ChevronLeft, ChevronRight, Mail, Phone } from 'lucide-react';
import EmployeeForm from './EmployeeForm';
import { useAuth } from '../../../contexts/AuthContext';

const PAGE_SIZE = 10;

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return 'bg-purple-100 text-purple-800';
    case 'VENDOR':
      return 'bg-blue-100 text-blue-800';
    case 'DESIGNER':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const EmployeesPage = () => {
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const { user: currentUser } = useAuth();

  const fetchEmployees = async (params: { page?: number; search?: string } = {}) => {
    setLoading(true);
    try {
      const res: UserListResponse = await userService.getAll({
        role: 'ADMIN',
        page: params.page || page,
        pageSize,
        search: params.search !== undefined ? params.search : search,
      });
      setEmployees(res.users.filter(user => user.roles.some(r => (typeof r === 'string' ? r : r.role) === 'ADMIN')));
      setTotal(res.total);
      setPage(res.page);
      setPageSize(res.pageSize);
    } catch (err: any) {
      setError(err.message || 'Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees({ page: 1 });
    // eslint-disable-next-line
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEmployees({ page: 1, search });
  };

  const handlePageChange = (newPage: number) => {
    fetchEmployees({ page: newPage });
  };

  const handleEdit = (emp: User) => {
    setEditingEmployee(emp);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: any) => {
    setFormLoading(true);
    setFormError(null);
    try {
      if (editingEmployee) {
        // Patch: solo enviar campos editables
        const updateData = { ...data };
        if (!updateData.password) delete updateData.password;
        await userService.update(editingEmployee.id, updateData);
      } else {
        await userService.create(data);
      }
      setShowForm(false);
      setEditingEmployee(null);
      fetchEmployees({ page: 1 });
    } catch (err: any) {
      setFormError(err.message || 'Error al guardar empleado');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      {/* Encabezado y botón */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Empleados</h1>
        <button
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors flex items-center"
          onClick={() => setShowForm(true)}
        >
          <UserPlus size={20} className="mr-2" />
          Nuevo Empleado
        </button>
      </div>

      {/* Caja de búsqueda */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre, email o rol..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
          <button type="submit" className="bg-accent text-white px-4 py-2 rounded-lg flex items-center gap-1 hover:bg-accent/90">
            <Search size={18} /> Buscar
          </button>
        </form>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {/* Tabla de empleados */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8">Cargando...</td></tr>
            ) : employees.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8">No hay empleados</td></tr>
            ) : employees.map(emp => {
                const isCurrentUser = emp.id === currentUser?.id;
                const isAdmin = emp.roles.some(r => (typeof r === 'string' ? r : r.role) === 'ADMIN');
                return (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-lg font-medium text-gray-600">
                            {emp.full_name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {emp.full_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {emp.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Mail size={16} className="mr-2 text-gray-400" />
                        {emp.email}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <Phone size={16} className="mr-2 text-gray-400" />
                        {emp.phone || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-2">
                        {emp.roles.map((r, idx) => {
                          const roleName = typeof r === 'string' ? r : r.role;
                          return (
                            <span key={roleName + idx} className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(roleName)}`}>{roleName}</span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${emp.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{emp.is_active ? 'Activo' : 'Inactivo'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {isCurrentUser ? (
                          <>
                            <button className="text-gray-400 hover:text-accent mr-2" onClick={() => handleEdit(emp)}><Edit2 size={20} /></button>
                            <button className="text-gray-400 hover:text-red-500"><Trash2 size={20} /></button>
                          </>
                        ) : isAdmin ? (
                          <span className="text-gray-400">No permitido</span>
                        ) : (
                          <>
                            <button className="text-gray-400 hover:text-accent mr-2" onClick={() => handleEdit(emp)}><Edit2 size={20} /></button>
                            <button className="text-gray-400 hover:text-red-500"><Trash2 size={20} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Paginación alineada a la derecha */}
      <div className="flex justify-end items-center mt-4">
        <span className="text-sm text-gray-600 mr-4">
          Página {page} de {totalPages} ({total} empleados)
        </span>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 rounded border bg-white hover:bg-gray-100 disabled:opacity-50"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            className="px-3 py-1 rounded border bg-white hover:bg-gray-100 disabled:opacity-50"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Modal para crear/editar empleado */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur bg-white/70">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative border border-gray-200">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={handleCloseForm}
              aria-label="Cerrar"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4 text-accent flex items-center gap-2">
              {editingEmployee ? <Edit2 size={22} /> : <UserPlus size={22} />} {editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}
            </h2>
            <EmployeeForm
              initialData={editingEmployee ? {
                full_name: editingEmployee.full_name,
                email: editingEmployee.email,
                phone: editingEmployee.phone,
                role: editingEmployee.role,
                // No password
              } : {}}
              onSubmit={handleFormSubmit}
              loading={formLoading}
              isEdit={!!editingEmployee}
              isCurrentUser={editingEmployee && currentUser && editingEmployee.id === currentUser.id}
            />
            {formError && <div className="text-red-600 mt-2">{formError}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesPage; 