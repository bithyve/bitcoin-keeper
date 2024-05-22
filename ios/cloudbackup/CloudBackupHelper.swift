import Foundation
import PDFGenerator
import QRCoder

@objc class CloudBackupHelper: NSObject, UIDocumentInteractionControllerDelegate{
  
  @objc public var imageSize:CGFloat = 280;
  
  override init() {
    super.init()
  }
  
  @objc func backupBsms(data: String, password: String, callback: @escaping ((String)-> Void)){
    var pdfFiles = [String]()
    if let jsonData = data.data(using: .utf8),
       let jsonArray = try? JSONSerialization.jsonObject(with: jsonData, options: []) as? [[String: Any]] {
        let parsedData = jsonArray.map { json -> (String, String) in
          let bsms = json["bsms"] as? String ?? ""
            let name = json["name"] as? String ?? ""
            return (bsms, name)
        }
        for (bsms, name) in parsedData {
          let pdf = generatePdf(bsms: bsms, name: name, password: password)
          pdfFiles.append(pdf)
        }
      print(pdfFiles.count)
      if pdfFiles.count > 0 {
        uploadToIcloud(files: pdfFiles, callback: callback)
      }
    } else {
        print("Error parsing JSON")
    }
  }
  
  func generatePdf(bsms: String, name: String, password: String) -> String{
    let txtTitle = UILabel();
    var txtPart = UILabel();
    let qrCodeImage = UIImageView();
    let generator = QRCodeGenerator();
    let v1 =   UIView( frame: CGRect(x: 0.0,y: 0, width: 595.0, height: 840.0))

    txtTitle.text = name as String
    txtTitle.lineBreakMode = .byWordWrapping
    txtTitle.numberOfLines = 0
    txtTitle.frame = CGRect(x:20,y:20,width:v1.bounds.size.width - 5, height:v1.bounds.size.height)
    txtTitle.font = UIFont.systemFont(ofSize: 16.0)
    txtTitle.textColor = UIColor.black
    txtTitle.textAlignment = .left
    txtTitle.sizeToFit()
    v1.addSubview(txtTitle)
    
    let txtSubHeading = UILabel();
    txtSubHeading.text = bsms
    txtSubHeading.lineBreakMode = .byWordWrapping
    txtSubHeading.numberOfLines = 0
    txtSubHeading.frame = CGRect(x:20,y:txtTitle.frame.height + txtTitle.font.ascender-1,width:v1.bounds.size.width - 20, height:v1.bounds.size.height)
    txtSubHeading.font = UIFont.systemFont(ofSize: 12.0)
    txtSubHeading.textColor = UIColor.black
    txtSubHeading.textAlignment = .left
    txtSubHeading.sizeToFit()
    v1.addSubview(txtSubHeading)
    
    qrCodeImage.image = generator.createImage(value: bsms ,size: CGSize(width: imageSize, height: imageSize))
    qrCodeImage.frame = CGRect(x: 20, y: 200 , width: imageSize, height: imageSize)
    v1.addSubview(qrCodeImage)
    let page = PDFPage.view(v1);
    let currentDate = Date()
    let formatter = DateFormatter()
    formatter.dateStyle = .medium
    formatter.timeStyle = .medium
    let dateTime = formatter.string(from: currentDate)
    let pdfFileName = name + "-" + dateTime + ".pdf"
    do {
      let pdfPath = NSTemporaryDirectory().appending(pdfFileName as String)
      try PDFGenerator.generate([page], to: pdfPath, password: PDFPassword(password))
      //print("file generated",pdfPath)
      return pdfPath
    } catch let error {
      print("error",error)
      return ""
    }
  }
  
  func getICloudFolder(named folderName: String) -> URL? {
      guard let iCloudURL = FileManager.default.url(forUbiquityContainerIdentifier: nil)?.appendingPathComponent("Documents") else {
          print("iCloud is not available.")
          return nil
      }
    return iCloudURL
      if FileManager.default.fileExists(atPath: iCloudURL.path) {
          return iCloudURL
      } else {
          return nil
      }
  }
  
  func uploadToIcloud(files: [String], callback: @escaping ((String)-> Void)) {
    print("uploading to iCloud...")
    let fileManager = FileManager.default
    do {
      let iCloudFolderURL = getICloudFolder(named: "Bitcoin-Keeper")
      if iCloudFolderURL != nil {
        for filePath in files {
          let url = URL(fileURLWithPath: filePath)
          let fileName = url.lastPathComponent
          let destinationURL = iCloudFolderURL!.appendingPathComponent(fileName)
          if fileManager.fileExists(atPath: destinationURL.path) {
            try fileManager.removeItem(at: destinationURL)
            try fileManager.copyItem(at: url, to: destinationURL)
          } else {
            try fileManager.copyItem(at: url, to: destinationURL)
          }
          let response = getJsonResponse(status: true, data: files.joined(separator: ", "), error: "")
          callback(response)
          print("File uploaded to iCloud successfully.")
        }
      } else {
        let response = getJsonResponse(status: false, data: "", error: "iCloud is currently inaccessible. Please check authentication with your iCloud and try again.")
        callback(response)
      }
    } catch{
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
}
