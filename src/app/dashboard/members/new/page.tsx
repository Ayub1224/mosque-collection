"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  memberSchema,
  type MemberFormValues,
} from "@/lib/validations/member.schema";

export default function AddMemberPage() {
  const router = useRouter();
  const [today, setToday] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      address: "",
      joiningDate: "",
    },
  });

  // Set the current date after mounting to avoid prerendering issues.
  useEffect(() => {
    const currentDate = new Date().toLocaleDateString("en-CA");
    setToday(currentDate);
    setValue("joiningDate", currentDate);
  }, [setValue]);


const onSubmit = async (values: MemberFormValues) => {
  setSubmitMessage("");

  try {
    const response = await fetch("/api/members", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(values),
    });

    const data = await response.json();

    if (response.status === 409) {
      setError("phoneNumber", {
        type: "server",
        message: "This phone number is already registered.",
      });
      return;
    }

    if (response.status === 400) {
      const properties = data.errors?.properties;

      const fields = [
        "fullName",
        "phoneNumber",
        "address",
        "joiningDate",
      ] as const;

      fields.forEach((field) => {
        const message = properties?.[field]?.errors?.[0];

        if (message) {
          setError(field, {
            type: "server",
            message,
          });
        }
      });

      return;
    }

    if (response.status === 401) {
      setSubmitMessage(
        "Your session has expired. Please log in again.",
      );
      return;
    }

    if (!response.ok || !data.success) {
      setSubmitMessage(
        data.message || "Unable to register member. Please try again.",
      );
      return;
    }

    setSubmitMessage("Member registered successfully!");

    router.push("/dashboard/members");
    router.refresh();
  } catch (error) {
    console.error("Member registration failed:", error);

    setSubmitMessage(
      "Something went wrong. Please check your connection and try again.",
    );
  }
};


  const inputClass =
    "h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#172B4D] outline-none transition placeholder:text-[#94A3B8] focus:border-[#17365D] focus:ring-2 focus:ring-[#17365D]/10";

  const textareaClass =
    "w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-[#172B4D] outline-none transition placeholder:text-[#94A3B8] focus:border-[#17365D] focus:ring-2 focus:ring-[#17365D]/10";

  const errorClass = "mt-1 text-xs text-red-600";

  return (
    <section className="mx-auto max-w-[680px] space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#64748B]">
        <Link href="/dashboard/members" className="hover:text-[#102744]">
          Members
        </Link>
        <span>/</span>
        <span className="font-medium text-[#172B4D]">Add Member</span>
      </div>

      {/* Heading */}
      <div className="flex items-start gap-3">
        <Link
          href="/dashboard/members"
          aria-label="Back to members"
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#17365D] hover:bg-[#F5F7FA]"
        >
          ←
        </Link>

        <div>
          <h1 className="text-2xl font-semibold text-[#102744]">
            Add New Member
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Register a new member in the mosque directory.
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm sm:p-6"
        noValidate
      >
        {/* Form heading */}
        <div className="mb-6 flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <h2 className="text-sm font-semibold text-[#102744]">
            Member Information
          </h2>

          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
            ● Active by default
          </span>
        </div>

        <div className="space-y-5">
          {/* Full Name and Phone */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block text-xs font-medium text-[#172B4D]"
              >
                Full Name <span className="text-red-500">*</span>
              </label>

              <input
                id="fullName"
                type="text"
                placeholder="Enter member's full name"
                autoComplete="name"
                aria-invalid={!!errors.fullName}
                className={inputClass}
                {...register("fullName")}
              />

              {errors.fullName && (
                <p className={errorClass}>{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="phoneNumber"
                className="mb-2 block text-xs font-medium text-[#172B4D]"
              >
                Phone Number <span className="text-red-500">*</span>
              </label>

              <div className="flex h-10 overflow-hidden rounded-lg border border-[#E2E8F0] focus-within:border-[#17365D] focus-within:ring-2 focus-within:ring-[#17365D]/10">
                <span className="flex items-center border-r border-[#E2E8F0] bg-[#F5F7FA] px-3 text-sm text-[#64748B]">
                  +91
                </span>

                <input
                  id="phoneNumber"
                  type="tel"
                  inputMode="numeric"
                  placeholder="Enter phone number"
                  autoComplete="tel-national"
                  aria-invalid={!!errors.phoneNumber}
                  className="min-w-0 flex-1 px-3 text-sm text-[#172B4D] outline-none placeholder:text-[#94A3B8]"
                  {...register("phoneNumber")}
                />
              </div>

              <p className="mt-1.5 text-[11px] text-[#64748B]">
                Each phone number can be registered only once.
              </p>

              {errors.phoneNumber && (
                <p className={errorClass}>{errors.phoneNumber.message}</p>
              )}
            </div>
          </div>

          {/* Joining Date */}
          <div className="sm:max-w-[50%]">
            <label
              htmlFor="joiningDate"
              className="mb-2 block text-xs font-medium text-[#172B4D]"
            >
              Joining Date <span className="text-red-500">*</span>
            </label>

            <input
              id="joiningDate"
              type="date"
              max={today || undefined}
              aria-invalid={!!errors.joiningDate}
              className={inputClass}
              {...register("joiningDate")}
            />

            {errors.joiningDate && (
              <p className={errorClass}>{errors.joiningDate.message}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label
              htmlFor="address"
              className="mb-2 block text-xs font-medium text-[#172B4D]"
            >
              Address{" "}
              <span className="font-normal text-[#64748B]">(Optional)</span>
            </label>

            <textarea
              id="address"
              rows={2}
              placeholder="Enter residential address"
              autoComplete="street-address"
              aria-invalid={!!errors.address}
              className={textareaClass}
              {...register("address")}
            />

            {errors.address && (
              <p className={errorClass}>{errors.address.message}</p>
            )}
          </div>
        </div>

        {/* Submission message */}
        {submitMessage && (
          <p
            role="status"
            className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs leading-5 text-blue-800"
          >
            {submitMessage}
          </p>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-col-reverse justify-end gap-3 border-t border-[#E2E8F0] pt-4 sm:flex-row">
          <Link
            href="/dashboard/members"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white px-5 text-sm font-medium text-[#17365D] hover:bg-[#F5F7FA]"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting || !today}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#102744] px-5 text-sm font-medium text-white transition hover:bg-[#17365D] disabled:cursor-not-allowed disabled:opacity-60"
          >
          {isSubmitting ? "Saving..." : "Save Member"}
          </button>
        </div>
      </form>
    </section>
  );
}
