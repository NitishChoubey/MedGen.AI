"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (selectedFile: File) => {
    setError("");
    setSuccess(false);

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Only PDF, JPG, and PNG files are allowed");
      return;
    }

    if (selectedFile.size > maxSize) {
      setError("File size must be less than 10MB");
      return;
    }

    setFile(selectedFile);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError("");
    setProgress(0);
    setStatusMessage("Uploading file...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 300);

      setStatusMessage("Uploading and processing...");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      const data = await response.json();

      if (response.ok && data.success) {
        setProgress(100);
        setStatusMessage("Upload successful! AI is processing your document...");
        setSuccess(true);
        
        // Redirect to analyses page after a short delay
        setTimeout(() => {
          router.push("/patient/analyses");
        }, 2000);
      } else {
        setError(data.error || "Upload failed. Please try again.");
        setProgress(0);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("An error occurred during upload. Please try again.");
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Upload Document</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Upload medical documents for AI analysis
        </p>
      </div>

      {/* Upload Card */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6">
        {/* Drag & Drop Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <Upload
            className={`mx-auto h-12 w-12 ${
              dragActive ? "text-blue-500" : "text-gray-400"
            }`}
          />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            {dragActive ? "Drop your file here" : "Upload your medical document"}
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Drag and drop your file here, or click to browse
          </p>

          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileInputChange}
            disabled={uploading}
          />

          <label
            htmlFor="file-upload"
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer disabled:opacity-50"
          >
            Select File
          </label>

          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Supported formats: PDF, JPG, PNG (Max 10MB)
          </p>
        </div>

        {/* File Preview */}
        {file && (
          <div className="mt-6">
            <div className="bg-gray-50 dark:bg-slate-950 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                {!uploading && (
                  <button
                    onClick={() => setFile(null)}
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-400"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Progress Bar */}
              {uploading && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span className="flex items-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {statusMessage}
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="mt-4 flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
                  <CheckCircle className="h-5 w-5" />
                  <div>
                    <span className="text-sm font-medium block">Upload successful!</span>
                    <span className="text-xs">Redirecting to your analyses...</span>
                  </div>
                </div>
              )}

              {/* Upload Button */}
              {!uploading && !success && (
                <button
                  onClick={handleUpload}
                  className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </button>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6">
          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Secure Storage
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            All documents are encrypted and stored securely with HIPAA compliance
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6">
          <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Analysis</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Advanced AI extracts insights and identifies key medical information
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6">
          <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
            <Upload className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Easy Access
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Access your documents anytime, anywhere from any device
          </p>
        </div>
      </div>
    </div>
  );
}
