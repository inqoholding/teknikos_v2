import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";
import type {
  AdminCalendarJob,
  AdminClientSubscription,
  AdminInboxItem,
  AdminResetPasswordResult,
  Business,
  BusinessWhatsappState,
  Contract,
  Customer,
  CustomerDetail,
  DashboardStatPayload,
  InventoryItem,
  Invoice,
  JobDetail,
  JobListItem,
  SessionPayload,
  SupportRequestResult,
  TechnicianAccountResult,
  Technician,
  TechnicianLivePresence,
  TechnicianSelfProfile,
} from "./types";

async function getSession() {
  try {
    const { data } = await api.get<SessionPayload>("/api/auth/get-session");
    return data;
  } catch (error) {
    if (typeof error === "object" && error !== null && "status" in error && error.status === 401) {
      return null;
    }
    throw error;
  }
}

async function getBusiness() {
  const { data } = await api.get<{ data: Business }>("/api/business/me");
  return data.data;
}

async function getDashboardStats() {
  const { data } = await api.get<{ data: DashboardStatPayload }>("/api/dashboard/stats");
  return data.data;
}

async function getJobs(params?: Record<string, string>) {
  const { data } = await api.get<{ data: JobListItem[] }>("/api/jobs", { params });
  return data.data;
}

async function getJob(id: string) {
  const { data } = await api.get<{ data: JobDetail }>(`/api/jobs/${id}`);
  return data.data;
}

async function getTechnicians() {
  const { data } = await api.get<{ data: Technician[] }>("/api/technicians");
  return data.data;
}

async function getTechniciansLive() {
  const { data } = await api.get<{ data: TechnicianLivePresence[] }>("/api/dashboard/technicians-live");
  return data.data;
}

async function getTechnicianSelf() {
  const { data } = await api.get<{ data: TechnicianSelfProfile }>("/api/technician/me");
  return data.data;
}

async function getCustomers(params?: Record<string, string>) {
  const { data } = await api.get<{ data: Customer[] }>("/api/customers", { params });
  return data.data;
}

async function getCustomer(id: string) {
  const { data } = await api.get<{ data: CustomerDetail }>(`/api/customers/${id}`);
  return data.data;
}

async function getInvoices(params?: Record<string, string>) {
  const { data } = await api.get<{ data: Invoice[] }>("/api/invoices", { params });
  return data.data;
}

async function getInventory() {
  const { data } = await api.get<{ data: InventoryItem[] }>("/api/inventory");
  return data.data;
}

async function getContracts() {
  const { data } = await api.get<{ data: Contract[] }>("/api/contracts");
  return data.data;
}

async function getAdminSubscriptions() {
  const { data } = await api.get<{
    data: AdminClientSubscription[];
    meta: {
      plans: NonNullable<Business["availablePlans"]>;
      statuses: Array<NonNullable<Business["subscriptionStatus"]>>;
    };
  }>("/api/admin/subscriptions");
  return data;
}

async function getAdminCalendar() {
  const { data } = await api.get<{ data: AdminCalendarJob[] }>("/api/admin/calendar");
  return data.data;
}

async function getAdminInbox() {
  const { data } = await api.get<{ data: AdminInboxItem[] }>("/api/admin/inbox");
  return data.data;
}

async function getBusinessWhatsapp() {
  const { data } = await api.get<{ data: BusinessWhatsappState }>("/api/business/whatsapp");
  return data.data;
}

export function useSessionQuery(enabled = true) {
  return useQuery({
    queryKey: ["session"],
    queryFn: getSession,
    retry: false,
    staleTime: 30_000,
    enabled,
  });
}

export function useBusinessQuery(enabled = true) {
  return useQuery({
    queryKey: ["business"],
    queryFn: getBusiness,
    retry: false,
    enabled,
  });
}

export function useDashboardStatsQuery(enabled = true) {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: getDashboardStats,
    enabled,
  });
}

export function useJobsQuery(params?: Record<string, string>, enabled = true) {
  return useQuery({
    queryKey: ["jobs", params],
    queryFn: () => getJobs(params),
    enabled,
  });
}

export function useJobQuery(id?: string) {
  return useQuery({
    queryKey: ["jobs", id],
    queryFn: () => getJob(id!),
    enabled: Boolean(id),
  });
}

export function useTechniciansQuery(enabled = true) {
  return useQuery({
    queryKey: ["technicians"],
    queryFn: getTechnicians,
    enabled,
  });
}

export function useTechniciansLiveQuery(enabled = true) {
  return useQuery({
    queryKey: ["technicians", "live"],
    queryFn: getTechniciansLive,
    enabled,
    refetchInterval: 30_000,
  });
}

export function useTechnicianSelfQuery(enabled = true) {
  return useQuery({
    queryKey: ["technician", "self"],
    queryFn: getTechnicianSelf,
    enabled,
    retry: false,
  });
}

export function useCustomersQuery(params?: Record<string, string>, enabled = true) {
  return useQuery({
    queryKey: ["customers", params],
    queryFn: () => getCustomers(params),
    enabled,
  });
}

export function useCustomerQuery(id?: string) {
  return useQuery({
    queryKey: ["customers", id],
    queryFn: () => getCustomer(id!),
    enabled: Boolean(id),
  });
}

export function useInvoicesQuery(params?: Record<string, string>, enabled = true) {
  return useQuery({
    queryKey: ["invoices", params],
    queryFn: () => getInvoices(params),
    enabled,
  });
}

export function useInventoryQuery(enabled = true) {
  return useQuery({
    queryKey: ["inventory"],
    queryFn: getInventory,
    enabled,
  });
}

export function useContractsQuery(enabled = true) {
  return useQuery({
    queryKey: ["contracts"],
    queryFn: getContracts,
    enabled,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const { data } = await api.post("/api/auth/sign-in/email", payload);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      await queryClient.invalidateQueries({ queryKey: ["business"] });
    },
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { name: string; email: string; password: string; phone?: string }) => {
      const { data } = await api.post("/api/auth/sign-up/email", payload);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/api/auth/sign-out");
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      await queryClient.invalidateQueries({ queryKey: ["business"] });
    },
  });
}

export function useSetupBusinessMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name: string;
      phone: string;
      email?: string;
      address: string;
      city: string;
      serviceType: string;
      plan: string;
    }) => {
      const { data } = await api.post<{ data: Business }>("/api/business/setup", payload);
      return data.data;
    },
    onSuccess: async (business) => {
      queryClient.setQueryData(["business"], business);
      await queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
    },
  });
}

export function useUpdateBusinessMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<Business>) => {
      const { data } = await api.patch<{ data: Business }>("/api/business/me", payload);
      return data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["business"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
    },
  });
}

export function useUpdateJobMutation(id?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.patch(`/api/jobs/${id}`, payload);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["jobs"] });
      await queryClient.invalidateQueries({ queryKey: ["jobs", id] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
    },
  });
}

export function useCreateInvoiceFromJobMutation(id?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/api/jobs/${id}/invoice`);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["jobs", id] });
      await queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useAdjustInventoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, delta }: { id: string; delta: number }) => {
      const { data } = await api.patch(`/api/inventory/${id}/adjust-stock`, { delta });
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["inventory"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
    },
  });
}

export function useCreateCustomerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name: string;
      phone: string;
      email?: string;
      address: string;
      units: string[];
    }) => {
      const { data } = await api.post("/api/customers", payload);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
    },
  });
}

export function useCreateTechnicianMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name: string;
      phone: string;
      specialties: string[];
      status: string;
      rating?: number;
    }) => {
      const { data } = await api.post("/api/technicians", payload);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["technicians"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
    },
  });
}

export function useUpdateTechnicianMutation(id?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.patch(`/api/technicians/${id}`, payload);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["technicians"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
    },
  });
}

export function useCreateTechnicianAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { technicianId: string; email: string; password?: string }) => {
      const { data } = await api.post<{ data: TechnicianAccountResult }>(
        `/api/technicians/${payload.technicianId}/account`,
        {
          email: payload.email,
          password: payload.password,
        },
      );
      return data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["technicians"] });
    },
  });
}

export function useResetTechnicianPasswordMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { technicianId: string; newPassword?: string }) => {
      const { data } = await api.post<{ data: TechnicianAccountResult }>(
        `/api/technicians/${payload.technicianId}/account/reset-password`,
        {
          newPassword: payload.newPassword,
        },
      );
      return data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["technicians"] });
    },
  });
}

export function useUpdateTechnicianAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { technicianId: string; email?: string; newPassword?: string }) => {
      const { data } = await api.patch<{ data: TechnicianAccountResult }>(
        `/api/technicians/${payload.technicianId}/account`,
        {
          email: payload.email,
          newPassword: payload.newPassword,
        },
      );
      return data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["technicians"] });
    },
  });
}

export function useForceLogoutTechnicianMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { technicianId: string }) => {
      const { data } = await api.post<{ data: TechnicianAccountResult }>(
        `/api/technicians/${payload.technicianId}/account/force-logout`,
      );
      return data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["technicians"] });
    },
  });
}

export function useDisableTechnicianAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { technicianId: string }) => {
      const { data } = await api.post<{ data: TechnicianAccountResult }>(
        `/api/technicians/${payload.technicianId}/account/disable`,
      );
      return data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["technicians"] });
    },
  });
}

export function useCreateJobMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.post("/api/jobs", payload);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["jobs"] });
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
    },
  });
}

export function useCreateInvoiceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.post("/api/invoices", payload);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["invoices"] });
      await queryClient.invalidateQueries({ queryKey: ["jobs"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
    },
  });
}

export function useUpdateInvoiceMutation(id?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.patch(`/api/invoices/${id}`, payload);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["invoices"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
      await queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useCreateInventoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.post("/api/inventory", payload);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["inventory"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
    },
  });
}

export function useCreateContractMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.post("/api/contracts", payload);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["contracts"] });
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
    },
  });
}

export function useAdminSubscriptionsQuery(enabled = true) {
  return useQuery({
    queryKey: ["admin", "subscriptions"],
    queryFn: getAdminSubscriptions,
    enabled,
  });
}

export function useAdminCalendarQuery(enabled = true) {
  return useQuery({
    queryKey: ["admin", "calendar"],
    queryFn: getAdminCalendar,
    enabled,
  });
}

export function useAdminInboxQuery(enabled = true) {
  return useQuery({
    queryKey: ["admin", "inbox"],
    queryFn: getAdminInbox,
    enabled,
  });
}

export function useBusinessWhatsappQuery(enabled = true) {
  return useQuery({
    queryKey: ["business", "whatsapp"],
    queryFn: getBusinessWhatsapp,
    enabled,
  });
}

export function useUpdateAdminSubscriptionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      businessId,
      payload,
    }: {
      businessId: string;
      payload: {
        plan?: "Starter" | "Pro" | "Bisnis";
        subscriptionStatus?:
          | "pending_payment"
          | "paid"
          | "active"
          | "trialing"
          | "past_due"
          | "paused"
          | "cancelled";
        trialEndsAt?: string | null;
        currentPeriodEndsAt?: string | null;
        subscriptionNotes?: string | null;
      };
    }) => {
      const { data } = await api.patch(`/api/admin/subscriptions/${businessId}`, payload);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "subscriptions"] });
      await queryClient.invalidateQueries({ queryKey: ["business"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
    },
  });
}

export function useResetClientPasswordMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { businessId: string; newPassword?: string }) => {
      const { data } = await api.post<{ data: AdminResetPasswordResult }>(
        "/api/admin/clients/reset-password",
        payload,
      );
      return data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "inbox"] });
    },
  });
}

export function useCreateBusinessSupportRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      type: "subscription_upgrade" | "subscription_renewal";
      targetPlan?: "Starter" | "Pro" | "Bisnis";
      message?: string;
    }) => {
      const { data } = await api.post<{ data: SupportRequestResult }>("/api/support-requests/business", payload);
      return data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "inbox"] });
      await queryClient.invalidateQueries({ queryKey: ["business"] });
    },
  });
}

export function useCreatePublicSupportRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      type: "password_help";
      requesterEmail: string;
      requesterName?: string;
      requesterPhone?: string;
      message?: string;
    }) => {
      const { data } = await api.post<{ data: SupportRequestResult }>("/api/support-requests/public", payload);
      return data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "inbox"] });
    },
  });
}

export function useUpdateBusinessWhatsappMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { mode: "basic" | "automation" }) => {
      const { data } = await api.patch<{ data: BusinessWhatsappState }>("/api/business/whatsapp", payload);
      return data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["business"] });
      await queryClient.invalidateQueries({ queryKey: ["business", "whatsapp"] });
    },
  });
}

export function useConnectBusinessWhatsappMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ data: BusinessWhatsappState }>("/api/business/whatsapp/connect");
      return data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["business"] });
      await queryClient.invalidateQueries({ queryKey: ["business", "whatsapp"] });
    },
  });
}

export function useBusinessWhatsappQrMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.get<{ data: BusinessWhatsappState }>("/api/business/whatsapp/qr");
      return data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["business"] });
      await queryClient.invalidateQueries({ queryKey: ["business", "whatsapp"] });
    },
  });
}

export function useDisconnectBusinessWhatsappMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ data: BusinessWhatsappState }>("/api/business/whatsapp/disconnect");
      return data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["business"] });
      await queryClient.invalidateQueries({ queryKey: ["business", "whatsapp"] });
    },
  });
}

export function useTechnicianCheckInMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { latitude: number; longitude: number }) => {
      const { data } = await api.post<{ data: TechnicianSelfProfile }>("/api/technician/check-in", payload);
      return data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["technician", "self"] });
      await queryClient.invalidateQueries({ queryKey: ["technicians"] });
      await queryClient.invalidateQueries({ queryKey: ["technicians", "live"] });
    },
  });
}

export function useTechnicianCheckOutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload?: { latitude?: number; longitude?: number }) => {
      const { data } = await api.post<{ data: TechnicianSelfProfile }>("/api/technician/check-out", payload ?? {});
      return data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["technician", "self"] });
      await queryClient.invalidateQueries({ queryKey: ["technicians"] });
      await queryClient.invalidateQueries({ queryKey: ["technicians", "live"] });
    },
  });
}

export function useTechnicianLocationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { latitude: number; longitude: number }) => {
      const { data } = await api.patch<{ data: TechnicianSelfProfile }>("/api/technician/location", payload);
      return data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["technician", "self"] });
      await queryClient.invalidateQueries({ queryKey: ["technicians"] });
      await queryClient.invalidateQueries({ queryKey: ["technicians", "live"] });
    },
  });
}

export function useSendBusinessWhatsappMutation() {
  return useMutation({
    mutationFn: async (payload: { phone: string; message: string }) => {
      const { data } = await api.post("/api/business/whatsapp/send-text", payload);
      return data;
    },
  });
}
