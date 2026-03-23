import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useBusinessQuery, useSessionQuery } from "../api/hooks";
import { getErrorMessage, isApiErrorStatus } from "../api/client";
import { PageError, PageLoader } from "./PageState";

function isStaffRole(role?: string | null) {
  return role === "admin" || role === "moderator";
}

function isPendingPayment(status?: string | null) {
  return ["pending_payment", "past_due", "paused", "cancelled"].includes(status ?? "");
}

export function GuestGuard() {
  const location = useLocation();
  const sessionQuery = useSessionQuery();
  const isStaff = isStaffRole(sessionQuery.data?.user.role);
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const businessQuery = useBusinessQuery(Boolean(sessionQuery.data) && !isStaff && !isAuthPage);

  if (isAuthPage) {
    return <Outlet />;
  }

  if (sessionQuery.isLoading || (sessionQuery.data && businessQuery.isLoading)) {
    return <PageLoader title="Memeriksa sesi..." />;
  }

  if (!sessionQuery.data) {
    return <Outlet />;
  }

  if (isStaff) {
    return <Navigate to="/admin" replace />;
  }

  if (businessQuery.data && isPendingPayment(businessQuery.data.subscriptionStatus)) {
    return <Navigate to="/payment-pending" replace />;
  }

  if (businessQuery.data) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isApiErrorStatus(businessQuery.error, 403)) {
    return <Navigate to="/onboarding" replace />;
  }

  if (businessQuery.error) {
    return <PageError message={getErrorMessage(businessQuery.error)} />;
  }

  return <Outlet />;
}

export function OnboardingGuard() {
  const location = useLocation();
  const sessionQuery = useSessionQuery();
  const isStaff = isStaffRole(sessionQuery.data?.user.role);
  const hasPendingOnboardingPlan =
    location.pathname === "/onboarding" &&
    typeof window !== "undefined" &&
    Boolean(window.sessionStorage.getItem("teknikos:selected-plan"));
  const businessQuery = useBusinessQuery(Boolean(sessionQuery.data) && !isStaff && !hasPendingOnboardingPlan);

  if (sessionQuery.isLoading || (sessionQuery.data && businessQuery.isLoading)) {
    return <PageLoader title="Menyiapkan onboarding..." />;
  }

  if (!sessionQuery.data) {
    return <Navigate to="/login" replace />;
  }

  if (isStaff) {
    return <Navigate to="/admin" replace />;
  }

  if (businessQuery.data && isPendingPayment(businessQuery.data.subscriptionStatus)) {
    return <Navigate to="/payment-pending" replace />;
  }

  if (businessQuery.data) {
    return <Navigate to="/dashboard" replace />;
  }

  if (businessQuery.error && !isApiErrorStatus(businessQuery.error, 403)) {
    return <PageError message={getErrorMessage(businessQuery.error)} />;
  }

  return <Outlet />;
}

export function ProtectedAppGuard() {
  const sessionQuery = useSessionQuery();
  const isStaff = isStaffRole(sessionQuery.data?.user.role);
  const businessQuery = useBusinessQuery(Boolean(sessionQuery.data) && !isStaff);

  if (sessionQuery.isLoading || (sessionQuery.data && businessQuery.isLoading)) {
    return <PageLoader title="Menyiapkan dashboard..." />;
  }

  if (!sessionQuery.data) {
    return <Navigate to="/login" replace />;
  }

  if (isStaff) {
    return <Navigate to="/admin" replace />;
  }

  if (isApiErrorStatus(businessQuery.error, 403)) {
    return <Navigate to="/onboarding" replace />;
  }

  if (businessQuery.error) {
    return <PageError message={getErrorMessage(businessQuery.error)} />;
  }

  if (!businessQuery.data) {
    return <PageLoader title="Memuat bisnis..." />;
  }

  if (isPendingPayment(businessQuery.data.subscriptionStatus)) {
    return <Navigate to="/payment-pending" replace />;
  }

  return <Outlet />;
}

export function PendingPaymentGuard() {
  const sessionQuery = useSessionQuery();
  const isStaff = isStaffRole(sessionQuery.data?.user.role);
  const businessQuery = useBusinessQuery(Boolean(sessionQuery.data) && !isStaff);

  if (sessionQuery.isLoading || (sessionQuery.data && businessQuery.isLoading)) {
    return <PageLoader title="Memuat status pembayaran..." />;
  }

  if (!sessionQuery.data) {
    return <Navigate to="/login" replace />;
  }

  if (isStaff) {
    return <Navigate to="/admin" replace />;
  }

  if (isApiErrorStatus(businessQuery.error, 403)) {
    return <Navigate to="/onboarding" replace />;
  }

  if (businessQuery.error) {
    return <PageError message={getErrorMessage(businessQuery.error)} />;
  }

  if (!businessQuery.data) {
    return <PageLoader title="Memuat bisnis..." />;
  }

  if (!isPendingPayment(businessQuery.data.subscriptionStatus)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export function StaffGuard() {
  const sessionQuery = useSessionQuery();

  if (sessionQuery.isLoading) {
    return <PageLoader title="Menyiapkan admin dashboard..." />;
  }

  if (!sessionQuery.data) {
    return <Navigate to="/login" replace />;
  }

  if (!isStaffRole(sessionQuery.data.user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
