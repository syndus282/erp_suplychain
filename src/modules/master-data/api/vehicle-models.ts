import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createCrudApi } from "@/lib/api/crud-factory";

const createSchema = z.object({
  make: z.string().min(1, "Hãng xe không được để trống"),
  model: z.string().min(1, "Model không được để trống"),
  yearFrom: z.number().int().optional(),
  yearTo: z.number().int().optional(),
  engine: z.string().optional(),
  fuelType: z.string().optional(),
});

const updateSchema = createSchema.partial();

export const vehicleModelsApi = createCrudApi({
  resource: "vehicle-model",
  delegate: prisma.vehicleModel,
  createSchema,
  updateSchema,
  searchFields: ["make", "model"],
  sortableFields: ["make", "model", "createdAt"],
});
