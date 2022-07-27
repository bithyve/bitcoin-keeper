//
//  iCloudHelper.swift
//  Keeper
//  Created by Shashank
//

import Foundation
import CloudKit

@objc class iCloudBackup: NSObject {
  
  override init() {
    super.init()
  }
  
  @objc func startBackup(json: String, callback: @escaping ((String) -> Void)){
    let pred = NSPredicate(value: true)
    let ckQuery = CKQuery(recordType: "KeeperJSONBackup", predicate: pred)
    let operation = CKQueryOperation(query: ckQuery)
    operation.desiredKeys = ["json"]
    operation.recordFetchedBlock = { record in
      print(record.recordID)
      print(record.recordType)
      CKContainer.init(identifier: "iCloud.io.hexawallet.keeper").privateCloudDatabase.delete(withRecordID: record.recordID) { (recordID, err) in
        guard let err = err else {
          print("\(String(describing: recordID)) deleted successffuly")
          return
        }
        print(err)
        print("delete failed for: \(String(describing: recordID)) error: \(err)")
      }
    }
    operation.queryCompletionBlock = {(_,err) in
      if let err = err as? CKError{
        print(err)
        callback("{\"status\": false, \"error\": \"\(err.localizedDescription)\", \"code\": \(err.errorCode)}")
        return
      }
      print("FETCH OPERATION COMPLETED & DELETE Scheduled for all")
      let ckr = CKRecord(recordType: "KeeperJSONBackup")
      ckr["json"] = json
      CKContainer.init(identifier: "iCloud.io.hexawallet.keeper").privateCloudDatabase.save(ckr) { (record, err) in
        if let err = err as? CKError{
          print(err)
          callback("{\"status\": false, \"error\": \"\(err.localizedDescription)\", \"code\": \(err.errorCode)}")
          return
        }
        guard let record = record else{
          print("no records....")
          callback("{\"status\": false, \"code\": -1}")
          return
        }
        guard (record["json"] as? String) != nil else{
          print("no json in record....")
          callback("{\"status\": false, \"code\": -1}")
          return
        }
        print("UPLOADED NEW JSON")
        callback("{\"status\": true, \"code\": 1111}")
      }
    }
    CKContainer.init(identifier: "iCloud.io.hexawallet.keeper").privateCloudDatabase.add(operation)
  }
}

@objc class iCloudRestore: NSObject {
  
  override init() {
    super.init()
  }
 
  @objc func getBackup(callback: @escaping ((String) -> Void)) {
    let pred = NSPredicate(value: true)
    let ckQuery = CKQuery(recordType: "KeeperJSONBackup", predicate: pred)
    let sort = NSSortDescriptor(key: "creationDate", ascending: true)
    ckQuery.sortDescriptors = [sort]
    let operation = CKQueryOperation(query: ckQuery)
    operation.desiredKeys = ["json"]
    var jsonFromiCloud = ""
    operation.recordFetchedBlock = { record in
      print(record.recordID)
      print(record.recordType)
      guard let jsoniCloud = record["json"] as? String else {
        print("JSON NOT PRESENT")
        return
      }
      jsonFromiCloud = jsoniCloud
    }
    operation.queryCompletionBlock = {(_,err) in
      if let err = err as? CKError{
        print(err)
        callback("{\"status\": false, \"error\": \"\(err.localizedDescription)\", \"code\": \(err.errorCode)}")
        return
      }
      callback(jsonFromiCloud)
    }
    CKContainer.init(identifier: "iCloud.io.hexawallet.keeper").privateCloudDatabase.add(operation)
  }
  
}
