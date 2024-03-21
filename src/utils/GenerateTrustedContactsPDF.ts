import RNHTMLtoPDF from 'react-native-html-to-pdf';

const GenerateTrustedContactsPDF = async () => {
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
          <div>
          <p style="margin-top:0pt; margin-bottom:0pt; font-size:7.5pt;"><strong><span style="font-family: Helvetica; font-size: 15px;">Trusted contact list&nbsp;</span></strong></p>
          <p style="margin-top:0pt; margin-bottom:0pt; font-size:7.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Add details of people who could help the heir to receive the bitcoin</span></p>
          <p style="margin-top:0pt; margin-bottom:0pt; font-size:7.5pt;"><span style="font-family: Helvetica; font-size: 15px;">&nbsp;</span></p>
          <table cellspacing="0" cellpadding="0" style="width:100%; border-collapse:collapse;">
              <tbody>
                  <tr style="height:11.35pt;">
                      <td colspan="3" style="width:158.85pt; border-top:0.75pt solid #bdd6ee; border-right:0.75pt solid #bdd6ee; border-left:0.75pt solid #bdd6ee; border-bottom:1.5pt solid #9cc2e5; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:7.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Contact 1:</span><span style="font-size: 15px;"><strong><span style="font-family:Helvetica;">&nbsp;</span></strong></span></p>
                      </td>
                  </tr>
                  <tr style="height:11.35pt;">
                      <td colspan="3" style="width:158.85pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:7.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Address:&nbsp;</span></p>
                      </td>
                  </tr>
                  <tr style="height:11.35pt;">
                      <td colspan="2" style="width:75.55pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:7.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Phone:&nbsp;</span></p>
                      </td>
                      <td style="width:72.5pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:7.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Email:&nbsp;</span></p>
                      </td>
                  </tr>
                  <tr style="height:11.35pt;">
                      <td colspan="3" style="width:158.85pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:7.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Contact 2:&nbsp;</span></p>
                      </td>
                  </tr>
                  <tr style="height:11.35pt;">
                      <td colspan="3" style="width:158.85pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:7.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Address:&nbsp;</span></p>
                      </td>
                  </tr>
                  <tr style="height:11.35pt;">
                      <td style="width:74.05pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:7.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Phone:&nbsp;</span></p>
                      </td>
                      <td colspan="2" style="width:74pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:7.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Email:&nbsp;</span></p>
                      </td>
                  </tr>
                  <tr style="height:11.35pt;">
                      <td colspan="3" style="width:158.85pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:7.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Contact 3:&nbsp;</span></p>
                      </td>
                  </tr>
                  <tr style="height:11.35pt;">
                      <td colspan="3" style="width:158.85pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:7.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Address:&nbsp;</span></p>
                      </td>
                  </tr>
                  <tr style="height:11.35pt;">
                      <td style="width:74.05pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:7.5pt;"><span style="font-size: 15px;"><strong><span style="font-family:Helvetica;">Phone:</span></strong></span></p>
                      </td>
                      <td colspan="2" style="width:74pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:7.5pt;"><span style="font-size: 15px;"><strong><span style="font-family:Helvetica;">Email:&nbsp;</span></strong></span></p>
                      </td>
                  </tr>
                  <tr style="height:11.35pt;">
                      <td colspan="3" style="width:158.85pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:7.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Contact 4:&nbsp;&nbsp;</span></p>
                      </td>
                  </tr>
                  <tr style="height:11.35pt;">
                      <td colspan="3" style="width:158.85pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; font-size:7.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Address:&nbsp;</span></p>
                      </td>
                  </tr>
                  <tr style="height:11.35pt;">
                      <td colspan="2" style="width:75.55pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:7.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Phone:&nbsp;&nbsp;</span></p>
                      </td>
                      <td style="width:72.5pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:7.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Email:&nbsp;</span></p>
                      </td>
                  </tr>
                  <tr style="height:11.35pt;">
                      <td colspan="3" style="width:158.85pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <div style="border-bottom:1pt solid #e7e6e6; clear:both;">
                              <p style="margin-top:0pt; margin-bottom:0pt; font-size:7.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Additional details:&nbsp;</span></p>
                              <p style="margin-top:0pt; margin-bottom:0pt; padding-bottom:2pt; font-size:7.5pt;"><span style="font-family: Helvetica; font-size: 15px;">&nbsp;</span></p>
                          </div>
                      </td>
                  </tr>
                  <tr style="height:0pt;">
                      <td style="width:213.15pt;"><span style="font-size: 15px;"><br></span></td>
                      <td style="width:3.75pt;"><span style="font-size: 15px;"><br></span></td>
                      <td style="width:209.2pt;"><span style="font-size: 15px;"><br></span></td>
                  </tr>
              </tbody>
          </table>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; font-size:10.5pt;"><span style="font-size: 15px;"><strong><span style="font-family:Helvetica;">&nbsp;</span></strong></span></p>
          <p style="margin-top:0pt; margin-bottom:0pt;"><span style="font-size: 15px;">&nbsp;</span></p>
      </div>
            </body>
        </html>
      `;
    const options = {
      html,
      fileName: 'TrustedContactsTemplate',
      directory: 'Documents',
      base64: true,
    };
    const file = await RNHTMLtoPDF.convert(options);
    return file.filePath;
  } catch (error: any) {
    return error;
  }
};

export default GenerateTrustedContactsPDF;
