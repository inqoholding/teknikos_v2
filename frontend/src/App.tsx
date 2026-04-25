import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AdminShellLayout, AppShellLayout } from "./components/Layout";
import { GuestGuard, OnboardingGuard, PendingPaymentGuard, ProtectedAppGuard, StaffGuard } from "./components/RouteGuards";
import { ErrorBoundary } from "./components/ErrorBoundary";

const HomePage = lazy(() => import("./pages/HomePage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsOfServicePage = lazy(() => import("./pages/TermsOfServicePage"));
const DataHandlingPage = lazy(() => import("./pages/DataHandlingPage"));
const SupportPage = lazy(() => import("./pages/SupportPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const JobsPage = lazy(() => import("./pages/JobsPage"));
const JobDetailPage = lazy(() => import("./pages/JobDetailPage"));
const TechniciansPage = lazy(() => import("./pages/TechniciansPage"));
const CustomersPage = lazy(() => import("./pages/CustomersPage"));
const CustomerDetailPage = lazy(() => import("./pages/CustomerDetailPage"));
const InvoicesPage = lazy(() => import("./pages/InvoicesPage"));
const InventoryPage = lazy(() => import("./pages/InventoryPage"));
const ContractsPage = lazy(() => import("./pages/ContractsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const SettingsWhatsappConnectPage = lazy(() => import("./pages/SettingsWhatsappConnectPage"));
const SettingsWhatsappRulesPage = lazy(() => import("./pages/SettingsWhatsappRulesPage"));
const AdminSubscriptionsPage = lazy(() => import("./pages/AdminSubscriptionsPage"));
const AttendancePage = lazy(() => import("./pages/AttendancePage"));
const PendingPaymentPage = lazy(() => import("./pages/PendingPaymentPage"));

const DemoWorkspaceLayout = lazy(() => import("./pages/demo/DemoWorkspace").then(m => ({ default: m.DemoWorkspaceLayout })));
const DemoDashboardPage = lazy(() => import("./pages/demo/DemoWorkspace").then(m => ({ default: m.DemoDashboardPage })));
const DemoJobsPage = lazy(() => import("./pages/demo/DemoWorkspace").then(m => ({ default: m.DemoJobsPage })));
const DemoJobDetailPage = lazy(() => import("./pages/demo/DemoWorkspace").then(m => ({ default: m.DemoJobDetailPage })));
const DemoTechniciansPage = lazy(() => import("./pages/demo/DemoWorkspace").then(m => ({ default: m.DemoTechniciansPage })));
const DemoCustomersPage = lazy(() => import("./pages/demo/DemoWorkspace").then(m => ({ default: m.DemoCustomersPage })));
const DemoInvoicesPage = lazy(() => import("./pages/demo/DemoWorkspace").then(m => ({ default: m.DemoInvoicesPage })));
const DemoInventoryPage = lazy(() => import("./pages/demo/DemoWorkspace").then(m => ({ default: m.DemoInventoryPage })));
const DemoContractsPage = lazy(() => import("./pages/demo/DemoWorkspace").then(m => ({ default: m.DemoContractsPage })));
const DemoSettingsPage = lazy(() => import("./pages/demo/DemoWorkspace").then(m => ({ default: m.DemoSettingsPage })));
const DemoWhatsappRulesPage = lazy(() => import("./pages/demo/DemoWorkspace").then(m => ({ default: m.DemoWhatsappRulesPage })));
const DemoWhatsappConnectPage = lazy(() => import("./pages/demo/DemoWorkspace").then(m => ({ default: m.DemoWhatsappConnectPage })));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-pulse flex flex-col items-center">
      <div className="h-8 w-8 bg-blue-500 rounded-full mb-4"></div>
      <div className="text-gray-500 text-sm font-medium">Memuat...</div>
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
            <Route path="/data-handling" element={<DataHandlingPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/demo-owner-dashboard" element={<DemoWorkspaceLayout />}>
              <Route index element={<DemoDashboardPage />} />
              <Route path="jobs" element={<DemoJobsPage />} />
              <Route path="jobs/:id" element={<DemoJobDetailPage />} />
              <Route path="technicians" element={<DemoTechniciansPage />} />
              <Route path="customers" element={<DemoCustomersPage />} />
              <Route path="invoices" element={<DemoInvoicesPage />} />
              <Route path="inventory" element={<DemoInventoryPage />} />
              <Route path="contracts" element={<DemoContractsPage />} />
              <Route path="settings" element={<DemoSettingsPage />} />
              <Route path="settings/whatsapp-rules" element={<DemoWhatsappRulesPage />} />
              <Route path="settings/whatsapp-connect" element={<DemoWhatsappConnectPage />} />
            </Route>
            <Route element={<GuestGuard />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>
            <Route element={<OnboardingGuard />}>
              <Route path="/onboarding" element={<OnboardingPage />} />
            </Route>
            <Route element={<PendingPaymentGuard />}>
              <Route path="/payment-pending" element={<PendingPaymentPage />} />
            </Route>
            <Route element={<ProtectedAppGuard />}>
              <Route element={<AppShellLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="/jobs/:id" element={<JobDetailPage />} />
                <Route path="/technicians" element={<TechniciansPage />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/customers/:id" element={<CustomerDetailPage />} />
                <Route path="/invoices" element={<InvoicesPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/contracts" element={<ContractsPage />} />
                <Route path="/attendance" element={<AttendancePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/settings/whatsapp-rules" element={<SettingsWhatsappRulesPage />} />
                <Route path="/settings/whatsapp-connect" element={<SettingsWhatsappConnectPage />} />
              </Route>
            </Route>
            <Route element={<StaffGuard />}>
              <Route element={<AdminShellLayout />}>
                <Route path="/admin" element={<AdminSubscriptionsPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
