"use client";

import { useState, useRef, } from "react";

import Header from "@/components/manuscript-scoring/Header";

import ServiceSelector from "@/components/manuscript-scoring/ServiceSelector";

import { ServiceType } from "@/types/service";

import UploadCard from "@/components/manuscript-scoring/UploadCard";

import SummaryCards
from "@/components/manuscript-scoring/SummaryCards";

import ResultTable
from "@/components/manuscript-scoring/ResultTable";

import { AnalysisResponse }
from "@/types/analysis";


export default function ManuscriptScoringPage() {
  const [activeService, setActiveService] =
    useState<ServiceType>(
      "reference-checker"
    );
  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [isAnalyzing, setIsAnalyzing] =
    useState(false);
  
  const [analysisResult, setAnalysisResult] =
    useState<AnalysisResponse | null>(
    null
    );

  const resultRef = useRef<HTMLDivElement | null>( null );

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    try {
      setIsAnalyzing(true);

      const formData =
        new FormData();

      formData.append(
        "file",
        selectedFile
      );

      const response =
        await fetch(
          "/api/manuscript-scoring/reference-checker",
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      console.log(data);

      setAnalysisResult({
        summary: {
          total:
            data.results.length,

          valid:
            data.results.filter(
              (r: any) =>
                r.status === "valid"
            ).length,

          invalid:
            data.results.filter(
              (r: any) =>
                r.status ===
                "invalid"
            ).length,

          retracted:
            data.results.filter(
              (r: any) =>
                r.status ===
                "retracted"
            ).length,
        },

        results: data.results,
      });

setTimeout(() => {
  resultRef.current?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}, 100);


    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };






  return (
    <div className="min-h-screen bg-slate-50">

      <div className="max-w-7xl mx-auto px-6 py-10">

        <Header />

        <div className="mt-10">
          <ServiceSelector
            activeService={
              activeService
            }
            onChange={
              setActiveService
            }
          />
        </div>

        <div className="mt-10">
          <UploadCard
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
          />
        </div>

        {analysisResult && (
          <div ref={resultRef} className="mt-10 space-y-10">

            <SummaryCards
              summary={
                analysisResult.summary
              }
            />

            <ResultTable
              results={
                analysisResult.results
              }
            />

          </div>
        )}

      </div>
    </div>
  );
}

