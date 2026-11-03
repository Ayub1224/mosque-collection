import { z } from "zod";

export const adminProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters.")
    .max(100, "Name cannot exceed 100 characters."),

  designation: z
    .string()
    .trim()
    .min(2, "Designation must contain at least 2 characters.")
    .max(80, "Designation cannot exceed 80 characters."),
});

export type AdminProfileFormValues = z.infer<
  typeof adminProfileSchema
>;