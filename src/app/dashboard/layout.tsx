import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/server-auth";
import { dbConnect } from "@/lib/db";
import { User } from "@/lib/models";
import DashboardShell from "@/components/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthenticatedUser();
  if (!session) {
    redirect("/login");
  }

  await dbConnect();
  const user = await User.findById(session.userId);

  if (!user) {
    redirect("/login");
  }

  const plainUser = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
  };

  return <DashboardShell user={plainUser}>{children}</DashboardShell>;
}
