"use server";

import { revalidatePath } from "next/cache";

import { getSession, logout } from "@/lib/auth";
import { deletePrescription, undoPrescriptionIssued, usePrescriptionPacks } from "@/services/prescription-service";

export async function usePacksAction(id: string, packs: number) {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  await usePrescriptionPacks(id, packs);
  revalidatePath("/dashboard");
  revalidatePath("/people");
  revalidatePath("/notifications");
}

export async function undoIssuedAction(id: string) {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  await undoPrescriptionIssued(id);
  revalidatePath("/dashboard");
  revalidatePath("/people");
  revalidatePath("/notifications");
}

export async function deletePrescriptionAction(id: string) {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  await deletePrescription(id);
  revalidatePath("/dashboard");
  revalidatePath("/people");
  revalidatePath("/notifications");
}

export async function logoutAction() {
  await logout();
  revalidatePath("/");
}
