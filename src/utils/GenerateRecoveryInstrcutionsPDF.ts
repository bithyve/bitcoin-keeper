import RNHTMLtoPDF from 'react-native-html-to-pdf';

const GenerateRecoveryInstrcutionsPDF = async () => {
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
                font-size: 25px;
              }
              h4{
                align-items: center;
              }
            </style>
          </head>
          <body>
          <div>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; font-size:10.5pt;"><br><strong><span style="font-family:Helvetica;">Recovery Instructions Document</span></strong></p>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify; font-size:7.5pt;"><span style="font-family:Helvetica;">&nbsp;</span></p>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify; font-size:7.5pt;"><br><span style="font-family:Helvetica;">Welcome Beneficiary,</span></p>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify; font-size:7.5pt;"><br><span style="font-family:Helvetica;">You are about to receive the most unique inheritance mankind has ever seen. Your benefactor has willed their bitcoin to you. They carefully stacked bitcoin, made sure to keep up with technology to keep it safe for you, and setup a robust inheritance plan to ensure you received the bitcoin after they moved on. Clearly you meant the world to them. Do take your time with this document as you work to take custody of your benefactor&rsquo;s bitcoin. Please accept our thoughts and prayers for your family and the dearly departed.</span><br><br><span style="font-family:Helvetica;">Kind Regards,</span><br><span style="font-family:Helvetica;">Team Keeper</span><span style="font-family:Helvetica;">&nbsp;&nbsp;</span><br><br><span style="font-family:Helvetica;">-------------------------------------------------------------------------------------------------------------------------------------------------------------------</span></p>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify; font-size:7.5pt;"><span style="font-family:Helvetica;">&nbsp;</span></p>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify; font-size:7.5pt;"><span style="font-family:Helvetica;">This document is part of a comprehensive plan to pass on your benefactor&rsquo;s bitcoin controlled by specific cryptographic keys. Herein, you will find information and instructions for recovering the intended funds once you can access some or all the keys.&nbsp;</span></p>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify; font-size:7.5pt;"><span style="font-family:Helvetica;">&nbsp;</span></p>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify; font-size:7.5pt;"><em><span style="font-family:Helvetica;">Legal Disclaimer:</span></em><span style="font-family:Helvetica;">&nbsp;This document is for informational purposes only and does not constitute legal advice. It should be used alongside legal and financial advice from qualified professionals. The creators of this document are not liable for any losses or damages arising from its use.</span></p>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify; font-size:7.5pt;"><em><span style="font-family:Helvetica;">Note on Ownership:</span></em><span style="font-family:Helvetica;">&nbsp;This document helps access digital assets but does not establish legal ownership. Legal ownership must be established through legal documentation like a will. Consult legal professionals for compliance with inheritance laws.</span></p>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify; font-size:7.5pt;"><br><span style="font-family:Helvetica;">&nbsp;</span></p>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify; font-size:10.5pt;"><strong><span style="font-family:Helvetica;">&nbsp;</span></strong></p>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify; font-size:10.5pt;"><strong><span style="font-family:Helvetica;">Bitcoin Wallets and Keys</span></strong></p>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify; font-size:8pt;"><span style="font-family:Helvetica;">&nbsp;</span></p>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify; font-size:7.5pt;"><span style="font-family:Helvetica;">Bitcoin is held in wallets with m-of-n configurations where m and n represent the number of keys. Any m out of n keys are needed to control the access to the funds, i.e. for signing transactions from the wallet. For example, a 1-of-1 wallet (typically called a singlesig wallet) has one Key needed to sign transactions from that wallet. Meanwhile, a 3-of-5 wallet (typically called a multisig or multi-key wallet) will need any 3 of the five keys to sign a transaction. The setup of the wallets is generally stored in a Wallet Configuration file, also referred to as output descriptors or BSMS files.&nbsp;</span></p>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify; font-size:7.5pt;"><span style="font-family:Helvetica;">&nbsp;</span></p>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify; font-size:7.5pt;"><span style="font-family:Helvetica;">The keys which control your benefactor&rsquo;s funds in the intended wallets would be secured by them in hardware devices, software apps, or written down as BIP 39 seed words. Access to some of these keys will be needed along with the Wallet Configuration details to gain complete access.&nbsp;</span><br><span style="font-family:Helvetica;">Details of these Keys may be included by your benefactor along with this document or provided separately.&nbsp;</span></p>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify; font-size:7.5pt;"><span style="font-family:Helvetica;">&nbsp;</span></p>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify; font-size:10.5pt;"><strong><span style="font-family:Helvetica;">&nbsp;</span></strong></p>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify; font-size:10.5pt;"><strong><span style="font-family:Helvetica;">Support and Assistance</span></strong></p>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify; font-size:8pt;"><span style="font-family:Helvetica;">&nbsp;</span></p>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify; font-size:7.5pt;"><span style="font-family:Helvetica;">Suppose the beneficiary is not experienced with handling bitcoin keys. In that case, they may want to consult specific individuals to help them recover funds in the bitcoin wallets. Seek opinions from multiple experts, preferably those who do not collaborate, to ensure unbiased assistance. The benefactor may provide a list of Trusted Individuals who are competent to help in this regard.</span></p>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify; font-size:7.5pt;"><span style="font-family:Helvetica;">&nbsp;</span></p>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify; font-size:7.5pt;"><span style="font-family:Helvetica;">Even when consulting with experts, never share the cryptographic keys with them. These keys can be in the form of hardware devices, software/ apps or written recovery phrase words. They can also be digital information in the form of long cryptographic material.&nbsp;</span></p>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify; font-size:7.5pt;"><span style="font-family:Helvetica;">&nbsp;</span></p>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify; font-size:7.5pt;"><span style="font-family:Helvetica;">It may be a good idea to understand some of them using the References section, which includes guides and recommended software for bitcoin wallet management.</span></p>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify;">&nbsp;</p>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify;">&nbsp;</p>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify; font-size:10.5pt;"><strong><span style="font-family:Helvetica;">Wallet Recreation/ Recovery Process</span></strong></p>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify; font-size:8pt;"><span style="font-family:Helvetica;">&nbsp;</span></p>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify; font-size:7.5pt;"><span style="font-family:Helvetica;">The process may vary depending on the software being used. Below is a brief on how this can be achieved in three different ways:</span></p>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify; font-size:7.5pt;"><span style="font-family:Helvetica;">&nbsp;</span></p>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify; font-size:7.5pt;"><strong><span style="font-family:Helvetica;">Using the Bitcoin Keeper</span></strong><span style="font-family:Helvetica; font-size:5pt;"><sup>1</sup></span><strong><span style="font-family:Helvetica;">&nbsp;App:&nbsp;</span></strong><br><span style="font-family:Helvetica;">This is the easiest and the least error-prone method. You will only need the App Recovery Phrase (twelve-word app seed) for this method.&nbsp;</span></p>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify; font-size:7.5pt;"><span style="font-family:Helvetica;">&nbsp;</span></p>
          <ol type="1" style="margin:0pt; padding-left:0pt;">
              <li style="margin-left:11.25pt; text-align:justify; padding-left:6.75pt; font-family:Helvetica; font-size:7.5pt;">Download the Bitcoin Keeper app from a trusted source like App Stores or through their hosted APKs.</li>
              <li style="margin-left:11.25pt; text-align:justify; padding-left:6.75pt; font-family:Helvetica; font-size:7.5pt;">Once installed, do not create a new app. Please follow the in-app instructions on how to recover an existing app.</li>
              <li style="margin-left:11.25pt; text-align:justify; padding-left:6.75pt; font-family:Helvetica; font-size:7.5pt;">You will be prompted to enter the twelve-word Recovery Phrase.</li>
              <li style="margin-left:11.25pt; text-align:justify; padding-left:6.75pt; font-family:Helvetica; font-size:7.5pt;">Once provided, the whole app with all the wallets (single-key and multi-key) are reproduced.</li>
          </ol>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify;">&nbsp;</p>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify; font-size:10.5pt;"><strong><span style="font-family:Helvetica; font-size:7.5pt;">Using other wallet coordinator software:</span></strong><br><span style="font-family:Helvetica; font-size:7.5pt;">This method can be used on any wallet/ coordinator software, but the beneficiary will need all the Wallet Configuration files. These may be provided by the benefactor along with this document or separately.</span></p>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify; font-size:7.5pt;"><span style="font-family:Helvetica;">&nbsp;</span></p>
          <ol type="1" style="margin:0pt; padding-left:0pt;">
              <li style="margin-left:29.25pt; text-align:justify; padding-left:6.75pt; font-family:Helvetica; font-size:7.5pt;">Each wallet has its configuration file that can provide &quot;watch-only&quot; access to these wallets.</li>
              <li style="margin-left:29.25pt; text-align:justify; padding-left:6.75pt; font-family:Helvetica; font-size:7.5pt;">Import these configuration or descriptor files into a supported software application from the References.</li>
              <li style="margin-left:29.25pt; text-align:justify; padding-left:6.75pt; font-family:Helvetica; font-size:7.5pt;">The wallets showing balances are the ones with funds.</li>
              <li style="margin-left:29.25pt; text-align:justify; padding-left:6.75pt; font-family:Helvetica; font-size:7.5pt;">The software should also highlight which keys have been used by that wallet using Master Fingerprint.</li>
          </ol>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify; font-size:7.5pt;"><span style="font-family:Helvetica;">Perform a small test transaction with keys matching the Master Fingerprints to ensure full access.</span></p>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify; font-size:7.5pt;"><span style="font-family:Helvetica;">&nbsp;</span></p>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify; font-size:7.5pt;"><strong><span style="font-family:Helvetica;">Using All n Keys (For Advanced Users):</span></strong></p>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify; font-size:7.5pt;"><span style="font-family:Helvetica;">This method should only be used when the above two options are not possible. Any wallet coordinator software can be used, but you will need all the Keys for this method.&nbsp;</span></p>
          <p style="margin-top:0pt; margin-left:18pt; margin-bottom:0pt; text-align:justify; font-size:7.5pt;"><span style="font-family:Helvetica;">&nbsp;</span></p>
          <ol type="1" style="margin:0pt; padding-left:0pt;">
              <li style="margin-left:11.25pt; text-align:justify; padding-left:6.75pt; font-family:Helvetica; font-size:7.5pt;">Suitable for recovering wallets without a configuration file.</li>
              <li style="margin-left:11.25pt; text-align:justify; padding-left:6.75pt; font-family:Helvetica; font-size:7.5pt;">Gather all n Keys. In the software you choose (see the References section for suggestions), try recreating all possible wallets with different combinations of these n keys.</li>
              <li style="margin-left:11.25pt; text-align:justify; padding-left:6.75pt; font-family:Helvetica; font-size:7.5pt;">For different wallets, try combinations of n (e.g., if there are five keys, try combinations with n = 1, 2, 3, 4, and 5).</li>
              <li style="margin-left:11.25pt; text-align:justify; padding-left:6.75pt; font-family:Helvetica; font-size:7.5pt;">Within each combination, experiment with different values of m (such that m &le; n) to find the correct scheme that allows access to the assets.</li>
              <li style="margin-left:11.25pt; text-align:justify; padding-left:6.75pt; font-family:Helvetica; font-size:7.5pt;">The References section includes guides for this process, including standard information like derivation paths and script types for both singlesig and multisig options.</li>
          </ol>
          <p style="margin-top:0pt; margin-bottom:0pt; font-size:7.5pt;"><span style="font-family:Helvetica;">&nbsp;</span></p>
          <p style="margin-top:0pt; margin-bottom:0pt; font-size:7.5pt;"><span style="font-family:Helvetica;">&nbsp;</span></p>
          <p style="margin-top:0pt; margin-bottom:0pt; text-align:center;"><strong><span style="font-family:Helvetica;">References: Resources and Software</span></strong></p>
          <p style="margin-top:0pt; margin-bottom:0pt; font-size:8pt;"><span style="font-family:Helvetica;">Guides for understanding bitcoin keys:&nbsp;</span></p>
          <table cellspacing="0" cellpadding="0" style="width:100%; border:0.75pt solid #bdd6ee; border-collapse:collapse;">
              <tbody>
                  <tr style="height:3.8pt;">
                      <td style="width:163.8pt; border-bottom:1.5pt solid #9cc2e5; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:20pt;"><span style="font-family:Helvetica; font-size:8pt;">1.</span><span style="font-family:Helvetica; font-size:8pt; color:#5b9bd5;">&nbsp;</span><a href="https://.bitcoinkeeper.app" style="text-decoration:none;"><u><span style="font-family:Helvetica; font-size:8pt; color:#0563c1;">https://.bitcoinkeeper.app</span></u></a><span style="font-family:Helvetica; font-size:8pt; color:#5b9bd5;">&nbsp;&nbsp;</span></p>
                      </td>
                  </tr>
                  <tr style="height:3.6pt;">
                      <td style="width:163.8pt; border-top:0.75pt solid #bdd6ee; border-bottom:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:10pt;"><span style="font-family:Helvetica; font-size:8pt;">2.&nbsp;</span><a href="https://bitcoiner.guide/multisig/" style="text-decoration:none;"><u><span style="font-family:Helvetica; font-size:8pt; color:#0563c1;">https://bitcoiner.guide/multisig/</span></u></a><span style="font-family:Helvetica; font-size:8pt;">&nbsp;</span></p>
                      </td>
                  </tr>
                  <tr style="height:3.6pt;">
                      <td style="width:163.8pt; border-top:0.75pt solid #bdd6ee; border-bottom:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:10pt;"><span style="font-family:Helvetica; font-size:8pt;">3.&nbsp;</span><a href="https://btcguide.github.io/why-multisig" style="text-decoration:none;"><u><span style="font-family:Helvetica; font-size:8pt; color:#0563c1;">https://btcguide.github.io/why-multisig</span></u></a><span style="font-family:Helvetica; font-size:8pt;">&nbsp;</span></p>
                      </td>
                  </tr>
                  <tr style="height:3.6pt;">
                      <td style="width:163.8pt; border-top:0.75pt solid #bdd6ee; border-bottom:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:10pt;"><span style="font-family:Helvetica; font-size:8pt;">4.&nbsp;</span><a href="https://sparrowwallet.com/docs/best-practices.html" style="text-decoration:none;"><u><span style="font-family:Helvetica; font-size:8pt; color:#0563c1;">https://sparrowwallet.com/docs/best-practices.html</span></u></a><span style="font-family:Helvetica; font-size:8pt;">&nbsp;</span></p>
                      </td>
                  </tr>
                  <tr style="height:3.6pt;">
                      <td style="width:163.8pt; border-top:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:10pt;"><span style="font-family:Helvetica; font-size:8pt;">5.&nbsp;</span><a href="https://www.keepitsimplebitcoin.com/" style="text-decoration:none;"><u><span style="font-family:Helvetica; font-size:8pt; color:#0563c1;">https://www.keepitsimplebitcoin.com/</span></u></a><span style="font-family:Helvetica; font-size:8pt;">&nbsp;</span></p>
                      </td>
                  </tr>
              </tbody>
          </table>
          <p style="margin-top:0pt; margin-bottom:0pt; font-size:8pt;"><span style="font-family:Helvetica;">&nbsp;</span></p>
          <p style="margin-top:0pt; margin-bottom:0pt; font-size:8pt;"><span style="font-family:Helvetica;">Recommended software for wallet recreation:</span></p>
          <table cellspacing="0" cellpadding="0" style="width:100%; border:0.75pt solid #bdd6ee; border-collapse:collapse;">
              <tbody>
                  <tr style="height:3.6pt;">
                      <td style="width:158.85pt; border-bottom:1.5pt solid #9cc2e5; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:10pt;"><span style="font-family:Helvetica; font-size:8pt;">6. Keeper:&nbsp;</span><a href="https://.bitcoinkeeper.app" style="text-decoration:none;"><u><span style="font-family:Helvetica; font-size:8pt; color:#0563c1;">https://.bitcoinkeeper.app</span></u></a><span style="font-family:Helvetica; font-size:8pt;">&nbsp;&nbsp;</span></p>
                      </td>
                  </tr>
                  <tr style="height:3.6pt;">
                      <td style="width:158.85pt; border-top:0.75pt solid #bdd6ee; border-bottom:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:10pt;"><span style="font-family:Helvetica; font-size:8pt;">7. Sparrow:&nbsp;</span><a href="https://sparrowwallet.com" style="text-decoration:none;"><u><span style="font-family:Helvetica; font-size:8pt; color:#0563c1;">https://sparrowwallet.com</span></u></a><span style="font-family:Helvetica; font-size:8pt;">&nbsp;</span></p>
                      </td>
                  </tr>
                  <tr style="height:3.6pt;">
                      <td style="width:158.85pt; border-top:0.75pt solid #bdd6ee; border-bottom:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:10pt;"><span style="font-family:Helvetica; font-size:8pt;">8. Core:&nbsp;</span><a href="http://www.bitcoincore.org" style="text-decoration:none;"><u><span style="font-family:Helvetica; font-size:8pt; color:#0563c1;">www.bitcoincore.org</span></u></a><span style="font-family:Helvetica; font-size:8pt;">&nbsp;&nbsp;</span></p>
                      </td>
                  </tr>
                  <tr style="height:3.6pt;">
                      <td style="width:158.85pt; border-top:0.75pt solid #bdd6ee; padding-right:5.03pt; padding-left:5.03pt; vertical-align:top;">
                          <p style="margin-top:0pt; margin-bottom:0pt; border-bottom:1pt solid #e7e6e6; padding-bottom:2pt; font-size:10pt;"><span style="font-family:Helvetica; font-size:8pt;">9. Electrum:&nbsp;</span><a href="https://bitcoinelectrum.com" style="text-decoration:none;"><u><span style="font-family:Helvetica; font-size:8pt; color:#0563c1;">https://bitcoinelectrum.com</span></u></a><span style="font-family:Helvetica; font-size:8pt;">&nbsp;</span></p>
                      </td>
                  </tr>
              </tbody>
          </table>
          <div style="border-bottom:1pt solid #e7e6e6; clear:both;">
              <h2 style="margin-top:0pt; margin-bottom:0pt; font-size:8pt;"><span style="font-family:Helvetica; text-transform:uppercase;">&nbsp;</span></h2>
              <h2 style="margin-top:0pt; margin-bottom:0pt; text-align:center; font-size:8pt;"><span style="font-family:Helvetica;">Bitcoin Keeper Customer Support</span><span style="font-family:Helvetica; text-transform:uppercase;">:</span></h2>
              <p style="margin-top:0pt; margin-bottom:0pt;"><span style="font-family:Helvetica; font-size:8pt;">Telegram:&nbsp;</span><a href="https://t.me/bitcoinkeeper" style="text-decoration:none;"><u><span style="font-family:Helvetica; font-size:8pt; color:#0563c1;">https://t.me/bitcoinkeeper</span></u></a><span style="font-family:Helvetica; font-size:8pt;">&nbsp;&nbsp;</span><br><span style="font-family:Helvetica; font-size:8pt;">Twitter:&nbsp;</span><a href="https://twitter.com/bitcoinkeeper_" style="text-decoration:none;"><u><span style="font-family:Helvetica; font-size:8pt; color:#0563c1;">https://twitter.com/bitcoinkeeper_</span></u></a><span style="font-family:Helvetica; font-size:8pt;">&nbsp;&nbsp;&nbsp;</span></p>
              <p style="margin-top:0pt; margin-bottom:0pt; padding-bottom:2pt; font-size:8pt;"><span style="font-family:Helvetica;">Email: hello@bithyve.com</span></p>
          </div>
          <p style="margin-top:0pt; margin-bottom:0pt; font-size:7.5pt;"><span style="font-family:Helvetica;">&nbsp;</span></p>
          <p style="margin-top:0pt; margin-bottom:0pt; font-size:7.5pt;"><span style="font-family:Helvetica;">&nbsp;</span></p>
          <p style="margin-top:0pt; margin-bottom:0pt; font-size:7.5pt;"><span style="font-family:Helvetica;">&nbsp;</span></p>
      </div>
            </body>
        </html>
      `;
    const options = {
      html,
      fileName: 'Recovery-Instructions',
      directory: 'Documents',
      base64: true,
    };
    const file = await RNHTMLtoPDF.convert(options);
    return file.filePath;
  } catch (error: any) {
    return error;
  }
};

export default GenerateRecoveryInstrcutionsPDF;
