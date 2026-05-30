export type VerifiedDOI = {
  doi: string;

  title?: string;

  status:
    | "valid"
    | "invalid"
    | "retracted";
};

export async function verifyDOI(
  doi: string
): Promise<VerifiedDOI> {

  try {

    const response =
      await fetch(
        `https://api.crossref.org/works/${encodeURIComponent(
          doi
        )}`
      );

    /*
    ========================
    INVALID DOI
    ========================
    */

    if (!response.ok) {
      return {
        doi,
        status: "invalid",
      };
    }

    const data =
      await response.json();

    const work =
      data.message;

    /*
    ========================
    TITLE
    ========================
    */

    const title =
      work.title?.[0];

    /*
    ========================
    RETRACTION CHECK
    ========================
    */

    const isRetracted =
      !!work.relation?.[
        "is-retracted-by"
      ];

    return {
      doi,

      title,

      status:
        isRetracted
          ? "retracted"
          : "valid",
    };

  } catch (error) {

    console.error(
      "DOI verification failed:",
      doi,
      error
    );

    return {
      doi,
      status: "invalid",
    };
  }
}

