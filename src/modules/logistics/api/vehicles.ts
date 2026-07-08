import { z } from "zod";
import { VehicleStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createCrudApi } from "@/lib/api/crud-factory";

const createSchema = z.object({
  plateNumber: z.string().min(1, "Biển số không được để trống"),
  type: z.string().optional(),
  capacity: z.number().nonnegative().optional(),
  status: z.nativeEnum(VehicleStatus).optional(),
});

const updateSchema = createSchema.partial();

export const vehicleApi = createCrudApi({
  resource: "vehicle",
  delegate: prisma.vehicle,
  createSchema,
  updateSchema,
  searchFields: ["plateNumber"],
  sortableFields: ["plateNumber", "createdAt"],
});
