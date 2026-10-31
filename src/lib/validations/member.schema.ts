
import { z } from "zod";

export const memberSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must contain at least 2 characters.")
    .max(100, "Full name cannot exceed 100 characters."),

  phoneNumber: z
    .string()
    .trim()
    .min(1, "Phone number is required.")
    .refine(
      (value) => {
        const digits = value.replace(/\D/g, "");
        return digits.length >= 7 && digits.length <= 15;
      },
      "Please enter a valid phone number.",
    ),

  address: z
    .string()
    .trim()
    .max(300, "Address cannot exceed 300 characters."),

  joiningDate: z
    .string()
    .min(1, "Joining date is required.")
    .refine(
      (value) => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

        const date = new Date(`${value}T00:00:00`);

        return (
          !Number.isNaN(date.getTime()) &&
          date.toISOString().slice(0, 10) === value
        );
      },
      "Please enter a valid joining date.",
    ),
});

export type MemberFormValues = z.infer<typeof memberSchema>;

export function normalizePhoneNumber(phoneNumber: string): string {
  const trimmed = phoneNumber.trim();
  const digits = trimmed.replace(/\D/g, "");

  if (trimmed.startsWith("+")) {
    return `+${digits}`;
  }

  if (digits.length === 10) {
    return `+91${digits}`;
  }

  if (digits.startsWith("91") && digits.length === 12) {
    return `+${digits}`;
  }

  return `+${digits}`;
}
