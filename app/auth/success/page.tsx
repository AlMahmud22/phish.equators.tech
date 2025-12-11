"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Desktop Auth Success Page
 * 
 * This page is shown after successful authentication.
 * It attempts to redirect to the desktop app via the phishguard:// protocol.
 * If the desktop app is not installed, it shows instructions.
 */
export default function AuthSuccessPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const [countdown, setCountdown] = useState(3);
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    if (!code) {
      return;
    }

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          attemptProtocolRedirect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [code]);

  const attemptProtocolRedirect = () => {
    if (!code) return;

    const protocolUrl = `phishguard://auth?code=${code}`;
    
    try {
      // Try to redirect to custom protocol
      window.location.href = protocolUrl;
      setRedirected(true);
      
      // Check if redirect failed after 2 seconds
      setTimeout(() => {
        // If still on this page, show manual link
        console.log("Protocol redirect may have failed, showing manual option");
      }, 2000);
    } catch (error) {
      console.error("Failed to redirect to desktop app:", error);
    }
  };

  const handleManualClick = () => {
    if (code) {
      const protocolUrl = `phishguard://auth?code=${code}`;
      window.location.href = protocolUrl;
    }
  };

  if (!code) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Invalid Request
          </h1>
          <p className="text-gray-600 mb-6">
            No authorization code found. Please try logging in again from the desktop app.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
            ✓
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Login Successful!
          </h1>
          <p className="text-gray-600">
            You can now close this window and return to PhishGuard Desktop.
          </p>
        </div>

        {countdown > 0 && (
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600">
              Redirecting to desktop app in {countdown}...
            </p>
            <div className="mt-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
        )}

        {countdown === 0 && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800 text-center">
                🖥️ Opening PhishGuard Desktop...
              </p>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 text-center mb-3">
                Desktop app didn't open?
              </p>
              <button
                onClick={handleManualClick}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Open PhishGuard Desktop
              </button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Make sure PhishGuard Desktop is installed and running
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-center gap-4 text-sm">
            <a
              href="/dashboard"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Go to Web Dashboard
            </a>
            <span className="text-gray-300">|</span>
            <a
              href="/"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
