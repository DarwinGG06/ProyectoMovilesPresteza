import { useState, useEffect } from 'react';

// Ajustamos la importación para apuntar a la API de administración que ya tienes creada.
// Usamos el alias @ asumiendo que tu api está en src/features/administracion/api/adminApi
import { listarProductos, listarCategorias } from '@/features/administracion/api/adminApi'; 

// Importa los tipos desde donde los tengas definidos (ajusta la ruta si es necesario)
import type { ProductoAdmin, CategoriaAdmin } from '@/features/administracion/types'; 
// Si tus tipos están en la raíz, podría ser: import type { ProductoAdmin, CategoriaAdmin } from '@/types';

export function useMenuPublico() {
  const [productos, setProductos] = useState<ProductoAdmin[]>([]);
  const [categorias, setCategorias] = useState<CategoriaAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let montado = true; // Para evitar actualizaciones de estado si el componente se desmonta

    const cargarDatos = async () => {
      try {
        setCargando(true);
        setError(null);

        // Hacemos ambas peticiones al mismo tiempo.
        // Si tu función en adminApi espera obligatoriamente un parámetro 'sesion' o 'token', 
        // le pasamos un string vacío '' o (null as any) para engañar a TypeScript en la vista pública.
        const [prods, cats] = await Promise.all([
          listarProductos('' as any), 
          listarCategorias('' as any)
        ]);
        
        if (montado) {
          // Filtramos para que al cliente SOLO le salgan los disponibles (available !== false)
          const productosDisponibles = prods.filter((p: ProductoAdmin) => p.available !== false);
          
          setProductos(productosDisponibles);
          setCategorias(cats);
        }
      } catch (err) {
        if (montado) {
          setError('No pudimos cargar el menú en este momento.');
          console.error('Error cargando el menú público:', err);
        }
      } finally {
        if (montado) {
          setCargando(false);
        }
      }
    };

    cargarDatos();

    // Cleanup function
    return () => {
      montado = false;
    };
  }, []);

  return { productos, categorias, cargando, error };
}


