"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { useMember } from "@/hooks/members/use-member";
import { useUpdateMember } from "@/hooks/members/use-update-member";
import {
  memberSchema,
  type MemberFormValues,
} from "@/lib/validations/member.schema";

export default function EditMemberPage() {
  const router = useRouter();
  const params = useParams<{ memberId: string }>();
  const memberId = params.memberId;

  const [today, setToday] = useState("");

  const { data: member, isLoading, isError, error } = useMember(memberId);
  const updateMemberMutation = useUpdateMember();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      address: "",
      joiningDate: "",
    },
  });

  // Set today's date after mounting.
  useEffect(() => {
    setToday(new Date().toLocaleDateString("en-CA"));
  }, []);

  // Populate the form once member details are fetched.
  useEffect(() => {
    if (!member) return;

    reset({
      fullName: member.fullName,
      phoneNumber: member.phoneNumber.startsWith("+91")
        ? member.phoneNumber.slice(3)
        : member.phoneNumber,
      address: member.address || "",
      joiningDate: member.joiningDate,
    });
  }, [member, reset]);

  const onSubmit = async (values: MemberFormValues) => {
    try {
      await updateMemberMutation.mutateAsync({
        memberId,
        input: values,
      });

      toast.success("Member updated successfully.");
      router.push("/dashboard/members");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to update member.";

      if (message.toLowerCase().includes("already registered")) {
        setError("phoneNumber", {
          type: "server",
          message: "This phone number is already registered.",
        });
        return;
      }

      toast.error(message);
    }
  };

  const inputClass =
    "h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#172B4D] outline-none transition placeholder:text-[#94A3B8] focus:border-[#17365D] focus:ring-2 focus:ring-[#17365D]/10";

  const textareaClass =
    "w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-[#172B4D] outline-none transition placeholder:text-[#94A3B8] focus:border-[#17365D] focus:ring-2 focus:ring-[#17365D]/10";

  const errorClass = "mt-1 text-xs text-red-600";

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-8 text-center text-sm text-[#64748B]">
        Loading member details...
      </div>
    );
  }

  if (isError || !member) {
    return (
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-8 text-center">
        <p className="text-sm text-red-600">
          {error instanceof Error ? error.message : "Member not found."}
        </p>

        <Link
          href="/dashboard/members"
          className="mt-4 inline-block text-sm font-medium text-[#17365D] hover:underline"
        >
          Back to Members
        </Link>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-[680px] space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#64748B]">
        <Link href="/dashboard/members" className="hover:text-[#102744]">
          Members
        </Link>
        <span>/</span>
        <span className="font-medium text-[#172B4D]">Edit Member</span>
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
            Edit Member
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Update member information.
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm sm:p-6"
        noValidate
      >
        <div className="mb-6 flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <h2 className="text-sm font-semibold text-[#102744]">
            Member Information
          </h2>

          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
              member.status === "Active"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border border-gray-200 bg-gray-100 text-gray-600"
            }`}
          >
            {member.status}
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
            disabled={updateMemberMutation.isPending}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#102744] px-5 text-sm font-medium text-white transition hover:bg-[#17365D] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {updateMemberMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </section>
  );
}