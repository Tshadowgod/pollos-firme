# 🍗 Pollo Firme

Sitio web y sistema de pedidos para la pollería **Pollo Firme** — especialistas en
pollo broaster y pollo a la brasa.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Neon (PostgreSQL) · desplegado en Vercel.

---

## ¿Qué incluye?

| Página | Ruta | Qué hace |
| --- | --- | --- |
| Inicio | `/` | Hero, especialidades, platos destacados (desde Neon), cómo pedir |
| Menú | `/menu` | Carta completa con filtro por categoría y buscador |
| Carrito | `/carrito` | Checkout: datos del cliente, delivery o recojo, total en vivo |
| Seguimiento | `/pedido/[código]` | El cliente ve el estado de su pedido |
| Nosotros | `/nosotros` | Historia y valores del negocio |
| Contacto | `/contacto` | Dirección, teléfonos, horarios y mapa |
| Admin | `/admin` | Panel con todos los pedidos y cambio de estado |
| Promociones | `/admin/promociones` | Subir fotos y banners de promociones |

### Cómo llega el pedido

1. El cliente arma su carrito y confirma en `/carrito`.
2. El servidor **recalcula los precios leyéndolos de la base de datos** (nunca
   confía en lo que manda el navegador) y guarda el pedido en Neon.
3. Se abre WhatsApp con el resumen ya escrito, listo para enviar al número de
   la pollería.
4. El pedido aparece en `/admin`, donde se le va cambiando el estado:
   pendiente → confirmado → en preparación → en camino → entregado.

---

## Puesta en marcha

### 1. Crear la base de datos en Neon

1. Entrá a [neon.com](https://neon.com) y creá un proyecto (el plan gratuito alcanza).
2. Copiá la **connection string** con *pooling* (termina en `-pooler...`).

### 2. Configurar las variables de entorno

```bash
cp .env.example .env.local
```

Editá `.env.local`:

```env
DATABASE_URL="postgresql://…-pooler…neon.tech/neondb?sslmode=require"
ADMIN_PASSWORD="la-clave-del-panel"
AUTH_SECRET="una-cadena-larga-y-aleatoria"
NEXT_PUBLIC_WHATSAPP="59170000000"
```

Para generar un `AUTH_SECRET` seguro:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> `NEXT_PUBLIC_WHATSAPP` va en formato internacional, **sin `+` y sin espacios**.
> Bolivia es `591`, así que el número `70012345` se escribe `59170012345`.

### 3. Crear las tablas y cargar el menú

```bash
npm install
npm run db:setup   # crea las tablas de db/schema.sql
npm run db:seed    # carga el menú de ejemplo
```

### 4. Levantar el sitio

```bash
npm run dev
```

Abrí <http://localhost:3000>. El panel está en <http://localhost:3000/admin>.

---

## Personalizar

### Datos del negocio

Todo lo editable vive en **`src/lib/site.ts`**: dirección, teléfonos, horarios,
redes sociales, costo de delivery y tiempo estimado. Cambiá ese archivo y listo.

### Menú y precios

Los precios del seed son **de ejemplo**. Dos formas de ajustarlos:

- **Editando el seed:** cambiá `scripts/seed.ts` y volvé a correr `npm run db:seed`
  (esto borra el menú y lo recarga; no toca los pedidos ya hechos).
- **Directo en Neon:** desde el SQL Editor del dashboard.

```sql
-- Cambiar un precio
UPDATE products SET price = 32 WHERE slug = 'broaster-1-4';

-- Marcar un plato como agotado (deja de aparecer en el sitio)
UPDATE products SET is_available = FALSE WHERE slug = 'brasa-entero';

-- Destacarlo en la portada
UPDATE products SET is_featured = TRUE WHERE slug = 'combo-familiar';
```

### Fotos de los platos

Cada plato tiene una columna `image_url`. Mientras esté vacía se muestra un
emoji de respaldo. Para poner fotos reales, subí las imágenes (por ejemplo a
Vercel Blob o Cloudinary) y guardá la URL:

```sql
UPDATE products SET image_url = 'https://…/broaster.jpg' WHERE slug = 'broaster-1-4';
```

### Promociones y fotos (desde el panel)

En **`/admin/promociones`** se cargan los banners y promociones sin tocar código:

- Subís la **foto o el banner** (JPG, PNG o WebP). El navegador la reduce a
  1600 px y calidad 85 % antes de mandarla, así una foto de celular de 5 MB
  llega pesando unos cientos de KB.
- Completás título, bajada, precio, cinta roja y la lista de "Incluye"
  (una línea por ítem).
- La primera promoción activa se muestra como el **afiche grande** de la
  portada; las demás aparecen abajo como galería de ofertas.
- El check *"Mostrar en el sitio"* la oculta sin borrarla.

La imagen se guarda en la propia base de datos (columna `image_base64`) y se
sirve por `/api/promos/:id/image`, cacheada con un parámetro `?v=` que cambia
al reemplazar la foto. La ventaja: subir fotos funciona igual en local y en
Vercel, sin contratar un servicio de almacenamiento aparte.

> Si todavía no cargaste ninguna promoción, la portada usa como respaldo los
> textos del objeto `promo` de `src/lib/site.ts` y muestra un marcador en el
> lugar de la foto.

### Estilo y colores

El sitio usa el lenguaje visual de los afiches de la pollería: fondo naranja
degradado con trama de semitono, tipografía de póster (**Anton**), bordes
gruesos marrón oscuro y cintas rojas.

Todo está en `src/app/globals.css`, dentro del bloque `@theme`:
naranja `#f97316`, ámbar `#ffc300`, rojo `#d81920` y la tinta marrón `#2b1409`.

Utilidades propias que podés reutilizar: `bg-poster`, `bg-poster-dark`,
`bg-halftone`, `drop-poster`, `font-display` (títulos en mayúsculas) y
`font-price` (misma tipografía, respetando minúsculas, para los montos).

Las piezas gráficas del afiche viven en `src/components/Poster.tsx`:
`<PriceOval>`, `<Ribbon>`, `<CheckList>` y `<CurvyArrow>`.

---

## Desplegar en Vercel

1. Subí el proyecto a GitHub.
2. En [vercel.com](https://vercel.com) → **Add New → Project** → importá el repo.
3. En **Environment Variables** cargá las cuatro variables de `.env.local`
   (`DATABASE_URL`, `ADMIN_PASSWORD`, `AUTH_SECRET`, `NEXT_PUBLIC_WHATSAPP`).
4. **Deploy.** Vercel detecta Next.js solo, no hay que configurar nada más.

Si preferís la terminal:

```bash
npm i -g vercel
vercel        # despliegue de prueba
vercel --prod # despliegue a producción
```

> Después de desplegar, actualizá `site.url` en `src/lib/site.ts` con el dominio
> real para que las vistas previas al compartir el link salgan bien.

También podés conectar Neon desde el marketplace de Vercel
(**Storage → Neon**), que carga `DATABASE_URL` automáticamente.

---

## Estructura

```
src/
├─ app/
│  ├─ page.tsx              Inicio
│  ├─ menu/                 Carta
│  ├─ carrito/              Checkout
│  ├─ pedido/[code]/        Seguimiento del pedido
│  ├─ admin/                Panel de pedidos (protegido por contraseña)
│  │  └─ promociones/       Subida de fotos y banners
│  ├─ nosotros/ contacto/   Páginas informativas
│  └─ api/
│     ├─ orders/            POST: crear pedido
│     ├─ products/          GET: menú
│     ├─ categories/        GET: categorías
│     ├─ promos/[id]/image  GET: foto de una promoción
│     └─ admin/             login, logout, estado de pedidos, promociones
├─ components/              Header, Footer, carrito, tarjetas, panel
│  └─ Poster.tsx            Óvalo de precio, cinta, lista ✓ y flecha
└─ lib/
   ├─ db.ts                 Conexión a Neon
   ├─ queries.ts            Todas las consultas SQL
   ├─ auth.ts               Sesión del admin (cookie firmada HMAC)
   ├─ site.ts               ⚙️ Datos del negocio — editá acá
   ├─ whatsapp.ts           Armado del mensaje de pedido
   ├─ format.ts             Formato de moneda y fechas
   └─ types.ts              Tipos compartidos
db/schema.sql               Esquema de la base de datos
scripts/                    setup-db.ts y seed.ts
```

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm start` | Sirve la compilación |
| `npm run db:setup` | Crea las tablas en Neon |
| `npm run db:seed` | Carga/recarga el menú |

## Seguridad

- Todas las consultas usan *template tags* de Neon, o sea parámetros — no hay
  concatenación de SQL.
- El total del pedido se calcula **en el servidor** con los precios de la base
  de datos.
- El panel usa una cookie `httpOnly` firmada con HMAC-SHA256 y vence a las 12 horas.
- Cambiá `ADMIN_PASSWORD` por una clave fuerte antes de publicar.
