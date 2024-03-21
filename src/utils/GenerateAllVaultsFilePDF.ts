import RNHTMLtoPDF from 'react-native-html-to-pdf';

const GenerateAllVaultsFilePDF = async (fingerPrints) => {
  try {
    const html = `
        <html>
          <head>
            <style>
              body {
                font-family: 'Calibri';
                font-size: 25px;
              }
              header, footer {
                height: 50px;
                background-color: #fff;
                color: #000;
                display: flex;
                justify-content: center;
                padding: 0 20px;
              }
              p{
                font-size:25px;
              }
            </style>
          </head>
          <body>

            <h4>Vault Configuration File Information:</h4>
            <p style='padding-left:10px'>${fingerPrints
              .map((keys, index) => `<p>Key ${index + 1} File: ${keys.file}</p>`)
              .join('')}</p>
            </body>
        </html>
      `;
    const options = {
      html,
      fileName: 'LetterToAtterny',
      directory: 'Documents',
      base64: true,
    };
    const file = await RNHTMLtoPDF.convert(options);
    return file.filePath;
  } catch (error: any) {
    return error;
  }
};

export default GenerateAllVaultsFilePDF;
