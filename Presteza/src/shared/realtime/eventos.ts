import { DeviceEventEmitter } from 'react-native';

export const EVENTO_PEDIDO = 'presteza:pedido';
export const EVENTO_RESERVA = 'presteza:reserva';
export const EVENTO_AVISO = 'presteza:aviso';

export function emitirPedidoRealtime(payload?: unknown) {
  DeviceEventEmitter.emit(EVENTO_PEDIDO, payload);
}

export function emitirReservaRealtime(payload?: unknown) {
  DeviceEventEmitter.emit(EVENTO_RESERVA, payload);
}

export function emitirAvisoRealtime(payload?: unknown) {
  DeviceEventEmitter.emit(EVENTO_AVISO, payload);
}
