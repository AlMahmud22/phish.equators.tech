import { redirect } from "next/navigation";
import { getServerSession, isTester } from "@/lib/auth";

export default async function TesterPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login");
  }

  if (!isTester(session)) {
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Tester Dashboard
        </h1>

        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Welcome, Tester!</h2>
          <p className="text-gray-600 mb-4">
            You have access to testing tools and resources.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              <strong>Role:</strong> {session.user.role}
            </p>
            <p className="text-sm text-green-800">
              <strong>Email:</strong> {session.user.email}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-semibold mb-2">Test Scanner</h3>
            <p className="text-sm text-gray-600 mb-4">
              Test the phishing detection system
            </p>
            <button className="btn-primary text-sm">Run Tests</button>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-2">Test Reports</h3>
            <p className="text-sm text-gray-600 mb-4">
              View and submit test reports
            </p>
            <button className="btn-primary text-sm">View Reports</button>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-2">Test Data</h3>
            <p className="text-sm text-gray-600 mb-4">
              Access test URLs and datasets
            </p>
            <button className="btn-primary text-sm">Browse Data</button>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-2">Bug Tracker</h3>
            <p className="text-sm text-gray-600 mb-4">
              Report bugs and issues
            </p>
            <button className="btn-primary text-sm">Submit Bug</button>
          </div>
        </div>
      </div>
    </div>
  );
}
