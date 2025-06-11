// app/dashboard/layout.tsx
import ClientLayout from "./ClientLayout";

export const metadata = {
  title: "Dashboard | Suzalink CRM",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>;
}
