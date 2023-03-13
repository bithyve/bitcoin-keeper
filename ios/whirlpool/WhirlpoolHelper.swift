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
  
  @objc func helloWorld(callback: @escaping ((String) -> Void)) {
    
    let result = hello_world()
    let sr =  String(cString: result!)

    callback(sr)

  }
}
