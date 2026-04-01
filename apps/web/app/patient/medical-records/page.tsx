import { FileText, Upload } from "lucide-react";
import Link from "next/link";

export default function MedicalRecordsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
          <p className="mt-2 text-gray-600">
            View and manage your medical documents
          </p>
        </div>
        <Link
          href="/patient/upload"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Link>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-lg shadow">
        <div className="text-center py-12 px-6">
          <FileText className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No medical records yet
          </h3>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            Get started by uploading your medical documents. You can upload lab
            results, prescriptions, imaging reports, and more.
          </p>
          <div className="mt-6">
            <Link
              href="/patient/upload"
              className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="h-5 w-5 mr-2" />
              Upload Your First Document
            </Link>
          </div>

          {/* Supported File Types */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              Supported File Types
            </p>
            <div className="mt-4 flex justify-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded bg-red-100 flex items-center justify-center">
                  <span className="text-xs font-semibold text-red-700">
                    PDF
                  </span>
                </div>
                <span className="text-sm text-gray-600">PDF Documents</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded bg-green-100 flex items-center justify-center">
                  <span className="text-xs font-semibold text-green-700">
                    JPG
                  </span>
                </div>
                <span className="text-sm text-gray-600">Images</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center">
                  <span className="text-xs font-semibold text-blue-700">
                    PNG
                  </span>
                </div>
                <span className="text-sm text-gray-600">Scans</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon: Document Grid */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Advanced Document Management Coming Soon
            </h3>
            <p className="mt-1 text-sm text-blue-700">
              We're working on features like document categorization, search,
              sharing with doctors, and AI-powered insights.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
