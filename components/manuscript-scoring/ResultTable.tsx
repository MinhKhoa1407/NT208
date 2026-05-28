import { DOIResult }
from "@/types/doi";

type Props = {
  results: DOIResult[];
};

export default function ResultTable({
  results,
}: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">

      <div className="px-8 py-6 border-b border-slate-200">

        <h3 className="text-xl font-semibold text-slate-900">
          DOI Verification Results
        </h3>
      </div>

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="bg-slate-50">
            <tr>

              <th className="text-left px-8 py-4 text-sm font-medium text-slate-500">
                DOI
              </th>

              <th className="text-left px-8 py-4 text-sm font-medium text-slate-500">
                Title
              </th>

              <th className="text-left px-8 py-4 text-sm font-medium text-slate-500">
                Status
              </th>

            </tr>
          </thead>

          <tbody>
            {results.map((item) => (
              <tr
                key={item.doi}
                className="border-t border-slate-100"
              >

                <td className="px-8 py-5 font-mono text-sm text-slate-700">
                  {item.doi}
                </td>

                <td className="px-8 py-5 text-slate-700">
                  {item.title || "-"}
                </td>

                <td className="px-8 py-5">

                  {item.status ===
                    "valid" && (
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                      Valid
                    </span>
                  )}

                  {item.status ===
                    "invalid" && (
                    <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
                      Invalid
                    </span>
                  )}

                  {item.status ===
                    "retracted" && (
                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium">
                      Retracted
                    </span>
                  )}

                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}

