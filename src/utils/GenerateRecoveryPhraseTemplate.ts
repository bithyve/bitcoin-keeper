import RNHTMLtoPDF from 'react-native-html-to-pdf';

const GenerateRecoveryPhraseTemplate = async () => {
  let tableHTML = '';
  let tableHTML2 = '';
  for (let i = 0; i < 15; i++) {
    tableHTML += `
            <tr>
                <td style="border-right-style:solid; border-right-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify; widows:0; orphans:0; ">${
                      i + 1
                    }</p>
                </td>
                <td style="width:500px; border-left-style:solid; border-left-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; widows:0; orphans:0; "> </p>
                </td>
            </tr>
        `;
  }

  for (let i = 15; i < 30; i++) {
    tableHTML2 += `
            <tr>
                <td style="border-right-style:solid; border-right-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify; widows:0; orphans:0; ">${
                      i + 1
                    }</p>
                </td>
                <td style="width:500px; border-left-style:solid; border-left-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; widows:0; orphans:0; "> </p>
                </td>
            </tr>
        `;
  }
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
                font-size:32px;
              }
            </style>
          </head>
          <body>
      <p style="margin-top:0pt; margin-left:108pt; margin-bottom:0pt; text-indent:55.9pt; text-align:justify; margin-bottom:50px">Recovery Phrase Template:</p>
    <div style="display:flex;justify-content:center;align-items:center;">
    <table cellspacing="0" cellpadding="0" style="margin-right:9pt; margin-left:9pt; border:0.75pt solid #000000; border-collapse:collapse;">
    <tbody>
    <tr>
    <td style="border-right-style:solid; border-right-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
        <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify; widows:0; orphans:0; ">Sr No.</p>
    </td>
    <td style="width:500px; border-left-style:solid; border-left-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
        <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; widows:0; orphans:0; ">Seed Word </p>
    </td>
</tr>
    ${tableHTML}  
    </tbody>
</table>

<table cellspacing="0" cellpadding="0" style="margin-right:9pt; margin-left:9pt; border:0.75pt solid #000000; border-collapse:collapse;">
<tbody>
<tr>
<td style="border-right-style:solid; border-right-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
    <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify; widows:0; orphans:0; ">Sr No.</p>
</td>
<td style="width:500px; border-left-style:solid; border-left-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; widows:0; orphans:0; ">Seed Word </p>
</td>
</tr>
${tableHTML2}  
</tbody>
</table>
    </div>
            </body>
        </html>
      `;
    const options = {
      html,
      fileName: 'RecoveryPhraseInstruction',
      directory: 'Documents',
      base64: true,
    };
    const file = await RNHTMLtoPDF.convert(options);
    return file.filePath;
  } catch (error: any) {
    return error;
  }
};

export default GenerateRecoveryPhraseTemplate;
