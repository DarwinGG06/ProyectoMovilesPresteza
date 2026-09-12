const PREFIJO = '[Presteza]';

export function logInfo(area: string, mensaje: string, extra?: unknown) {
  if (extra !== undefined) {
    console.log(PREFIJO, `[${area}]`, mensaje, extra);
  } else {
    console.log(PREFIJO, `[${area}]`, mensaje);
  }
}

export function logWarn(area: string, mensaje: string, extra?: unknown) {
  if (extra !== undefined) {
    console.warn(PREFIJO, `[${area}]`, mensaje, extra);
  } else {
    console.warn(PREFIJO, `[${area}]`, mensaje);
  }
}

export function logError(area: string, mensaje: string, extra?: unknown) {
  if (extra !== undefined) {
    console.error(PREFIJO, `[${area}]`, mensaje, extra);
  } else {
    console.error(PREFIJO, `[${area}]`, mensaje);
  }
}

export function redactarCuerpo(cuerpo?: Record<string, unknown>) {
  if (!cuerpo) return undefined;

  const copia: Record<string, unknown> = { ...cuerpo };
  for (const clave of Object.keys(copia)) {
    if (/password|token|authorization/i.test(clave)) {
      copia[clave] = '***';
    }
  }
  return copia;
}

export function redactarRespuesta(data: unknown) {
  if (!data || typeof data !== 'object') return data;

  const copia: Record<string, unknown> = { ...(data as Record<string, unknown>) };
  for (const clave of Object.keys(copia)) {
    const valor = copia[clave];
    if (typeof valor !== 'string') continue;
    if (/password|token|authorization/i.test(clave) || (clave === 'user' && valor.includes('.'))) {
      copia[clave] = `jwt(${valor.length})`;
    }
  }
  return copia;
}
