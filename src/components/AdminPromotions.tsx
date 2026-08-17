"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import type { Promotion } from "@/lib/types";

/** Tamaño máximo del lado largo al que reducimos la foto antes de subirla. */
const MAX_SIDE = 1600;

type FormState = {
  id?: number;
  kicker: string;
  title: string;
  subtitle: string;
  price: string;
  ribbon: string;
  includes: string;
  isActive: boolean;
  sortOrder: string;
  imageDataUrl: string;
  currentImage: string | null;
};

const EMPTY: FormState = {
  kicker: "Promoción del mes",
  title: "",
  subtitle: "",
  price: "",
  ribbon: "",
  includes: "",
  isActive: true,
  sortOrder: "0",
  imageDataUrl: "",
  currentImage: null,
};

/**
 * Reduce la foto en el navegador antes de mandarla, así una foto de
 * celular de 5 MB llega a la base pesando unos pocos cientos de KB.
 */
async function shrinkImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo procesar la imagen.");

  // Fondo blanco: si el PNG tiene transparencia, no queda negra al pasar a JPG.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", 0.85);
}

export default function AdminPromotions({
  promotions,
}: {
  promotions: Promotion[];
}) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function editPromotion(promo: Promotion) {
    setError(null);
    setForm({
      id: promo.id,
      kicker: promo.kicker ?? "",
      title: promo.title,
      subtitle: promo.subtitle ?? "",
      price: promo.price === null ? "" : String(promo.price),
      ribbon: promo.ribbon ?? "",
      includes: promo.includes.join("\n"),
      isActive: promo.is_active,
      sortOrder: String(promo.sort_order),
      imageDataUrl: "",
      currentImage: promo.image_url,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setForm(EMPTY);
    setError(null);
    if (fileInput.current) fileInput.current.value = "";
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    try {
      set("imageDataUrl", await shrinkImage(file));
    } catch {
      setError("No pudimos leer esa imagen. Probá con un JPG o PNG.");
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: form.id,
          kicker: form.kicker,
          title: form.title,
          subtitle: form.subtitle,
          price: form.price,
          ribbon: form.ribbon,
          includes: form.includes.split("\n").map((l) => l.trim()),
          isActive: form.isActive,
          sortOrder: Number(form.sortOrder) || 0,
          imageDataUrl: form.imageDataUrl,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "No pudimos guardar la promoción.");
        return;
      }

      resetForm();
      startTransition(() => router.refresh());
    } catch {
      setError("Error de conexión.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(promo: Promotion) {
    const response = await fetch(`/api/admin/promotions/${promo.id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      if (form.id === promo.id) resetForm();
      startTransition(() => router.refresh());
    }
  }

  const preview = form.imageDataUrl || form.currentImage;

  return (
    <div className="min-h-screen bg-pollo-cream">
      <header className="bg-poster-dark">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6">
          <div>
            <h1 className="font-display text-3xl text-white">
              Promociones y fotos
            </h1>
            <p className="text-sm text-white/60">
              Lo que subas acá se muestra en la portada del sitio.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin"
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              ← Pedidos
            </Link>
            <Link
              href="/"
              target="_blank"
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Ver sitio
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* ── Formulario ── */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border-4 border-pollo-navy bg-white p-6 shadow-[var(--shadow-card)]"
        >
          <h2 className="font-display text-2xl text-pollo-navy">
            {form.id ? `Editando promoción #${form.id}` : "Nueva promoción"}
          </h2>
          <p className="mt-1 text-sm font-medium text-pollo-navy/70">
            La primera promoción activa se muestra grande en la portada:{" "}
            <strong>el título y la imagen</strong>. Los precios y el detalle van
            dentro del propio afiche. Los demás campos se usan en las tarjetas
            de las promociones siguientes.
          </p>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {/* Zona de la foto */}
            <div>
              <span className="text-sm font-bold text-pollo-navy">
                Foto o banner
              </span>

              <label className="mt-1 block cursor-pointer overflow-hidden rounded-2xl border-3 border-dashed border-pollo-navy/40 bg-pollo-cream transition hover:border-pollo-red">
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
                {preview ? (
                  <span className="relative block aspect-video">
                    <Image
                      src={preview}
                      alt="Vista previa"
                      fill
                      sizes="400px"
                      unoptimized
                      className="object-cover"
                    />
                  </span>
                ) : (
                  <span className="grid aspect-video place-items-center p-6 text-center">
                    <span>
                      <span className="block text-5xl">🖼️</span>
                      <span className="mt-2 block font-display text-lg text-pollo-navy">
                        Subir imagen
                      </span>
                      <span className="mt-1 block text-xs font-medium text-pollo-navy/60">
                        JPG, PNG o WebP · se reduce sola antes de subir
                      </span>
                    </span>
                  </span>
                )}
              </label>

              {preview && (
                <button
                  type="button"
                  onClick={() => {
                    set("imageDataUrl", "");
                    if (fileInput.current) fileInput.current.value = "";
                  }}
                  className="mt-2 text-xs font-semibold text-pollo-navy/60 transition hover:text-pollo-red"
                >
                  {form.imageDataUrl
                    ? "Descartar la imagen nueva"
                    : "Elegí un archivo para reemplazarla"}
                </button>
              )}
            </div>

            {/* Textos */}
            <div className="space-y-3">
              <Field
                label="Título"
                value={form.title}
                onChange={(v) => set("title", v)}
                placeholder="Combo Firme"
                required
              />
              <Field
                label="Etiqueta de arriba"
                value={form.kicker}
                onChange={(v) => set("kicker", v)}
                placeholder="Promoción del mes"
              />
              <Field
                label="Bajada"
                value={form.subtitle}
                onChange={(v) => set("subtitle", v)}
                placeholder="Pollo entero con sus guarniciones"
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Precio (Bs.)"
                  type="number"
                  value={form.price}
                  onChange={(v) => set("price", v)}
                  placeholder="110"
                />
                <Field
                  label="Orden"
                  type="number"
                  value={form.sortOrder}
                  onChange={(v) => set("sortOrder", v)}
                />
              </div>
              <Field
                label="Cinta roja"
                value={form.ribbon}
                onChange={(v) => set("ribbon", v)}
                placeholder="+ Coca Cola 2 litros"
              />
            </div>
          </div>

          <label className="mt-4 block">
            <span className="text-sm font-bold text-pollo-navy">
              Incluye (una línea por ítem)
            </span>
            <textarea
              value={form.includes}
              onChange={(e) => set("includes", e.target.value)}
              rows={5}
              placeholder={"1 pollo entero\n2 porciones de arroz\n1 porción de papas fritas"}
              className="mt-1 w-full resize-y rounded-xl border-3 border-pollo-navy px-4 py-2.5 font-medium outline-none transition focus:border-pollo-red"
            />
          </label>

          <label className="mt-4 flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
              className="size-5 accent-[var(--color-pollo-red)]"
            />
            <span className="font-bold text-pollo-navy">
              Mostrar en el sitio
            </span>
          </label>

          {error && (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-pollo-red">
              {error}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-pollo-red px-7 py-3 font-display text-lg text-white transition hover:bg-pollo-navy disabled:opacity-60"
            >
              {saving ? "Guardando…" : form.id ? "Guardar cambios" : "Crear promoción"}
            </button>
            {form.id && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border-3 border-pollo-navy px-7 py-3 font-display text-lg text-pollo-navy transition hover:bg-pollo-navy hover:text-white"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        {/* ── Listado ── */}
        <h2 className="mt-10 font-display text-2xl text-pollo-navy">
          Promociones cargadas ({promotions.length})
        </h2>

        {promotions.length === 0 ? (
          <p className="mt-4 rounded-2xl border-3 border-dashed border-pollo-navy/30 p-8 text-center font-medium text-pollo-navy/60">
            Todavía no hay promociones. Creá la primera con el formulario de
            arriba: la portada mostrará esa imagen.
          </p>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {promotions.map((promo) => (
              <li
                key={promo.id}
                className="overflow-hidden rounded-2xl border-3 border-pollo-navy bg-white"
              >
                <div className="relative aspect-video bg-pollo-cream">
                  {promo.image_url ? (
                    <Image
                      src={promo.image_url}
                      alt={promo.title}
                      fill
                      sizes="400px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="grid h-full place-items-center text-4xl">
                      🖼️
                    </span>
                  )}
                  {!promo.is_active && (
                    <span className="absolute inset-0 grid place-items-center bg-pollo-navy/70 font-display text-xl text-white">
                      Oculta
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <p className="font-display text-xl text-pollo-navy">
                    {promo.title}
                  </p>
                  <p className="text-sm font-medium text-pollo-navy/60">
                    {promo.price !== null && `Bs. ${promo.price.toFixed(2)} · `}
                    orden {promo.sort_order} · {promo.includes.length} ítems
                  </p>

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => editPromotion(promo)}
                      className="rounded-full bg-pollo-navy px-4 py-2 text-sm font-bold text-white transition hover:bg-pollo-red"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(promo)}
                      className="rounded-full border-2 border-pollo-navy/20 px-4 py-2 text-sm font-bold text-pollo-navy/60 transition hover:border-pollo-red hover:text-pollo-red"
                    >
                      Borrar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-pollo-navy">
        {label}
        {required && <span className="text-pollo-red"> *</span>}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border-3 border-pollo-navy px-4 py-2.5 font-medium outline-none transition focus:border-pollo-red"
      />
    </label>
  );
}
