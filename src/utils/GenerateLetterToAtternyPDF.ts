import RNHTMLtoPDF from 'react-native-html-to-pdf';

const GenerateLetterToAtternyPDF = async (fingerPrints) => {
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
            <h4>Letter to the Attorney</h4>
            <p>This document is one of three Inheritance Planning documents provided by Keeper. The other 2 being Key Security Tips and Restoring Inheritance Vault. This document is auto-produced by the Bitcoin Keeper app. The data shared in this document is sensitive. Please be cautious about revealing part or all of its contents to anyone. To learn more, please visit bitcoinkeeper.app</p>
            <p>Subject: Bitcoin Bequest Information for Inclusion in My Will</p>
            <p>Dear _________________ , </p>
            <p>I hope this letter finds you well. I am writing to provide you with the necessary information to include my bitcoin holdings in my estate plan. As a significant proportion of my wealth is held in bitcoin, it is crucial to address the legal transfer of these assets appropriately.</p>
            <p>Below, I have outlined the specific details regarding my current bitcoin holdings:</p>
            <p>1. Bitcoin Key Information:</p>
            <p>${fingerPrints.map((keys, index) => `<p>Key ${index + 1} Master Fingerprint: ${keys}</p>`).join("")}</p>
            <p>These master fingerprints act as unique identifiers for the respective keys without revealing sensitive details. Following the BIP32 (Bitcoin Improvement Proposal 32) standard, each fingerprint helps identify the associated extended public key (xPub). The xPub serves as a distinct identifier that can be utilized by a digital asset expert or software, adhering to standard BIP32 derivation paths, to locate and validate the keys during the transfer process.</p>
            <p>Please note that the funds associated with these keys may be held in any combination of single-key or multi-signature (multisig) wallets. Regardless of the specific configuration, I intend that any wealth controlled by these keys be legally transferred to the designated heir or intended beneficiary.</p>
            <p>My explicit intention is to transfer the legal title to my bitcoin holdings to the designated heir or intended beneficiary. However, it is important to note that access to the actual keys and the bitcoin will be provided separately to the intended beneficiary. This letter solely addresses the transfer of legal title and the inclusion of my bitcoin assets in my estate plan.</p>
            <p>These master fingerprints and the accompanying explanation of their usage can be recorded in my will if it is of any help. Further details regarding the designated beneficiary, executor, and supplementary instructions will be provided separately during our estate planning discussions. I have complete faith in your expertise to handle this confidential information securely. Please do not hesitate to contact me if you require additional documentation or information. Your support and meticulous attention to detail in facilitating the transfer of the legal title to my bitcoin holdings are greatly appreciated.</p>
            <p>Thank you for your professional assistance in preparing my estate plan and ensuring the proper transfer of the legal title to my bitcoin assets according to my wishes.</p>
            <p>Sincerely,</p><br>
            <p>------------------------------------------------------------------------------------</p>
            <p>This document is one of three Inheritance Planning documents provided by Keeper. The other 2 being Key Security Tips and Restoring Inheritance Vault. This document is auto-produced by the Bitcoin Keeper app. The data shared in this document is sensitive. Please be cautious about revealing part or all of its contents to anyone. To learn more, please visit bitcoinkeeper.app</p>
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
    return file.filePath;
  } catch (error: any) {
    return error;
  }
};

export default GenerateLetterToAtternyPDF;
