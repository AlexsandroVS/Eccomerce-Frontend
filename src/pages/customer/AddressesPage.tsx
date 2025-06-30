import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Plus, Edit2, Trash2 } from 'lucide-react';

// TODO: Mover a types
interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

const AddressesPage = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<Partial<Address>>({
    name: '',
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    is_default: false
  });

  useEffect(() => {
    // TODO: Implementar fetch real de direcciones
    const fetchAddresses = async () => {
      try {
        // Simulación de fetch
        const mockAddresses: Address[] = [
          {
            id: '1',
            name: 'Casa',
            street: 'Calle Principal 123',
            city: 'Ciudad de México',
            state: 'CDMX',
            postal_code: '12345',
            country: 'México',
            is_default: true
          },
          {
            id: '2',
            name: 'Oficina',
            street: 'Av. Reforma 456',
            city: 'Ciudad de México',
            state: 'CDMX',
            postal_code: '67890',
            country: 'México',
            is_default: false
          }
        ];

        setAddresses(mockAddresses);
      } catch (error) {
        console.error('Error al cargar las direcciones:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  const handleOpenModal = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setFormData(address);
    } else {
      setEditingAddress(null);
      setFormData({
        name: '',
        street: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        is_default: false
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
    setFormData({
      name: '',
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      is_default: false
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar lógica real de guardado
    if (editingAddress) {
      setAddresses(prev =>
        prev.map(addr =>
          addr.id === editingAddress.id ? { ...addr, ...formData } : addr
        )
      );
    } else {
      const newAddress = {
        ...formData,
        id: Date.now().toString()
      } as Address;
      setAddresses(prev => [...prev, newAddress]);
    }
    handleCloseModal();
  };

  const handleDelete = async (addressId: string) => {
    // TODO: Implementar lógica real de eliminación
    setAddresses(prev => prev.filter(addr => addr.id !== addressId));
  };

  const handleSetDefault = async (addressId: string) => {
    // TODO: Implementar lógica real de actualización
    setAddresses(prev =>
      prev.map(addr => ({
        ...addr,
        is_default: addr.id === addressId
      }))
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mis Direcciones</h1>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90"
        >
          <Plus size={20} />
          <span>Añadir Dirección</span>
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-12">
          <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">
            No tienes direcciones guardadas
          </h2>
          <p className="text-gray-500">
            Añade una dirección para facilitar tus compras
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <motion.div
              key={address.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {address.name}
                  </h3>
                  {address.is_default && (
                    <span className="inline-block mt-1 px-2 py-1 text-xs font-medium text-accent bg-accent/10 rounded-full">
                      Dirección Principal
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleOpenModal(address)}
                    className="p-2 text-gray-500 hover:text-accent"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="p-2 text-gray-500 hover:text-red-500"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-gray-600">
                <p>{address.street}</p>
                <p>
                  {address.city}, {address.state} {address.postal_code}
                </p>
                <p>{address.country}</p>
              </div>

              {!address.is_default && (
                <button
                  onClick={() => handleSetDefault(address.id)}
                  className="mt-4 text-sm text-accent hover:text-accent/90"
                >
                  Establecer como dirección principal
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingAddress ? 'Editar Dirección' : 'Nueva Dirección'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Dirección
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Calle y Número
                </label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, street: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, city: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, state: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código Postal
                  </label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        postal_code: e.target.value
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    País
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, country: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_default"
                  checked={formData.is_default}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      is_default: e.target.checked
                    }))
                  }
                  className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
                />
                <label
                  htmlFor="is_default"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Establecer como dirección principal
                </label>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-md"
                >
                  {editingAddress ? 'Guardar Cambios' : 'Añadir Dirección'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AddressesPage; 