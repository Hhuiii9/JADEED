import { cookies } from "next/headers";
import { verifyJWT } from "./auth";

export async function getAuthenticatedUser() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("jadeed_session")?.value;
    
    if (!sessionToken) {
      return null;
    }

    return await verifyJWT(sessionToken);
  } catch (error) {
    console.error("Error authenticating request:", error);
    return null;
  }
}
