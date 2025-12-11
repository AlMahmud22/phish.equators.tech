"use client";

import { useState } from "react";
import type { UserSettings } from "@/types";

interface SettingsFormProps {
  settings: UserSettings;
  onSave: (settings: Partial<UserSettings>) => Promise<void>;
  isLoading?: boolean;
}

/// SettingsForm component for editing user preferences
/// handles theme, notifications, language, and timezone settings
export default function SettingsForm({ settings, onSave, isLoading = false }: SettingsFormProps) {
  const [formData, setFormData] = useState({
    theme: settings.theme,
    notifications: { ...settings.notifications },
    language: settings.language,
    timezone: settings.timezone,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  /// handle input changes for simple fields
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /// handle notification checkbox changes
  const handleNotificationChange = (key: keyof UserSettings["notifications"], value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  };

  /// submit form and update user settings
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);

    try {
      await onSave(formData);
      setSaveMessage({ type: "success", text: "Settings saved successfully!" });
    } catch (error) {
      console.error("Failed to save settings:", error);
      setSaveMessage({ type: "error", text: "Failed to save settings. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Save message */}
      {saveMessage && (
        <div
          className={`p-4 rounded-lg ${
            saveMessage.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {saveMessage.text}
        </div>
      )}

      {/* Appearance section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h3>
        
        <div className="space-y-4">
          {/* Theme selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
            <div className="grid grid-cols-3 gap-3">
              {["light", "dark", "auto"].map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => handleChange("theme", theme)}
                  className={`px-4 py-3 rounded-lg border-2 transition-colors capitalize ${
                    formData.theme === theme
                      ? "border-primary-600 bg-primary-50 text-primary-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>

          {/* Language selector */}
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              id="language"
              value={formData.language}
              onChange={(e) => handleChange("language", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="ar">Arabic</option>
            </select>
          </div>

          {/* Timezone selector */}
          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              id="timezone"
              value={formData.timezone}
              onChange={(e) => handleChange("timezone", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time (US)</option>
              <option value="America/Chicago">Central Time (US)</option>
              <option value="America/Denver">Mountain Time (US)</option>
              <option value="America/Los_Angeles">Pacific Time (US)</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
              <option value="Asia/Dubai">Dubai</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
        
        <div className="space-y-4">
          {/* Email notifications */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-500">Receive scan results and alerts via email</p>
            </div>
            <button
              type="button"
              onClick={() => handleNotificationChange("email", !formData.notifications.email)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.notifications.email ? "bg-primary-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.notifications.email ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Desktop notifications */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Desktop Notifications</p>
              <p className="text-sm text-gray-500">Show browser notifications for important updates</p>
            </div>
            <button
              type="button"
              onClick={() => handleNotificationChange("desktop", !formData.notifications.desktop)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.notifications.desktop ? "bg-primary-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.notifications.desktop ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Phishing alerts */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Phishing Alerts</p>
              <p className="text-sm text-gray-500">Get immediate alerts when phishing is detected</p>
            </div>
            <button
              type="button"
              onClick={() => handleNotificationChange("phishingAlerts", !formData.notifications.phishingAlerts)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.notifications.phishingAlerts ? "bg-primary-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.notifications.phishingAlerts ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Account section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              placeholder="Enter current password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              placeholder="Enter new password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm new password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <button type="button" className="btn-secondary w-full">
            Change Password
          </button>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end space-x-4">
        <button type="button" className="btn-secondary" disabled={isSaving}>
          Reset
        </button>
        <button type="submit" className="btn-primary" disabled={isSaving || isLoading}>
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
