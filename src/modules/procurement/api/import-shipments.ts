import { z } from "zod";
import { ImportShipmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createCrudApi } from "@/lib/api/crud-factory";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { optionalDateInput } from "@/lib/api/validation";
import { generateCode } from "../lib/codegen";

const include = { supplier: true, entrustedImportUnit: true, purchaseOrder: true, documents: true };

const createSchema = z.object({
  poId: z.string().min(1, "Phải chọn đơn mua hàng"),
  supplierId: z.string().min(1, "Phải chọn nhà cung cấp"),
  entrustedImportUnitId: z.string().nullable().optional(),
  eta: optionalDateInput(),
  etd: optionalDateInput(),
  status: z.nativeEnum(ImportShipmentStatus).optional(),
});

const updateSchema = createSchema.partial().extend({
  actualArrivalDate: optionalDateInput(),
});

// Chỉ dùng factory cho list/update — create cần sinh `code` tự động nên viết riêng.
const { list, update } = createCrudApi({
  resource: "import-shipment",
  delegate: prisma.importShipment,
  createSchema,
  updateSchema,
  sortableFields: ["code", "createdAt"],
  include,
});

export const listImportShipments = list;
export const updateImportShipment = update;

export async function createImportShipment(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "import-shipment", "create");

  const input = createSchema.parse(await request.json());
  const created = await prisma.importShipment.create({
    data: { ...input, companyId: session.companyId, code: generateCode("SHP") },
    include,
  });
  return apiSuccess(created, undefined, 201);
}
