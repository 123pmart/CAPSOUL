import { cookies } from "next/headers";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { getCurrentAdminFromCookieStore } from "@/lib/admin-auth";
import { listLeads } from "@/lib/leads";
import { listResolvedMediaSlots } from "@/lib/media";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const currentAdmin = await getCurrentAdminFromCookieStore(cookieStore);

  if (!currentAdmin) {
    return <AdminLoginForm />;
  }

  const [leads, mediaSlots, siteContent] = await Promise.all([
    listLeads(),
    listResolvedMediaSlots(),
    getSiteContent(),
  ]);

  return (
    <AdminDashboard
      currentAdmin={currentAdmin}
      initialLeads={leads}
      initialMediaSlots={mediaSlots}
      initialSiteContent={siteContent}
    />
  );
}
