import { z } from "zod";

export const entityIdSchema = z.string().trim().uuid("ID tidak valid.");

export function textField(label: string, min: number, max: number) {
  return z
    .string()
    .trim()
    .min(min, `${label} minimal ${min} karakter.`)
    .max(max, `${label} maksimal ${max} karakter.`);
}

export function optionalTextField(label: string, max: number) {
  return z.string().trim().max(max, `${label} maksimal ${max} karakter.`).optional();
}

export function nullableOptionalTextField(label: string, max: number) {
  return z.string().trim().max(max, `${label} maksimal ${max} karakter.`).optional().nullable();
}

export const nullableDateField = z.preprocess(
  (val) => (val === null || val === undefined || val === "" ? null : new Date(val as any)),
  z.date().nullable().optional()
);

export const emailField = z
  .string()
  .trim()
  .email("Format email tidak valid.")
  .max(160, "Email maksimal 160 karakter.");

export const optionalEmailField = emailField.optional().or(z.literal(""));

export const phoneField = z
  .string()
  .trim()
  .min(6, "Nomor telepon minimal 6 karakter.")
  .max(40, "Nomor telepon maksimal 40 karakter.")
  .regex(/^[0-9+\-\s()]+$/, "Nomor telepon hanya boleh berisi angka dan simbol telepon umum.");

export const optionalPhoneField = phoneField.optional().or(z.literal(""));

export const shortSearchField = z.string().trim().max(100, "Kata pencarian maksimal 100 karakter.").default("");

export function stringArrayField(label: string, itemMaxLength: number, maxItems: number, minItems = 0) {
  return z
    .array(z.string().trim().min(1, `${label} tidak boleh kosong.`).max(itemMaxLength, `${label} terlalu panjang.`))
    .min(minItems, minItems > 0 ? `Minimal ${minItems} item untuk ${label}.` : `${label} tidak valid.`)
    .max(maxItems, `Maksimal ${maxItems} item untuk ${label}.`)
    .transform((values): string[] => Array.from(new Set(values.filter(Boolean))));
}
