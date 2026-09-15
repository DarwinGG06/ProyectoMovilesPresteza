# Presteza

App móvil del restaurante **Presteza** (barrio Milán, Manizales).

Está hecha con **Expo**, **React Native** y **NativeWind** (Tailwind). El código de la
app vive en la carpeta `Presteza/`. Habla con un backend propio en
`http://localhost:4000`: usuarios, carta, reservas y el panel de administración.

Este archivo es la guía para levantar el proyecto y para la entrega del curso.

---

## Qué hay que demostrar (rúbrica)

1. **Tres entidades con CRUD desde la app** (crear con validación, buscar/filtrar,
   editar con datos precargados y PATCH solo de lo que cambió, borrar con confirmación).
2. **Registro e inicio de sesión** contra el backend. Si algo falla, el mensaje
   se ve **en pantalla**, no solo en consola.
3. **Tailwind / NativeWind** en todas las pantallas.
4. Guía de clases en [`Presteza/ESTILOS.md`](Presteza/ESTILOS.md).
5. Este README: cómo levantar backend, app y variables de entorno.
6. El proyecto levanta sin errores.

---

## Requisitos

- Node.js (LTS)
- El **backend de Presteza** ya encendido en el puerto **4000**
- Para el teléfono: [Expo Go](https://expo.dev/go) y la misma red Wi‑Fi que el PC

---

## Cómo levantar el backend

Este repositorio **no incluye** el servidor. Es el API de Presteza que el equipo
ya tiene aparte.

1. Arranca ese servidor en el puerto **4000**.
2. Comprueba que responde:

```bash
# En el navegador o con curl:
GET http://localhost:4000/dishes
GET http://localhost:4000/categories
```

Si esas rutas no contestan, la app no podrá listar el menú ni hacer login.

---

## Cómo levantar la app

Desde la raíz de este repo:

```bash
cd Presteza
npm install
npm run start
```

Metro queda en `http://localhost:8081`.

| Dónde | Qué hacer |
|---|---|
| **Web (PC)** | Abre `http://localhost:8081` |
| **Teléfono** | Expo Go, misma Wi‑Fi que el PC, escanea el QR |
| **Solo web** | `npm run web` |

La primera vez `npm install` tarda. Si Metro ya estaba corriendo y ves un error
viejo (por ejemplo de `Button` o de `useAuth`), recarga la página o pulsa
**Reload** en la barra roja de Expo.

### Scripts

| Comando | Qué hace |
|---|---|
| `npm run start` | Expo (web, Android, iOS) |
| `npm run web` | Solo navegador |
| `npm run android` / `npm run ios` | Abre el simulador si está instalado |

---

## Variable de entorno

Por defecto la app apunta a `http://localhost:4000`. No hace falta `.env` si
el backend está en esa URL.

Si el API está en otro host, crea `Presteza/.env` junto a `package.json`:

```
EXPO_PUBLIC_API_URL=http://localhost:4000
```

| Situación | URL que usa la app |
|---|---|
| Navegador (web) | Siempre `http://localhost:4000` (ignora una IP de LAN en el `.env`) |
| Teléfono / Expo Go | IP de Metro + puerto 4000, para alcanzar el PC en la red |
| Emulador Android | `http://10.0.2.2:4000` si no hay IP de Metro |
| API en internet | Pon esa URL en `EXPO_PUBLIC_API_URL` |

Después de crear o cambiar el `.env`, **reinicia** Metro (`Ctrl+C` y `npm run start`).
La variable se lee al arrancar.

La lógica está en `Presteza/src/api/config.ts`. El único archivo que hace `fetch`
es `Presteza/src/api/client.ts`.

---

## Cuentas de prueba

| Rol | Correo | Contraseña | Para qué |
|---|---|---|---|
| **Admin** | `admin@presteza.com` | `Admin1234` | CRUD de las tres entidades en `/administracion` |
| **Cliente** | `isa@gmail.com` | `Hola1234` | Perfil, reservas, menú |

También puedes crear una cuenta nueva en `/registro`. Sale como rol `client`.

---

## Auth (registro e inicio de sesión)

Las pantallas **no son wrappers vacíos**: el formulario está en la ruta.

| Ruta | Qué hace |
|---|---|
| `/registro` | `POST /auth/register` (nombre, correo, teléfono, contraseña). Si el correo ya existe, el error sale en pantalla. Luego inicia sesión solo. |
| `/iniciar-sesion` | `POST /auth/login`. Guarda el JWT en memoria (`src/session/context.tsx` + `setToken`). |
| `/recuperar-contrasena` | Pide el correo para el restablecimiento |
| `/restablecer-contrasena` | Nueva contraseña |

Validación de cada campo: `required` y `maxLength` (correo también con `pattern`).
El error del servidor usa el componente `MensajeError`.

La sesión **no se guarda en disco**: al recargar la pestaña hay que volver a entrar.

Para el CRUD de la rúbrica entra con **admin** y ve a `/administracion`.

---

## Las tres entidades (CRUD)

Equivalente al patrón de clase (usuario / categoría / ítem del catálogo):

| Entidad | Pantalla | Crear | Buscar | Editar | Borrar |
|---|---|---|---|---|---|
| **Cliente** | Admin → Clientes | Formulario (`Field`) | Texto + filtros | Precargado; `PATCH /users/:id` **solo con lo que cambió** | Confirmación |
| **Categoría** | Admin → Categorías | Formulario | Texto | Precargado; `PATCH /categories/:id` solo cambios | Confirmación |
| **Producto** (plato) | Admin → Productos | Formulario; **elige una categoría** (`Select`) | Texto + categoría + en carta/oculto | Precargado; `PATCH /dishes/:id` solo cambios | Confirmación |

El PATCH “solo cambios” lo arma `cambiosDe` en
`Presteza/src/features/administracion/utils.ts`: no reenvía los campos que
siguieron iguales.

El menú público (`/menu`) **lista y busca** platos (`GET /dishes`). Crear,
editar y borrar se hacen en administración.

Otras piezas del admin (pedidos, reservas, inventario, mensajes) también hablan
con el backend, pero las tres de la rúbrica son Cliente, Categoría y Producto.

---

## Rutas de la app

| Ruta | Pantalla |
|---|---|
| `/` | Inicio |
| `/menu` | Carta (búsqueda) |
| `/reservas` | Plano de mesas y nueva reserva |
| `/sede` | Torre Plaza 70 |
| `/nosotros` | La casa |
| `/contacto` | WhatsApp y correo |
| `/pago` | Medios de pago en mesa |
| `/perfil` | Cuenta del usuario (o invitado) |
| `/administracion` | Panel admin (solo rol `admin`) |
| `/iniciar-sesion` | Login |
| `/registro` | Alta de cliente |
| `/recuperar-contrasena` | Recuperar clave |
| `/restablecer-contrasena` | Nueva clave |

---

## Estilos (NativeWind)

Todas las pantallas usan clases Tailwind. La paleta de Presteza (vino, oro,
crema) está en `Presteza/tailwind.config.js`.

La guía completa — paleta, contenedor de pantalla, tipografía, listas,
formularios y mensajes de error — está en
[`Presteza/ESTILOS.md`](Presteza/ESTILOS.md).

**Regla de la entrega:** si una combinación de clases se copia **tres veces**,
pasa a `Presteza/src/components/`. Ya está extraído:

| Componente | Papel |
|---|---|
| `Button` | Acción (vino, borde oro, oro lleno) |
| `Field` | Input de formulario + error del campo |
| `Select` | Una opción entre varias (categoría, mesa, tipo de tarjeta…) |
| `Badge` | Sello PRESTEZA o píldora CARTA / MILÁN |
| `Pantalla` | Marco de las rutas claras (`ContenedorPantalla`) |
| `Tarjeta` | Bloque de lista / contenido |
| `MensajeError` | Error del servidor, en pantalla |
| `CampoBusqueda` | Filtro de listas (menú y admin) |

---

## Estructura del repo

```
ProyectoMovilesPresteza/
  README.md                 ← este archivo
  Presteza/                 ← la app Expo
    app/                    rutas (archivo = pantalla)
    src/api/                client.ts, auth, productos, categorias, reservas…
    src/components/         Button, Field, Select, Badge, Pantalla, Tarjeta…
    src/session/            SessionProvider y useSession
    src/features/           pantallas grandes (inicio, admin, perfil, reservas)
    src/shared/             nav, footer, avisos
    src/types.ts            tipos de dominio
    ESTILOS.md              guía de clases
    tailwind.config.js      paleta marca / oro / crema
    package.json
```

Misma idea que la app de clase: `app/` para rutas, `src/api/` para el backend,
`src/components/` para lo que se repite, `src/session/` para quién está dentro.

---

## Si algo no carga

| Síntoma | Qué revisar |
|---|---|
| “No se pudo conectar con http://localhost:4000” | El backend no está en el 4000 |
| Login o menú vacíos | `GET http://localhost:4000/dishes` en el navegador |
| En el teléfono no entra al API | PC y celular en la misma Wi‑Fi; el firewall no bloquee el 4000 |
| Overlay rojo de Expo con un error viejo | Reload; el código actual ya no usa `AuthProvider` suelto |
| Cambiaste el `.env` y no pasa nada | Reinicia `npm run start` |
