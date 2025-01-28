import Foundation
import PDFGenerator
import QRCoder

@objc class CloudBackupHelper: NSObject, UIDocumentInteractionControllerDelegate{
  
  @objc public var imageSize:CGFloat = 220;
  
  override init() {
    super.init()
  }
  
  @objc func backupBsms(data: String, password: String, callback: @escaping ((String)-> Void)){
    let pdf = generatePdf(data: data, password: password)
    print("PDF: "+pdf)
    uploadToIcloud(files: pdf, callback: callback)
  }
  
  func generatePdf(data: String, password: String) -> String{
    let currentDate = Date()
    let formatter = DateFormatter()
    formatter.dateFormat = "dd-MM-yyy-HH:mm:ss"
    let dateTime = formatter.string(from: currentDate)
    let image = UIImage(named: "keeperbg")
    let txtTitle = UILabel();
    var txtPart = UILabel();
    let qrCodeImage = UIImageView();
    let generator = QRCodeGenerator();
    let frontPage =   UIView( frame: CGRect(x: 0.0,y: 0, width: 595.0, height: 840.0))
    let imageView = UIImageView(image: image)
    imageView.contentMode = .scaleAspectFit
    imageView.frame = CGRect(x: 20, y: 20, width: frontPage.bounds.width, height: 130)
    frontPage.addSubview(imageView)
    // Title
    txtTitle.text = "Your Wallet Configurations"
    txtTitle.lineBreakMode = .byWordWrapping
    txtTitle.numberOfLines = 0
    txtTitle.font = UIFont.systemFont(ofSize: 30)
    txtTitle.frame = CGRect(x:140,y:imageView.frame.height + 40,width:595.0 - 20, height:frontPage.bounds.size.height)
    txtTitle.textColor = UIColor(named: "keeper")
    txtTitle.sizeToFit()
    txtTitle.textAlignment = .center

    frontPage.addSubview(txtTitle)

    let p1 = UILabel();
    p1.text = "Dear Recipient,\nThis document includes all your Wallet Configurations (aka Output Descriptors or BSMS files)*. To recreate your wallet on a multisig app like Keeper or Sparrow**, copy the text between the dotted lines in the Wallet Configuration Text section, and paste it in the appropriate area of the app. You can also scan the QR code of the desired vault to recreate it.\n\nThis document is generated by the Bitcoin Keeper app. Need help? Reach out to us via the in-app chat support called Keeper Concierge. For more details visit: www.bitcoinkeeper.app.\n\n* Wallet configuration files standardize multi-signature setups, ensuring secure and interoperable configurations with public keys and derivation paths. This ensures that you do not have to rely on a single bitcoin wallet to create and use a multisig wallet.\n\n** Keeper and Sparrow are bitcoin wallets that allow you to create wallets called multisig wallets. Multisig wallets, as the name suggests require multiple signatures to sign a single bitcoin transaction"
    p1.lineBreakMode = .byWordWrapping
    p1.numberOfLines = 0
    p1.font = UIFont.systemFont(ofSize: 14)
    p1.textAlignment = .justified
    p1.frame = CGRect(x:20,y:imageView.frame.height + txtTitle.frame.height + 40 + txtTitle.font.ascender-1,width: 555, height:frontPage.bounds.size.height)
    p1.textColor = UIColor.black
    p1.sizeToFit()
    frontPage.addSubview(p1)
    var pages = [UIView]()
    pages.append(frontPage)
    if let jsonData = data.data(using: .utf8),
       let jsonArray = try? JSONSerialization.jsonObject(with: jsonData, options: []) as? [[String: Any]] {
        let parsedData = jsonArray.map { json -> (String, String) in
          let bsms = json["bsms"] as? String ?? ""
            let name = json["name"] as? String ?? ""
            return (bsms, name)
        }
        for (bsms, name) in parsedData {
          let page =   UIView( frame: CGRect(x: 0.0,y: 0, width: 595.0, height: 840.0))
          let textVaultName = UILabel();
          textVaultName.text = "Vault Name: "+name+"\n"
          textVaultName.lineBreakMode = .byWordWrapping
          textVaultName.numberOfLines = 0
          textVaultName.frame = CGRect(x:20,y:30,width:page.bounds.size.width - 20, height:30)
          textVaultName.font = UIFont.systemFont(ofSize: 12.0)
          textVaultName.font = UIFont.systemFont(ofSize: 12.0)
          textVaultName.textAlignment = .left
          textVaultName.sizeToFit()
          page.addSubview(textVaultName)
          
          let textBsms = UILabel();
          textBsms.text = "Wallet Configuration Text:\n -----------------------------------------------------------------------------------------------------\n"+bsms+"\n\n-----------------------------------------------------------------------------------------------------"
          textBsms.lineBreakMode = .byWordWrapping
          textBsms.numberOfLines = 0
          textBsms.isUserInteractionEnabled = true
          textBsms.frame = CGRect(x:20,y: 60,width:page.bounds.size.width - 20, height:150)
          textBsms.font = UIFont.systemFont(ofSize: 12.0)
          textBsms.textColor = UIColor.black
          textBsms.textAlignment = .left
          textBsms.sizeToFit()
          page.addSubview(textBsms)
          
          let textTime = UILabel();
          textTime.text = "File Details: File created on: " + dateTime + "\n\nWallet Configuration QR:\n"
          textTime.lineBreakMode = .byWordWrapping
          textTime.numberOfLines = 0
          textTime.isUserInteractionEnabled = true
          textTime.frame = CGRect(x:20,y: 90 + textBsms.frame.height,width:page.bounds.size.width - 20, height:30)
          textTime.font = UIFont.systemFont(ofSize: 12.0)
          textTime.textColor = UIColor.black
          textTime.textAlignment = .left
          textTime.sizeToFit()
          page.addSubview(textTime)
          
          qrCodeImage.image = generator.createImage(value: bsms ,size: CGSize(width: imageSize, height: imageSize))
          qrCodeImage.frame = CGRect(x: 220, y: 350 , width: imageSize, height: imageSize)
          page.addSubview(qrCodeImage)
          pages.append(page)
        }
    } else {
        print("Error parsing JSON")
    }
    
    let pdfFileName = "Your-Wallet-Configurations-" + String(format: "%.0f", Date().timeIntervalSince1970) + ".pdf"
    do {
      let pdfPath = NSTemporaryDirectory().appending(pdfFileName as String)
      try PDFGenerator.generate(pages, to: pdfPath, password: PDFPassword(password))
      print("file generated",pdfPath)
      return pdfPath
    } catch let error {
      print("error",error)
      return ""
    }
  }
  
  func getICloudFolder(named folderName: String) -> URL? {
    let fileManager = FileManager.default
      guard let iCloudURL = fileManager.url(forUbiquityContainerIdentifier: nil)?.appendingPathComponent("Documents") else {
          print("iCloud is not available.")
          return nil
      }
    let folderURL = iCloudURL
//    if !fileManager.fileExists(atPath: folderURL.path) {
//            do {
//                try fileManager.createDirectory(at: folderURL, withIntermediateDirectories: true, attributes: nil)
//                print("Folder created at: \(folderURL.path)")
//              return folderURL
//            } catch {
//                print("Error creating folder: \(error.localizedDescription)")
//              return nil
//            }
//        } else {
//            print("Folder already exists at: \(folderURL.path)")
          return folderURL
//        }
  }
  
  func uploadToIcloud(files: String, callback: @escaping ((String)-> Void)) {
    print("uploading to iCloud...")
    let fileManager = FileManager.default
    let iCloudFolderURL = getICloudFolder(named: "BitcoinKeeper")
    do{
      if iCloudFolderURL != nil {
        let fileUrl = URL(fileURLWithPath: files)
        let fileName = fileUrl.lastPathComponent
        print("fileName: "+fileName)
        var destinationURL = iCloudFolderURL!.appendingPathComponent(fileName)
        try fileManager.copyItem(at: fileUrl, to: destinationURL)
        let response = getJsonResponse(status: true, data: "", error: "")
        
        let filesURLs = try fileManager.contentsOfDirectory(at: iCloudFolderURL!, includingPropertiesForKeys: nil)
        if filesURLs.isEmpty {
                    print("No files found in folder: \(filesURLs)")
                } else {
                    print("Files in folder \(filesURLs):")
                    for fileURL in filesURLs {
                        print(fileURL.lastPathComponent)
                    }
                }
        callback(response)
      } else {
        let response = getJsonResponse(status: false, data: "", error: "iCloud is currently inaccessible. Please check authentication with your iCloud and try again.")
        callback(response)
      }
    } catch {
      print("Error uploading file to iCloud: \(error.localizedDescription)")
      let response = getJsonResponse(status: false, data: "", error: error.localizedDescription)
      callback(response)
    }
  }
  
  func getJsonResponse(status: Bool, data: String, error: String) -> String {
      let jsonObject: [String: Any] = [
          "status": status,
          "data": data,
          "error": error
      ]
      do {
          let jsonData = try JSONSerialization.data(withJSONObject: jsonObject, options: [])
          if let jsonString = String(data: jsonData, encoding: .utf8) {
              return jsonString
          }
      } catch {
          print("Error creating JSON object: \(error.localizedDescription)")
      }
      return ""
  }
  
  @objc func bsmsHealthCheck(callback: @escaping ((String)-> Void)) {
    // First check cloud storage
    guard let iCloudFolderURL = getICloudFolder(named: "BitcoinKeeper") else {
        let response = getJsonResponse(
            status: false,
            data: "",
            error: "iCloud is currently inaccessible. Please check authentication with your iCloud and try again."
        )
        callback(response)
        return
    }
    
    // Check files in iCloud
    do {
        let fileManager = FileManager.default
        let files = try fileManager.contentsOfDirectory(
            at: iCloudFolderURL, 
            includingPropertiesForKeys: nil
        )
        
        let response = getJsonResponse(
            status: true,
            data: "Found \(files.count) files",
            error: ""
        )
        callback(response)
        
    } catch {
        let response = getJsonResponse(
            status: false,
            data: "",
            error: error.localizedDescription
        )
        callback(response)
    }
  }
}
