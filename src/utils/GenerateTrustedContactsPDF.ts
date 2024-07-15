import RNHTMLtoPDF from 'react-native-html-to-pdf';

const GenerateTrustedContactsPDF = async () => {
  try {
    const html = `
       <html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Additional Key Details Template</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap">
    <style>
        * {
            font-family: 'Fira Sans', sans-serif;
            print-color-adjust:exact !important;
            box-sizing: border-box;
           }
        body {
            margin: 0;
            padding-left: 20px;
            padding-right: 20px;
        }
        .container {
            width: 100%;
            background-color: #fff;
            padding: 20px;
            height: 100%;
        }
        h1 {
            text-align: center;
            margin-top: 2px;
            color: #2e695e;
        }
        p {
            text-align: center;
            font-size: 14px;
        }
        .keys {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            margin-top: 10px;
        }
        .key-container {
            display: flex;
            flex-direction: column;
            width: 49%;
            margin: 20px 0;
        }
        .key {
            background-color: #FFF8ED;
            padding: 10px;
            padding-left: 30px;
        }
        .key p {
            text-align: left;
            margin: 5px 0;
        }
        .key-heading {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            margin-top: 20px;
        }
        .image {
            display: flex;
            align-items: center;
            justify-content: center;
            max-width: 100%;
            margin-top: 20px;
        }
        .marginBottom {
            padding-bottom: 5px;
        }
        .marginBottomTwice {
            padding-bottom: 60px;
        }
        .title {
            font-size: 50px;
            font-weight: 300;
            margin-bottom: -10px;
        }
        .multi-line {
            display: block;
        }
        .link{
            color: #000;
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="image"><img  height="200" src="data:image/png;base64,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"/></div>
        <h1 class="title">Trusted Contacts Template</h1>
        <p>Add details of people who could help your heir to receive the bitcoin 
        </p>
        <div class="keys">
            <div class="key-container">
                <div class="key-heading">Contact 1</div>
                <div class="key">
                    <p class="marginBottom">Name:</p>
                    <p class="marginBottomTwice">Address:</p>
                    <p class="marginBottom">Phone No.:</p>
                    <p class="marginBottom">Email:</p>
                </div>
            </div>
            <div class="key-container">
                <div class="key-heading">Contact 2</div>
                <div class="key">
                    <p class="marginBottom">Name:</p>
                    <p class="marginBottomTwice">Address:</p>
                    <p class="marginBottom">Phone No.:</p>
                    <p class="marginBottom">Email:</p>
                </div>
            </div>
            <div class="key-container">
                <div class="key-heading">Contact 3</div>
                <div class="key">
                    <p class="marginBottom">Name:</p>
                    <p class="marginBottomTwice">Address:</p>
                    <p class="marginBottom">Phone No.:</p>
                    <p class="marginBottom">Email:</p>
                </div>
            </div>
            <div class="key-container">
                <div class="key-heading">Contact 4</div>
                <div class="key">
                    <p class="marginBottom">Name:</p>
                    <p class="marginBottomTwice">Address:</p>
                    <p class="marginBottom">Phone No.:</p>
                    <p class="marginBottom">Email:</p>
                </div>
            </div>
        </div>
        <div class="footer">
            <p>This template is provided by the Bitcoin Keeper app. Need help? Reach out to us via the in-app chat support called Keeper Concierge. For more details visit: <a class="link" href="https://www.bitcoinkeeper.app">www.bitcoinkeeper.app</a>.</p>
        </div>
    </div>
</body>
</html>

      `;
    const options = {
      html,
      fileName: 'Trusted-Contacts-Template',
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
