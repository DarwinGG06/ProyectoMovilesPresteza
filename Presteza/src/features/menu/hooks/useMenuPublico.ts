import { useState, useEffect } from 'react';
import { listarProductos } from '@/api/productos'; 
import { listarCategorias } from '@/api/categorias';

// Usa los tipos Producto y Categoria exportados en tu archivo de tipos
import type { Producto, Categoria } from '@/types'; 

export function useMenuPublico() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let montado = true;

    const cargarDatos = async () => {
      try {
        setCargando(true);
        setError(null);

        const [resProds, resCats] = await Promise.all([
          listarProductos('' as any), 
          listarCategorias('' as any)
        ]);
        
        // Garantiza que la respuesta sea un arreglo, incluso si la API responde { data: [...] }
        const listaProductos: Producto[] = Array.isArray(resProds) ? resProds : resProds?.data || [];
        const listaCategorias: Categoria[] = Array.isArray(resCats) ? resCats : resCats?.data || [];

        if (montado) {
          const productosDisponibles = listaProductos.filter((p) => p.available !== false);
          
          setProductos(productosDisponibles);
          setCategorias(listaCategorias);
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

    return () => {
      montado = false;
    };
  }, []);

  return { productos, categorias, cargando, error };
}