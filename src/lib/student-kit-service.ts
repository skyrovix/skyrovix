import { createServerFn } from "@tanstack/react-start";
import type {
  StudentKitItem,
  StudentKitPurchaseItem,
  StudentKitsSummary,
  AdminStudentKitsData,
} from "./student-kit-service.server";

export type {
  StudentKitItem,
  StudentKitPurchaseItem,
  StudentKitsSummary,
  AdminStudentKitsData,
};

/**
 * Fetch student kits list for authenticated student with unlock status
 */
export const getStudentKitsFn = createServerFn({ method: "POST" })
  .validator((d: { applicationId?: string; userId?: string } | undefined) => d)
  .handler(async ({ data }) => {
    const { getStudentKitsDataServer } = await import("./student-kit-service.server");
    return getStudentKitsDataServer(data?.applicationId, data?.userId);
  });

/**
 * Unlock a student kit (Free for Premium, or after ₹20 payment for Standard)
 */
export const unlockStudentKitFn = createServerFn({ method: "POST" })
  .validator(
    (d: {
      kitId: string;
      applicationId?: string;
      userId?: string;
      paymentId?: string;
      amount?: number;
      paymentMethod?: string;
    }) => d
  )
  .handler(async ({ data }) => {
    const { unlockStudentKitServer } = await import("./student-kit-service.server");
    return unlockStudentKitServer(data);
  });

/**
 * Fetch all student kits & purchases for admin panel
 */
export const getAdminStudentKitsFn = createServerFn({ method: "POST" }).handler(
  async () => {
    const { getAdminStudentKitsServer } = await import("./student-kit-service.server");
    return getAdminStudentKitsServer();
  }
);

/**
 * Save / Update a Student Kit (Admin only)
 */
export const saveAdminStudentKitFn = createServerFn({ method: "POST" })
  .validator(
    (d: {
      id?: string;
      title: string;
      description?: string;
      pdf_url: string;
      cover_image_url?: string;
      price: number;
      is_free_for_premium?: boolean;
      is_active?: boolean;
      domain?: string;
      edition?: string;
    }) => d
  )
  .handler(async ({ data }) => {
    const { saveAdminStudentKitServer } = await import("./student-kit-service.server");
    return saveAdminStudentKitServer(data);
  });

/**
 * Delete a Student Kit (Admin only)
 */
export const deleteAdminStudentKitFn = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    const { deleteAdminStudentKitServer } = await import("./student-kit-service.server");
    return deleteAdminStudentKitServer(data.id);
  });

/**
 * Upload PDF or image asset for Student Kit (Admin only)
 */
export const uploadStudentKitAssetFn = createServerFn({ method: "POST" })
  .validator(
    (d: {
      filename: string;
      base64Data: string;
      type: "pdf" | "image";
    }) => d
  )
  .handler(async ({ data }) => {
    const { uploadStudentKitAssetServer } = await import("./student-kit-service.server");
    return uploadStudentKitAssetServer(data);
  });

