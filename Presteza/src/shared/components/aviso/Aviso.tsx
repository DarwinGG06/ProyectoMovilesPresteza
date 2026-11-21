import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { SelloP } from '@/shared/components/nav-bar/SelloP';
import { colores } from '@/theme/tokens';

export type AvisoConfig = {
  sello?: string;
  titulo: string;
  texto: string;
  confirmar?: string;
  cancelar?: string;
  peligro?: boolean;
  exito?: { titulo: string; texto: string };
  onConfirmar?: () => void | Promise<void>;
};

type AvisoApi = {
  confirmar: (config: AvisoConfig) => void;
  error: (titulo: string, texto?: string) => void;
  errorDe: (err: unknown, fallback: string, titulo?: string) => void;
  ok: (titulo: string, texto: string) => void;
};

const AvisoContext = createContext<AvisoApi | null>(null);

function textoDeError(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

function BotonAviso({
  etiqueta,
  onPress,
  variante,
  disabled,
  ancho,
}: {
  etiqueta: string;
  onPress: () => void;
  variante: 'oro' | 'outline' | 'peligro';
  disabled?: boolean;
  /** 'fila' reparte el ancho; 'bloque' ocupa todo (solo un botón). */
  ancho: 'fila' | 'bloque';
}) {
  const marco =
    variante === 'oro'
      ? styles.marcoOro
      : variante === 'peligro'
        ? styles.marcoPeligro
        : styles.marcoOutline;
  const texto =
    variante === 'oro'
      ? styles.textoOro
      : variante === 'peligro'
        ? styles.textoPeligro
        : styles.textoOutline;

  // Caja View de altura fija: PlacaOro a height 100% + flex stretch explotaba en Android.
  return (
    <View
      style={[
        styles.marco,
        marco,
        ancho === 'fila' ? styles.botonFila : styles.botonBloque,
        disabled ? styles.apagado : null,
      ]}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: Boolean(disabled) }}
        style={({ pressed }) => [styles.botonToque, pressed && !disabled ? styles.presionado : null]}>
        <Text
          style={[styles.botonEtiqueta, texto, disabled ? styles.textoApagado : null]}
          className="font-roboto"
          numberOfLines={1}>
          {etiqueta}
        </Text>
      </Pressable>
    </View>
  );
}

function AvisoModal({
  aviso,
  cargando,
  onCerrar,
  onAceptar,
}: {
  aviso: AvisoConfig | null;
  cargando: boolean;
  onCerrar: () => void;
  onAceptar: () => void;
}) {
  const sello =
    aviso?.sello || (aviso?.peligro ? 'CUIDADO' : aviso?.cancelar ? 'CONFIRMAR' : 'AVISO');
  const tieneCancelar = Boolean(aviso?.cancelar);
  const etiquetaConfirmar = aviso?.confirmar || (tieneCancelar ? 'CONFIRMAR' : 'ENTENDIDO');

  return (
    <Modal
      visible={Boolean(aviso)}
      transparent
      animationType="fade"
      statusBarTranslucent
      presentationStyle={Platform.OS === 'ios' ? 'overFullScreen' : undefined}
      onRequestClose={tieneCancelar ? onCerrar : onAceptar}>
      <View style={styles.fondo}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={cargando ? undefined : tieneCancelar ? onCerrar : onAceptar}
        />
        <View style={styles.caja} accessibilityViewIsModal>
          <View style={styles.linea} />
          <View style={styles.cuerpo}>
            <View style={styles.centro}>
              <SelloP size="sm" />
              <Text style={styles.sello} className="font-roboto">
                {sello}
              </Text>
              <Text style={styles.titulo} className="font-roboto" accessibilityRole="header">
                {aviso?.titulo}
              </Text>
            </View>

            <View style={styles.puntos}>
              {Array.from({ length: 16 }).map((_, index) => (
                <View key={index} style={styles.punto} />
              ))}
            </View>

            <Text style={styles.texto} className="font-roboto" accessibilityLiveRegion="polite">
              {aviso?.texto}
            </Text>

            <View style={[styles.acciones, tieneCancelar ? styles.accionesFila : null]}>
              {tieneCancelar ? (
                <BotonAviso
                  etiqueta={aviso?.cancelar ?? 'CANCELAR'}
                  onPress={onCerrar}
                  variante="oro"
                  disabled={cargando}
                  ancho="fila"
                />
              ) : null}
              <BotonAviso
                etiqueta={cargando ? 'ESPERA...' : etiquetaConfirmar}
                onPress={onAceptar}
                variante={
                  aviso?.peligro && tieneCancelar ? 'peligro' : tieneCancelar ? 'outline' : 'oro'
                }
                disabled={cargando}
                ancho={tieneCancelar ? 'fila' : 'bloque'}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function AvisoProvider({ children }: { children: ReactNode }) {
  const [aviso, setAviso] = useState<AvisoConfig | null>(null);
  const [cargando, setCargando] = useState(false);

  const mostrar = useCallback((config: AvisoConfig) => {
    setTimeout(() => {
      setCargando(false);
      setAviso(config);
    }, 80);
  }, []);

  const api = useMemo<AvisoApi>(
    () => ({
      confirmar: (config) =>
        mostrar({
          cancelar: 'CANCELAR',
          confirmar: 'CONFIRMAR',
          ...config,
        }),
      error: (titulo, texto) =>
        mostrar({
          sello: 'AVISO',
          titulo: texto ? titulo : 'Aviso',
          texto: texto ?? titulo,
          confirmar: 'ENTENDIDO',
        }),
      errorDe: (err, fallback, titulo = 'Aviso') =>
        mostrar({
          sello: 'AVISO',
          titulo,
          texto: textoDeError(err, fallback),
          confirmar: 'ENTENDIDO',
        }),
      ok: (titulo, texto) =>
        mostrar({
          sello: 'LISTO',
          titulo,
          texto,
          confirmar: 'ENTENDIDO',
        }),
    }),
    [mostrar]
  );

  const aceptar = async () => {
    if (!aviso || cargando) return;
    const actual = aviso;
    if (!actual.onConfirmar) {
      setAviso(null);
      return;
    }

    setCargando(true);
    try {
      await actual.onConfirmar();
      if (actual.exito) {
        setAviso({
          sello: 'LISTO',
          titulo: actual.exito.titulo,
          texto: actual.exito.texto,
          confirmar: 'ENTENDIDO',
        });
      } else {
        setAviso((prev) => (prev === actual ? null : prev));
      }
    } catch (err) {
      setAviso({
        sello: 'AVISO',
        titulo: actual.titulo,
        texto: textoDeError(err, 'No se pudo completar.'),
        confirmar: 'ENTENDIDO',
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <AvisoContext.Provider value={api}>
      {children}
      <AvisoModal
        aviso={aviso}
        cargando={cargando}
        onCerrar={() => setAviso(null)}
        onAceptar={() => void aceptar()}
      />
    </AvisoContext.Provider>
  );
}

export function useAviso() {
  const api = useContext(AvisoContext);
  if (!api) {
    throw new Error('useAviso necesita AvisoProvider');
  }
  return api;
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(58, 12, 32, 0.82)',
    paddingHorizontal: 24,
  },
  caja: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 119, 0.55)',
    backgroundColor: '#3a0c20',
  },
  linea: {
    height: 4,
    width: '100%',
    backgroundColor: '#d4af77',
  },
  cuerpo: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
  },
  centro: {
    alignItems: 'center',
  },
  sello: {
    marginTop: 16,
    fontSize: 12,
    letterSpacing: 4,
    color: '#d4af77',
  },
  titulo: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 26,
    fontFamily: 'Roboto_300Light',
    color: '#faf6f2',
  },
  puntos: {
    marginVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  punto: {
    height: 4,
    width: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(212, 175, 119, 0.35)',
  },
  texto: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 24,
    color: colores.crema,
  },
  acciones: {
    marginTop: 28,
  },
  accionesFila: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botonFila: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    marginHorizontal: 5,
  },
  botonBloque: {
    alignSelf: 'stretch',
  },
  marco: {
    height: 52,
    borderWidth: 2,
    justifyContent: 'center',
  },
  marcoOro: {
    borderColor: '#d4af77',
    backgroundColor: '#d4af77',
  },
  marcoPeligro: {
    borderColor: '#f0a8a8',
    backgroundColor: '#4a1528',
  },
  marcoOutline: {
    borderColor: '#d4af77',
    backgroundColor: '#2a0a18',
  },
  botonToque: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  botonEtiqueta: {
    textAlign: 'center',
    fontSize: 13,
    letterSpacing: 2,
  },
  textoOro: {
    color: '#3a0c20',
  },
  textoPeligro: {
    color: '#fecaca',
  },
  textoOutline: {
    color: '#e8d4a4',
  },
  apagado: {
    backgroundColor: colores['pergamino-oscuro'],
    borderColor: colores.madera,
    borderStyle: 'dashed',
  },
  textoApagado: {
    color: colores.tinta,
  },
  presionado: {
    opacity: 0.84,
  },
});
