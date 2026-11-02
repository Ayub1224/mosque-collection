import { z } from "zod";

export const collectionSchema = z.object({
  memberId: z.string().trim().min(1, "Please select a member."),

  amount: z.coerce
    .number()
    .positive("Amount must be greater than zero."),

  donationDate: z
    .string()
    .min(1, "Donation date is required.")
    .refine(
      (value) => !Number.isNaN(Date.parse(value)),
      "Please enter a valid donation date.",
    ),

  note: z.string().trim().optional().default(""),
});

export const updateCollectionSchema = z
  .object({
    amount: z.coerce
      .number()
      .positive("Amount must be greater than zero.")
      .optional(),

    donationDate: z
      .string()
      .min(1, "Donation date is required.")
      .refine(
        (value) => !Number.isNaN(Date.parse(value)),
        "Please enter a valid donation date.",
      )
      .optional(),

    note: z.string().trim().optional(),
  })
  .refine(
    (data) =>
      data.amount !== undefined ||
      data.donationDate !== undefined ||
      data.note !== undefined,
    "At least one field must be provided for update.",
  );