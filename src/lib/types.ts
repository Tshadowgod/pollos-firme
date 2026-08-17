export type Category = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  emoji: string | null;
  sort_order: number;
};

export type Product = {
  id: number;
  category_id: number;
  category_slug: string;
  category_name: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  badge: string | null;
  is_featured: boolean;
  is_available: boolean;
  sort_order: number;
};

/** Promoción / banner que se muestra en la portada. */
export type Promotion = {
  id: number;
  kicker: string | null;
  title: string;
  subtitle: string | null;
  price: number | null;
  ribbon: string | null;
  includes: string[];
  /** URL para pedir la imagen guardada en la base, o null si no tiene. */
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
};

export const ORDER_STATUSES = [
  "pendiente",
  "confirmado",
  "en_preparacion",
  "en_camino",
  "entregado",
  "cancelado",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  en_preparacion: "En preparación",
  en_camino: "En camino",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export type OrderType = "delivery" | "recojo";

export type OrderItem = {
  id: number;
  product_id: number | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export type Order = {
  id: number;
  code: string;
  customer_name: string;
  customer_phone: string;
  type: OrderType;
  address: string | null;
  reference: string | null;
  notes: string | null;
  payment_method: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  created_at: string;
  items: OrderItem[];
};

/** Lo que el carrito guarda en el navegador. */
export type CartLine = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
};
