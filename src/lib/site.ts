/**
 * Datos del negocio.
 * ⚠️ Editá este archivo con la información real de la pollería:
 * dirección, teléfonos, horarios y redes sociales.
 */
export const site = {
  name: "Pollo Firme",
  tagline: "¡El mejor sabor del pollo está aquí!",
  description:
    "Pollería Pollo Firme: especialistas en pollo broaster y pollo a la brasa. Crocante por fuera, jugoso por dentro. Delivery y recojo en tienda.",
  url: "https://pollo-firme.vercel.app",

  phone: "+591 78064332",
  /** Número al que llegan los pedidos por WhatsApp (código de país sin "+"). */
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "59178064332",
  email: "contacto@pollofirme.com",

  address: "Avenida Radial 10, zona Noel Kempff",
  city: "Santa Cruz de la Sierra, Bolivia",
  mapsUrl: "https://maps.app.goo.gl/YDHWpvfoYuWW2x5FA",
  /** Coordenadas del local: el mapa incrustado las usa para no depender
   *  de que Google acierte al buscar la dirección por texto. */
  coords: { lat: -17.8128941, lng: -63.1195846 },

  hours: [
    { days: "Lunes a Jueves", time: "11:00 – 22:00" },
    { days: "Viernes y Sábado", time: "11:00 – 23:30" },
    { days: "Domingo", time: "11:00 – 22:00" },
  ],

  /** Dejá en "" las redes que todavía no existan: no se muestran. */
  social: {
    facebook: "",
    instagram: "",
    tiktok: "https://www.tiktok.com/@pollo.firme",
  },

  /** Costo fijo de delivery en Bs. Poné 0 para envío gratis. */
  deliveryFee: 10,
  /** Tiempo estimado que se muestra al cliente. */
  deliveryTime: "30–45 min",

  /**
   * Promoción destacada de la portada (el "afiche" del mes).
   * Poné `active: false` para ocultarla, o cambiá los datos cuando
   * saques una promo nueva.
   */
  promo: {
    active: true,
    kicker: "Promoción del mes",
    title: "Combo Firme",
    subtitle: "Pollo entero con sus guarniciones incluidas",
    price: 110,
    ribbon: "+ Coca Cola 2 litros",
    /**
     * Afiche que se muestra en la portada mientras no carguen una
     * promoción desde /admin/promociones. Reemplazá este archivo en
     * `public/promos/` para cambiarlo sin tocar la base de datos.
     */
    image: "/promos/combo-firme.png",
    includes: [
      "1 pollo entero",
      "2 porciones de arroz",
      "2 porciones de fideo",
      "1 porción de papas fritas",
      "Coca Cola de 2 litros",
    ],
  },
} as const;
