import PDFParser from "pdf2json";

export async function extractText(
  buffer: Buffer
): Promise<string> {
  return new Promise(
    (resolve, reject) => {

      const pdfParser =
        new PDFParser();

      pdfParser.on(
        "pdfParser_dataError",
        (errData: Error | { parserError: Error }) => {
          if ("parserError" in errData) {
            reject(errData.parserError);
          } else {
            reject(errData);
          }
        }
      );

      pdfParser.on(
        "pdfParser_dataReady",
        (pdfData) => {

          let text = "";

          for (
            const page of pdfData.Pages
          ) {
            for (
              const textItem of page.Texts
            ) {
              for (
                const run of textItem.R
              ) {
                try {
                text +=
                    decodeURIComponent(
                    run.T
                    ) + " ";
                } catch {
                text += run.T + " ";
                }
              }
            }
          }

          resolve(text);
        }
      );

      pdfParser.parseBuffer(buffer);
    }
  );
}

