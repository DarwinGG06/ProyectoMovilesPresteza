# Diccionario de colores y tipografía de Presteza

## Tipografía

**Familia definida para el diseño: Roboto**, de tipo sans-serif. Se utilizará en títulos, párrafos, botones, etiquetas y campos de formulario.

**Estado de implementación:** pendiente de cargar y aplicar Roboto en la app.

## 1. Paleta central

| Token | Nombre | HEX | RGB | Uso |
|---|---|---|---|---|
| `marca` | Vino principal | `#6B1D3D` | `107, 29, 61` | Identidad de marca, acentos, selecciones y fondos de reservas. |
| `marca-clara` | Vino claro | `#8B2D4F` | `139, 45, 79` | Apoyo de la paleta y degradados del plano de reservas. |
| `marca-oscura` | Vino oscuro | `#3A0C20` | `58, 12, 32` | Fondos oscuros, navegación, botones, títulos sobre crema y pantalla de inicio de carga. |
| `oro` | Oro | `#D4AF77` | `212, 175, 119` | Precios, bordes, separadores, sellos, acciones e indicadores de carga. |
| `crema` | Crema | `#FAF6F2` | `250, 246, 242` | Fondos claros y texto sobre vino. |
| `texto` | Texto oscuro | `#222222` | `34, 34, 34` | Contenido sobre fondos claros, también con opacidad reducida. |
| `linea` | Línea clara | `#EEE6DC` | `238, 230, 220` | Bordes de campos y tarjetas. |
| `whatsapp` | Verde WhatsApp | `#25D366` | `37, 211, 102` | Botón flotante de WhatsApp. |
| `whatsapp-oscuro` | Verde WhatsApp oscuro | `#1EBC57` | `30, 188, 87` | Fondo del botón de WhatsApp mientras se pulsa (`active:bg-whatsapp-oscuro`). |


## 2. Colores auxiliares y estados

Los tokens estándar siguientes provienen de la versión de Tailwind instalada en el proyecto.

| Token o valor | HEX | Uso |
|---|---|---|
| `white` | `#FFFFFF` | Tarjetas, campos, iconos y texto destacado sobre fondos oscuros. |
| `black` | `#000000` | Fondos del visor 3D, capas oscuras del menú y texto de filtros activos. |
| `transparent` | Sin color visible (alfa 0) | Botones con borde y extremos de efectos de luz. |
| `red-50` | `#FEF2F2` | Fondo de error de formulario o servidor. |
| `red-300` | `#FCA5A5` | Errores y acciones de peligro sobre vino. |
| `red-400` | `#F87171` | Borde de acción peligrosa, usado al 50 %. |
| `red-600` | `#DC2626` | Borde y mensaje de validación de campos. |
| `red-700` | `#B91C1C` | Texto de error sobre fondo rojo suave. |
| `emerald-50` | `#ECFDF5` | Fondo del mensaje de recuperación de contraseña exitosa. |
| `emerald-800` | `#065F46` | Texto del mensaje de recuperación exitosa. |
| Valor directo | `#A3A3A3` | Texto de ejemplo de campos y búsqueda clara. |
| Valor directo | `#28A745` | Aviso verde del formulario de nueva reserva. |
| Valor directo | `#FFC107` | Selector de capacidad y sus fondos y bordes translúcidos. |
| Valor directo | `#FFD0A8` | Mensaje de apoyo del selector de hora. |
| Valor directo | `#E6C089` | Indicador «Libre» de la leyenda de mesas. |
| `oro` | `#D4AF77` | Indicador «Tu mesa» de la leyenda de mesas. |
| Valor directo | `#C45B6A` | Indicador «Ocupada» de la leyenda de mesas. |
| Valor directo | `#E8C99A` | Numeración de la cuenta del perfil. |
| Valor directo | `#F7F1EA` | Etiquetas de la cuenta del perfil. |
| Valor directo | `#0D0D0D` | Fondo del visor de modelos 3D. |
| Valor directo | `#FF6B6B` | Mensaje de error dentro del visor 3D. |

## 3. Combinaciones por componente

| Elemento / estado | Fondo | Texto / acento | Borde |
|---|---|---|---|
| Pantalla clara | `crema` | `marca-oscura`, `texto`, `oro` | Según contenido |
| Pantalla oscura | `marca-oscura` | `crema`, `white`, `oro` | Oro o blanco con transparencia |
| Tarjeta base | `white` | Según contenido | `linea` |
| Botón `primary` | `marca-oscura` | `crema` | Sin borde explícito |
| Botón `secondary` | `transparent` | `marca-oscura` | `oro` |
| Botón `ghost` | `transparent` | `oro` | `oro` |
| Botón `gold` | `oro` | `marca-oscura` | Sin borde explícito |
| Campo normal | `white` | Etiqueta `marca-oscura`; placeholder `#A3A3A3` | `linea` |
| Campo con error | `white` | Mensaje `red-600` | `red-600` |
| Opción de Select activa | `marca-oscura` | `crema` | Sin borde explícito |
| Opción de Select inactiva | Sin fondo explícito | `marca-oscura` | `marca/20` |
| Badge `pill` | `marca/10` | `marca` | Sin borde explícito |
| Badge `sello` | Sin fondo explícito | `oro` | Sin borde explícito |
| Búsqueda clara | `white` | `texto` | `linea` |
| Búsqueda oscura reutilizable | Sin fondo explícito | `crema`; placeholder `#D4AF7788` | Inferior `oro/30` |
| Error de formulario / servidor | `red-50` | `red-700` | Sin borde explícito |
| Filtro de administración activo | `oro` | `marca-oscura` | Según componente |
| Filtro de administración inactivo | Sin fondo explícito | `crema/70` | `oro/30` |
| Tarjeta del menú actual | `black/20` | `crema`, descripción `crema/60`, precio `oro` | `white/5` |
| Filtro del menú activo | `oro` | `black` | `oro` |
| Filtro del menú inactivo | `transparent` | `oro` | `oro/50` |

El menú actual utiliza la combinación oscura. La descripción de menú claro en `ESTILOS.md` no refleja esta pantalla actual.

## 4. Transparencias y estados de interacción

- El sufijo `/70` significa 70 % de opacidad del color: `text-crema/70` conserva el color crema con alfa 0.70.
- `rgba(r,g,b,a)` expresa canales RGB y alfa entre 0 y 1. El color visible depende del fondo sobre el que se compone.
- `#D4AF7788` es oro con alfa hexadecimal `88`: aproximadamente 53.33 % de opacidad.
- `transparent` representa alfa 0.
- En `Button`, `active:opacity-80` y `disabled:opacity-50` afectan al componente completo, no únicamente a su fondo.
- El borde animado de `HeroInicio.tsx` usa `rgba(212,175,119,${brillo.value})`; su alfa cambia durante la animación. |

## 5. Degradados de reservas

El orden de los colores corresponde al arreglo `colors` del componente. Las referencias completas de cada color aparecen en los inventarios anteriores.

| Elemento | Colores | Archivo |
|---|---|---|
| Hero de reservas | `rgba(107,29,61,0.72)` → `rgba(58,12,32,0.92)` | `HeroReservas.tsx` |
| Fondo del plano | `#2A0818` → `#14040C` | `PlanoMesas.tsx` |
| Arco | `#5A2040` → `#2A0818` | `PlanoMesas.tsx` |
| Barra seleccionada / normal | `#F0D59A` → `#6B1D3D` / `#E8C48A` → `#9A6A38` | `PlanoMesas.tsx` |
| Zona personalizada / normal | `#FFF1C2` → `#8B2D4F` / `#FFE08A` → `#D4A017` | `PlanoMesas.tsx` |
| Luz de paso | `transparent` → `rgba(212,175,119,0.16)` → `transparent` | `PlanoMesas.tsx` |
| Mesa ocupada / seleccionada / libre | `#7A3D45` → `#3D181E` / `#FFF1C4` → `#8B2D4F` / `#F6E2B8` → `#B07A3C` | `Mesa3D.tsx` |
| Rellenos decorativos | `#D7B06A` → `#7A5420` y `#E8C888` → `#8A6230` | `Mesa3D.tsx` |
| Relleno oscuro ocupado / libre | `#4A1C22` → `#2A1014` / `#7A4A1C` → `#4A2A10` | `Mesa3D.tsx` |
| Base ocupada / seleccionada / libre | `#8A454C` → `#5A2A30` / `#A34468` → `#6B1D3D` / `#A56A40` → `#6A4024` | `Mesa3D.tsx` |