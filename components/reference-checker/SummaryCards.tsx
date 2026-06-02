import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";

import { Summary }
from "@/types/analysis";

type Props = {
  summary: Summary;
};

export default function SummaryCards({
  summary,
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      {/* VALID */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">

        <p className="text-sm text-slate-500">
          Valid DOI
        </p>

        <div className="mt-3 flex items-center gap-3">

          <CheckCircle2 className="text-green-500" />

          <span className="text-4xl font-bold text-slate-900">
            {summary.valid}
          </span>
        </div>
      </div>

      {/* INVALID */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">

        <p className="text-sm text-slate-500">
          Invalid DOI
        </p>

        <div className="mt-3 flex items-center gap-3">

          <XCircle className="text-red-500" />

          <span className="text-4xl font-bold text-slate-900">
            {summary.invalid}
          </span>
        </div>
      </div>

      {/* RETRACTED */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">

        <p className="text-sm text-slate-500">
          Retracted Papers
        </p>

        <div className="mt-3 flex items-center gap-3">

          <AlertTriangle className="text-yellow-500" />

          <span className="text-4xl font-bold text-slate-900">
            {summary.retracted}
          </span>
        </div>
      </div>
    </div>
  );
}

