/**
 * Desktop OAuth Flow Endpoint
 * 
 * This page handles the authentication flow for the PhishGuard desktop application:
 * 1. Checks if user has an active NextAuth session
 * 2. If not logged in, redirects to login page with callback
 * 3. If logged in, generates a one-time authorization code
 * 4. Redirects to phishguard://auth?code=XXX custom protocol URL
 * 
 * This mimics the ChatGPT Desktop authentication flow
 */

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { generateOneTimeCode } from "@/lib/oneTimeCode";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";

export default async function DesktopAuthPage() {
  // Check if user is logged in
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    // User not logged in - redirect to login page with callback
    const callbackUrl = encodeURIComponent("/auth/desktop");
    redirect(`/login?callbackUrl=${callbackUrl}`);
  }

  // User is logged in - generate one-time code
  await dbConnect();
  
  const user = await User.findOne({ email: session.user.email });

  if (!user) {
    // User not found in database
    redirect("/login?error=UserNotFound");
  }

  // Generate one-time authorization code
  const code = await generateOneTimeCode(
    String(user._id),
    user.email,
    user.role
  );

  console.log(`[Desktop Auth] Generated code for ${user.email}: ${code.substring(0, 8)}...`);

  // Redirect to custom protocol URL
  // The desktop app will catch this and exchange the code for tokens
  const protocolUrl = `phishguard://auth?code=${code}`;
  
  // For browsers that support custom protocols, redirect directly
  // For others, show a fallback page
  redirect(`/auth/success?code=${code}`);
}
