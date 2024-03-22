import RNHTMLtoPDF from 'react-native-html-to-pdf';

const GenerateLetterToAtternyPDFInheritanceTool = async (fingerPrints) => {
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
            <p>Subject: Bitcoin Bequest Information for Inclusion in My Will</p>
            <p>Dear _________________ , </p>
            <p>I hope this letter finds you well. I am writing to provide you with the 
            necessary information for the inclusion of my bitcoin holdings in my will. 
            As a significant proportion of my wealth is held in bitcoin, it is crucial to 
            ensure that the legal transfer of these assets is appropriately addressed.</p>
            <p>Below, I have outlined the specific details regarding my bitcoin holdings:</p>
            <p>1. Bitcoin Key Information:</p>
            <p>${fingerPrints
              .map((keys, index) => `<p>Key ${index + 1} Fingerprint: ${keys}</p>`)
              .join('')}</p>
            <p>These master fingerprints act as unique identifiers for the respective keys 
            without revealing any sensitive details. Following the BIP32 (Bitcoin 
            Improvement Proposal 32) standard, each fingerprint helps identify the 
            associated extended public key (xPub). The xPub serves as a distinct 
            identifier that can be utilized by a digital asset expert or software, 
            adhering to standard BIP32 derivation paths, to locate and validate the 
            keys during the transfer process.</p>
            <br />
            <br />
            <p>It is my explicit intention that the legal title to my bitcoin holdings be 
            transferred to the designated heir or intended beneficiary. However, it is 
            important to note that access to the actual keys and, consequently, the 
            bitcoin will be provided separately to the intended beneficiary. This letter 
            solely addresses the transfer of legal title and the inclusion of my bitcoin 
            assets in my will.</p>
            <p>Please ensure that these master fingerprints and the accompanying 
            explanation of their usage are accurately recorded in my will. Further 
            details regarding the designated beneficiary, executor, and any 
            supplementary instructions will be provided separately during the will 
            creation.</p>
            <p>I have confidence in your expertise to handle this confidential information 
            securely. Should you require additional documentation or information from
            me, please do not hesitate to contact me. Your support and meticulous 
            attention to detail in facilitating the transfer of the legal title to my bitcoin 
            holdings are greatly appreciated.</p>
            <p>Thank you for your professional assistance in preparing my will and 
            ensuring the proper transfer of the legal title to my bitcoin assets 
            according to my wishes.</p>
            <p>Sincerely,</p><br>
            <p>------------------------------------------------------------------------------------</p>
            </body>
        </html>
      `;
    const options = {
      html,
      fileName: 'Letter-To-Attorney',
      directory: 'Documents',
      base64: true,
    };
    const file = await RNHTMLtoPDF.convert(options);
    return file.filePath;
  } catch (error: any) {
    return error;
  }
};

export default GenerateLetterToAtternyPDFInheritanceTool;
