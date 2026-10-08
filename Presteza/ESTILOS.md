# Estilos Presteza

Identidad visual de la casa: vino, oro y crema, letras de ticket, recortes
rectos. La guía sigue el orden de la entrega (paleta, pantalla, tipografía,
listas, formularios, errores), pero las cadenas son las nuestras.

**Regla:** si una combinación se copia **tres veces**, vive en `src/components/`.
Eso ya pasó con `Button`, `Field`, `Select` y `Badge` (como en la rúbrica), y
con lo que se repitió aquí: `Pantalla`, `Tarjeta`, `MensajeError`, `CampoBusqueda`.

No pegues estas clases a mano en una pantalla nueva. Importa el componente.

---

## Paleta (`tailwind.config.js`)

| Papel | Token | Hex | Dónde se ve |
|---|---|---|---|
| Vino | `marca` | `#6b1d3d` | sello de sección, borde de chip, precio |
| Vino claro | `marca-clara` | `#8b2d4f` | apoyo en reservas |
| Vino oscuro | `marca-oscura` | `#3a0c20` | barra, botones, perfil, admin |
| Oro | `oro` | `#d4af77` | líneas, eyebrows, CTAs |
| Crema | `crema` | `#faf6f2` | fondo de carta / login |
| Texto | `texto` | `#222222` | cuerpo sobre crema (`/70` `/55`) |
| Línea | `linea` | `#eee6dc` | borde de tarjeta y de campo |
| WhatsApp | `whatsapp` | `#25d366` | botón flotante |
| Error | `red-600` / `red-50` / `red-700` | — | campo y aviso de servidor |

Dos lienzos:

- **Carta / auth** — fondo `crema`, letra `marca-oscura`, acento `oro`.
- **Perfil / admin** — fondo `marca-oscura`, letra `crema`, acento `oro`.

---

## Contenedor de pantalla

Rutas claras (login, registro, menú, contacto, nosotros, pago, claves):

```
flex-1 bg-crema
px-6 pb-12 pt-8
mb-3 h-px w-12 bg-oro
```

Componente: `src/components/Pantalla.tsx`  
Las rutas siguen importando `ContenedorPantalla` (mismo archivo).

```tsx
<ContenedorPantalla titulo="Iniciar sesión">
  ...
</ContenedorPantalla>
```

Perfil y administración **no** usan este marco: son el lienzo oscuro
(`TarjetaPerfil`, `HeroAdmin`, comanda con puntos de ticket).

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

Recorte de ticket: sin radio. Letras abiertas.

```
caja:      items-center py-4
primary:   bg-marca-oscura     texto crema     (ENTRAR, GUARDAR, RESERVAR)
secondary: border border-oro   texto marca-oscura   (CANCELAR sobre crema)
ghost:     border border-oro   texto oro            (VER MENÚ sobre vino)
gold:      bg-oro              texto marca-oscura   (LLAMAR)
letra:     text-[11px] tracking-[3px]
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
Botón        bg-marca-oscura py-4 + text-[11px] tracking-[3px] text-crema
Botón 2      border border-oro + text-marca-oscura
Chip on      bg-marca-oscura px-3 py-2 + text-crema
Chip off     border border-marca/20 px-3 py-2 + text-marca-oscura
Buscar admin mb-4 border-b border-oro/30 py-3 text-crema
Badge pill   self-start rounded-full bg-marca/10 px-3 py-1 text-[11px] tracking-[2px] text-marca
```
