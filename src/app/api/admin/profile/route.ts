
import { NextResponse } from "next/server";
import { auth, isAdminEmail } from "@/auth";
import {
  getAdminProfileByEmail,
  saveAdminProfile,
} from "@/lib/admin-profiles";
import { adminLanguageSchema, adminProfileSchema } from "@/lib/validations/admin-profile.schema";
import { z } from "zod";

async function getAuthorizedAdminEmail() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email || !isAdminEmail(email)) {
    return null;
  }

  return email.trim().toLowerCase();
}

export async function GET() {
  try {
    const email = await getAuthorizedAdminEmail();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 },
      );
    }

    const profile = await getAdminProfileByEmail(email);

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Fetch admin profile error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch admin profile.",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const email = await getAuthorizedAdminEmail();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 },
      );
    }

    const body: unknown = await request.json();
    const validation = adminProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Please check your profile details.",
          errors: z.treeifyError(validation.error),
        },
        { status: 400 },
      );
    }

    const profile = await saveAdminProfile({
      email,
      name: validation.data.name,
      designation: validation.data.designation,
      language: validation.data.language,
    });

    return NextResponse.json({
      success: true,
      message: "Profile saved successfully.",
      profile,
    });
  } catch (error) {
    console.error("Save admin profile error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to save admin profile.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const email = await getAuthorizedAdminEmail();
    if (!email) return NextResponse.json({ success: false, message: "Unauthorized access." }, { status: 401 });
    const validation = adminLanguageSchema.safeParse(await request.json());
    if (!validation.success) return NextResponse.json({ success: false, message: "Please select a supported language." }, { status: 400 });
    const existing = await getAdminProfileByEmail(email);
    if (!existing?.profileCompleted) return NextResponse.json({ success: false, message: "Complete your profile first." }, { status: 409 });
    const profile = await saveAdminProfile({ email, name: existing.name, designation: existing.designation, language: validation.data.language });
    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error("Update admin language error:", error);
    return NextResponse.json({ success: false, message: "Unable to update language." }, { status: 500 });
  }
}
