import type {
  AIReviewResult as AIReviewResultType
} from "@/types/ai-review";

type Props = {
  result: AIReviewResultType;
};

export default function
AIReviewResult({
  result,
}: Props) {

  return (

    <div className="
      space-y-8
    ">

      <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        lg:grid-cols-4
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
            Grammar
          </h2>

          <p className="
            mt-4
            text-4xl
            font-bold
          ">
            {
              result.summary
                .grammarCount
            }
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
            Style
          </h2>

          <p className="
            mt-4
            text-4xl
            font-bold
          ">
            {
              result.summary
                .styleCount
            }
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
            Coherence
          </h2>

          <p className="
            mt-4
            text-4xl
            font-bold
          ">
            {
              result.summary
                .coherenceCount
            }
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
            Rewrites
          </h2>

          <p className="
            mt-4
            text-4xl
            font-bold
          ">
            {
              result.summary
                .rewriteCount
            }
          </p>
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
          mb-4
        ">
          Grammar Issues
        </h2>

        <div className="
          space-y-4
        ">

          {
            result.grammarIssues.map(
              (
                issue,
                index
              ) => (
                <div
                  key={index}
                  className="
                    border
                    rounded-xl
                    p-4
                  "
                >

                  <p className="
                    font-medium
                  ">
                    {
                      issue.sentence
                    }
                  </p>

                  <p className="
                    mt-2
                    text-red-500
                  ">
                    {
                      issue.issue
                    }
                  </p>

                  <p className="
                    mt-2
                    text-green-600
                  ">
                    {
                      issue.suggestion
                    }
                  </p>

                </div>
              )
            )
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
          mb-4
        ">
          Style Issues
        </h2>

        <div className="
          space-y-4
        ">

          {
            result.styleIssues.map(
              (
                issue,
                index
              ) => (
                <div
                  key={index}
                  className="
                    border
                    rounded-xl
                    p-4
                  "
                >

                  <p className="
                    font-medium
                  ">
                    {
                      issue.sentence
                    }
                  </p>

                  <p className="
                    mt-2
                    text-red-500
                  ">
                    {
                      issue.issue
                    }
                  </p>

                  <p className="
                    mt-2
                    text-green-600
                  ">
                    {
                      issue.suggestion
                    }
                  </p>

                </div>
              )
            )
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
          mb-4
        ">
          Coherence Issues
        </h2>

        <div className="
          space-y-4
        ">

          {
            result.coherenceIssues.map(
              (
                issue,
                index
              ) => (
                <div
                  key={index}
                  className="
                    border
                    rounded-xl
                    p-4
                  "
                >

                  <p className="
                    font-medium
                  ">
                    {
                      issue.section
                    }
                  </p>

                  <p className="
                    mt-2
                    text-red-500
                  ">
                    {
                      issue.issue
                    }
                  </p>

                  <p className="
                    mt-2
                    text-green-600
                  ">
                    {
                      issue.suggestion
                    }
                  </p>

                </div>
              )
            )
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
          mb-4
        ">
          Rewrite Suggestions
        </h2>

        <div className="
          space-y-4
        ">

          {
            result.rewriteSuggestions.map(
              (
                suggestion,
                index
              ) => (
                <div
                  key={index}
                  className="
                    border
                    rounded-xl
                    p-4
                  "
                >

                  <p className="
                    text-sm
                    text-slate-500
                  ">
                    Original
                  </p>

                  <p className="
                    mt-2
                  ">
                    {
                      suggestion.original
                    }
                  </p>

                  <p className="
                    mt-4
                    text-sm
                    text-slate-500
                  ">
                    Rewritten
                  </p>

                  <p className="
                    mt-2
                    text-green-600
                  ">
                    {
                      suggestion.rewritten
                    }
                  </p>

                  <p className="
                    mt-4
                    text-sm
                    text-slate-500
                  ">
                    {
                      suggestion.reason
                    }
                  </p>

                </div>
              )
            )
          }

        </div>

      </div>

    </div>
  );
}

