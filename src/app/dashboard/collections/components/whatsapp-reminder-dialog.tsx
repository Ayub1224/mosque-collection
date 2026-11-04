
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Check,
  Copy,
  Download,
  MessageCircle,
  Share2,
  X,
} from "lucide-react";

import type { Member } from "@/types/member";
import { buildMonthlyContributionMessage } from "@/lib/whatsapp/message-templates";

interface WhatsAppReminderDialogProps {
  open: boolean;
  onClose: () => void;
  member: Member;
  month: number;
  year: number;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const QR_CODE_PATH = "/contribution-qr.jpeg";

type ShareStatus = "idle" | "sharing" | "completed" | "unsupported" | "error";

export default function WhatsAppReminderDialog({
  open,
  onClose,
  member,
  month,
  year,
}: WhatsAppReminderDialogProps) {
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState("");

  const [shareStatus, setShareStatus] = useState<ShareStatus>("idle");
  const [copied, setCopied] = useState(false);

  const monthName = MONTHS[month - 1];

  const message = buildMonthlyContributionMessage({
    memberName: member.fullName,
    month: monthName,
    year,
  });

  // Load the QR image as a File before the user clicks Share.
  useEffect(() => {
    if (!open) return;

    let isMounted = true;

    async function loadQrCode() {
      setQrLoading(true);
      setQrFile(null);
      setQrError("");
      setShareStatus("idle");
      setCopied(false);

      try {
        const response = await fetch(QR_CODE_PATH);

        if (!response.ok) {
          throw new Error("QR code image not found.");
        }

        const blob = await response.blob();

        if (!blob.type.startsWith("image/")) {
          throw new Error("Invalid QR code image.");
        }

        const file = new File(
          [blob],
          "contribution-qr.png",
          { type: blob.type },
        );

        if (isMounted) {
          setQrFile(file);
        }
      } catch {
        if (isMounted) {
          setQrError(
            "Unable to load QR code. Please check the public folder.",
          );
        }
      } finally {
        if (isMounted) {
          setQrLoading(false);
        }
      }
    }

    loadQrCode();

    return () => {
      isMounted = false;
    };
  }, [open]);

  // Share message and QR code together.
  async function handleShare() {
    if (!qrFile) return;

    const shareData: ShareData = {
      title: "Masjid ka Chanda",
      text: message,
      files: [qrFile],
    };

    if (
      typeof navigator.share !== "function" ||
      typeof navigator.canShare !== "function" ||
      !navigator.canShare({ files: [qrFile] })
    ) {
      setShareStatus("unsupported");
      return;
    }

    try {
      setShareStatus("sharing");

      await navigator.share(shareData);

      setShareStatus("completed");
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setShareStatus("idle");
        return;
      }

      setShareStatus("error");
    }
  }

  // Copy message separately as a fallback.
  async function handleCopyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  // Download QR code separately as a fallback.
  function handleDownloadQr() {
    if (!qrFile) return;

    const url = URL.createObjectURL(qrFile);
    const link = document.createElement("a");

    link.href = url;
    link.download = "contribution-qr.png";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#102744]/40 p-3 sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="whatsapp-reminder-title"
        className="flex max-h-[90vh] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E2E8F0] px-5 py-5 sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-[#16834A]" />

              <h2
                id="whatsapp-reminder-title"
                className="text-lg font-semibold text-[#102744]"
              >
                WhatsApp Reminder
              </h2>
            </div>

            <p className="mt-1 text-sm text-[#64748B]">
              Prepare a personalized chanda reminder.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-2 text-[#64748B] transition hover:bg-[#F5F7FA]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5 overflow-y-auto p-5 sm:p-6">

          {/* Member Details */}
          <div className="rounded-xl bg-[#F5F7FA] p-4">
            <p className="text-xs font-medium text-[#64748B]">
              REMINDER FOR
            </p>

            <p className="mt-1 text-sm font-semibold text-[#102744]">
              {member.fullName}
            </p>

            <p className="mt-1 text-xs text-[#64748B]">
              {member.phoneNumber}
            </p>

            <div className="mt-3 border-t border-[#E2E8F0] pt-3">
              <p className="text-xs text-[#64748B]">
                Contribution month
              </p>

              <p className="mt-1 text-sm font-medium text-[#172B4D]">
                {monthName} {year}
              </p>
            </div>
          </div>

          {/* Message Preview */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#172B4D]">
                Message Preview
              </h3>

              <span className="text-[11px] text-[#64748B]">
                Hinglish
              </span>
            </div>

            <div className="whitespace-pre-wrap rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-sm leading-6 text-[#334155]">
              {message}
            </div>
          </div>

          {/* QR Code Preview */}
          <div>
            <h3 className="text-sm font-semibold text-[#172B4D]">
              Masjid Contribution QR Code
            </h3>

            {qrLoading ? (
              <p className="mt-3 text-center text-sm text-[#64748B]">
                Loading QR code...
              </p>
            ) : qrError ? (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4 text-center">
                <p className="text-sm text-red-600">{qrError}</p>
              </div>
            ) : (
              <div className="mt-3 flex justify-center rounded-xl border border-[#E2E8F0] bg-white p-4">
                <Image
                  src={QR_CODE_PATH}
                  alt="Masjid contribution QR code"
                  width={220}
                  height={220}
                  className="h-auto max-w-[220px] object-contain"
                />
              </div>
            )}
          </div>

          {/* Primary Share Action */}
          <button
            type="button"
            onClick={handleShare}
            disabled={!qrFile || qrLoading || shareStatus === "sharing"}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#16834A] px-4 text-sm font-medium text-white transition hover:bg-[#116B3C] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Share2 size={17} />

            {shareStatus === "sharing"
              ? "Opening share menu..."
              : "Share Message + QR Code"}
          </button>

          {shareStatus === "completed" && (
            <p className="text-center text-xs text-[#16834A]">
              Share action completed. Please confirm the message was sent in WhatsApp.
            </p>
          )}

          {shareStatus === "unsupported" && (
            <p className="text-center text-xs text-[#B45309]">
              Your browser does not support sharing image files. Use the fallback options below.
            </p>
          )}

          {shareStatus === "error" && (
            <p className="text-center text-xs text-red-600">
              Unable to share. Please try the fallback options.
            </p>
          )}

          {/* Fallback Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleCopyMessage}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-medium text-[#17365D] transition hover:bg-[#F5F7FA]"
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? "Copied" : "Copy Message"}
            </button>

            <button
              type="button"
              onClick={handleDownloadQr}
              disabled={!qrFile}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-medium text-[#17365D] transition hover:bg-[#F5F7FA] disabled:opacity-50"
            >
              <Download size={15} />
              Download QR
            </button>
          </div>

          {/* Instructions */}
          <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3">
            <p className="text-xs font-semibold text-[#172B4D]">
              How to send?
            </p>

            <p className="mt-1 text-xs leading-5 text-[#64748B]">
              Select WhatsApp from the share menu, choose the member's chat,
              and send the prepared message with the QR code attached.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#E2E8F0] bg-[#F8FAFC] px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-4 text-sm font-medium text-[#17365D] transition hover:bg-[#F5F7FA]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
