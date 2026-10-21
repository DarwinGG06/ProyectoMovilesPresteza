import { useState } from 'react';

export function useSeleccionAdmin() {
  const [activa, setActiva] = useState(false);
  const [ids, setIds] = useState<string[]>([]);

  const activar = () => setActiva(true);

  const vaciar = () => {
    setIds([]);
    setActiva(false);
  };

  const tiene = (id: string) => ids.includes(id);

  const alternar = (id: string) => {
    setIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const empezar = (id: string) => {
    setActiva(true);
    setIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  return { activa, activar, vaciar, ids, tiene, alternar, empezar, cuenta: ids.length };
}
