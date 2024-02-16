import RNHTMLtoPDF from 'react-native-html-to-pdf';

const GenerateRecoveryInstrPDF = async (signers, descriptorString) => {
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
            <h2>Vault Recovery Instructions with or without the Keeper App:</h2>
            <p>This document is one of three Inheritance Planning documents provided by Keeper. The other 2 are Letter to the Attorney and Key Security Tips. This document is auto-produced by the Bitcoin Keeper app. The data shared in this document is sensitive. Please be cautious about revealing part or all of its contents to anyone. To learn more, please visit bitcoinkeeper.app.</p>
            <p>Getting Started: </p>
            <p>An m-of-n multisig setup enhances security by distributing control and access, thus reducing the risk of unauthorized access or fraudulent activities. The bitcoin you inherited is within such a setup, i.e. the vault. This document provides the method to recover the vault and gain custody of your Inheritance. </p>
            <p>If you have not previously handled bitcoin, we highly recommend contacting the people mentioned in the “Technical Assistance” section below. </p>
            <p>Please note that failure to recover the vault successfully may result in the loss of bitcoin forever. Great caution is advised.  </p>
            <p>Technical Assistance:</p>
            <p>Recovering a multi-sig vault has a few steps involved. If you need assistance, you could reach out to any of the people in the list below for help. They are the trusted contacts of the person giving away the bitcoin (You do not have to share the keys with them)<p/>
            <p>Person 1: </p>
            <p>Name: </p>
            <p> Ph. No.: </p>
            <p>Alt. Ph. No.: </p>
            <p>Email: </p>
            <p>Home Address: </p>
            <p>Office Address:  </p><br><br>
            <p>Person 2: </p>
            <p>Name: </p>
            <p> Ph. No.: </p>
            <p>Alt. Ph. No.: </p>
            <p>Email: </p>
            <p>Home Address: </p>
            <p>Office Address:  </p><br><br>
            <p>Person 3: </p>
            <p>Name: </p>
            <p> Ph. No.: </p>
            <p>Alt. Ph. No.: </p>
            <p>Email: </p>
            <p>Home Address: </p>
            <p>Office Address:  </p><br><br>
            <p>Person 4: </p>
            <p>Name: </p>
            <p> Ph. No.: </p>
            <p>Alt. Ph. No.: </p>
            <p>Email: </p>
            <p>Home Address: </p>
            <p>Office Address:  </p><br><br>
            <p>Keeper Customer Support:</p>
            <p>Telegram: https://t.me/bitcoinkeeper  </p>
            <p>Twitter: https://twitter.com/bitcoinkeeper_ </p>
            <p>Email: info@bithyve.com  </p><br>
            <p>Restoring the vault:</p>
            <p>We have attached the Wallet Configuration File as an Annexure to this document. To recover the vault, please input the Wallet Configuration File in a wallet (such as Electrum or Sparrow) that supports a multi-sig setup. You could, of course, use Keeper to recover the vault, but it’s not necessary that you do. Look for the “Recovery” button/section when setting up a wallet. Follow the steps from there.</p>
            <p>Please note that the funds associated with these keys may be in any combination of single-key or multi-signature (multisig) wallets. </p>
            <p>A) Key: Type Details </p>
            ${signers
              .map(
                (keys, index) =>
                  `<p>Key ${index + 1}: ${keys.xfp}</p>
               <p>Type: ${keys.type}</p>`
              )
              .join('')}<br>
            ${signers
              .map(
                (keys, index) =>
                  `<p>Key ${index + 1}: ${keys.xfp}</p>
              <p>Location details: </p>
              <p>Access details: </p><br>`
              )
              .join('')}
            <p>Any other information:</p> <br><br><br><br><br>
            <p>----------------------------------------------------------------------------------------------------</p>
            <p>With the Wallet Configuration File and the keys with you, you now have complete access to the vault.</p>
            <p>----------------------------------------------------------------------------------------------------</p>
            <p>This document is one of three Inheritance Planning documents provided by Keeper. The other 2 are Letter to the Attorney and Key Security Tips. This document is auto-produced by the Bitcoin Keeper app. The data shared in this document is sensitive. Please be cautious about revealing part or all of its contents to anyone. To learn more, please visit bitcoinkeeper.app.</p>
            <p>----------------------------------------------------------------------------------------------------</p>
            <p>Annexure 1</p>
            <p>Wallet Configuration File</p>
            <p style="font-size: 15px">${descriptorString}</p>
            </body>
        </html>
      `;
    const options = {
      html,
      fileName: 'RecoveryInstruction',
      directory: 'Documents',
      base64: true,
    };
    const file = await RNHTMLtoPDF.convert(options);
    return file.filePath;
  } catch (error: any) {
    return error;
  }
};

export default GenerateRecoveryInstrPDF;
