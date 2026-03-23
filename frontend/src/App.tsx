import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AdminShellLayout, AppShellLayout } from "./components/Layout";
import { GuestGuard, OnboardingGuard, PendingPaymentGuard, ProtectedAppGuard, StaffGuard } from "./components/RouteGuards";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardPage from "./pages/DashboardPage";
import JobsPage from "./pages/JobsPage";
import JobDetailPage from "./pages/JobDetailPage";
import TechniciansPage from "./pages/TechniciansPage";
import CustomersPage from "./pages/CustomersPage";
import CustomerDetailPage from "./pages/CustomerDetailPage";
import InvoicesPage from "./pages/InvoicesPage";
import InventoryPage from "./pages/InventoryPage";
import ContractsPage from "./pages/ContractsPage";
import SettingsPage from "./pages/SettingsPage";
import SettingsWhatsappConnectPage from "./pages/SettingsWhatsappConnectPage";
import SettingsWhatsappRulesPage from "./pages/SettingsWhatsappRulesPage";
import AdminSubscriptionsPage from "./pages/AdminSubscriptionsPage";
import PendingPaymentPage from "./pages/PendingPaymentPage";
import {
  DemoContractsPage,
  DemoCustomersPage,
  DemoDashboardPage,
  DemoInvoicesPage,
  DemoInventoryPage,
  DemoJobDetailPage,
  DemoJobsPage,
  DemoSettingsPage,
  DemoTechniciansPage,
  DemoWhatsappConnectPage,
  DemoWhatsappRulesPage,
  DemoWorkspaceLayout,
} from "./pages/demo/DemoWorkspace";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
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
    </BrowserRouter>
  );
}
