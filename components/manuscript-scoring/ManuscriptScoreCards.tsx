import { ManuscriptScore }
from "@/types/manuscript-score";

type Props = {
  result:
    ManuscriptScore;
};

export default function
ManuscriptScoreCards({
  result,
}: Props) {

  return (

    <div className="
      grid
      grid-cols-1
      md:grid-cols-2
      gap-6
    ">

      <div className="
        border
        rounded-2xl
        bg-white
        p-6
      ">
        <h2 className="
          text-lg
          font-semibold
          text-slate-700
        ">
          Overall Score
        </h2>

        <p className="
          mt-4
          text-5xl
          font-bold
        ">
          {result.overall}
        </p>
      </div>

      <div className="
        border
        rounded-2xl
        bg-white
        p-6
      ">
        <h2 className="
          text-lg
          font-semibold
          text-slate-700
        ">
          Structure
        </h2>

        <p className="
          mt-4
          text-3xl
          font-bold
        ">
          {result.structure.score}
          /
          {result.structure.maxScore}
        </p>

        <div className="
          mt-4
          text-sm
          text-slate-500
        ">
          Missing:
          {" "}

          {
            result.structure
              .missingSections
              .length > 0

              ? result.structure
                  .missingSections
                  .join(", ")

              : "None"
          }
        </div>
      </div>

      <div className="
        border
        rounded-2xl
        bg-white
        p-6
      ">
        <h2 className="
          text-lg
          font-semibold
          text-slate-700
        ">
          Keywords
        </h2>

        <p className="
          mt-4
          text-3xl
          font-bold
        ">
          {result.keywords.score}
          /
          {result.keywords.maxScore}
        </p>

        <div className="
          mt-4
          text-sm
          text-slate-500
        ">
          Generic:
          {" "}

          {
            result.keywords
              .genericKeywords
              .length > 0

              ? result.keywords
                  .genericKeywords
                  .join(", ")

              : "None"
          }
        </div>
      </div>

      <div className="
        border
        rounded-2xl
        bg-white
        p-6
      ">
        <h2 className="
          text-lg
          font-semibold
          text-slate-700
        ">
          Length
        </h2>

        <p className="
          mt-4
          text-3xl
          font-bold
        ">
          {result.length.score}
          /
          {result.length.maxScore}
        </p>

        <div className="
          mt-4
          text-sm
          text-slate-500
        ">
          Words:
          {" "}
          {result.length.wordCount}
        </div>
      </div>

      {
        result.warnings
          ?.length > 0 && (

          <div className="
            md:col-span-2
            border
            rounded-2xl
            bg-white
            p-6
          ">

            <h2 className="
              text-lg
              font-semibold
              text-red-500
            ">
              Warnings
            </h2>

            <ul className="
              mt-4
              list-disc
              ml-6
              space-y-2
              text-sm
            ">

              {
                result.warnings.map(
                  (
                    warning
                  ) => (
                    <li
                      key={
                        warning
                      }
                    >
                      {warning}
                    </li>
                  )
                )
              }

            </ul>

          </div>
        )
      }

    </div>
  );
}

