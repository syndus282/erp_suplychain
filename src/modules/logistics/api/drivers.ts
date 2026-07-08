import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createCrudApi } from "@/lib/api/crud-factory";
import { optionalDateInput } from "@/lib/api/validation";

const createSchema = z.object({
  employeeId: z.string().min(1, "Phải chọn nhân viên"),
  licenseNo: z.string().optional(),
  licenseType: z.string().optional(),
  licenseExpiry: optionalDateInput(),
});

const updateSchema = createSchema.omit({ employeeId: true }).partial();

export const driverApi = createCrudApi({
  resource: "driver",
  delegate: prisma.driver,
  createSchema,
  updateSchema,
  defaultSort: { id: "asc" },
  include: { employee: true },
});
