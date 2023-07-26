import RNHTMLtoPDF from 'react-native-html-to-pdf';

const GenerateSecurityTipsPDF = async () => {
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
            <h4>Key Security Tips:</h4>
            <p>This document is one of three Inheritance Planning documents provided by Keeper. The other 2 being: Letter to the Attorney and Recovery Instructions for your heir. This document is auto-produced by the Bitcoin Keeper app. To learn more visit bitcoinkeeper.app</p>
            <p>Getting Started: </p>
            <p>A multisig enhances wallet security by distributing control and access, thus reducing the risk of unauthorized access, fraudulent activities, and loss of funds. The bitcoin your heir would inherit is within such a setup, i.e. your Vault. This document offers suggestions for storing keys and access & recovery mechanisms safely so that your intended beneficiary* can easily access your bitcoin when needed.</p>
            <p>Also, the following information is only meant to help you start planning your bitcoin inheritance and should be considered as partial information for your bitcoin inheritance planning. We recommend you also speak with your estate planners to customize a plan that works best for you and to ensure that legal title also passes to your heir(s). </p>
            <p>*Please note that the term intended beneficiary is not being used in legal terminology.</p>
            <p>Checklist before storing away your keys: </p>
            <p>Setup</p>
            <ul>  
            <li>Initialize devices and update firmware</li>
            <li>Save one seed phrase in a tamper-evident bag</li>
            <li>Record the tamper-evident bag serial number in a password manager</li>
            <li>Record device PIN(s) in a password manager</li>
            <li>Connect devices to BitcoinKeeper</li>
            </ul>
            <p>Testing</p>
            <ul>
            <li>Receive a transaction</li>
            <li>Send a transaction</li>
            <li>Complete a health check on all devices</li>
            </ul>
            <p>Some prompts to consider a place safe:</p>
            <ul>
            <li>Please ensure that the safe place is easily accessible to your heir</li>
            <li>The place should not be prone to natural calamities like floods, earthquakes, etc.</li>
            <li>Keep your key in a place away from fire, water, moisture, corroding elements, electromagnets, etc. </li>
            <li>Please consider the political situation in the area being designated safe. The safe place should not be rendered inaccessible due to political turmoil in the region. </li>
            <li>Make sure that the key is away from children and pets!</li>
            </ul>  
            <p>Key Storage: We’ve identified five places where you could potentially store your keys. The remainder of the document offers cautions and considerations as you decide how and where to store them.</p>
            <p>1)  Safety Deposit Box: </p>
            <ul> 
            <li>Your Safety Deposit Box should be accessible 24/7/365.</li>
            <li>Make sure that the nominee of the locker is the same as the heir for your bitcoin so that they can access it after you’ve moved on.</li>
            <li>Keep different keys in different locations. You should never have two hardware wallets in the same place simultaneously. </li>
            <li>You may consider storing the key in a deposit box with a larger bank than a smaller one.</li>
            <li>Please ensure that the deposit box is at a bank branch that’s in a relatively safe neighbourhood.</li>
            <li>Ask the bank, if they go under, whether you would still have access to the deposit box seamlessly. There may be a possibility for the safety box to be frozen and thus inaccessible if the bank goes under. If the safety deposit box may be frozen, then you should know for how long. Try to get commitments from the bank on paper regarding this.</li>
            <li>Which bank personnel would have access to the deposit box under extraordinary circumstances? It is recommended to get their details with relevant commitments to you, the lessee of the deposit box.</li>
            <li>Do consider the state of affairs in the country where you’re leasing the deposit box.</li>
            <li>Keep your device in a Faraday bag to prevent it from being compromised by EMP’s and scanning devices.</li>
            </ul> 
            <p>2) Soft Keys </p>
            <ul> 
            <li>Make sure that you’ve not used the phone(s) with the soft keys to access untrustworthy websites and apps.</li>
            <li>Make sure that your wifi is private/ trustworthy.</li>
            <li>It is recommended that you do not use the phone with the soft keys for day-to-day use.</li>
            <li>Please store the device with the soft keys away from elements like moisture, heat, magnetic fields, etc.</li>
            <li>It is recommended that you store an extra charger with the device for the heir. It is better that you do it rather than depend on the heir as the charger may stop being manufactured, the technology may change, etc. </li>
            <li>It is recommended that you instruct your heir not to perform an OS update on the phone as the latest OS may not be compatible with the latest version of Keeper. </li>
            <li>If you plan to store the software key in a device for years on end, please consider the possibility that the battery in the device may degrade and stop working. Make sure to check on the device at least twice a year to see if its functional.</li>
            </ul> 
            <p>3) With a trusted contact:  </p>
            <ul> 
            <li>Ensure that they are truly trustworthy. </li>
            <li>They should be happy for the heir to inherit the wealth and not hinder the transfer.</li>
            <li>They should not have access to the other keys. They should know this and be ok with this.</li>
            <li>Consider the possibility of their death as well (natural and unnatural). Who transfers the trusted contact’s key to your heir, then?</li>
            <li>If the trusted contact breaks trust or your relationship sours, please consider resetting the quorum of the signing keys. This way, you will render the key with the formerly trusted contact obsolete.</li>
            <li>Your trusted contact should be able to transfer the key to your heir as soon as possible in the event of your demise.</li>
            </ul> 
            <p>4)  With your Executor, Trustee, or Agent under Power of Attorney:</p>
            <ul> 
            <li>Ensure that you trust them, as they will have access to your bitcoin. Conduct thorough research and consider their reputation, credentials, and experience before entrusting them with this responsibility.</li>
            <li>Ensure that this trusted person/company has robust security measures in place to protect your bitcoin keys from potential hacks, theft, or loss. Please inquire about the security measures they’ve instituted to ensure the safety of your keys. If you’re dissatisfied, you could request them to upgrade security or perhaps look for another entity to help you.</li>
            <li>It is essential that the person in this capacity has a solid understanding of how Bitcoin works and the intricacies of handling private keys. They should be familiar with wallet management, transaction processes, and recovery procedures in case of unforeseen circumstances.</li>
            <li>To tackle unexpected circumstances, a well-defined backup and recovery plan should be in place. This ensures that your heir can access your Bitcoin keys without any complications. Ensure your team has outlined a clear process for securely transferring the keys.</li>
            <li>Regular Communication: Maintain open and regular communication with your executor/trustee/agent under PoA. Stay informed about any changes in procedures, security measures, or regulations they may face/undertake, that may impact your keys. This ensures that you stay up-to-date and can make informed decisions regarding your estate planning. </li>
            </ul> 
            <p>5) With your heir:</p>
            <ul> 
            <li>Ensure that your heir has a solid understanding of how Bitcoin works, including key management, wallet security, and transaction processes. Please provide them with resources or educational materials to help them navigate the intricacies of holding and managing Bitcoin.</li>
            <li>Emphasize the importance of strong security practices to your heir. Please encourage them to use secure wallets, enable two-factor authentication (2FA), regularly update software, and avoid sharing sensitive information related to the Bitcoin keys. Additionally, advise them to be cautious of phishing attempts, scams, and malicious actors who may attempt to steal their Bitcoin.</li>
            <li>Instruct your heir on the importance of maintaining secure backups of the Bitcoin keys. This includes securely storing backup copies of the private keys or seed phrases in offline locations and keeping them confidential. In case of loss, theft, or damage to the keys, having proper backups will ensure that your heir can still access the inherited Bitcoin. </li>
            <li>Legal and Tax Implications: Seek legal advice to ensure that your estate planning and the transfer of Bitcoin to your heir align with applicable laws and regulations. Cryptocurrency regulations vary across jurisdictions, and it's essential to be aware of any tax obligations or legal requirements that may arise. Consulting with a lawyer experienced in cryptocurrency and estate planning will help ensure compliance. </li>
            <li>Regular Updates and Communication: Maintain open communication with your heir about your Bitcoin holdings and any updates or changes you make to your estate plan. Inform them about any changes in security measures, or relevant instructions they should be aware of. This will help avoid confusion or potential loss of access in the future. </li>
            <li>Contingency Planning: Prepare for unforeseen circumstances by having contingency plans in place. Consider appointing alternate beneficiaries or trusted individuals who can assist your heir if they cannot fulfil their responsibilities.</li>
            </ul> 
            <p>Storing keys comes with the responsibility of storing pins and recovery phrases. Here are a few suggestions to store them safely over the long term:</p>
            <p>Access mechanisms: Pins </p>
            <p>A PIN (Personal Identification Number) is a security measure to protect access to the wallet and its associated funds. It is typically a numeric code, similar to a password, that must be entered into the hardware wallet's interface to access the stored Bitcoin.</p>
            <p>The primary purpose of a PIN is to ensure that only the authorized user can access and control the funds stored in the hardware wallet. By requiring a PIN, hardware wallets provide an additional layer of security against unauthorized access, even if the device itself is lost, stolen, or compromised.</p>
            <p>Keeping the PIN safe is crucial because if it falls into the wrong hands, an attacker could potentially gain control of the Bitcoin stored on the hardware wallet. It is important to choose a PIN that is not easily guessable and not to share it with anyone. Additionally, it is recommended to avoid using obvious PINs like birthdates or repetitive numbers. Furthermore, consider storing the PIN separately from the hardware wallet and other associated information to prevent a single point of failure. However, you can consider using the same pin for all your devices. An important point of caution is to keep things simple! </p>
            <p>By diligently protecting the PIN, users can significantly reduce the risk of unauthorized access and ensure the security of their Bitcoin holdings. Thus, ensuring pins' safety is step one in safeguarding your keys. Please consider using custom-made steel plates to note them down as they better resist degradation compared to writing/typing them on paper.</p>
            <p>As an additional security step, consider storing your Pin in a Password Manager as well. </p>
            <p></p>
            <p>In case you change your PIN(s), please ensure that you change them at the place where you stored your previous pin as well. This is important as failing to do so may lead to the inaccessibility of keys. </p>
            <p>Backup mechanism: Recovery phrases</p>
            <p>Recovery phrases come into play when a key becomes inaccessible. Some of the reasons for inaccessibility may be the degradation of devices storing the keys or the souring of relationships with people entrusted with them. Thus it is important that you not only backup the device storing a key properly, but also test out your recovery mechanism. Once satisfied, please consider etching the seed words onto stainless steel plates for longevity. Please consider etching the seed words of your hardware wallets onto steel plates and storing them in tamper-evident bags.  </p>
            <p>When you are satisfied with the arrangements you’ve made to store access and backup mechanisms, a point to decide is whether you want to store them along with the devices that have your keys or store them separately. This is an important decision and should be taken carefully.</p>
            <p>To be avoided:</p>
            <p>Treasure hunts: Please do not simply share keys with people you trust in your lifetime. They may collude and access the Vault after you pass away.</p>
            <p>Photographing things: Photographs of seed words and pins may give unintended access to your private keys. Please avoid photographing them.</p>
            <p>Unprotected Storage: Avoid storing your pins/seed words in random files that could be easily accessed or hacked. </p>
            <p>Entrusting all your keys to one person or storing them all in one place: This action beats the purpose of a multi-sig setup and creates a single point of failure.</p>
            <p>Closing Notes:</p>
            <ul> 
            <li>Don’t fret and overcomplicate your setup.</li>
            <li>Test your setup</li>
            <li>Avoid single points of failure </li>
            <li>Access your setup multiple times during your lifetime. Once a year at least.</li>
            <li>If you change something somewhere, like a device or a pin, please update the change in relevant places. </li>
            </ul> 
            <p>--------------------------------------------------------------------------------------------------------</p>
            <p>This document is one of three Inheritance Planning documents provided by Keeper. The other 2 being: Letter to the Attorney and Recovery Instructions for your heir. This document is auto-produced by the Bitcoin Keeper app. To learn more visit bitcoinkeeper.app.</p>
            </body>
        </html>
      `;
        const options = {
            html,
            fileName: `KeySecurityTips`,
            directory: 'Documents',
            base64: true,
        };
        const file = await RNHTMLtoPDF.convert(options);
        return file.filePath;
        // Alert.alert('Success', `PDF saved to ${file.filePath}`);
    } catch (error: any) {
        return error;
        // Alert.alert('Error', error.message);
    }
};

export default GenerateSecurityTipsPDF;
