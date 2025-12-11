"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify?token=${token}`);
        const data = await response.json();

        if (data.success) {
          setStatus("success");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Unable to verify email. Please try again.");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="card">
          <div className="text-center">
            {status === "loading" && (
              <>
                <div className="mb-4 text-6xl animate-pulse">⏳</div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Verifying Email...
                </h1>
                <p className="text-gray-600">Please wait while we verify your email address.</p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="mb-4 text-6xl">✅</div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Email Verified!
                </h1>
                <p className="text-gray-600 mb-6">{message}</p>
                <Link href="/login" className="inline-block btn-primary">
                  Go to Login
                </Link>
              </>
            )}

            {status === "error" && (
              <>
                <div className="mb-4 text-6xl">❌</div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Verification Failed
                </h1>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="space-y-3">
                  <Link href="/login" className="block btn-primary">
                    Go to Login
                  </Link>
                  <Link
                    href="/register"
                    className="block text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    Register Again
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
