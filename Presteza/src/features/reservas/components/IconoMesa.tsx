import Svg, { Circle, G, Path } from 'react-native-svg';

type IconoMesaProps = {
  ocupada: boolean;
};

const VERDE = '#22c55e';
const ROJO = '#e53935';

export function IconoMesa({ ocupada }: IconoMesaProps) {
  const color = ocupada ? ROJO : VERDE;

  return (
    <Svg width={82} height={76} viewBox="0 0 100 92">
      {ocupada ? <Personas color={color} /> : <Paloma color={color} />}
      <MesaYSillas color={color} />
    </Svg>
  );
}

function Paloma({ color }: { color: string }) {
  return (
    <>
      <Circle cx="50" cy="13" r="10" fill="none" stroke={color} strokeWidth={2.5} />
      <Path
        d="M44.2 13.3 L48.3 17.4 L56.5 8.7"
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}

function Personas({ color }: { color: string }) {
  return (
    <>
      <Busto cx={33} cabezaY={14.5} radio={3.2} hombros={13} color={color} />
      <Busto cx={67} cabezaY={14.5} radio={3.2} hombros={13} color={color} />
      <Busto cx={50} cabezaY={11} radio={4.5} hombros={21} color={color} />
    </>
  );
}

function Busto({
  cx,
  cabezaY,
  radio,
  hombros,
  color,
}: {
  cx: number;
  cabezaY: number;
  radio: number;
  hombros: number;
  color: string;
}) {
  const cuello = cabezaY + radio + 0.6;
  const base = cuello + radio * 1.55;
  const medio = hombros / 2;

  return (
    <>
      <Circle cx={cx} cy={cabezaY} r={radio} fill={color} />
      <Path
        d={`M ${cx - medio} ${base} Q ${cx - medio} ${cuello} ${cx} ${cuello} Q ${cx + medio} ${cuello} ${cx + medio} ${base} Z`}
        fill={color}
      />
    </>
  );
}

function MesaYSillas({ color }: { color: string }) {
  return (
    <G stroke={color} strokeWidth={4.5} fill="none" strokeLinecap="round">
      <Path d="M14 36 C12 43 12 53 13 62" />
      <Path d="M13 62 L30 62" />
      <Path d="M14 62 L14 84" />
      <Path d="M29 62 L29 84" />

      <Path d="M86 36 C88 43 88 53 87 62" />
      <Path d="M87 62 L70 62" />
      <Path d="M86 62 L86 84" />
      <Path d="M71 62 L71 84" />

      <Path d="M33 52 L67 52" />
      <Path d="M50 52 L50 82" />
      <Path d="M40 82 L60 82" />
    </G>
  );
}
