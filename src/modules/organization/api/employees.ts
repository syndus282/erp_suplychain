import { z } from "zod";
import { EmployeeType, MasterDataStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createCrudApi } from "@/lib/api/crud-factory";
import { optionalDateInput } from "@/lib/api/validation";

const createSchema = z.object({
  code: z.string().min(1, "Mã nhân viên không được để trống"),
  fullName: z.string().min(1, "Họ tên không được để trống"),
  phone: z.string().optional(),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  departmentId: z.string().nullable().optional(),
  positionId: z.string().nullable().optional(),
  managerId: z.string().nullable().optional(),
  hireDate: optionalDateInput(),
  employeeType: z.nativeEnum(EmployeeType).optional(),
  status: z.nativeEnum(MasterDataStatus).optional(),
});

const updateSchema = createSchema.partial();

export const employeesApi = createCrudApi({
  resource: "employee",
  delegate: prisma.employee,
  createSchema,
  updateSchema,
  searchFields: ["code", "fullName", "email"],
  sortableFields: ["code", "fullName", "createdAt"],
  include: { department: true, position: true, manager: { select: { id: true, fullName: true } } },
});
