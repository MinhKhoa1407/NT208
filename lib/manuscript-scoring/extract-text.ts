import PDFParser from "pdf2json";

export async function extractText(
  buffer: Buffer
): Promise<string> {

  return new Promise(
    (resolve, reject) => {

      const pdfParser =
        new PDFParser();

      /*
      ========================
      HANDLE ERRORS
      ========================
      */

      pdfParser.on(
        "pdfParser_dataError",
        (
          errData:
            | Error
            | {
                parserError:
                  Error;
              }
        ) => {

          if (
            "parserError" in
            errData
          ) {

            reject(
              errData.parserError
            );

          } else {

            reject(errData);
          }
        }
      );

      /*
      ========================
      HANDLE SUCCESS
      ========================
      */

      pdfParser.on(
        "pdfParser_dataReady",
        (pdfData) => {

          let text = "";

          /*
          ========================
          ITERATE PAGES
          ========================
          */

          for (
            const page of
            pdfData.Pages
          ) {

            /*
            ========================
            ITERATE TEXT ITEMS
            ========================
            */

            for (
              const textItem of
              page.Texts
            ) {

              /*
              ========================
              ITERATE TEXT RUNS
              ========================
              */

              for (
                const run of
                textItem.R
              ) {

                try {

                  text +=
                    decodeURIComponent(
                      run.T
                    ) + " ";

                } catch {

                  text +=
                    run.T + " ";
                }
              }

              /*
              ========================
              PRESERVE LINE BREAKS
              ========================
              */

              text += "\n";
            }

            /*
            ========================
            PAGE BREAK
            ========================
            */

            text += "\n\n";
          }

          /*
          ========================
          CLEAN TEXT
          ========================
          */

          text =
            text.replace(
              /\s+\n/g,
              "\n"
            );

          text =
            text.replace(
              /\n{3,}/g,
              "\n\n"
            );

          text =
            text.replace(
              /[￾]/g,
              ""
            );

          /*
          ========================
          RETURN TEXT
          ========================
          */

          resolve(text);
        }
      );

      /*
      ========================
      PARSE BUFFER
      ========================
      */

      pdfParser.parseBuffer(
        buffer
      );
    }
  );
}

