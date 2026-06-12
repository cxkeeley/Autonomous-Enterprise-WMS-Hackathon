import { useState, useRef, type ChangeEvent } from "react";
import apiClient from "../api/client";

interface Props {
  onUploadComplete: (objectKey: string) => void;
}

export default function FileUpload({ onUploadComplete }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post("/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onUploadComplete(response.data.object_key);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? String((err as { response: { data: { detail?: string } } }).response?.data?.detail || "Upload failed")
          : "Upload failed";
      setError(msg);
    } finally {
      setIsUploading(false);
      // Reset input so the same file can be re-selected
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Receipt Document
      </label>
      <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-indigo-400 transition-colors">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.gif"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          {isUploading ? (
            <p className="text-sm text-gray-500">Uploading...</p>
          ) : fileName ? (
            <p className="text-sm text-green-600">{fileName} uploaded</p>
          ) : (
            <>
              <p className="text-sm text-gray-500">Click to upload a receipt</p>
              <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 10MB</p>
            </>
          )}
        </label>
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
