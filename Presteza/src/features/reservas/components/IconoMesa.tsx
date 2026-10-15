import Svg, { Circle, Ellipse, G, Rect } from 'react-native-svg';

type IconoMesaProps = {
  ocupada: boolean;
  seleccionada?: boolean;
  capacidad?: number;
};

const PALETA = {
  libre: {
    respaldo: '#4e1430',
    asiento: '#6b1d3d',
    brillo: 'rgba(255,255,255,0.24)',
    aro: '#c6a15e',
    mantel: '#fbf7f2',
    plato: '#ffffff',
    bordePlato: '#e4d3c0',
    aroInterior: 'rgba(198,161,94,0.7)',
    centro: '#d4af77',
  },
  seleccionada: {
    respaldo: '#4e1430',
    asiento: '#7a2348',
    brillo: 'rgba(255,255,255,0.32)',
    aro: '#e0c48a',
    mantel: '#fffaf3',
    plato: '#ffffff',
    bordePlato: '#e8d5a3',
    aroInterior: '#d4af77',
    centro: '#c6a15e',
  },
  ocupada: {
    respaldo: '#8d807c',
    asiento: '#b3a7a3',
    brillo: 'rgba(255,255,255,0.2)',
    aro: '#d5cdc6',
    mantel: '#f3eeea',
    plato: '#faf7f5',
    bordePlato: '#e3dbd4',
    aroInterior: 'rgba(180,170,162,0.8)',
    centro: '#c8beb6',
  },
} as const;

function medidas(capacidad: number) {
  if (capacidad <= 1) return { radio: 17, ancho: 20, altoAsiento: 11, altoRespaldo: 6, hueco: 3.5 };
  if (capacidad === 2) return { radio: 18, ancho: 18, altoAsiento: 10, altoRespaldo: 5.5, hueco: 3.5 };
  if (capacidad <= 4) return { radio: 19, ancho: 16, altoAsiento: 9, altoRespaldo: 5, hueco: 3 };
  return { radio: 20, ancho: 13, altoAsiento: 8, altoRespaldo: 4.5, hueco: 2.5 };
}

export function IconoMesa({ ocupada, seleccionada = false, capacidad = 4 }: IconoMesaProps) {
  const tono = ocupada ? PALETA.ocupada : seleccionada ? PALETA.seleccionada : PALETA.libre;
  const { radio, ancho, altoAsiento, altoRespaldo, hueco } = medidas(capacidad);
  const sillas = Math.min(Math.max(capacidad, 1), 8);
  const yAsiento = 50 - radio - hueco - altoAsiento;
  const yRespaldo = yAsiento - altoRespaldo - 0.7;
  const inicio = sillas === 1 ? 180 : sillas === 2 ? 90 : 0;

  return (
    <Svg width={92} height={92} viewBox="0 0 100 100">
      {seleccionada && !ocupada ? (
        <Circle cx={50} cy={50} r={47} fill="rgba(212,175,119,0.16)" stroke="#d4af77" strokeWidth={1.25} />
      ) : null}

      {Array.from({ length: sillas }, (_, index) => (
        <Silla
          key={index}
          angulo={inicio + (360 / sillas) * index}
          ancho={ancho}
          altoAsiento={altoAsiento}
          altoRespaldo={altoRespaldo}
          yAsiento={yAsiento}
          yRespaldo={yRespaldo}
          asiento={tono.asiento}
          respaldo={tono.respaldo}
          brillo={tono.brillo}
        />
      ))}

      <Circle cx={51.2} cy={51.8} r={radio} fill="rgba(58,12,32,0.07)" />
      <Circle cx={50} cy={50} r={radio} fill={tono.aro} />
      <Circle cx={50} cy={50} r={radio - 2.4} fill={tono.mantel} />
      <Ellipse
        cx={50 - radio * 0.18}
        cy={50 - radio * 0.22}
        rx={radio * 0.34}
        ry={radio * 0.16}
        fill="rgba(255,255,255,0.72)"
      />
      <Circle
        cx={50}
        cy={50}
        r={radio - 5.2}
        fill="none"
        stroke={tono.aroInterior}
        strokeWidth={0.75}
      />
      <Circle
        cx={50}
        cy={50}
        r={radio * 0.34}
        fill={tono.plato}
        stroke={tono.bordePlato}
        strokeWidth={0.7}
      />
      <Circle
        cx={50}
        cy={50}
        r={radio * 0.18}
        fill="none"
        stroke={tono.bordePlato}
        strokeWidth={0.45}
      />
      <Circle cx={50} cy={50} r={1.35} fill={tono.centro} />
    </Svg>
  );
}

function Silla({
  angulo,
  ancho,
  altoAsiento,
  altoRespaldo,
  yAsiento,
  yRespaldo,
  asiento,
  respaldo,
  brillo,
}: {
  angulo: number;
  ancho: number;
  altoAsiento: number;
  altoRespaldo: number;
  yAsiento: number;
  yRespaldo: number;
  asiento: string;
  respaldo: string;
  brillo: string;
}) {
  const anchoRespaldo = ancho - 3.2;

  return (
    <G transform={`rotate(${angulo} 50 50)`}>
      <Rect
        x={50 - anchoRespaldo / 2}
        y={yRespaldo}
        width={anchoRespaldo}
        height={altoRespaldo}
        rx={altoRespaldo / 2}
        fill={respaldo}
      />
      <Rect
        x={50 - ancho / 2}
        y={yAsiento}
        width={ancho}
        height={altoAsiento}
        rx={Math.min(4, altoAsiento / 2)}
        fill={asiento}
      />
      <Rect
        x={50 - ancho / 2 + 1.6}
        y={yAsiento + 1.2}
        width={ancho - 3.2}
        height={1.5}
        rx={0.75}
        fill={brillo}
      />
    </G>
  );
}
