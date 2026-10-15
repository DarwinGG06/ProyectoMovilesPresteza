import { useEffect, useMemo, useState } from 'react';

import { esFinDeSemana, horaEnHorario, horarioDelDia, horasAbiertas } from '../data';

const HORA_SUGERIDA = '7:00 p. m.';

type UseSelectorHoraParams = {
  fecha: string;
  hora: string;
  onHora: (hora: string) => void;
};

export function useSelectorHora({ fecha, hora, onHora }: UseSelectorHoraParams) {
  const [aviso, setAviso] = useState<string | null>(null);
  const horario = horarioDelDia(fecha);
  const horas = useMemo(() => horasAbiertas(fecha), [fecha]);
  const indice = horas.indexOf(hora);

  useEffect(() => {
    if (hora && !horaEnHorario(fecha, hora)) {
      setAviso(`No se puede. Ese día el restaurante está abierto de ${horario.etiqueta}.`);
      return;
    }
    setAviso(null);
  }, [fecha, hora, horario.etiqueta]);

  const mover = (paso: number) => {
    if (horas.length === 0) return;

    if (indice === -1) {
      onHora(horas.includes(HORA_SUGERIDA) ? HORA_SUGERIDA : horas[0]);
      setAviso(null);
      return;
    }

    const siguiente = indice + paso;
    if (siguiente < 0) {
      setAviso(`No se puede. El restaurante abre a las ${horas[0]}.`);
      return;
    }
    if (siguiente >= horas.length) {
      setAviso(`No se puede. El restaurante cierra a las ${horas[horas.length - 1]}.`);
      return;
    }

    onHora(horas[siguiente]);
    setAviso(null);
  };

  const elegir = (item: string) => {
    onHora(item);
    setAviso(null);
  };

  return {
    aviso,
    etiquetaHorario: horario.etiqueta,
    etiquetaDias: esFinDeSemana(fecha) ? 'Sábado y domingo' : 'Lunes a viernes',
    // El selector solo pinta una de cada dos horas para que quepan en pantalla.
    atajos: horas.filter((_, index) => index % 2 === 0),
    mover,
    elegir,
  };
}
