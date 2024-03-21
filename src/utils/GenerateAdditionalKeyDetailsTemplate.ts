import RNHTMLtoPDF from 'react-native-html-to-pdf';

const GenerateAdditionalKeyDetailsTemplate = async () => {
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
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; font-size:7.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Additional Key Details - Can be used in any m-of-n combination to create one or more vaults (multi-key wallets)</span></p>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; font-size:7.5pt;"><br></p>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; font-size:7.5pt;"><br></p>
          <table cellspacing="0" cellpadding="0" style="width:100%; margin-right:9pt; margin-left:9pt; border-collapse:collapse; float:left;">
              <tbody>
                  <tr style="height:11.35pt;">
                      <td colspan="2" style="width:158.85pt; border-top:0.75pt solid #bdd6ee; border-right:0.75pt solid #bdd6ee; border-left:0.75pt solid #bdd6ee; border-bottom:1.5pt solid #9cc2e5; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Key 1 (Fingerprint/ ID):&nbsp;</span></p>
                      </td>
                  </tr>
                  <tr style="height:11.35pt;">
                      <td style="width:75.5pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Type: &nbsp;</span></p>
                      </td>
                      <td style="width:72.55pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">PIN: Guess</span></p>
                      </td>
                  </tr>
                  <tr style="height:11.35pt;">
                      <td style="width:75.5pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <div style="border-bottom:1pt solid #e7e6e6; clear:both;">
                              <p style="margin-top:0pt; margin-bottom:0pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Location:&nbsp;</span></p>
                              <p style="margin-top:0pt; margin-bottom:0pt; padding-bottom:2pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">&nbsp;</span></p>
                          </div>
                      </td>
                      <td style="width:72.55pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <div style="border-bottom:1pt solid #e7e6e6; clear:both;">
                              <p style="margin-top:0pt; margin-bottom:0pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Software version:</span></p>
                              <p style="margin-top:0pt; margin-bottom:0pt; padding-bottom:2pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">&nbsp;</span></p>
                          </div>
                      </td>
                  </tr>
                  <tr style="height:11.35pt;">
                      <td colspan="2" style="width:158.85pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Key 2 (Fingerprint/ ID):&nbsp;</span></p>
                      </td>
                  </tr>
                  <tr style="height:11.35pt;">
                      <td style="width:75.5pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Type:&nbsp;</span></p>
                      </td>
                      <td style="width:72.55pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">PIN: Guess - Guess</span></p>
                      </td>
                  </tr>
                  <tr style="height:11.35pt;">
                      <td style="width:75.5pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <div style="border-bottom:1pt solid #e7e6e6; clear:both;">
                              <p style="margin-top:0pt; margin-bottom:0pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Location:&nbsp;</span></p>
                              <p style="margin-top:0pt; margin-bottom:0pt; padding-bottom:2pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">&nbsp;</span></p>
                          </div>
                      </td>
                      <td style="width:72.55pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <div style="border-bottom:1pt solid #e7e6e6; clear:both;">
                              <p style="margin-top:0pt; margin-bottom:0pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Software version:</span></p>
                              <p style="margin-top:0pt; margin-bottom:0pt; padding-bottom:2pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">&nbsp;</span></p>
                          </div>
                      </td>
                  </tr>
                  <tr style="height:11.35pt;">
                      <td colspan="2" style="width:158.85pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Key 3 (Fingerprint/ ID):&nbsp;</span></p>
                      </td>
                  </tr>
                  <tr style="height:11.35pt;">
                      <td style="width:75.5pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Type:&nbsp;</span></p>
                      </td>
                      <td style="width:72.55pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">PIN:&nbsp;</span></p>
                      </td>
                  </tr>
                  <tr style="height:11.35pt;">
                      <td style="width:75.5pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <div style="border-bottom:1pt solid #e7e6e6; clear:both;">
                              <p style="margin-top:0pt; margin-bottom:0pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Location:&nbsp;</span></p>
                              <p style="margin-top:0pt; margin-bottom:0pt; padding-bottom:2pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">&nbsp;</span></p>
                          </div>
                      </td>
                      <td style="width:72.55pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <div style="border-bottom:1pt solid #e7e6e6; clear:both;">
                              <p style="margin-top:0pt; margin-bottom:0pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Software version:</span></p>
                              <p style="margin-top:0pt; margin-bottom:0pt; padding-bottom:2pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">&nbsp;</span></p>
                          </div>
                      </td>
                  </tr>
                  <tr style="height:11.35pt;">
                      <td style="width:75.5pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Key 4 (Fingerprint/ ID):&nbsp;</span></p>
                      </td>
                      <td style="border-top:0.75pt solid #bdd6ee; border-bottom:0.75pt solid #bdd6ee; vertical-align:top;"><span style="font-size: 15px;"><br></span></td>
                  </tr>
                  <tr style="height:11.35pt;">
                      <td style="width:75.5pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Type:</span></p>
                      </td>
                      <td style="width:72.55pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">PIN:</span></p>
                      </td>
                  </tr>
                  <tr style="height:11.35pt;">
                      <td style="width:75.5pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <div style="border-bottom:1pt solid #e7e6e6; clear:both;">
                              <p style="margin-top:0pt; margin-bottom:0pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Location:&nbsp;</span></p>
                              <p style="margin-top:0pt; margin-bottom:0pt; padding-bottom:2pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">&nbsp;</span></p>
                          </div>
                      </td>
                      <td style="width:72.55pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <div style="border-bottom:1pt solid #e7e6e6; clear:both;">
                              <p style="margin-top:0pt; margin-bottom:0pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Software version:</span></p>
                              <p style="margin-top:0pt; margin-bottom:0pt; padding-bottom:2pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">&nbsp;</span></p>
                          </div>
                      </td>
                  </tr>
                  <tr style="height:0pt;">
                      <td style="width:216.75pt;"><span style="font-size: 15px;"><br></span></td>
                      <td style="width:209.35pt;"><span style="font-size: 15px;"><br></span></td>
                  </tr>
              </tbody>
          </table>
          <p style="margin-top:0pt; margin-bottom:0pt; font-size:8pt;"><span style="font-family: Helvetica; font-size: 15px;">&nbsp;</span></p>
          <table cellspacing="0" cellpadding="0" style="width:100%; margin-right:9pt; margin-left:9pt; border-collapse:collapse; float:left;">
              <tbody>
                  <tr style="height:11.35pt;">
                      <td colspan="2" style="width:158.8pt; border-top:0.75pt solid #bdd6ee; border-right:0.75pt solid #bdd6ee; border-left:0.75pt solid #bdd6ee; border-bottom:1.5pt solid #9cc2e5; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Key 5 (Fingerprint/ ID):&nbsp;</span></p>
                      </td>
                  </tr>
                  <tr style="height:11.35pt;">
                      <td style="width:75.5pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Type:&nbsp;</span></p>
                      </td>
                      <td style="width:72.5pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">PIN:</span></p>
                      </td>
                  </tr>
                  <tr style="height:11.35pt;">
                      <td style="width:75.5pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <div style="border-bottom:1pt solid #e7e6e6; clear:both;">
                              <p style="margin-top:0pt; margin-bottom:0pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Location:&nbsp;</span></p>
                              <p style="margin-top:0pt; margin-bottom:0pt; padding-bottom:2pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">&nbsp;</span></p>
                          </div>
                      </td>
                      <td style="width:72.5pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <div style="border-bottom:1pt solid #e7e6e6; clear:both;">
                              <p style="margin-top:0pt; margin-bottom:0pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Software version:</span></p>
                              <p style="margin-top:0pt; margin-bottom:0pt; padding-bottom:2pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">&nbsp;</span></p>
                          </div>
                      </td>
                  </tr>
                  <tr style="height:11.35pt;">
                      <td colspan="2" style="width:158.8pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Key 6 (Fingerprint/ ID):</span></p>
                      </td>
                  </tr>
                  <tr style="height:11.35pt;">
                      <td style="width:75.5pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Type:&nbsp;</span></p>
                      </td>
                      <td style="width:72.5pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">PIN:</span></p>
                      </td>
                  </tr>
                  <tr style="height:11.35pt;">
                      <td style="width:75.5pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <div style="border-bottom:1pt solid #e7e6e6; clear:both;">
                              <p style="margin-top:0pt; margin-bottom:0pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Location:&nbsp;</span></p>
                              <p style="margin-top:0pt; margin-bottom:0pt; padding-bottom:2pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">&nbsp;</span></p>
                          </div>
                      </td>
                      <td style="width:72.5pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <div style="border-bottom:1pt solid #e7e6e6; clear:both;">
                              <p style="margin-top:0pt; margin-bottom:0pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Software version:</span></p>
                              <p style="margin-top:0pt; margin-bottom:0pt; padding-bottom:2pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">&nbsp;</span></p>
                          </div>
                      </td>
                  </tr>
                  <tr style="height:11.35pt;">
                      <td colspan="2" style="width:158.8pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Key 7 (Fingerprint/ ID):&nbsp;</span></p>
                      </td>
                  </tr>
                  <tr style="height:11.35pt;">
                      <td style="width:75.5pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Type:&nbsp;</span></p>
                      </td>
                      <td style="width:72.5pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">PIN:</span></p>
                      </td>
                  </tr>
                  <tr style="height:11.35pt;">
                      <td style="width:75.5pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <div style="border-bottom:1pt solid #e7e6e6; clear:both;">
                              <p style="margin-top:0pt; margin-bottom:0pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Location:&nbsp;</span></p>
                              <p style="margin-top:0pt; margin-bottom:0pt; padding-bottom:2pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">&nbsp;</span></p>
                          </div>
                      </td>
                      <td style="width:72.5pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <div style="border-bottom:1pt solid #e7e6e6; clear:both;">
                              <p style="margin-top:0pt; margin-bottom:0pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Software version:</span></p>
                              <p style="margin-top:0pt; margin-bottom:0pt; padding-bottom:2pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">&nbsp;</span></p>
                          </div>
                      </td>
                  </tr>
                  <tr style="height:11.35pt;">
                      <td style="width:75.5pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Key 8 (Fingerprint/ ID):</span></p>
                      </td>
                      <td style="border-top:0.75pt solid #bdd6ee; border-bottom:0.75pt solid #bdd6ee; vertical-align:top;"><span style="font-size: 15px;"><br></span></td>
                  </tr>
                  <tr style="height:11.35pt;">
                      <td style="width:75.5pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Type:&nbsp;&nbsp;</span></p>
                      </td>
                      <td style="width:72.5pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">PIN:</span></p>
                      </td>
                  </tr>
                  <tr style="height:11.35pt;">
                      <td style="width:75.5pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <div style="border-bottom:1pt solid #e7e6e6; clear:both;">
                              <p style="margin-top:0pt; margin-bottom:0pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Location:&nbsp;</span></p>
                              <p style="margin-top:0pt; margin-bottom:0pt; padding-bottom:2pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">&nbsp;</span></p>
                          </div>
                      </td>
                      <td style="width:72.5pt; border:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <div style="border-bottom:1pt solid #e7e6e6; clear:both;">
                              <p style="margin-top:0pt; margin-bottom:0pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">Software version:</span></p>
                              <p style="margin-top:0pt; margin-bottom:0pt; padding-bottom:2pt; font-size:5.5pt;"><span style="font-family: Helvetica; font-size: 15px;">&nbsp;</span></p>
                          </div>
                      </td>
                  </tr>
                  <tr style="height:0pt;">
                      <td style="width:216.8pt;"><span style="font-size: 15px;"><br></span></td>
                      <td style="width:209.3pt;"><span style="font-size: 15px;"><br></span></td>
                  </tr>
              </tbody>
          </table>
          <p style="margin-top:0pt; margin-bottom:0pt; font-size:8pt;"><span style="font-family: Helvetica; font-size: 15px;">&nbsp;</span></p>
          <p style="margin-top:0pt; margin-bottom:0pt; font-size:6.5pt;"><span style="font-size: 15px;"><strong><span style="font-family:Helvetica;">&nbsp;</span></strong></span></p>
          <p style="margin-top:0pt; margin-bottom:0pt; font-size:6.5pt;"><span style="font-size: 15px;"><strong><span style="font-family:Helvetica;">Additional Info (If any):&nbsp;</span></strong></span></p>
          <p style="margin-top:0pt; margin-bottom:0pt; font-size:6.5pt;"><span style="font-size: 15px;"><strong><span style="font-family:Helvetica;">&nbsp;</span></strong></span></p>
      </div>
            </body>
        </html>
      `;
    const options = {
      html,
      fileName: 'AdditionalKeyDetailsTemplate',
      directory: 'Documents',
      base64: true,
    };
    const file = await RNHTMLtoPDF.convert(options);
    return file.filePath;
  } catch (error: any) {
    return error;
  }
};

export default GenerateAdditionalKeyDetailsTemplate;
