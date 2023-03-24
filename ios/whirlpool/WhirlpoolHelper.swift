//
//  WhirlpoolHelper.swift
//  hexa_keeper
//
//  Created by Praneeth G on 13/03/23.
//

import Foundation

@objc class WhirlpoolHelper: NSObject{
  override init() {
      super.init()
    }
  
  @objc func helloWorld(name: String, callback: @escaping ((String) -> Void)) {
    let result = hello_world(name)
    let str =  String(cString: result!)
    callback(str)
  }
  
  @objc func initiateClient(torPort: String, callback: @escaping ((String)-> Void)){
    let result = initiate(torPort)
    let str =  String(cString: result!)
    callback(str)
  }
}
