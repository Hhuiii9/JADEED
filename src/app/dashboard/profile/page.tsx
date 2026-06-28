import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/server-auth";
import { dbConnect } from "@/lib/db";
import { User } from "@/lib/models";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
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
    name: user.name,
    email: user.email,
    phone: user.phone,
    created_at: user.created_at.toISOString(),
  };

  return <ProfileClient user={plainUser} />;
}
