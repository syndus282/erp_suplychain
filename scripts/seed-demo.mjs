// Script tạo dữ liệu mẫu phong phú cho MỌI module để xem/demo UI — KHÔNG phải
// seed bắt buộc để hệ thống chạy được (đó là prisma/seed.ts). Chạy sau khi
// đã `npm run prisma:seed` và `npm run dev` đang chạy.
//
// Cách chạy: node scripts/seed-demo.mjs [base_url]
//   node scripts/seed-demo.mjs                 # mặc định http://localhost:3000
//   node scripts/seed-demo.mjs http://localhost:2605
//
// Script gọi thẳng qua HTTP API (giống hệt cách UI gọi) thay vì insert thẳng
// Prisma, để mọi rule nghiệp vụ (transaction, validation, tính toán) đều
// chạy đúng như thật — không tạo dữ liệu "giả" bỏ qua business logic.

const BASE = process.argv[2] || "http://localhost:3000";

let step = 0;
function log(msg) {
  step += 1;
  console.log(`[${String(step).padStart(3, "0")}] ${msg}`);
}
function warn(msg) {
  console.warn(`      ⚠ ${msg}`);
}

async function login(username, password) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const setCookie = res.headers.get("set-cookie");
  if (!setCookie) throw new Error(`Đăng nhập thất bại cho user "${username}": ${await res.text()}`);
  return setCookie.split(";")[0];
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Gọi API, trả về `data` nếu success, ném lỗi rõ ràng nếu không — trừ khi
 * allowFail=true (trả về null, log cảnh báo). Next.js dev server thỉnh
 * thoảng trả JSON rỗng/parse lỗi khi đang hot-reload route lần đầu dưới tải
 * dồn dập của script này — retry 1 lần cho trường hợp transient đó trước khi
 * coi là lỗi thật.
 */
async function api(cookie, method, path, body, { allowFail = false, _retried = false } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    if (!_retried) {
      await sleep(300);
      return api(cookie, method, path, body, { allowFail, _retried: true });
    }
    json = { success: false, error: { message: `Không parse được JSON (status ${res.status}): ${text.slice(0, 200)}` } };
  }
  if (!json.success) {
    const msg = `${method} ${path} thất bại: ${json.error?.code} - ${json.error?.message} ${
      json.error?.details ? JSON.stringify(json.error.details) : ""
    }`;
    if (allowFail) {
      warn(msg);
      return null;
    }
    throw new Error(msg);
  }
  return json.data;
}

async function main() {
  console.log(`Seed demo data vào ${BASE} ...\n`);

  const admin = await login("admin", "Admin@123456");
  const manager = await login("manager", "Manager@123456");
  log("Đăng nhập admin + manager thành công");

  // ===================================================================
  // 1. TỔ CHỨC (org)
  // ===================================================================
  const branchHN = await api(admin, "POST", "/api/org/branches", {
    code: "CN-HN",
    name: "Chi nhánh Hà Nội",
    type: "BRANCH",
    address: "12 Trần Duy Hưng, Cầu Giấy, Hà Nội",
  });
  const branchHCM = await api(admin, "POST", "/api/org/branches", {
    code: "CN-HCM",
    name: "Trụ sở chính TP.HCM",
    type: "HEAD_OFFICE",
    address: "88 Nguyễn Huệ, Quận 1, TP.HCM",
  });
  log("Tạo 2 chi nhánh (HN, HCM)");

  const deptSales = await api(admin, "POST", "/api/org/departments", {
    code: "PB-KD",
    name: "Phòng Kinh doanh",
    branchId: branchHCM.id,
  });
  const deptWarehouse = await api(admin, "POST", "/api/org/departments", {
    code: "PB-KHO",
    name: "Phòng Kho vận",
    branchId: branchHCM.id,
  });
  const deptAccounting = await api(admin, "POST", "/api/org/departments", {
    code: "PB-KT",
    name: "Phòng Kế toán",
    branchId: branchHCM.id,
  });
  log("Tạo 3 phòng ban");

  const posSalesRep = await api(admin, "POST", "/api/org/positions", { code: "CV-NVKD", name: "Nhân viên kinh doanh" });
  const posWarehouseKeeper = await api(admin, "POST", "/api/org/positions", { code: "CV-THUKHO", name: "Thủ kho" });
  const posAccountant = await api(admin, "POST", "/api/org/positions", { code: "CV-KTV", name: "Kế toán viên" });
  log("Tạo 3 chức vụ");

  const empSalesA = await api(admin, "POST", "/api/org/employees", {
    code: "EMP-001",
    fullName: "Nguyễn Văn An",
    phone: "0901111111",
    email: "an.nguyen@example.com",
    departmentId: deptSales.id,
    positionId: posSalesRep.id,
    employeeType: "FULL_TIME",
    hireDate: "2023-03-01",
  });
  const empSalesB = await api(admin, "POST", "/api/org/employees", {
    code: "EMP-002",
    fullName: "Trần Thị Bình",
    phone: "0902222222",
    email: "binh.tran@example.com",
    departmentId: deptSales.id,
    positionId: posSalesRep.id,
    employeeType: "FULL_TIME",
    hireDate: "2024-01-15",
  });
  const empWarehouse = await api(admin, "POST", "/api/org/employees", {
    code: "EMP-003",
    fullName: "Lê Văn Cường",
    phone: "0903333333",
    departmentId: deptWarehouse.id,
    positionId: posWarehouseKeeper.id,
    employeeType: "FULL_TIME",
    hireDate: "2022-06-01",
  });
  const empAccountant = await api(admin, "POST", "/api/org/employees", {
    code: "EMP-004",
    fullName: "Phạm Thị Dung",
    phone: "0904444444",
    departmentId: deptAccounting.id,
    positionId: posAccountant.id,
    employeeType: "PART_TIME",
    hireDate: "2024-08-01",
  });
  log("Tạo 4 nhân viên");

  // ===================================================================
  // 2. DỮ LIỆU NỀN (master-data)
  // ===================================================================
  const catEngine = await api(admin, "POST", "/api/master-data/categories", { code: "NH-DONGCO", name: "Phụ tùng động cơ" });
  const catBrake = await api(admin, "POST", "/api/master-data/categories", { code: "NH-PHANH", name: "Hệ thống phanh" });
  const catElectric = await api(admin, "POST", "/api/master-data/categories", { code: "NH-DIEN", name: "Điện - Ắc quy" });
  log("Tạo 3 nhóm hàng");

  const uomCai = await api(admin, "POST", "/api/master-data/uom", { code: "CAI", name: "Cái" });
  const uomBo = await api(admin, "POST", "/api/master-data/uom", { code: "BO", name: "Bộ" });
  const uomLit = await api(admin, "POST", "/api/master-data/uom", { code: "LIT", name: "Lít" });
  log("Tạo 3 đơn vị tính");

  const vmVios = await api(admin, "POST", "/api/master-data/vehicle-models", {
    make: "Toyota",
    model: "Vios",
    yearFrom: 2018,
    yearTo: 2023,
    fuelType: "Xăng",
  });
  const vmCity = await api(admin, "POST", "/api/master-data/vehicle-models", {
    make: "Honda",
    model: "City",
    yearFrom: 2019,
    yearTo: 2024,
    fuelType: "Xăng",
  });
  const vmRanger = await api(admin, "POST", "/api/master-data/vehicle-models", {
    make: "Ford",
    model: "Ranger",
    yearFrom: 2020,
    yearTo: 2025,
    fuelType: "Dầu",
  });
  log("Tạo 3 dòng xe tương thích");

  const whCentral = await api(admin, "POST", "/api/master-data/warehouses", {
    code: "KHO-HCM",
    name: "Kho trung tâm TP.HCM",
    type: "CENTRAL",
    branchId: branchHCM.id,
    managerId: empWarehouse.id,
    address: "Khu công nghiệp Tân Bình, TP.HCM",
  });
  const whBranchHN = await api(admin, "POST", "/api/master-data/warehouses", {
    code: "KHO-HN",
    name: "Kho chi nhánh Hà Nội",
    type: "BRANCH",
    branchId: branchHN.id,
    address: "Khu công nghiệp Bắc Thăng Long, Hà Nội",
  });
  log("Tạo 2 kho (trung tâm + chi nhánh)");

  const locZoneA = await api(admin, "POST", "/api/master-data/storage-locations", {
    warehouseId: whCentral.id,
    code: "A",
    type: "ZONE",
  });
  await api(admin, "POST", "/api/master-data/storage-locations", {
    warehouseId: whCentral.id,
    parentId: locZoneA.id,
    code: "A-01",
    type: "RACK",
  });
  log("Tạo vị trí lưu trữ trong kho trung tâm (zone + rack)");

  // 10 sản phẩm đa dạng: có manageSerial, manageLot, reorderPoint (để demo
  // cảnh báo tồn kho), gắn nhóm hàng/ĐVT/xe tương thích khác nhau.
  const productDefs = [
    { code: "SKU-LOC-DAU", name: "Lọc dầu động cơ", categoryId: catEngine.id, baseUomId: uomCai.id, brand: "Denso", reorderPoint: 20, vehicleModelIds: [vmVios.id, vmCity.id] },
    { code: "SKU-LOC-GIO", name: "Lọc gió động cơ", categoryId: catEngine.id, baseUomId: uomCai.id, brand: "Bosch", reorderPoint: 15, vehicleModelIds: [vmVios.id] },
    { code: "SKU-DAY-CUROA", name: "Dây curoa cam", categoryId: catEngine.id, baseUomId: uomCai.id, brand: "Gates", reorderPoint: 10, manageLot: true, vehicleModelIds: [vmRanger.id] },
    { code: "SKU-MA-PHANH", name: "Má phanh trước", categoryId: catBrake.id, baseUomId: uomBo.id, brand: "Akebono", reorderPoint: 30, vehicleModelIds: [vmVios.id, vmCity.id, vmRanger.id] },
    { code: "SKU-DIA-PHANH", name: "Đĩa phanh sau", categoryId: catBrake.id, baseUomId: uomCai.id, brand: "Brembo", reorderPoint: 12 },
    { code: "SKU-DAU-PHANH", name: "Dầu phanh DOT4", categoryId: catBrake.id, baseUomId: uomLit.id, brand: "Castrol", reorderPoint: 25 },
    { code: "SKU-ACQUY-45", name: "Ắc quy 45Ah", categoryId: catElectric.id, baseUomId: uomCai.id, brand: "GS", manageSerial: true, reorderPoint: 8, vehicleModelIds: [vmVios.id, vmCity.id] },
    { code: "SKU-ACQUY-65", name: "Ắc quy 65Ah", categoryId: catElectric.id, baseUomId: uomCai.id, brand: "GS", manageSerial: true, reorderPoint: 5, vehicleModelIds: [vmRanger.id] },
    { code: "SKU-DEN-PHA", name: "Đèn pha LED", categoryId: catElectric.id, baseUomId: uomBo.id, brand: "Philips", manageSerial: true, reorderPoint: 6 },
    { code: "SKU-ECU-DONGCO", name: "ECU điều khiển động cơ", categoryId: catElectric.id, baseUomId: uomCai.id, brand: "Denso", manageSerial: true, reorderPoint: 3, oemCode: "89661-0K010" },
  ];
  const products = {};
  for (const def of productDefs) {
    const created = await api(admin, "POST", "/api/master-data/products", def);
    products[def.code] = created;
  }
  log(`Tạo ${productDefs.length} sản phẩm (đủ manageSerial/manageLot/reorderPoint/xe tương thích)`);

  // ===================================================================
  // 3. MUA HÀNG (procurement)
  // ===================================================================
  const supDomestic = await api(admin, "POST", "/api/procurement/suppliers", {
    code: "NCC-TRONGNUOC",
    name: "Công ty TNHH Phụ tùng Việt",
    type: "SUPPLIER",
    country: "Việt Nam",
    paymentTerm: "30 ngày",
  });
  const supForeign = await api(admin, "POST", "/api/procurement/suppliers", {
    code: "NCC-DENSO-JP",
    name: "Denso Corporation",
    type: "FOREIGN_MANUFACTURER",
    country: "Nhật Bản",
    currency: "USD",
    paymentTerm: "T/T 30% trước, 70% khi giao hàng",
  });
  const supEntrusted = await api(admin, "POST", "/api/procurement/suppliers", {
    code: "NCC-UYTHAC-LOG",
    name: "Công ty Logistics ủy thác nhập khẩu ABC",
    type: "ENTRUSTED_IMPORT_UNIT",
    country: "Việt Nam",
  });
  log("Tạo 3 nhà cung cấp (trong nước, nước ngoài, ủy thác nhập khẩu)");

  const managerId = (await api(admin, "GET", "/api/org/users")).find((u) => u.username === "manager").id;

  async function createAndDecidePR(lines, decision) {
    const pr = await api(admin, "POST", "/api/procurement/purchase-requests", { approverUserId: managerId, lines });
    const approvalId = (await api(manager, "GET", "/api/workflow/approval-requests?assignedToMe=true")).find(
      (r) => r.entityType === "PurchaseRequest" && r.entityId === pr.id
    ).id;
    if (decision) {
      await api(manager, "POST", `/api/workflow/approval-requests/${approvalId}/decide`, { decision });
    }
    return pr;
  }

  const prClosed = await createAndDecidePR(
    [{ productId: products["SKU-LOC-DAU"].id, uomId: uomCai.id, qty: 100, estimatedPrice: 85000 }],
    "APPROVED"
  );
  const prPartial = await createAndDecidePR(
    [{ productId: products["SKU-MA-PHANH"].id, uomId: uomBo.id, qty: 60, estimatedPrice: 320000 }],
    "APPROVED"
  );
  const prApprovedNoReceipt = await createAndDecidePR(
    [{ productId: products["SKU-DIA-PHANH"].id, uomId: uomCai.id, qty: 24, estimatedPrice: 450000 }],
    "APPROVED"
  );
  const prDraftPo = await createAndDecidePR(
    [{ productId: products["SKU-DAU-PHANH"].id, uomId: uomLit.id, qty: 50, estimatedPrice: 95000 }],
    "APPROVED"
  );
  const prHighValue = await createAndDecidePR(
    [{ productId: products["SKU-ACQUY-65"].id, uomId: uomCai.id, qty: 40, estimatedPrice: 1800000 }],
    "APPROVED"
  );
  // Số lượng nhỏ + đơn giá vừa phải để tổng giá trị quy đổi VND nằm trong tier1
  // (0-50 triệu -> MANAGER duyệt được) — nếu để giá trị lớn hơn sẽ rơi vào
  // tier2 (ADMIN duyệt), mà admin cũng là người tạo/trình duyệt nên sẽ tự
  // chặn bởi luật Segregation of Duties, không duyệt được để đi tiếp nhận
  // hàng cho demo.
  const prForeign = await createAndDecidePR(
    [{ productId: products["SKU-ECU-DONGCO"].id, uomId: uomCai.id, qty: 5, estimatedPrice: 25000, currency: "USD" }],
    "APPROVED"
  );
  await createAndDecidePR(
    [{ productId: products["SKU-DEN-PHA"].id, uomId: uomBo.id, qty: 15, estimatedPrice: 650000 }],
    "REJECTED"
  );
  await createAndDecidePR(
    [{ productId: products["SKU-ACQUY-45"].id, uomId: uomCai.id, qty: 30, estimatedPrice: 950000 }],
    null // để nguyên PENDING_APPROVAL — demo việc đang chờ duyệt trong hộp thư manager
  );
  log("Tạo 8 đề nghị mua hàng (5 đã duyệt, 1 bị từ chối, 1 đang chờ duyệt)");

  async function createSubmitApprovePo(prId, supplierId, lines, opts = {}) {
    const po = await api(admin, "POST", "/api/procurement/purchase-orders", {
      prId,
      supplierId,
      currency: opts.currency ?? "VND",
      exchangeRate: opts.exchangeRate ?? 1,
      entrustedImportUnitId: opts.entrustedImportUnitId ?? null,
      lines,
    });
    if (opts.submit === false) return po; // để lại DRAFT
    await api(admin, "POST", `/api/procurement/purchase-orders/${po.id}/submit`);
    if (opts.decide === false) return po; // để lại PENDING_APPROVAL (không ai duyệt)
    const approverCookie = opts.decideAs === "admin" ? admin : manager;
    const approvals = await api(approverCookie, "GET", "/api/workflow/approval-requests?assignedToMe=true");
    const approval = approvals.find((r) => r.entityType === "PurchaseOrder" && r.entityId === po.id);
    if (approval) {
      await api(approverCookie, "POST", `/api/workflow/approval-requests/${approval.id}/decide`, { decision: "APPROVED" }, { allowFail: true });
    }
    return po;
  }

  const poClosed = await createSubmitApprovePo(prClosed.id, supDomestic.id, [
    { productId: products["SKU-LOC-DAU"].id, qty: 100, unitPrice: 85000 },
  ]);
  const poPartial = await createSubmitApprovePo(prPartial.id, supDomestic.id, [
    { productId: products["SKU-MA-PHANH"].id, qty: 60, unitPrice: 320000 },
  ]);
  const poApprovedNoReceipt = await createSubmitApprovePo(prApprovedNoReceipt.id, supDomestic.id, [
    { productId: products["SKU-DIA-PHANH"].id, qty: 24, unitPrice: 450000 },
  ]);
  await createSubmitApprovePo(
    prDraftPo.id,
    supDomestic.id,
    [{ productId: products["SKU-DAU-PHANH"].id, qty: 50, unitPrice: 95000 }],
    { submit: false } // demo 1 PO còn DRAFT, chưa trình duyệt
  );
  await createSubmitApprovePo(
    prHighValue.id,
    supDomestic.id,
    [{ productId: products["SKU-ACQUY-65"].id, qty: 40, unitPrice: 1800000 }], // 72,000,000 VND -> tier 2 (ADMIN)
    { decide: false } // để PENDING_APPROVAL — demo mốc Approval Matrix cấp cao (ADMIN), chưa ai duyệt (SOD chặn admin tự duyệt)
  );
  const poForeign = await createSubmitApprovePo(
    prForeign.id,
    supForeign.id,
    [{ productId: products["SKU-ECU-DONGCO"].id, qty: 5, unitPrice: 25000 }],
    { currency: "USD", exchangeRate: 25000, entrustedImportUnitId: supEntrusted.id }
  );
  log("Tạo 6 đơn mua hàng ở đủ trạng thái (DRAFT/PENDING_APPROVAL/APPROVED/CLOSED sau này)");

  await api(admin, "POST", "/api/procurement/goods-receipts", {
    warehouseId: whCentral.id,
    poId: poClosed.id,
    lines: [{ poLineId: poClosed.lines[0].id, productId: products["SKU-LOC-DAU"].id, qtyReceived: 100 }],
  });
  await api(admin, "POST", "/api/procurement/goods-receipts", {
    warehouseId: whCentral.id,
    poId: poPartial.id,
    lines: [{ poLineId: poPartial.lines[0].id, productId: products["SKU-MA-PHANH"].id, qtyReceived: 30 }],
  });
  log("Nhận kho: PO lọc dầu nhận đủ (CLOSED), PO má phanh nhận 1 phần (PARTIALLY_RECEIVED)");
  void poApprovedNoReceipt; // giữ nguyên APPROVED, chưa nhận kho — demo trạng thái chờ nhận hàng

  const shipment = await api(admin, "POST", "/api/procurement/import-shipments", {
    poId: poForeign.id,
    supplierId: supForeign.id,
    entrustedImportUnitId: supEntrusted.id,
    etd: "2026-06-01",
    eta: "2026-07-05",
    status: "ARRIVED_PORT",
  });
  const landedCost1 = await api(admin, "POST", "/api/procurement/landed-costs", {
    shipmentId: shipment.id,
    costType: "ENTRUSTED_FEE",
    amount: 5000000,
  });
  const landedCost2 = await api(admin, "POST", "/api/procurement/landed-costs", {
    shipmentId: shipment.id,
    costType: "IMPORT_TAX",
    amount: 12000000,
  });
  await api(admin, "POST", `/api/procurement/landed-costs/${shipment.id}/allocate`, {}, { allowFail: true });
  void landedCost1;
  void landedCost2;
  log("Tạo lô hàng nhập khẩu ủy thác + 2 khoản chi phí nhập khẩu (phí ủy thác, thuế NK) + phân bổ vào PO");

  await api(admin, "POST", "/api/procurement/goods-receipts", {
    warehouseId: whCentral.id,
    poId: poForeign.id,
    shipmentId: shipment.id,
    lines: [
      {
        poLineId: poForeign.lines[0].id,
        productId: products["SKU-ECU-DONGCO"].id,
        qtyReceived: 5,
        serialNumbers: Array.from({ length: 5 }, (_, i) => `ECU-2026-${String(i + 1).padStart(4, "0")}`),
      },
    ],
  });
  log("Nhận kho lô hàng nhập khẩu (ECU quản lý serial — sinh 20 serial number)");

  // ===================================================================
  // 4. KHO VẬN (inventory)
  // ===================================================================
  const transfer = await api(admin, "POST", "/api/inventory/transfers", {
    fromWarehouseId: whCentral.id,
    toWarehouseId: whBranchHN.id,
    lines: [{ productId: products["SKU-MA-PHANH"].id, qty: 5 }],
  });
  await api(admin, "POST", `/api/inventory/transfers/${transfer.id}/ship`);
  await api(admin, "POST", `/api/inventory/transfers/${transfer.id}/receive`);
  await api(admin, "POST", "/api/inventory/transfers", {
    fromWarehouseId: whCentral.id,
    toWarehouseId: whBranchHN.id,
    lines: [{ productId: products["SKU-LOC-DAU"].id, qty: 10 }],
  });
  log("Điều chuyển kho: 1 chuyến hoàn tất (COMPLETED), 1 chuyến còn PENDING_APPROVAL");

  const count = await api(admin, "POST", "/api/inventory/counts", {
    warehouseId: whCentral.id,
    productIds: [products["SKU-LOC-DAU"].id, products["SKU-MA-PHANH"].id],
  });
  await api(admin, "POST", `/api/inventory/counts/${count.id}/submit`, {
    lines: count.lines.map((l) => ({
      lineId: l.id,
      actualQty: l.product.code === "SKU-LOC-DAU" ? l.systemQty - 2 : l.systemQty, // lệch 2 cái để demo variance
    })),
  });
  await api(admin, "POST", `/api/inventory/counts/${count.id}/approve`);
  log("Kiểm kê kho: 1 phiếu hoàn tất (có lệch tồn 2 cái để demo variance)");

  // ===================================================================
  // 5. PHÂN PHỐI & KÝ GỬI (distribution)
  // ===================================================================
  const dealer1 = await api(admin, "POST", "/api/distribution/customers", {
    code: "DL-MIENDONG",
    name: "Đại lý phụ tùng Miền Đông",
    type: "DEALER",
    region: "Miền Đông Nam Bộ",
    phone: "0281111111",
    creditLimit: 200000000,
    segment: "A",
    dealerProfile: {
      tier: "GOLD",
      region: "Miền Đông Nam Bộ",
      contractNumber: "HD-DL-2026-001",
      contractStart: "2026-01-01",
      contractEnd: "2027-01-01",
      committedRevenue: 500000000,
    },
  });
  await api(admin, "POST", "/api/distribution/customers", {
    code: "DL-MIENTAY",
    name: "Đại lý phụ tùng Miền Tây",
    type: "DEALER",
    region: "Đồng bằng sông Cửu Long",
    creditLimit: 100000000,
    segment: "B",
    dealerProfile: { tier: "SILVER", contractNumber: "HD-DL-2026-002", contractStart: "2026-02-01" },
  });
  const custGarage = await api(admin, "POST", "/api/distribution/customers", {
    code: "GRG-THANHCONG",
    name: "Garage Thành Công",
    type: "GARAGE",
    phone: "0909999999",
    creditLimit: 50000000,
    segment: "B",
  });
  const custDistributor = await api(admin, "POST", "/api/distribution/customers", {
    code: "NPP-TRUNGNAM",
    name: "Nhà phân phối Trung Nam",
    type: "DISTRIBUTOR",
    creditLimit: 300000000,
    segment: "VIP",
  });
  const custEnterprise = await api(admin, "POST", "/api/distribution/customers", {
    code: "DN-VANTAI-HP",
    name: "Công ty Vận tải Hải Phòng",
    type: "ENTERPRISE",
    creditLimit: 150000000,
    segment: "A",
  });
  // Khách hàng cố ý vượt hạn mức tín dụng (currentDebt sẽ tăng qua hóa đơn ở
  // phần Tài chính bên dưới) để demo cảnh báo/chặn xác nhận đơn vượt hạn mức.
  const custOverLimit = await api(admin, "POST", "/api/distribution/customers", {
    code: "GRG-RUIRO",
    name: "Garage Rủi Ro Công Nợ",
    type: "GARAGE",
    creditLimit: 5000000,
    segment: "C",
  });
  log("Tạo 6 khách hàng (2 đại lý có DealerProfile, garage, NPP, doanh nghiệp, 1 khách sát hạn mức)");

  const agreement = await api(admin, "POST", "/api/distribution/consignment-agreements", {
    dealerId: dealer1.id,
    contractNo: "KG-2026-001",
    effectiveFrom: "2026-01-01",
    effectiveTo: "2027-01-01",
    reconciliationCycle: "MONTHLY",
    maxStockValue: 100000000,
  });
  void agreement;
  const consignShipment = await api(admin, "POST", "/api/distribution/consignment-shipments", {
    dealerId: dealer1.id,
    fromWarehouseId: whCentral.id,
    lines: [{ productId: products["SKU-LOC-DAU"].id, qty: 20, unitCost: 85000 }],
  });
  await api(admin, "POST", `/api/distribution/consignment-shipments/${consignShipment.id}/deliver`);
  await api(admin, "POST", "/api/distribution/consignment-sales-reports", {
    dealerId: dealer1.id,
    productId: products["SKU-LOC-DAU"].id,
    qtySold: 8,
    endCustomerName: "Khách lẻ tại đại lý",
    unitPrice: 150000,
  });
  const reconciliation = await api(admin, "POST", "/api/distribution/consignment-reconciliations", {
    dealerId: dealer1.id,
    periodFrom: "2026-01-01",
    periodTo: "2026-01-31",
    dealerReportedQty: 12, // lệch so với hệ thống (systemQty=20-8=12 → khớp, demo RESOLVED)
  });
  await api(
    admin,
    "PATCH",
    `/api/distribution/consignment-reconciliations/${reconciliation.id}`,
    { status: "RESOLVED" }
  );
  log("Ký gửi: giao hàng cho đại lý, báo bán 8/20, đối soát khớp (RESOLVED)");

  const recall = await api(admin, "POST", "/api/distribution/stock-recalls", {
    dealerId: dealer1.id,
    reason: "Đại lý ngừng kinh doanh mặt hàng này",
    lines: [{ productId: products["SKU-LOC-DAU"].id, qty: 4 }],
  });
  await api(admin, "POST", `/api/distribution/stock-recalls/${recall.id}/receive`, { warehouseId: whCentral.id });
  await api(admin, "POST", "/api/distribution/stock-recalls", {
    dealerId: dealer1.id,
    reason: "Kiểm tra chất lượng định kỳ",
    lines: [{ productId: products["SKU-LOC-DAU"].id, qty: 2 }],
  });
  log("Thu hồi ký gửi: 1 phiếu đã nhận về kho (CLOSED), 1 phiếu đang chờ (REQUESTED)");

  // ===================================================================
  // 6. BÁN HÀNG (sales)
  // ===================================================================
  const priceListSale = await api(admin, "POST", "/api/sales/price-lists", {
    code: "BG-BANLE",
    name: "Bảng giá bán lẻ",
    type: "SALE",
  });
  const priceListDealer = await api(admin, "POST", "/api/sales/price-lists", {
    code: "BG-DAILY",
    name: "Bảng giá đại lý",
    type: "DEALER",
  });
  const retailPrices = {
    "SKU-LOC-DAU": 150000,
    "SKU-LOC-GIO": 120000,
    "SKU-MA-PHANH": 480000,
    "SKU-DIA-PHANH": 650000,
    "SKU-DAU-PHANH": 140000,
    "SKU-ACQUY-45": 1300000,
    "SKU-ACQUY-65": 2500000,
    "SKU-DEN-PHA": 950000,
    "SKU-ECU-DONGCO": 8500000,
  };
  for (const [code, price] of Object.entries(retailPrices)) {
    await api(admin, "POST", "/api/sales/price-list-items", {
      priceListId: priceListSale.id,
      productId: products[code].id,
      unitPrice: price,
    });
  }
  await api(admin, "POST", "/api/sales/price-list-items", {
    priceListId: priceListDealer.id,
    productId: products["SKU-LOC-DAU"].id,
    unitPrice: 120000,
    minQty: 10,
  });
  log("Tạo 2 bảng giá (bán lẻ + đại lý) với đơn giá cho 9 sản phẩm");

  const quoteDraft = await api(admin, "POST", "/api/sales/quotations", {
    customerId: custGarage.id,
    salesRepId: empSalesA.id,
    validUntil: "2026-08-31",
    lines: [{ productId: products["SKU-MA-PHANH"].id, qty: 4, unitPrice: 480000 }],
  });
  void quoteDraft; // để nguyên DRAFT — demo báo giá chưa gửi

  const quoteRejected = await api(admin, "POST", "/api/sales/quotations", {
    customerId: custDistributor.id,
    salesRepId: empSalesB.id,
    lines: [{ productId: products["SKU-ACQUY-65"].id, qty: 10, unitPrice: 2500000 }],
  });
  await api(admin, "POST", `/api/sales/quotations/${quoteRejected.id}/send`);
  await api(admin, "POST", `/api/sales/quotations/${quoteRejected.id}/reject`);

  const quoteConverted = await api(admin, "POST", "/api/sales/quotations", {
    customerId: custEnterprise.id,
    salesRepId: empSalesA.id,
    lines: [{ productId: products["SKU-LOC-DAU"].id, qty: 5, unitPrice: 150000 }],
  });
  await api(admin, "POST", `/api/sales/quotations/${quoteConverted.id}/send`);
  await api(admin, "POST", `/api/sales/quotations/${quoteConverted.id}/accept`);
  const soFromQuote = await api(admin, "POST", `/api/sales/quotations/${quoteConverted.id}/convert`);
  log("Báo giá: 1 nháp, 1 bị từ chối, 1 chuyển thành đơn hàng bán");

  // SO đi hết vòng đời: confirm -> allocate -> giao hàng -> đóng
  await api(admin, "POST", `/api/sales/orders/${soFromQuote.id}/confirm`);
  await api(admin, "POST", `/api/sales/orders/${soFromQuote.id}/allocate`, { warehouseId: whCentral.id });
  const drFromSo = await api(admin, "POST", "/api/logistics/delivery-requests/from-sales-order", { soId: soFromQuote.id });

  const soDraft = await api(admin, "POST", "/api/sales/orders", {
    customerId: custGarage.id,
    salesRepId: empSalesA.id,
    lines: [{ productId: products["SKU-DAU-PHANH"].id, qty: 6, unitPrice: 140000 }],
  });
  void soDraft; // để nguyên DRAFT

  const soConfirmedOnly = await api(admin, "POST", "/api/sales/orders", {
    customerId: custDistributor.id,
    salesRepId: empSalesB.id,
    lines: [{ productId: products["SKU-DIA-PHANH"].id, qty: 8, unitPrice: 650000 }],
  });
  await api(admin, "POST", `/api/sales/orders/${soConfirmedOnly.id}/confirm`);

  // Chiết khấu > 20% so bảng giá -> tự chuyển PENDING_APPROVAL, cần approverUserId.
  // Việc so sánh giá chỉ chạy khi khách hàng có gắn priceListId (đơn giá niêm
  // yết lấy từ đúng bảng giá của khách, không phải bảng giá bất kỳ trong hệ
  // thống) — phải gán trước thì demo mới rơi đúng vào nhánh PENDING_APPROVAL.
  await api(admin, "PATCH", `/api/distribution/customers/${custEnterprise.id}`, { priceListId: priceListSale.id });
  const soNeedsApproval = await api(admin, "POST", "/api/sales/orders", {
    customerId: custEnterprise.id,
    salesRepId: empSalesA.id,
    lines: [{ productId: products["SKU-ACQUY-65"].id, qty: 3, unitPrice: 1800000 }], // giá niêm yết 2,500,000
  });
  await api(admin, "POST", `/api/sales/orders/${soNeedsApproval.id}/confirm`, { approverUserId: managerId });
  log("Đơn hàng bán: 1 đi hết vòng đời logistics, 1 DRAFT, 1 CONFIRMED, 1 PENDING_APPROVAL (chiết khấu >20%)");

  const soCancelled = await api(admin, "POST", "/api/sales/orders", {
    customerId: custGarage.id,
    lines: [{ productId: products["SKU-DEN-PHA"].id, qty: 2, unitPrice: 950000 }],
  });
  await api(admin, "POST", `/api/sales/orders/${soCancelled.id}/cancel`);
  log("Tạo 1 đơn hàng đã hủy (CANCELLED)");

  const returnRefunded = await api(admin, "POST", "/api/sales/returns", {
    soId: soFromQuote.id,
    lines: [{ productId: products["SKU-LOC-DAU"].id, qty: 1, reason: "Khách đặt nhầm loại lọc dầu" }],
  });
  await api(admin, "POST", `/api/sales/returns/${returnRefunded.id}/approve`);
  await api(admin, "POST", `/api/sales/returns/${returnRefunded.id}/receive`, { warehouseId: whCentral.id });
  await api(admin, "POST", `/api/sales/returns/${returnRefunded.id}/qc`);
  await api(admin, "POST", `/api/sales/returns/${returnRefunded.id}/refund`);
  await api(admin, "POST", "/api/sales/returns", {
    soId: soConfirmedOnly.id,
    lines: [{ productId: products["SKU-DIA-PHANH"].id, qty: 2, reason: "Đĩa phanh không đúng thông số xe" }],
  });
  log("Trả hàng: 1 đã hoàn tiền xong (REFUNDED), 1 mới yêu cầu (REQUESTED)");

  // ===================================================================
  // 7. GIAO HÀNG & VẬN TẢI (logistics)
  // ===================================================================
  const vehicle1 = await api(admin, "POST", "/api/logistics/vehicles", {
    plateNumber: "51C-123.45",
    type: "Xe tải 1.5 tấn",
    capacity: 1500,
    status: "AVAILABLE",
  });
  await api(admin, "POST", "/api/logistics/vehicles", {
    plateNumber: "51C-678.90",
    type: "Xe tải 3.5 tấn",
    capacity: 3500,
    status: "MAINTENANCE",
  });
  const driver1 = await api(admin, "POST", "/api/logistics/drivers", {
    employeeId: empWarehouse.id,
    licenseNo: "B2-123456",
    licenseType: "B2",
    licenseExpiry: "2028-01-01",
  });
  const carrier1 = await api(admin, "POST", "/api/logistics/carriers", {
    code: "NVC-GHTK",
    name: "Giao Hàng Tiết Kiệm",
    serviceArea: "Toàn quốc",
  });
  log("Tạo 2 xe (1 sẵn sàng, 1 bảo trì), 1 tài xế, 1 đơn vị vận chuyển");

  const shipment2 = await api(admin, "POST", "/api/logistics/shipments", {
    warehouseId: whCentral.id,
    vehicleId: vehicle1.id,
    driverId: driver1.id,
    carrierId: carrier1.id,
    deliveryRequestIds: [drFromSo.id],
  });
  await api(admin, "POST", `/api/logistics/shipments/${shipment2.id}/dispatch`);
  await api(admin, "POST", `/api/logistics/shipments/${shipment2.id}/pod`, {
    receivedByName: "Anh Tuấn (bảo vệ công ty Vận tải Hải Phòng)",
    note: "Giao đủ, khách ký nhận",
  });
  await api(admin, "POST", `/api/logistics/shipments/${shipment2.id}/close`);
  await api(admin, "POST", "/api/logistics/delivery-costs", {
    shipmentId: shipment2.id,
    type: "FUEL",
    amount: 350000,
  });
  await api(admin, "POST", "/api/logistics/delivery-costs", {
    shipmentId: shipment2.id,
    type: "TOLL",
    amount: 80000,
  });
  log("1 chuyến giao hàng đi hết vòng đời (PLANNED→ON_DELIVERY→DELIVERED→CLOSED) + 2 khoản chi phí");

  // ===================================================================
  // 8. BẢO HÀNH & DỊCH VỤ (warranty)
  // ===================================================================
  const policyGeneral = await api(admin, "POST", "/api/warranty/policies", {
    categoryId: catElectric.id,
    durationMonths: 12,
    conditions: "Bảo hành 12 tháng cho lỗi nhà sản xuất, không áp dụng cho hư hỏng do va chạm/ngập nước.",
  });
  void policyGeneral;
  await api(admin, "POST", "/api/warranty/policies", {
    categoryId: catEngine.id,
    durationMonths: 6,
    conditions: "Bảo hành 6 tháng hoặc 10,000km, tùy điều kiện nào đến trước.",
  });
  log("Tạo 2 chính sách bảo hành (theo nhóm hàng Điện, Động cơ)");

  const regEcu = await api(admin, "POST", "/api/warranty/registrations", {
    productId: products["SKU-ECU-DONGCO"].id,
    customerId: custGarage.id,
    vehicleModelId: vmVios.id,
    soldAt: "2026-05-01",
  });
  const regBattery = await api(admin, "POST", "/api/warranty/registrations", {
    productId: products["SKU-ACQUY-65"].id,
    customerId: custEnterprise.id,
    vehicleModelId: vmRanger.id,
    soldAt: "2026-04-15",
  });
  log("Đăng ký bảo hành cho 2 sản phẩm đã bán (ECU, ắc quy)");

  const claimClosed = await api(admin, "POST", "/api/warranty/claims", {
    registrationId: regEcu.id,
    description: "ECU báo lỗi mã P0601, xe không nổ máy",
  });
  await api(admin, "POST", `/api/warranty/claims/${claimClosed.id}/inspect`);
  await api(admin, "POST", `/api/warranty/claims/${claimClosed.id}/approve`);
  const repairResult = await api(admin, "POST", `/api/warranty/claims/${claimClosed.id}/repair`, {
    technicianId: empWarehouse.id,
  });
  const repairOrderId = repairResult?.repairOrders?.[0]?.id;
  if (repairOrderId) {
    // RECEIVED -> DIAGNOSING -> REPAIRING -> TESTING -> COMPLETED -> RETURNED
    await api(admin, "POST", `/api/warranty/repair-orders/${repairOrderId}/advance`);
    await api(admin, "POST", `/api/warranty/repair-orders/${repairOrderId}/advance`);
    await api(admin, "POST", `/api/warranty/repair-orders/${repairOrderId}/advance`, { laborCost: 300000 });
    await api(admin, "POST", `/api/warranty/repair-orders/${repairOrderId}/advance`);
    await api(admin, "POST", `/api/warranty/repair-orders/${repairOrderId}/advance`);
  }
  await api(admin, "POST", `/api/warranty/claims/${claimClosed.id}/close`);

  const claimOpen = await api(admin, "POST", "/api/warranty/claims", {
    registrationId: regBattery.id,
    description: "Ắc quy không giữ điện, sụt áp nhanh",
  });
  void claimOpen; // để nguyên OPEN

  const claimRejected = await api(admin, "POST", "/api/warranty/claims", {
    registrationId: regEcu.id,
    description: "Yêu cầu bảo hành lần 2 do khách tự ý can thiệp mạch điện",
  });
  await api(admin, "POST", `/api/warranty/claims/${claimRejected.id}/inspect`);
  await api(admin, "POST", `/api/warranty/claims/${claimRejected.id}/reject`);
  log("Yêu cầu bảo hành: 1 đã đóng (qua sửa chữa), 1 mới mở, 1 bị từ chối");

  const rma = await api(admin, "POST", "/api/warranty/rma-requests", { claimId: claimClosed.id }, { allowFail: true });
  if (rma) {
    await api(admin, "POST", `/api/warranty/rma-requests/${rma.id}/approve`, {}, { allowFail: true });
    log("Tạo 1 yêu cầu RMA từ khiếu nại bảo hành đã duyệt");
  }

  const ecuSerials = await api(admin, "GET", `/api/inventory/serial-numbers?productId=${products["SKU-ECU-DONGCO"].id}&pageSize=10`);
  if (ecuSerials?.length > 0) {
    const coreReturn = await api(admin, "POST", "/api/warranty/core-returns", {
      newSerialId: ecuSerials[0].id,
      customerId: custEnterprise.id,
      dueReturnAt: "2026-08-01",
    }, { allowFail: true });
    if (coreReturn) log("Tạo 1 phiếu Core Return đang chờ khách trả lại hàng cũ (PENDING)");
  }

  const fieldService = await api(admin, "POST", "/api/warranty/field-service-requests", {
    customerId: custDistributor.id,
    type: "INSTALLATION",
    scheduledAt: "2026-07-20",
  });
  await api(admin, "POST", `/api/warranty/field-service-requests/${fieldService.id}/assign`, {
    technicianId: empWarehouse.id,
  });
  await api(admin, "POST", `/api/warranty/field-service-requests/${fieldService.id}/start`);
  const fieldService2 = await api(admin, "POST", "/api/warranty/field-service-requests", {
    customerId: custGarage.id,
    type: "MAINTENANCE",
    scheduledAt: "2026-07-25",
  });
  void fieldService2; // để nguyên REQUESTED
  log("Dịch vụ hiện trường: 1 đang thực hiện (IN_PROGRESS), 1 mới yêu cầu (REQUESTED)");

  // ===================================================================
  // 9. TÀI CHÍNH & KẾ TOÁN (finance)
  // ===================================================================
  const ccSales = await api(admin, "POST", "/api/finance/cost-centers", { code: "CC-KD", name: "Trung tâm chi phí Kinh doanh" });
  const ccWarehouse = await api(admin, "POST", "/api/finance/cost-centers", { code: "CC-KHO", name: "Trung tâm chi phí Kho vận" });
  log("Tạo 2 trung tâm chi phí");

  const accounts = await api(admin, "GET", "/api/finance/accounts?pageSize=50");
  const acc = Object.fromEntries(accounts.map((a) => [a.code, a]));
  await api(admin, "POST", "/api/finance/journal-entries", {
    description: "Chi phí thuê văn phòng tháng 7/2026",
    lines: [
      { accountId: acc["642"].id, debit: 25000000, costCenterId: ccSales.id },
      { accountId: acc["111"].id, credit: 25000000 },
    ],
  }).then((je) => api(admin, "POST", `/api/finance/journal-entries/${je.id}/post`));
  log("Ghi + post 1 bút toán thủ công (chi phí thuê văn phòng)");
  void ccWarehouse;

  const bankAccount = await api(admin, "POST", "/api/finance/bank-accounts", {
    bankName: "Vietcombank",
    accountNo: "0071000123456",
    currency: "VND",
  });

  const supplierInvoicePaid = await api(admin, "POST", "/api/finance/supplier-invoices", {
    supplierId: supDomestic.id,
    poId: poClosed.id,
    amount: 8500000,
    dueDate: "2026-07-20",
  });
  await api(admin, "POST", "/api/finance/payments", {
    direction: "OUT",
    invoiceId: supplierInvoicePaid.id,
    amount: 8500000,
    bankAccountId: bankAccount.id,
    method: "Chuyển khoản",
  });
  const supplierInvoiceUnpaid = await api(admin, "POST", "/api/finance/supplier-invoices", {
    supplierId: supForeign.id,
    poId: poForeign.id,
    currency: "USD",
    exchangeRate: 25200,
    amount: 11000000, // 110.00 USD (đơn vị cent) — tỷ giá ghi nhận khác lúc tạo PO để demo chênh lệch tỷ giá
    dueDate: "2026-08-10",
  });
  void supplierInvoiceUnpaid;
  log("Hóa đơn mua hàng (AP): 1 đã thanh toán đủ, 1 còn nợ (ngoại tệ USD, để demo đánh giá lại tỷ giá)");

  const customerInvoicePaid = await api(admin, "POST", "/api/finance/customer-invoices", {
    customerId: custEnterprise.id,
    soId: soFromQuote.id,
    amount: 750000,
    dueDate: "2026-06-01",
  });
  await api(admin, "POST", "/api/finance/payments", {
    direction: "IN",
    invoiceId: customerInvoicePaid.id,
    amount: 750000,
    bankAccountId: bankAccount.id,
    method: "Tiền mặt",
  });
  await api(admin, "POST", "/api/finance/customer-invoices", {
    customerId: custDistributor.id,
    soId: soConfirmedOnly.id,
    amount: 5200000,
    dueDate: "2026-05-01", // đã quá hạn xa -> demo AR aging + alert AR_OVERDUE
  });
  await api(admin, "POST", "/api/finance/customer-invoices", {
    customerId: custOverLimit.id,
    amount: 4800000,
    dueDate: "2026-07-15",
  });
  log("Hóa đơn bán hàng (AR): 1 đã thu đủ, 1 quá hạn xa (demo aging/alert), 1 khiến khách sát hạn mức tín dụng");

  const fixedAsset = await api(admin, "POST", "/api/finance/fixed-assets", {
    code: "TS-XETAI-01",
    name: "Xe tải giao hàng 51C-123.45",
    purchaseDate: "2025-01-01",
    originalCost: 450000000,
    usefulLifeMonths: 60,
  });
  await api(admin, "POST", `/api/finance/fixed-assets/${fixedAsset.id}/depreciate`);
  await api(admin, "POST", `/api/finance/fixed-assets/${fixedAsset.id}/depreciate`);
  log("Tạo 1 tài sản cố định (xe tải) + khấu hao 2 kỳ");

  await api(admin, "POST", "/api/finance/budgets", {
    departmentId: deptSales.id,
    costCenterId: ccSales.id,
    period: "2026-Q3",
    category: "Chi phí bán hàng",
    plannedAmount: 100000000,
  });
  await api(admin, "POST", "/api/finance/budgets", {
    departmentId: deptWarehouse.id,
    period: "2026-Q3",
    category: "Chi phí vận hành kho",
    plannedAmount: 60000000,
  });
  log("Tạo 2 ngân sách theo phòng ban (Q3/2026)");

  // ===================================================================
  // 10. NHÂN SỰ & LƯƠNG (hrm)
  // ===================================================================
  for (const [emp, salary] of [
    [empSalesA, 15000000],
    [empSalesB, 13000000],
    [empWarehouse, 12000000],
    [empAccountant, 9000000],
  ]) {
    await api(admin, "POST", "/api/hrm/employment-contracts", {
      employeeId: emp.id,
      type: "Chính thức",
      startDate: "2026-01-01",
      baseSalary: salary,
    });
  }
  log("Tạo hợp đồng lao động cho 4 nhân viên");

  const shiftOffice = await api(admin, "POST", "/api/hrm/shifts", { name: "Ca hành chính", startTime: "08:00", endTime: "17:00" });
  await api(admin, "POST", "/api/hrm/shifts", { name: "Ca kho sáng", startTime: "06:00", endTime: "14:00" });
  log("Tạo 2 ca làm việc");

  await api(admin, "POST", "/api/hrm/attendance/check-in", { employeeId: empSalesA.id, shiftId: shiftOffice.id });
  await api(admin, "POST", "/api/hrm/attendance/check-out", { employeeId: empSalesA.id });
  await api(admin, "POST", "/api/hrm/attendance/check-in", { employeeId: empWarehouse.id, shiftId: shiftOffice.id });
  log("Chấm công vào/ra cho 2 nhân viên (1 đã ra ca, 1 đang trong ca)");

  const leaveApproved = await api(admin, "POST", "/api/hrm/leave-requests", {
    employeeId: empSalesA.id,
    type: "ANNUAL",
    fromDate: "2026-08-10",
    toDate: "2026-08-12",
  });
  await api(admin, "POST", `/api/hrm/leave-requests/${leaveApproved.id}/approve`);
  const leaveRejected = await api(admin, "POST", "/api/hrm/leave-requests", {
    employeeId: empSalesB.id,
    type: "UNPAID",
    fromDate: "2026-07-15",
    toDate: "2026-07-16",
  });
  await api(admin, "POST", `/api/hrm/leave-requests/${leaveRejected.id}/reject`);
  await api(admin, "POST", "/api/hrm/leave-requests", {
    employeeId: empAccountant.id,
    type: "SICK",
    fromDate: "2026-07-09",
    toDate: "2026-07-09",
  });
  log("Đơn nghỉ phép: 1 đã duyệt, 1 bị từ chối, 1 đang chờ duyệt");

  await api(admin, "POST", "/api/hrm/commission-records", {
    employeeId: empSalesA.id,
    soId: soFromQuote.id,
    amount: 37500,
    period: "2026-07",
  });
  log("Ghi nhận hoa hồng bán hàng cho nhân viên kinh doanh");

  const payrollPaid = await api(admin, "POST", "/api/hrm/payroll/generate", {
    employeeId: empSalesA.id,
    period: "2026-07",
    allowance: 500000,
    bonus: 200000,
  });
  await api(admin, "POST", `/api/hrm/payroll/${payrollPaid.id}/confirm`);
  await api(admin, "POST", `/api/hrm/payroll/${payrollPaid.id}/pay`);
  await api(admin, "POST", "/api/hrm/payroll/generate", {
    employeeId: empWarehouse.id,
    period: "2026-07",
    allowance: 300000,
  });
  log("Bảng lương tháng 7: 1 đã trả (PAID), 1 còn nháp (DRAFT)");

  // ===================================================================
  // 11. HỢP ĐỒNG (contracts)
  // ===================================================================
  const today = new Date();
  const inDays = (n) => new Date(today.getTime() + n * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  await api(admin, "POST", "/api/contracts", {
    code: "HD-NCC-001",
    type: "SUPPLIER",
    title: "Hợp đồng nguyên tắc mua hàng với Công ty TNHH Phụ tùng Việt",
    partnerType: "Supplier",
    partnerId: supDomestic.id,
    status: "ACTIVE",
    startDate: "2026-01-01",
    endDate: inDays(5), // sắp hết hạn -> demo alert CONTRACT_EXPIRING (danger)
    value: 2000000000,
  });
  await api(admin, "POST", "/api/contracts", {
    code: "HD-KH-001",
    type: "CUSTOMER",
    title: "Hợp đồng phân phối với Nhà phân phối Trung Nam",
    partnerType: "Customer",
    partnerId: custDistributor.id,
    status: "ACTIVE",
    startDate: "2026-01-01",
    endDate: inDays(20), // sắp hết hạn (warning)
    value: 1500000000,
  });
  await api(admin, "POST", "/api/contracts", {
    code: "HD-DV-001",
    type: "SERVICE",
    title: "Hợp đồng dịch vụ bảo trì kho lạnh",
    status: "ACTIVE",
    startDate: "2026-01-01",
    endDate: "2027-06-30", // còn xa hạn -> không cảnh báo
    value: 80000000,
  });
  await api(admin, "POST", "/api/contracts", {
    code: "HD-KHAC-001",
    type: "OTHER",
    title: "Hợp đồng thuê kho bãi (đang soạn thảo)",
    status: "DRAFT",
    startDate: "2026-08-01",
  });
  await api(admin, "POST", "/api/contracts", {
    code: "HD-NCC-002",
    type: "SUPPLIER",
    title: "Hợp đồng cũ đã hết hiệu lực",
    status: "TERMINATED",
    startDate: "2024-01-01",
    endDate: "2025-12-31",
    value: 300000000,
  });
  log("Tạo 5 hợp đồng (2 sắp hết hạn để demo cảnh báo, 1 còn dài hạn, 1 DRAFT, 1 TERMINATED)");

  // ===================================================================
  // 12. KÊNH BÁN ONLINE (shop — public, không cần đăng nhập)
  // ===================================================================
  await fetch(`${BASE}/api/shop/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customerName: "Nguyễn Thị Mai",
      phone: "0912345678",
      email: "mai.nguyen@example.com",
      address: "45 Lê Văn Việt, TP. Thủ Đức",
      lines: [
        { productId: products["SKU-LOC-DAU"].id, qty: 2 },
        { productId: products["SKU-LOC-GIO"].id, qty: 1 },
      ],
    }),
  });
  await fetch(`${BASE}/api/shop/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customerName: "Hoàng Văn Nam",
      phone: "0987654321",
      lines: [{ productId: products["SKU-DAU-PHANH"].id, qty: 3 }],
    }),
  });
  log("Tạo 2 đơn hàng online qua kênh /shop (không cần đăng nhập)");

  console.log("\n✅ Hoàn tất seed dữ liệu mẫu — mở lại ứng dụng để xem/demo.");
}

main().catch((err) => {
  console.error("\n❌ Script dừng do lỗi:", err.message);
  process.exit(1);
});
