import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { businessRuleError, notFoundError, validationError } from "@/lib/api/errors";
import { parsePagination, parseSort, buildPageMeta } from "@/lib/api/pagination";
import { recordStockMovement, releaseReservation } from "@/modules/inventory/lib/stock-ledger";
import { generateCode } from "@/modules/procurement/lib/codegen";

const createSchema = z.object({
  warehouseId: z.string().min(1, "Phải chọn kho xuất hàng"),
  vehicleId: z.string().nullable().optional(),
  driverId: z.string().nullable().optional(),
  carrierId: z.string().nullable().optional(),
  deliveryRequestIds: z.array(z.string().min(1)).min(1, "Phải chọn ít nhất 1 yêu cầu giao hàng"),
});

const podSchema = z.object({
  receivedByName: z.string().optional(),
  signatureUrl: z.string().optional(),
  photoUrl: z.string().optional(),
  note: z.string().optional(),
});

const costSchema = z.object({
  shipmentId: z.string().min(1),
  type: z.enum(["FUEL", "TOLL", "THIRD_PARTY_CARRIER", "LOADING", "OTHER"]),
  amount: z.number().int().nonnegative(),
  currency: z.string().optional(),
});

const include = {
  warehouse: true,
  vehicle: true,
  driver: { include: { employee: true } },
  carrier: true,
  lines: { include: { product: true, deliveryRequest: true } },
  proofsOfDelivery: true,
  costs: true,
};

export async function listShipments(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "shipment", "read");

  const url = new URL(request.url);
  const { page, pageSize, skip, take } = parsePagination(url.searchParams);
  const orderBy = parseSort(url.searchParams, ["code", "createdAt"]);

  const where = { companyId: session.companyId };
  const [items, totalItems] = await Promise.all([
    prisma.shipment.findMany({ where, orderBy, skip, take, include }),
    prisma.shipment.count({ where }),
  ]);

  return apiSuccess(items, buildPageMeta(page, pageSize, totalItems));
}

export async function createShipment(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "shipment", "create");

  const input = createSchema.parse(await request.json());

  const warehouse = await prisma.warehouse.findUnique({ where: { id: input.warehouseId } });
  if (!warehouse || warehouse.companyId !== session.companyId) throw validationError("Kho không hợp lệ");

  const requests = await prisma.deliveryRequest.findMany({
    where: { id: { in: input.deliveryRequestIds }, companyId: session.companyId },
    include: { lines: true },
  });
  if (requests.length !== input.deliveryRequestIds.length) {
    throw validationError("Có yêu cầu giao hàng không hợp lệ");
  }
  const notDraft = requests.find((r) => r.status !== "DRAFT");
  if (notDraft) {
    throw businessRuleError("Chỉ có thể gom chuyến các yêu cầu giao hàng đang ở trạng thái Nháp", {
      rule: "DELIVERY_REQUEST_NOT_DRAFT",
      requestCode: notDraft.code,
      currentStatus: notDraft.status,
    });
  }

  const shipment = await prisma.$transaction(async (tx) => {
    const created = await tx.shipment.create({
      data: {
        companyId: session.companyId,
        code: generateCode("SHP"),
        warehouseId: input.warehouseId,
        vehicleId: input.vehicleId ?? undefined,
        driverId: input.driverId ?? undefined,
        carrierId: input.carrierId ?? undefined,
        status: "PLANNED",
        lines: {
          create: requests.flatMap((r) =>
            r.lines.map((l) => ({ deliveryRequestId: r.id, productId: l.productId, qty: l.qty }))
          ),
        },
      },
      include,
    });

    await tx.deliveryRequest.updateMany({
      where: { id: { in: requests.map((r) => r.id) } },
      data: { status: "PLANNED" },
    });

    return created;
  });

  return apiSuccess(shipment, undefined, 201);
}

export async function dispatchShipment(id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "shipment", "dispatch");

  const shipment = await prisma.shipment.findUnique({
    where: { id },
    include: { lines: { include: { deliveryRequest: true } } },
  });
  if (!shipment || shipment.companyId !== session.companyId) throw notFoundError();
  if (shipment.status !== "PLANNED") {
    throw businessRuleError("Chỉ có thể xuất kho chuyến hàng đang ở trạng thái Đã lên kế hoạch", {
      rule: "SHIPMENT_NOT_PLANNED",
      currentStatus: shipment.status,
    });
  }

  const updated = await prisma.$transaction(async (tx) => {
    for (const line of shipment.lines) {
      await recordStockMovement(tx, {
        companyId: session.companyId,
        warehouseId: shipment.warehouseId,
        productId: line.productId,
        type: "ISSUE",
        qty: -line.qty,
        refType: "Shipment",
        refId: shipment.id,
      });

      if (line.deliveryRequest.sourceType === "SALES_ORDER") {
        await releaseReservation(tx, {
          warehouseId: shipment.warehouseId,
          productId: line.productId,
          qty: line.qty,
        });
        const soLine = await tx.salesOrderLine.findFirst({
          where: { soId: line.deliveryRequest.sourceId, productId: line.productId },
        });
        if (soLine) {
          await tx.salesOrderLine.update({
            where: { id: soLine.id },
            data: { qtyDelivered: soLine.qtyDelivered + line.qty },
          });
        }
      }
    }

    const requestIds = [...new Set(shipment.lines.map((l) => l.deliveryRequestId))];
    await tx.deliveryRequest.updateMany({ where: { id: { in: requestIds } }, data: { status: "ON_DELIVERY" } });

    return tx.shipment.update({ where: { id }, data: { status: "ON_DELIVERY", shippedAt: new Date() }, include });
  });

  return apiSuccess(updated);
}

export async function recordProofOfDelivery(request: Request, id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "shipment", "pod");

  const input = podSchema.parse(await request.json().catch(() => ({})));

  const shipment = await prisma.shipment.findUnique({
    where: { id },
    include: { lines: { include: { deliveryRequest: true } } },
  });
  if (!shipment || shipment.companyId !== session.companyId) throw notFoundError();
  if (shipment.status !== "ON_DELIVERY") {
    throw businessRuleError("Chỉ có thể ghi nhận bằng chứng giao hàng khi chuyến đang giao (On Delivery)", {
      rule: "SHIPMENT_NOT_ON_DELIVERY",
      currentStatus: shipment.status,
    });
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.proofOfDelivery.create({ data: { shipmentId: id, ...input } });

    const requestIds = [...new Set(shipment.lines.map((l) => l.deliveryRequestId))];
    await tx.deliveryRequest.updateMany({ where: { id: { in: requestIds } }, data: { status: "DELIVERED" } });

    const soIds = [
      ...new Set(
        shipment.lines
          .map((l) => l.deliveryRequest)
          .filter((r) => r.sourceType === "SALES_ORDER")
          .map((r) => r.sourceId)
      ),
    ];
    for (const soId of soIds) {
      const so = await tx.salesOrder.findUnique({ where: { id: soId }, include: { lines: true } });
      if (so && so.lines.every((l) => l.qtyDelivered >= l.qty)) {
        await tx.salesOrder.update({ where: { id: soId }, data: { status: "DELIVERED" } });
      }
    }

    return tx.shipment.update({ where: { id }, data: { status: "DELIVERED" }, include });
  });

  return apiSuccess(updated);
}

export async function closeShipment(id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "shipment", "close");

  const shipment = await prisma.shipment.findUnique({ where: { id }, include: { lines: true } });
  if (!shipment || shipment.companyId !== session.companyId) throw notFoundError();
  if (shipment.status !== "DELIVERED") {
    throw businessRuleError("Chỉ có thể đóng chuyến hàng đã giao xong (Delivered)", {
      rule: "SHIPMENT_NOT_DELIVERED",
      currentStatus: shipment.status,
    });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const requestIds = [...new Set(shipment.lines.map((l) => l.deliveryRequestId))];
    await tx.deliveryRequest.updateMany({ where: { id: { in: requestIds } }, data: { status: "CLOSED" } });
    return tx.shipment.update({ where: { id }, data: { status: "CLOSED" }, include });
  });

  return apiSuccess(updated);
}

export async function listDeliveryCosts(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "delivery-cost", "read");

  const url = new URL(request.url);
  const shipmentId = url.searchParams.get("shipmentId");
  if (!shipmentId) throw validationError("Thiếu tham số shipmentId");

  const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });
  if (!shipment || shipment.companyId !== session.companyId) throw notFoundError();

  const costs = await prisma.deliveryCost.findMany({ where: { shipmentId } });
  return apiSuccess(costs);
}

export async function createDeliveryCost(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "delivery-cost", "create");

  const input = costSchema.parse(await request.json());
  const shipment = await prisma.shipment.findUnique({ where: { id: input.shipmentId } });
  if (!shipment || shipment.companyId !== session.companyId) throw validationError("Chuyến hàng không hợp lệ");

  const created = await prisma.deliveryCost.create({ data: { ...input, currency: input.currency ?? "VND" } });
  return apiSuccess(created, undefined, 201);
}
