import { useState, useMemo } from 'react';

// Tipos para atributos
export interface AttributeOption {
  id: string;
  name: string;
  values: string[];
  category?: string;
}

export interface ProductAttribute {
  name: string;
  value: string;
}

// Atributos predefinidos por categoría
const PREDEFINED_ATTRIBUTES: AttributeOption[] = [
  // Muebles
  {
    id: 'tipo_mueble',
    name: 'Tipo de Mueble',
    values: ['Sofá', 'Silla', 'Mesa', 'Cama', 'Armario', 'Estantería', 'Escritorio', 'Comoda', 'Mesa de centro', 'Mesa de comedor', 'Silla de comedor', 'Sofá cama', 'Futón', 'Puff', 'Banco'],
    category: 'muebles'
  },
  {
    id: 'material',
    name: 'Material',
    values: ['Madera', 'Metal', 'Plástico', 'Vidrio', 'Mármol', 'Granito', 'Cuero', 'Tela', 'Rattan', 'Bambú', 'Mimbre', 'Aluminio', 'Acero', 'Poliéster'],
    category: 'muebles'
  },
  {
    id: 'color',
    name: 'Color',
    values: ['Natural', 'Blanco', 'Negro', 'Marrón', 'Gris', 'Beige', 'Rojo', 'Azul', 'Verde', 'Amarillo', 'Rosa', 'Morado', 'Naranja', 'Multicolor'],
    category: 'muebles'
  },
  {
    id: 'estilo',
    name: 'Estilo',
    values: ['Moderno', 'Clásico', 'Vintage', 'Rústico', 'Minimalista', 'Industrial', 'Escandinavo', 'Mediterráneo', 'Tropical', 'Art Deco', 'Shabby Chic', 'Boho'],
    category: 'muebles'
  },
  {
    id: 'habitacion',
    name: 'Habitación',
    values: ['Sala', 'Comedor', 'Dormitorio', 'Cocina', 'Baño', 'Oficina', 'Terraza', 'Jardín', 'Entrada', 'Pasillo', 'Estudio', 'Sótano'],
    category: 'muebles'
  },

  // Decoración
  {
    id: 'tipo_decoracion',
    name: 'Tipo',
    values: ['Lámpara', 'Espejo', 'Cuadro', 'Jarrón', 'Cojín', 'Alfombra', 'Cortina', 'Mantel', 'Centro de mesa', 'Portavelas', 'Reloj', 'Maceta', 'Cesta'],
    category: 'decoracion'
  },
  {
    id: 'tamaño',
    name: 'Tamaño',
    values: ['Pequeño', 'Mediano', 'Grande', 'Extra Grande'],
    category: 'decoracion'
  },

  // Cocina
  {
    id: 'tipo_cocina',
    name: 'Tipo',
    values: ['Vajilla', 'Cubiertos', 'Ollas', 'Sartenes', 'Electrodomésticos', 'Utensilios', 'Organizadores', 'Accesorios'],
    category: 'cocina'
  },
  {
    id: 'material_cocina',
    name: 'Material',
    values: ['Acero inoxidable', 'Cerámica', 'Vidrio', 'Plástico', 'Silicón', 'Madera', 'Bambú', 'Aluminio', 'Hierro fundido'],
    category: 'cocina'
  },

  // Baño
  {
    id: 'tipo_bano',
    name: 'Tipo',
    values: ['Toallas', 'Alfombras', 'Accesorios', 'Organizadores', 'Cortinas', 'Jaboneras', 'Porta rollos', 'Estantes'],
    category: 'bano'
  },
  {
    id: 'material_bano',
    name: 'Material',
    values: ['Algodón', 'Microfibra', 'Bambú', 'Plástico', 'Acero inoxidable', 'Cerámica', 'Vidrio', 'Madera'],
    category: 'bano'
  },

  // Jardín
  {
    id: 'tipo_jardin',
    name: 'Tipo',
    values: ['Macetas', 'Muebles de jardín', 'Iluminación', 'Decoración', 'Herramientas', 'Accesorios'],
    category: 'jardin'
  },
  {
    id: 'resistencia',
    name: 'Resistencia',
    values: ['Interior', 'Exterior', 'Resistente al agua', 'Resistente a UV', 'Resistente a la intemperie'],
    category: 'jardin'
  },

  // Iluminación
  {
    id: 'tipo_iluminacion',
    name: 'Tipo',
    values: ['Lámpara de techo', 'Lámpara de mesa', 'Lámpara de pie', 'Lámpara de pared', 'Lámpara colgante', 'Lámpara de escritorio', 'Lámpara de noche'],
    category: 'iluminacion'
  },
  {
    id: 'tipo_bombilla',
    name: 'Tipo de Bombilla',
    values: ['LED', 'Incandescente', 'Fluorescente', 'Halógena', 'Smart LED'],
    category: 'iluminacion'
  },

  // Textiles
  {
    id: 'tipo_textil',
    name: 'Tipo',
    values: ['Cortinas', 'Alfombras', 'Manteles', 'Servilletas', 'Cojines', 'Fundas', 'Colchas', 'Sábanas', 'Toallas'],
    category: 'textiles'
  },
  {
    id: 'material_textil',
    name: 'Material',
    values: ['Algodón', 'Lino', 'Seda', 'Lana', 'Poliéster', 'Microfibra', 'Bambú', 'Yute', 'Lurex'],
    category: 'textiles'
  }
];

export const useAttributes = () => {
  const [selectedAttributes, setSelectedAttributes] = useState<ProductAttribute[]>([]);
  const [customAttributes, setCustomAttributes] = useState<ProductAttribute[]>([]);

  // Obtener atributos por categoría
  const getAttributesByCategory = (category?: string) => {
    if (!category) return PREDEFINED_ATTRIBUTES;
    return PREDEFINED_ATTRIBUTES.filter(attr => attr.category === category);
  };

  // Obtener todas las categorías disponibles
  const getCategories = () => {
    const categories = new Set(PREDEFINED_ATTRIBUTES.map(attr => attr.category).filter(Boolean));
    return Array.from(categories);
  };

  // Agregar atributo predefinido
  const addPredefinedAttribute = (attributeId: string, value: string) => {
    const attribute = PREDEFINED_ATTRIBUTES.find(attr => attr.id === attributeId);
    if (attribute) {
      const newAttribute: ProductAttribute = {
        name: attribute.name,
        value
      };
      setSelectedAttributes(prev => [...prev, newAttribute]);
    }
  };

  // Agregar atributo personalizado
  const addCustomAttribute = (name: string, value: string) => {
    const newAttribute: ProductAttribute = { name, value };
    setCustomAttributes(prev => [...prev, newAttribute]);
  };

  // Remover atributo
  const removeAttribute = (name: string, value: string) => {
    setSelectedAttributes(prev => prev.filter(attr => !(attr.name === name && attr.value === value)));
    setCustomAttributes(prev => prev.filter(attr => !(attr.name === name && attr.value === value)));
  };

  // Obtener todos los atributos
  const getAllAttributes = useMemo(() => {
    return [...selectedAttributes, ...customAttributes];
  }, [selectedAttributes, customAttributes]);

  // Limpiar todos los atributos
  const clearAttributes = () => {
    setSelectedAttributes([]);
    setCustomAttributes([]);
  };

  // Cargar atributos existentes (para edición)
  const loadExistingAttributes = (attributes: Record<string, string>) => {
    const existingAttributes: ProductAttribute[] = Object.entries(attributes).map(([name, value]) => ({
      name,
      value
    }));
    
    // Separar entre predefinidos y personalizados
    const predefinedNames = PREDEFINED_ATTRIBUTES.map(attr => attr.name);
    const predefined = existingAttributes.filter(attr => predefinedNames.includes(attr.name));
    const custom = existingAttributes.filter(attr => !predefinedNames.includes(attr.name));
    
    setSelectedAttributes(predefined);
    setCustomAttributes(custom);
  };

  // Convertir a formato para el backend
  const getAttributesForBackend = () => {
    const allAttributes = getAllAttributes;
    const attributesObject: Record<string, string> = {};
    allAttributes.forEach(attr => {
      attributesObject[attr.name] = attr.value;
    });
    return attributesObject;
  };

  return {
    // Datos
    predefinedAttributes: PREDEFINED_ATTRIBUTES,
    selectedAttributes,
    customAttributes,
    allAttributes: getAllAttributes,
    
    // Métodos
    getAttributesByCategory,
    getCategories,
    addPredefinedAttribute,
    addCustomAttribute,
    removeAttribute,
    clearAttributes,
    loadExistingAttributes,
    getAttributesForBackend
  };
}; 
