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
  
  @objc func hello(name: String, callback: @escaping ((String) -> Void)) {
    let result = hello_world(name)
    let str =  String(cString: result!)
    callback(str)
  }
  
  @objc func initiateClient(callback: @escaping ((String)-> Void)){
    let result = initiate()
    let str =  String(cString: result!)
    callback(str)
  }

  @objc func getPools(callback: @escaping ((String)-> Void)){
    let result = pools()
    let str =  String(cString: result!)
    callback(str)
  }
  
  @objc func getTx0Data(callback: @escaping ((String)-> Void)){
    let result = gettx0data()
    let str =  String(cString: result!)
    callback(str)
  }
}

