import { AnalysisResponse }
from "@/types/analysis";

export const MOCK_ANALYSIS_RESULT:
  AnalysisResponse = {
  summary: {
    total: 3,
    valid: 1,
    invalid: 1,
    retracted: 1,
  },

  results: [
    {
      doi: "10.1038/nature12373",

      title:
        "Deep Neural Networks",

      status: "valid",
    },

    {
      doi: "10.fake/abc123",

      title:
        "Unknown Reference",

      status: "invalid",
    },

    {
      doi:
        "10.1000/retracted001",

      title:
        "Retracted AI Paper",

      status: "retracted",
    },
  ],
};

