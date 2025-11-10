import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";

export default async function AdminPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Admin Dashboard
        </h1>

        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Welcome, Admin!</h2>
          <p className="text-gray-600 mb-4">
            You have full administrative access to the PhishGuard system.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Role:</strong> {session.user.role}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Email:</strong> {session.user.email}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="font-semibold mb-2">User Management</h3>
            <p className="text-sm text-gray-600 mb-4">
              Manage users, roles, and permissions
            </p>
            <button className="btn-primary text-sm">Manage Users</button>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-2">System Settings</h3>
            <p className="text-sm text-gray-600 mb-4">
              Configure system-wide settings
            </p>
            <button className="btn-primary text-sm">View Settings</button>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-2">Analytics</h3>
            <p className="text-sm text-gray-600 mb-4">
              View detailed system analytics
            </p>
            <button className="btn-primary text-sm">View Reports</button>
          </div>
        </div>
      </div>
    </div>
  );
}
