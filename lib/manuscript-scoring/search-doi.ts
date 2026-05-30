export async function searchDOI(
  reference: string
) {

  try {

    /*
    ========================
    SHORTEN QUERY
    ========================
    */

    const query =
      reference.slice(0, 200);

    /*
    ========================
    SEARCH CROSSREF
    ========================
    */

    const response =
      await fetch(
        `https://api.crossref.org/works?query.bibliographic=${encodeURIComponent(
          query
        )}&rows=1`
      );

    if (!response.ok) {
      return null;
    }

    const data =
      await response.json();

    const item =
      data.message?.items?.[0];

    if (!item) {
      return null;
    }

    return {
      doi: item.DOI,

      title:
        item.title?.[0],
    };

  } catch (error) {

    console.error(
      "DOI search failed:",
      error
    );

    return null;
  }
}

