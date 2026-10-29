# Estilos Presteza

## Elección de estilo (rúbrica)

Se eligió **Historical Manuscript** para las superficies claras, combinado con
**minimalismo elegante**, **Luxury UI** y acentos **editoriales**.

Buscábamos una presencia visual refinada: sobria, hospitalaria, con el peso
de una carta impresa. No queríamos una app ruidosa ni un panel de cocina; el
gesto debía parecer el de un menú de mesa. Historical
Manuscript nos dio el papel: el pergamino se concibió como folio de marfil,
no como un talón; el sello cierra el pedido como un lacre, no como un botón
genérico. El minimalismo recorta lo accesorio —sin islas, sin círculos
numerados, sin metal— para que quede una línea, una serifa, un oro. Luxury UI
y lo editorial entran en la tipografía: Cormorant en los títulos, Roboto con
tracking en los sellos, blanco entre líneas. El lujo es contenido —vino, oro,
madera— y se reserva para acentos; el cuerpo se lee en tinta, con contraste
alto. Así la interfaz se siente elegante sin ostentación.

- **Pergamino** — marfil quieto, sin marco. El papel es el fondo.
- **Minimalismo** — una línea, una serifa, un oro. Nada de islas, círculos
  numerados ni placas de metal.
- **Luxury / editorial** — Cormorant en títulos, Roboto con tracking en sellos.
- **Oro** — champán plano (`PlacaOro`) o un hilo. Nunca un bloque plano `bg-oro`.
- **Real-Wood** — piso y tapas de mesa en `#e8d7b8` → `#c4a574` en reservas.

**Regla:** si una combinación se copia **tres veces**, vive en `src/components/`
o `src/shared/components/materiales/`. Eso ya pasó con `Button`, `Field`,
`Select`, `Badge`, `Pergamino`, `SelloLacre`, `ChipCategoria`, `TarjetaPlato`
y `BarraEstadosPedido`.

No pegues estas clases a mano en una pantalla nueva. Importa el componente.

---

Los valores viven en `src/theme/tokens.ts`. Las pantallas usan `className`
(`bg-pergamino`, `rounded-tarjeta`, `shadow-elevada`). Si un API no acepta
clase (`placeholderTextColor`, `Ionicons`), se importa `colores`.

## Paleta (`tailwind.config.js`)

| Papel | Token | Hex | Dónde se ve |
|---|---|---|---|
| Vino | `marca` | `#6b1d3d` | sello de sección, borde de chip, precio |
| Vino claro | `marca-clara` | `#8b2d4f` | apoyo en reservas |
| Vino oscuro | `marca-oscura` | `#3a0c20` | barra, botones, perfil, admin |
| Oro | `oro` | `#d4af77` | líneas, eyebrows, CTAs |
| Crema | `crema` | `#faf6f2` | texto sobre vino |
| Pergamino | `pergamino` | `#f6f0e6` | folio (carta, login, pago, reservas) |
| Pergamino oscuro | `pergamino-oscuro` | `#ebe3d4` | sombra del papel |
| Tinta | `tinta` | `#2a1810` | texto sobre pergamino (contraste alto) |
| Madera | `madera` | `#5c3d2e` | bordes de carta / reservas |
| Texto | `texto` | `#222222` | cuerpo sobre crema (`/70` `/55`) |
| Línea | `linea` | `#eee6dc` | borde de tarjeta y de campo |
| WhatsApp | `whatsapp` | `#25d366` | botón flotante |
| Error | `red-600` / `red-50` / `red-700` | — | campo y aviso de servidor |

Tres lienzos:

- **Claros** — pergamino, tinta, serifa. Login, menú, detalle de plato, pago,
  reservas, seguimiento.
- **Oscuros** — vino, oro, crema. Inicio, perfil, barra y pie.
- **Admin** — crema `#faf6f2`, baldosas blancas, ingresos en vino (`HeroAdmin`).
  Los formularios van en `Pergamino` / `Comanda`.

---

## Contenedor de pantalla

Rutas claras (login, registro, menú, contacto, nosotros, pago, claves):

```
Pergamino fill
px-6 pb-12 pt-8
mb-3 h-px w-10 bg-marca/40
```

Componente: `src/components/Pantalla.tsx`  
Las rutas siguen importando `ContenedorPantalla` (mismo archivo).

```tsx
<ContenedorPantalla titulo="Iniciar sesión">
  ...
</ContenedorPantalla>
```

Perfil **no** usa este marco: es el lienzo vino (`TarjetaPerfil`). Admin va en
crema (`MarcoAdmin`, `HeroAdmin`). Los formularios van en `Comanda` (pergamino).

---

## Tipografía

Letter-spacing abierto, como en un ticket. Mayúsculas en sellos y botones.

```
text-[10px] tracking-[4px] text-oro
  eyebrow de sección (RESERVA TU MESA, CARTA DE NAVEGACIÓN)

text-[11px] tracking-[3px] text-oro
  sello PRESTEZA  →  Badge variant="sello"

text-4xl font-roboto-extrabold leading-tight text-marca-oscura
  título de pantalla clara  →  Pantalla

text-4xl font-roboto-extrabold tracking-[4px] text-crema
  título de carta sobre vino (inicio)

text-3xl font-roboto-light text-marca-oscura
  pregunta de reserva (¿Cuántos vienen?)

text-base text-texto/70
  apoyo bajo el título

text-lg font-roboto-semibold text-marca-oscura
  plato / valor / dato

text-sm text-texto/70
  cuerpo

text-[11px] tracking-[3px]
  etiqueta de botón  →  Button
```

```tsx
<Badge text="CARTA" className="mt-4" />
<Text className="mt-3 text-base text-texto/70">Platos que salen del backend.</Text>
```

---

## Listas y filtros

### Búsqueda

```
oscuro (admin):  mb-4 border-b border-oro/30 py-3 text-crema
claro  (menú):   border border-linea bg-white px-4 py-3 text-texto
```

Componente: `src/components/CampoBusqueda.tsx`

```tsx
<CampoBusqueda value={q} onChangeText={setQ} placeholder="Buscar un plato..." />
<CampoBusqueda value={q} onChangeText={setQ} placeholder="Buscar cliente..." variant="oscuro" />
```

Platos, categorías, clientes y `/menu`.

### Tarjeta

```
border border-linea bg-white p-5
```

Componente: `src/components/Tarjeta.tsx`

Plato del menú, valor de Nosotros, bloque de contacto, vacío de lista.

```tsx
<Tarjeta>…</Tarjeta>
<Tarjeta className="overflow-hidden p-0">…</Tarjeta>
```

### Chip de filtro (admin, fondo vino)

No es `Select`. Filtra una lista ya pintada. `ChipFiltro` en
`src/features/administracion/components/elementos.tsx`:

```
activo:    bg-oro + text-marca-oscura
inactivo:  border border-oro/30 + text-crema/70
```

---

## Formularios

Bloque: `gap-4` o `gap-5`. Campos sobre crema (modales admin y login).

### Campo — `Field`

`src/components/Field.tsx`

```
etiqueta:  font-roboto-semibold text-marca-oscura
input:     border bg-white p-3.5
ok:        border-linea
error:     border-red-600
ayuda:     text-xs text-red-600
```

Validación de la entrega: `required` + `maxLength` (`pattern` si el formato
importa: correo, fecha).

```tsx
<Field
  control={control}
  name="email"
  label="Correo"
  maxLength={120}
  rules={{
    required: 'El correo es obligatorio',
    maxLength: { value: 120, message: 'Máximo 120 caracteres' },
  }}
/>
```

### Selector — `Select`

`src/components/Select.tsx`

Una opción entre varias. Recorte recto de Presteza, no píldora.

```
fila:      flex-row flex-wrap gap-2
inactiva:  border border-marca/20 px-3 py-2  +  text-marca-oscura
activa:    bg-marca-oscura px-3 py-2         +  text-crema
```

Acepta `string`, `{ value, label }` y booleanos (Sí / No).

```tsx
<Select
  control={control}
  name="categoryId"
  label="Categoría"
  options={categorias.map((c) => ({ value: idDe(c), label: c.name }))}
  rules={{ required: 'Elige una categoría' }}
/>
```

Producto (categoría), reserva admin (mesa), pedido (cliente / pago / estado),
tarjeta del perfil (tipo / marca / principal), dirección (principal).

### Botón — `Button`

`src/components/Button.tsx`

Placa, sin radio. El oro nunca es un rectángulo plano: usa `PlacaOro`.

```
primary:   vino + filete oro     texto crema     (ENTRAR, GUARDAR)
secondary: placa hueca           texto marca     (CANCELAR sobre claro)
ghost:     placa hueca           texto oro       (VER MENÚ sobre vino)
gold:      placa metálica        texto marca     (LLAMAR, MAPA, ENVIAR)
letra:     text-[11px] tracking-[3px]
pressed:   reducción de escala a 0.97; conserva los colores y el contraste
disabled:  fondo pergamino oscuro, texto tinta, borde discontinuo y acción bloqueada
```

```tsx
<Button text="ENTRAR" onPress={submit} />
<Button text="CANCELAR" onPress={cerrar} secondary />
<Button text="VER MENÚ" onPress={irMenu} variant="ghost" />
<Button text="LLAMAR" onPress={llamar} variant="gold" />
```

Guardar / Cancelar salen de `AccionesForm` y `AccionesFormulario`. No copies
`bg-marca-oscura py-4` otra vez.

### Badge

`src/components/Badge.tsx`

```
pill:   self-start rounded-full bg-marca/10 px-3 py-1
        text-[11px] font-roboto-semibold tracking-[2px] text-marca
sello:  text-[11px] font-roboto-semibold tracking-[3px] text-oro
```

`pill` = CARTA, MILÁN, EN MESA. `sello` = PRESTEZA, WHATSAPP, MEDIOS.

---

## Mensajes de error

Las dos capas se ven **en pantalla**, no en consola.

1. **Campo** — `Field` / `Select` (`text-xs text-red-600`).
2. **Servidor o formulario** — `src/components/MensajeError.tsx`

```
bg-red-50 p-3 text-center text-red-700
```

```tsx
<MensajeError texto={formState.errors.root?.message} />
```

Login, registro, recuperar / restablecer y fallo de red del menú.

---

## Mapa: cadena → componente

| Se repetía | Componente | Papel |
|---|---|---|
| `bg-marca-oscura py-4` + tracking del label | `Button` | acción (vino / borde oro / oro lleno) |
| `border border-linea bg-white p-3.5` + label | `Field` | input |
| `px-3 py-2` vino / borde marca | `Select` | una opción entre varias |
| chip `bg-marca/10` o eyebrow oro | `Badge` | sello o píldora |
| `flex-1 bg-crema` + título 4xl + raya oro | `Pantalla` | marco de ruta clara |
| `border border-linea bg-white p-5` | `Tarjeta` | ítem / bloque |
| `bg-red-50 … text-red-700` | `MensajeError` | error de servidor |
| `border-b border-oro/30 py-3` (×3 admin) | `CampoBusqueda` | filtro de lista |
| puntos Confirmado → Entregado | `BarraEstadosPedido` | perfil + seguimiento |
| cubo 3D + línea de carta | `TarjetaPlato` | menú |
| CTA bandeja en placa de oro | `SelloLacre` | cart sheet |

---

## Qué no extraer

- `BotonPerfil` / `EnlaceAccion`: tracking más corto y `text-red-300` sobre vino.
  Viven en `src/features/perfil/components/elementos.tsx`.
- Reserva 3D (`FormularioNuevaReserva`): un solo uso, `rounded-full bg-marca`.
- `ChipFiltro`: filtro de lista sobre admin, no campo de formulario.

---

## Copy-paste (solo prototipo)

En código de la app, importa el componente.

```
Pantalla     flex-1 bg-crema
Padding      px-6 pb-12 pt-8
Raya         mb-3 h-px w-12 bg-oro
Sello        text-[11px] tracking-[3px] text-oro
Eyebrow      text-[10px] tracking-[4px] text-oro
Título       text-4xl font-roboto-extrabold leading-tight text-marca-oscura
Apoyo        mt-3 text-base text-texto/70
Tarjeta      border border-linea bg-white p-5
Campo ok     border border-linea bg-white p-3.5
Campo error  border border-red-600 bg-white p-3.5
Error campo  text-xs text-red-600
Error API    bg-red-50 p-3 text-center text-red-700
Botón        Button (primary / secondary / ghost / gold)
Oro          PlacaOro — no pegues bg-oro a mano
Chip on      bg-marca-oscura px-3 py-2 + text-crema
Chip off     border border-marca/20 px-3 py-2 + text-marca-oscura
Buscar admin mb-4 border-b border-oro/30 py-3 text-crema
Badge pill   self-start rounded-full bg-marca/10 px-3 py-1 text-[11px] tracking-[2px] text-marca
```

---

## Contraste 4.5:1

Cuerpo y precios van en tinta o vino. El oro es eyebrow o CTA sobre vino, no
cuerpo sobre crema.

| Superficie | Texto | Tokens | Relación (aprox.) |
|---|---|---|---|
| Pergamino `#f6f0e6` | Tinta | `text-tinta` | ~12:1 |
| Pergamino | Cuerpo | `text-tinta/70` | ~5.5:1 |
| Pergamino / crema | Precio | `text-marca` `#6b1d3d` | ~8:1 |
| Crema `#faf6f2` | Admin | `text-tinta` / `text-tinta/70` | ≥4.5:1 |
| Vino `#3a0c20` | Crema | `text-crema` | ~12:1 |
| Vino | Oro (eyebrow) | `text-oro` | ~4.6:1 |
| **No usar** | Oro sobre crema | `text-oro` en precios | ~1.8:1 |
| **No usar** | Tinta al 40% | `text-tinta/40` | ~3:1 |

Chips inactivos: `text-tinta/70`. Ayudas de campo: `text-tinta/70`.

---

## Pantallas de la rúbrica

| Ítem | Dónde |
|---|---|
| Home | `app/home/index.tsx` — vino, serifa, pergamino en bloques |
| Carta | `TarjetaPlato` + `ChipCategoria` |
| Detalle + 3D | `app/plato/[id].tsx` → `DetallePlatoScreen` (`VER EN 3D`, `A LA BANDEJA`) |
| Bandeja | `CartSheet` + `SelloLacre` |
| Seguimiento | `app/seguimiento.tsx` + `BarraEstadosPedido` (tras pagar) |
| Perfil | `app/perfil.tsx` — historial con la misma barra |
| Reservas / Real-Wood | `PlanoMesas` piso madera + `IconoMesa` tapa `#d4bc93` |
| Tokens | `tailwind.config.js` |
| Base | `Button`, `Field`, `Select`, `Badge`, `Pergamino`, `Tarjeta` |

Android e iOS: mismos tokens NativeWind. Hay que grabar las dos plataformas
en el video de la entrega; el código no cambia por SO.


## Revisión de contraste y pedidos · 28 de octubre de 2026

Los textos antes al 55% pasan al 70%. También se elevaron los textos más tenues en tinta, crema y gris. El oro se reserva para texto sobre fondos oscuros; en superficies claras se usa marca o tinta. Los botones base conservan el contraste en sus estados presionado y deshabilitado.

Relaciones calculadas con los tokens: tinta al 70% sobre pergamino 5.94:1; gris al 70% sobre pergamino 5.55:1; crema al 70% sobre vino oscuro 8.06:1; marca sobre pergamino 9.92:1. Estos valores verifican esas combinaciones, no certifican toda la interfaz sobre fotografías o degradados.

El historial y los pedidos del administrador se consultan al entrar, al volver del segundo plano y cada cinco segundos mientras la pantalla está enfocada y la app activa. Si falla una consulta se conserva la lista anterior. La creación conserva el aviso «Pedido creado» y la navegación a seguimiento.

Validación pendiente: recorrido visual y funcional en teléfonos Android e iOS.
