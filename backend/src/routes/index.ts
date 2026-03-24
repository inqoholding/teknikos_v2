import { Router } from "express";
import { adminRouter } from "./admin.js";
import { businessRouter } from "./business.js";
import { contractsRouter } from "./contracts.js";
import { customersRouter } from "./customers.js";
import { dashboardRouter } from "./dashboard.js";
import { inventoryRouter } from "./inventory.js";
import { invoicesRouter } from "./invoices.js";
import { jobsRouter } from "./jobs.js";
import { supportRouter } from "./support.js";
import { technicianSelfRouter } from "./technician-self.js";
import { techniciansRouter } from "./technicians.js";

export const apiRouter = Router();

apiRouter.use("/admin", adminRouter);
apiRouter.use("/business", businessRouter);
apiRouter.use("/jobs", jobsRouter);
apiRouter.use("/support-requests", supportRouter);
apiRouter.use("/technician", technicianSelfRouter);
apiRouter.use("/technicians", techniciansRouter);
apiRouter.use("/customers", customersRouter);
apiRouter.use("/inventory", inventoryRouter);
apiRouter.use("/dashboard", dashboardRouter);
apiRouter.use("/invoices", invoicesRouter);
apiRouter.use("/contracts", contractsRouter);
