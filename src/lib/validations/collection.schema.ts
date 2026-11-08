import { z } from "zod";
const donationDateSchema = z
  .string()
  .regex(/^\\d{4}-\\d{2}-\\d{2}$/, "Date must be in YYYY-MM-DD format.")
  .refine((value) => {
    const [year, month, day] = value.split("-").map(Number);

    const date = new Date(Date.UTC(year, month - 1, day));

    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    );
  }, "Please enter a valid calendar date.");

export const collectionSchema = z
  .object({
    memberId: z.string().trim().min(1, "Please select a member."),

    amount: z.coerce.number().positive("Amount must be greater than zero."),

    donationDate: donationDateSchema,

    note: z.string().trim().optional().default(""),

    isYearlyPayment: z.boolean().optional().default(false),
  })
  .refine(
    (data) =>
      !data.isYearlyPayment ||
      (Number.isInteger(data.amount) && data.amount % 12 === 0),
    {
      message: "Yearly amount must be a whole rupee amount divisible by 12.",
      path: ["amount"],
    },
  );

export const updateCollectionSchema = z
  .object({
    amount: z.coerce
      .number()
      .positive("Amount must be greater than zero.")
      .optional(),

    donationDate: donationDateSchema.optional(),

    note: z.string().trim().optional(),
  })
  .refine(
    (data) =>
      data.amount !== undefined ||
      data.donationDate !== undefined ||
      data.note !== undefined,
    "At least one field must be provided for update.",
  );
