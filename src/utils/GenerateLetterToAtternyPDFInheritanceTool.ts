import RNHTMLtoPDF from 'react-native-html-to-pdf';

const GenerateLetterToAtternyPDFInheritanceTool = async (fingerPrints) => {
  try {
    const html = `
        <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Letter to the Attorney</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap">
    <style>
        body {
        font-family: 'Fira Sans', sans-serif;
            print-color-adjust:exact !important;
            box-sizing: border-box;
            margin: 0 10px;
        }
        .container {
            max-width: 100%;
            margin: 0 14px;  
        }
        h1 {
        font-weight: 300;
            text-align: center;
            font-size: 30px;
            margin-bottom: 5px;
            color: #2D6759;
        }
        p {
          margin-bottom: 16px;
        }
        .page{  
            background-color: #FFF8ED;
            padding-top: 10px;
            padding-right: 5px;
            padding-bottom: 0px;
            padding-left: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Letter to the Attorney</h1>
        <div class="page">
            <p>Subject: Bitcoin Bequest Information for Inclusion in My Will</p>
        <p>Dear _________________ ,</p>
        <p>
            I hope this letter finds you well. I am writing to provide you with the necessary information
            for the inclusion of my bitcoin holdings in my will. As a significant proportion of my wealth
            is held in bitcoin, it is crucial to ensure that the legal transfer of these assets is
            appropriately addressed.
        </p>
        <p>Below, I have outlined the specific details regarding the keys controlling my bitcoin holdings:</p>
        <p><b>Bitcoin Key Information:</b></p>
        <p>
        ${fingerPrints.map((keys, index) => `Key ${index + 1} Fingerprint: ${keys}<br>`).join('')}
        </p>
        <p>
            These master fingerprints represent the private keys that control the funds, not the funds
            themselves. Master fingerprints uniquely identify the associated private keys, which can
            generate derived keys as per the BIP32 (Bitcoin Improvement Proposal 32) standard or other
            derivation paths.
        </p>
        <p>
            The derived or original keys can hold funds directly or be used in combination with other keys
            to control wallets. In certain cases, the keys may incorporate time-based conditions, meaning
            they may not be active immediately or may only be used under specific circumstances.
        </p>
        <p>
            The private keys represented by these fingerprints control access to the bitcoin wallets and,
            ultimately, the funds. It is my explicit intention that the legal title to my bitcoin
            holdings—including all wallets controlled by these keys, derived or otherwise—be transferred
            to the designated heir or intended beneficiary. Access to the actual keys and, consequently,
            the bitcoin will be provided separately to the intended beneficiary. This letter solely
            addresses the transfer of legal title and the inclusion of my bitcoin assets in my will.
        </p>
        <p>
            Please ensure that the above master fingerprints, along with the explanation of their
            role in controlling the funds, are accurately recorded in my will. Additional details
            regarding the designated beneficiary, executor, and any supplementary instructions
            will be provided separately during the will creation.
        </p>
        <p>
            I have confidence in your expertise to handle this confidential information securely. Should
            you require additional documentation or information from me, please do not hesitate to
            contact me. Your support and meticulous attention to detail in facilitating the transfer of
            the legal title to my bitcoin holdings are greatly appreciated.
        </p>
        <p>
            Thank you for your professional assistance in preparing my will and ensuring the proper
            transfer of the legal title to my bitcoin assets according to my wishes.
        </p>
        <p>Sincerely,</p>
        <p>------------------------------------------------------------------------------------</p>
        </div>
    </div>
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
