"use client";

import {
  Upload,
  FileText,
  LoaderCircle,
} from "lucide-react";

type Props = {
  selectedFile: File | null;

  onFileSelect: (
    file: File | null
  ) => void;

  onAnalyze: () => void;

  isAnalyzing: boolean;
};

export default function UploadCard({
  selectedFile,
  onFileSelect,
  onAnalyze,
  isAnalyzing,
}: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">

      {/* Upload Area */}
      <div className="border-2 border-dashed border-blue-300 rounded-3xl p-14 flex flex-col items-center text-center hover:border-blue-500 transition">

        <div className="w-20 h-20 rounded-3xl bg-blue-600 text-white flex items-center justify-center shadow-lg">
          <Upload size={34} />
        </div>

        <h2 className="mt-6 text-2xl font-semibold text-slate-900">
          Upload Manuscript
        </h2>

        <p className="mt-3 text-slate-500 max-w-xl leading-relaxed">
          Upload a PDF manuscript for DOI
          verification and reference
          integrity analysis.
        </p>

        <input
          type="file"
          accept=".pdf"
          className="hidden"
          id="pdf-upload"
          onChange={(e) => {
            const file =
              e.target.files?.[0] || null;

            onFileSelect(file);
          }}
        />

        <label
          htmlFor="pdf-upload"
          className="mt-8 px-8 py-4 rounded-2xl bg-blue-600 text-white font-medium cursor-pointer hover:bg-blue-700 transition"
        >
          Select PDF File
        </label>
      </div>

      {/* Selected File */}
      {selectedFile && (
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
              <FileText className="text-slate-600" />
            </div>

            <div>
              <p className="font-medium text-slate-800">
                {selectedFile.name}
              </p>

              <p className="text-sm text-slate-500">
                Ready for analysis
              </p>
            </div>
          </div>

          <button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className={`
  relative
  overflow-hidden
  flex
  items-center
  justify-center
  gap-2

  px-6
  py-3

  rounded-2xl

  bg-slate-900
  text-white
  font-medium

  transition-all
  duration-300

  hover:bg-slate-800
  hover:scale-105

  disabled:opacity-70
  disabled:cursor-not-allowed
`}
          >
          {isAnalyzing && (
  <span className="absolute inset-y-0 -left-20 w-20 bg-white/20 skew-x-[-20deg] animate-shimmer" />
)}
            {isAnalyzing ? (
  <>
    <LoaderCircle
      size={18}
      className="animate-spin"
    />
    <span>Analyzing...</span>
  </>
) : (
  "Analyze"
)}
          </button>
        </div>
      )}
    </div>
  );
}

