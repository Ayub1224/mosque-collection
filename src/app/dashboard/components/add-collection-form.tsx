"use client";

import { ArrowLeft, UserRound, X } from "lucide-react";
import type { Member } from "@/types/member";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { collectionSchema } from "@/lib/validations/collection.schema";
import type { z } from "zod";
import { useState } from "react";
import { useCreateCollection } from "@/hooks/collections/useCreateCollection";
import type { Collection } from "@/types/collection";
import CollectionSuccessDialog from "../collections/components/collection-success-dialog";
import { useLanguage } from "./admin-profile-context";

interface AddCollectionFormProps {
  member: Member;
  onChangeMember: () => void;
  onClose: () => void;
}

export default function AddCollectionForm({
  member,
  onChangeMember,
  onClose,
}: AddCollectionFormProps) {
  const { t, language } = useLanguage();
  const createCollectionMutation = useCreateCollection();
  const [submitError, setSubmitError] = useState("");
  const [savedCollection, setSavedCollection] = useState<Collection | null>(
    null,
  );

  type CollectionFormValues = z.input<typeof collectionSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      memberId: member.memberId,
      amount: 0,
      donationDate: new Date().toLocaleDateString("en-CA"),
      note: "",
    },
  });

  const onSubmit = async (values: CollectionFormValues) => {
    setSubmitError("");

    try {
      const validatedValues = collectionSchema.parse({
        ...values,
        memberId: member.memberId,
      });

      const createdCollection =
        await createCollectionMutation.mutateAsync(validatedValues);

      setSavedCollection(createdCollection);
    } catch (error) {
      console.error("Failed to create collection:", error);

      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to save collection. Please try again.",
      );
    }
  };

  const amountValue = watch("amount");

  const initials = member.fullName
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  if (savedCollection) {
    return (
      <CollectionSuccessDialog
        collection={savedCollection}
        member={member}
        onAddAnother={() => {
          reset({
            memberId: member.memberId,
            amount: 0,
            donationDate: new Date().toLocaleDateString("en-CA"),
            note: "",
          });

          setSubmitError("");
          setSavedCollection(null);
        }}
        onDone={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102744]/40 p-3 backdrop-blur-sm sm:p-5">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-collection-form-title"
        className="flex max-h-[90vh] w-full max-w-[560px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
      >
        {/* Decorative accent */}
        <div className="h-1.5 w-full bg-[#102744]" />

        {/* Header */}
        <div className="flex items-start justify-between px-5 pb-3 pt-5 sm:px-6">
          <div>
            <h2
              id="add-collection-form-title"
              className="text-xl font-semibold text-[#102744]"
            >
              {t("collection.add")}
            </h2>

            <p className="mt-1 text-sm text-[#64748B]">
              {t("collection.addDescription")}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t("collection.close")}
            className="rounded-lg p-2 text-[#64748B] transition hover:bg-[#F5F7FA] hover:text-[#102744]"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Form content */}
          <div className="space-y-5 overflow-y-auto px-5 py-4 sm:px-6">
            {/* Selected member */}
            <div className="flex items-center justify-between gap-3 rounded-lg bg-[#F5F7FA] p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#17365D] text-sm font-semibold text-white">
                  {initials || <UserRound size={18} />}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-[#172B4D]">
                      {member.fullName}
                    </p>

                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        member.status === "Active"
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {member.status}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-[#64748B]">
                    Serial No. {member.serialNo} · {member.phoneNumber}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onChangeMember}
                className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[#17365D] transition hover:bg-white"
              >
                <ArrowLeft size={14} />
                {t("collection.changeMember")}
              </button>
            </div>

            {/* Contribution Amount */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="collection-amount"
                  className="text-sm font-medium text-[#172B4D]"
                >
                  {t("collection.contributionAmount")} <span className="text-red-500">*</span>
                </label>

                <span className="text-[10px] font-medium uppercase tracking-wider text-[#94A3B8]">
                  INR
                </span>
              </div>

              <div className="flex h-14 items-center rounded-lg bg-[#F5F7FA] px-4 transition focus-within:bg-white focus-within:ring-2 focus-within:ring-[#17365D]/10">
                <span className="mr-3 text-2xl font-semibold text-[#102744]">
                  ₹
                </span>

                <input
                  id="collection-amount"
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  {...register("amount", { valueAsNumber: true })}
                  placeholder="0"
                  className="h-full min-w-0 flex-1 bg-transparent text-2xl font-semibold text-[#102744] outline-none placeholder:text-[#94A3B8]"
                />
              </div>
              {errors.amount && (
                <p className="text-xs text-red-600">{errors.amount.message}</p>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 text-[11px] font-medium uppercase text-[#64748B]">
                  {t("collection.addAmount")}
                </span>

                {[500, 1000, 2000, 5000].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setValue("amount", (Number(amountValue) || 0) + value, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    className="rounded-full bg-[#F5F7FA] px-3 py-1.5 text-xs font-medium text-[#17365D] transition hover:bg-[#E8EEF5]"
                  >
                    + ₹{value.toLocaleString(language === "hi" ? "hi-IN" : "en-IN")}
                  </button>
                ))}
              </div>

              <p className="text-xs text-[#94A3B8]">
                {t("collection.rupeesOnly")}
              </p>
            </div>

            {/* Donation Date */}
            <div className="space-y-2">
              <label
                htmlFor="collection-date"
                className="block text-sm font-medium text-[#172B4D]"
              >
                {t("collection.received")} <span className="text-red-500">*</span>
              </label>

              <input
                id="collection-date"
                type="date"
                {...register("donationDate")}
                className="h-11 w-full rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] px-3 text-sm text-[#172B4D] outline-none transition focus:border-[#17365D] focus:bg-white"
              />
              {errors.donationDate && (
                <p className="text-xs text-red-600">
                  {errors.donationDate.message}
                </p>
              )}
            </div>

            {/* Optional Note */}
            <div className="space-y-2">
              <label
                htmlFor="collection-note"
                className="block text-sm font-medium text-[#172B4D]"
              >
                {t("collection.note")} <span className="font-normal text-[#94A3B8]">{t("collection.optional")}</span>
              </label>

              <textarea
                id="collection-note"
                rows={3}
                {...register("note")}
                placeholder={t("collection.notePlaceholder")}
                className="w-full resize-none rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] px-3 py-2.5 text-sm text-[#172B4D] outline-none transition placeholder:text-[#94A3B8] focus:border-[#17365D] focus:bg-white"
              />
            </div>
          </div>

          {submitError && (
            <div className="mx-5 mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-6">
              {submitError}
            </div>
          )}

          {/* Footer */}
          <div className="flex flex-col-reverse gap-3 border-t border-[#E2E8F0] bg-[#F8FAFC] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-lg border border-[#E2E8F0] bg-white px-5 text-sm font-medium text-[#17365D] transition hover:bg-[#F5F7FA]"
            >
              {t("collection.cancel")}
            </button>

            <button
              type="submit"
              disabled={
                createCollectionMutation.isPending ||
                !amountValue ||
                Number(amountValue) <= 0
              }
              className="h-10 rounded-lg bg-[#102744] px-5 text-sm font-medium text-white transition hover:bg-[#17365D] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {createCollectionMutation.isPending
                ? t("collection.saving")
                : t("collection.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
