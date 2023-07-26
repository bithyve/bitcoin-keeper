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
                font-size:25px;
              }
            </style>
          </head>
          <body>
            <h4>Vault Recovery Instructions with or without the Keeper App:</h4>
            <p>This document is one of three Inheritance Planning documents provided by Keeper. The other 2 are Letter to the Attorney and Key Security Tips. This document is auto-produced by the Bitcoin Keeper app. The data shared in this document is sensitive. Please be cautious about revealing part or all of its contents to anyone. To learn more, please visit bitcoinkeeper.app.</p>
            <p>Getting Started: </p>
            <p>An m-of-n multisig setup enhances security by distributing control and access, thus reducing the risk of unauthorized access or fraudulent activities. The bitcoin you inherited is within such a setup, i.e. the Vault. This document provides the method to recover the Vault and gain custody of your Inheritance. </p>
            <p>If you have not previously handled bitcoin, we highly recommend contacting the people mentioned in the “Technical Assistance” section below. </p>
            <p>Please note that failure to recover the Vault successfully may result in the loss of bitcoin forever. Great caution is advised.  </p>
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
            <p>Restoring the Vault:</p>
            <p>We have attached the Output Descriptor file as an Annexure to this document. To recover the Vault, please input the Output Descriptor file in a wallet (such as Electrum or Sparrow) that supports a multi-sig setup. You could, of course, use Keeper to recover the Vault, but it’s not necessary that you do. Look for the “Recovery” button/section when setting up a wallet. Follow the steps from there.</p>
            <p>Please note that the funds associated with these keys may be in any combination of single-key or multi-signature (multisig) wallets. </p>
            <p>A) Key: Type Details </p>
            ${signers
        .map(
          (keys, index) => `
                    <p>Key ${index + 1}: ${keys.signerId}</p>
                    <p>Type: ${keys.type}</p><br>
                `,
        )}
        ${signers
        .map(
          (keys, index) => `
            <p>Key ${index + 1}: ${keys.signerId}</p>
            <p>Location details: </p>
            <p>Access details: </p><br>
                  `,
        )}
            <p>Any other information:</p> <br><br><br><br><br>
            
            <p>--------------------------------------------------------------------------------------------------------------------------------------------------------------</p>
            <p>With the Output Descriptor file and the keys with you, you now have complete access to the Vault.</p>
            <p>--------------------------------------------------------------------------------------------------------------------------------------------------------------</p>
            <p>This document is one of three Inheritance Planning documents provided by Keeper. The other 2 are Letter to the Attorney and Key Security Tips. This document is auto-produced by the Bitcoin Keeper app. The data shared in this document is sensitive. Please be cautious about revealing part or all of its contents to anyone. To learn more, please visit bitcoinkeeper.app.</p>
            <p>--------------------------------------------------------------------------------------------------------------------------------------------------------------</p>
            <p>Annexure 1</p>
            <p>Output Descriptor</p>
            <p>${descriptorString}</p>
            </body>
        </html>
      `;
    const options = {
      html,
      fileName: `RecoveryInstruction`,
      directory: 'Documents',
      base64: true,
    };
    const file = await RNHTMLtoPDF.convert(options);
    return file.filePath
    // Alert.alert('Success', `PDF saved to ${file.filePath}`);
  } catch (error: any) {
    return error
    // Alert.alert('Error', error.message);
  }
};

export default GenerateRecoveryInstrPDF