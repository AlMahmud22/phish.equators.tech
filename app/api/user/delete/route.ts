import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/db";
import User from "@/lib/models/User";
import Scan from "@/lib/models/Scan";
import Log from "@/lib/models/Log";
import { logInfo, logWarning, getClientIp, getUserAgent } from "@/lib/logger";
import { sendAccountDeletionEmail } from "@/lib/email";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  const ipAddress = getClientIp(request.headers);
  const userAgent = getUserAgent(request.headers);

  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { password, confirmText } = await request.json();

    // Require confirmation text
    if (confirmText !== "DELETE MY ACCOUNT") {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Please type "DELETE MY ACCOUNT" to confirm' 
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // For credentials users, verify password
    if (user.provider === "credentials") {
      if (!password) {
        return NextResponse.json(
          { success: false, message: "Password is required to delete account" },
          { status: 400 }
        );
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash || '');
      
      if (!isValidPassword) {
        await logWarning(
          "Account Deletion Failed",
          "Invalid password",
          { 
            userId: session.user.id, 
            userName: user.name,
            ipAddress, 
            userAgent 
          }
        );
        return NextResponse.json(
          { success: false, message: "Invalid password" },
          { status: 400 }
        );
      }
    }

    const userEmail = user.email;
    const userName = user.name;
    const userId = (user._id as any).toString();

    // Delete all user data
    await Promise.all([
      User.deleteOne({ _id: user._id }),
      Scan.deleteMany({ userId: user._id }),
      Log.deleteMany({ userId: user._id }),
    ]);

    // Send deletion confirmation email
    await sendAccountDeletionEmail(userEmail, userName);

    await logInfo(
      "Account Deleted",
      `User account permanently deleted: ${userEmail}`,
      {
        userId,
        userName,
        ipAddress,
        userAgent,
        metadata: { 
          email: userEmail, 
          provider: user.provider,
          scansDeleted: true,
          logsDeleted: true,
        },
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Your account has been permanently deleted. We're sorry to see you go.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete account" },
      { status: 500 }
    );
  }
}
