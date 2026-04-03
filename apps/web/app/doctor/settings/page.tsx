"use client";

import { useState } from "react";
import { Settings, Bell, Shield, Moon, Globe, Save } from "lucide-react";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("en");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
        <Settings className="h-8 w-8 mr-3 text-blue-600" />
        Settings
      </h1>

      {/* Notifications */}
      <div className="bg-white dark:bg-slate-900 dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
          <Bell className="h-5 w-5 mr-2 text-blue-500" />
          Notifications
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div><p className="font-medium text-gray-900 dark:text-white">Push Notifications</p><p className="text-sm text-gray-500 dark:text-gray-400">Receive alerts for new pending reviews</p></div>
            <button onClick={() => setNotifications(!notifications)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-900 transition-transform ${notifications ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div><p className="font-medium text-gray-900 dark:text-white">Email Alerts</p><p className="text-sm text-gray-500 dark:text-gray-400">Get daily summary of pending documents</p></div>
            <button onClick={() => setEmailAlerts(!emailAlerts)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${emailAlerts ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-900 transition-transform ${emailAlerts ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-slate-900 dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
          <Moon className="h-5 w-5 mr-2 text-purple-500" />
          Appearance
        </h2>
        <div className="flex items-center justify-between">
          <div><p className="font-medium text-gray-900 dark:text-white">Dark Mode</p><p className="text-sm text-gray-500 dark:text-gray-400">Use dark theme across the dashboard</p></div>
          <button onClick={() => { setDarkMode(!darkMode); document.documentElement.classList.toggle("dark"); }} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${darkMode ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-900 transition-transform ${darkMode ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>
      </div>

      {/* Language */}
      <div className="bg-white dark:bg-slate-900 dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
          <Globe className="h-5 w-5 mr-2 text-green-500" />
          Language
        </h2>
        <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full md:w-64 p-3 bg-gray-50 dark:bg-slate-950 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
        </select>
      </div>

      {/* Security */}
      <div className="bg-white dark:bg-slate-900 dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
          <Shield className="h-5 w-5 mr-2 text-red-500" />
          Security
        </h2>
        <div className="space-y-4">
          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">Change Password</button>
          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 ml-3">Enable 2FA</button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all">
          <Save className="h-5 w-5 mr-2" />
          Save Changes
        </button>
      </div>
    </div>
  );
}
