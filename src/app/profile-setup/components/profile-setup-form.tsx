"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  adminProfileSchema,
  type AdminProfileFormValues,
} from "@/lib/validations/admin-profile.schema";

type ProfileSetupFormProps = {
  adminEmail: string;
  initialValues: AdminProfileFormValues;
};

export default function ProfileSetupForm({
  adminEmail,
  initialValues,
}: ProfileSetupFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminProfileFormValues>({
    resolver: zodResolver(adminProfileSchema),
    defaultValues: initialValues,
  });

  async function onSubmit(values: AdminProfileFormValues) {
    setServerError("");

    try {
      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (!response.ok) {
        setServerError(result.message ?? "Unable to save profile.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  }

  const inputClass =
    "mt-2 w-full rounded-lg border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#172B4D] outline-none transition focus:border-[#17365D] focus:ring-2 focus:ring-[#17365D]/10";

  return (
    <div className="w-full max-w-lg rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm sm:p-9">
      <div className="mb-8">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#102744] text-white">
          <span className="text-xl">☾</span>
        </div>

        <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
          Administrator profile
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#102744]">
          Welcome to your workspace
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#64748B]">
          Complete your profile to personalize your mosque management
          dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="text-sm font-medium text-[#172B4D]">
            Google account
          </label>
          <input
            value={adminEmail}
            disabled
            className={`${inputClass} cursor-not-allowed bg-[#F5F7FA] text-[#64748B]`}
          />
        </div>

        <div>
          <label htmlFor="name" className="text-sm font-medium text-[#172B4D]">
            Full name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            {...register("name")}
            placeholder="Enter your name"
            className={inputClass}
          />
          {errors.name && (
            <p className="mt-1.5 text-xs text-red-600">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="designation"
            className="text-sm font-medium text-[#172B4D]"
          >
            Designation <span className="text-red-500">*</span>
          </label>
          <input
            id="designation"
            {...register("designation")}
            placeholder="e.g. President, Treasurer, Secretary"
            className={inputClass}
          />
          {errors.designation && (
            <p className="mt-1.5 text-xs text-red-600">
              {errors.designation.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-[#172B4D]">
              Language
            </label>
            <input
              value="English"
              disabled
              className={`${inputClass} cursor-not-allowed bg-[#F5F7FA]`}
            />
            <p className="mt-1 text-[11px] text-[#94A3B8]">
              Coming soon
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-[#172B4D]">
              Theme
            </label>
            <input
              value="Blue"
              disabled
              className={`${inputClass} cursor-not-allowed bg-[#F5F7FA]`}
            />
            <p className="mt-1 text-[11px] text-[#94A3B8]">
              Coming soon
            </p>
          </div>
        </div>

        {serverError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center rounded-lg bg-[#102744] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#17365D] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Saving profile..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}