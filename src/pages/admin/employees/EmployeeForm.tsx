import React, { useState } from 'react';
import { UserCreateData } from '../../../services/user.service';

const ROLES = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'VENDOR', label: 'Vendedor' },
  { value: 'DESIGNER', label: 'Diseñador' },
];

interface EmployeeFormProps {
  initialData?: Partial<UserCreateData>;
  onSubmit: (data: UserCreateData) => void;
  loading?: boolean;
  isEdit?: boolean;
  isCurrentUser?: boolean;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ initialData = {}, onSubmit, loading, isEdit, isCurrentUser }) => {
  const [form, setForm] = useState({
    full_name: initialData.full_name || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    password: '',
    role: initialData.role || ROLES[0].value,
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.email || (!isEdit && !form.password) || !form.role) {
      setError('Todos los campos son obligatorios');
      return;
    }
    setError(null);
    onSubmit({ ...form, roles: [form.role] });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Nombre completo</label>
        <input
          type="text"
          name="full_name"
          value={form.full_name}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition"
          required
          autoFocus
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Teléfono</label>
        <input
          type="text"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">
          {isEdit ? 'Contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
        </label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition"
          placeholder={isEdit ? '•••••••• (opcional)' : '••••••••'}
          autoComplete="new-password"
        />
        {isEdit && (
          <div className="text-xs text-gray-500 mt-1">Deja este campo vacío si no deseas cambiar la contraseña.</div>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Rol</label>
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition"
          required
          disabled={isEdit && isCurrentUser}
        >
          {ROLES.map(role => (
            <option key={role.value} value={role.value}>{role.label}</option>
          ))}
        </select>
        {isEdit && isCurrentUser && (
          <div className="text-xs text-gray-500 mt-1">No puedes cambiar tu propio rol.</div>
        )}
      </div>
      <button
        type="submit"
        className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90 transition font-semibold w-full"
        disabled={loading}
      >
        {loading ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Crear Empleado'}
      </button>
    </form>
  );
};

export default EmployeeForm; 