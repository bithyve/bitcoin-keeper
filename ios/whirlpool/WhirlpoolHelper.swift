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
  
  @objc func tx0Preview(inputs_value: Int32, pool_str: String, premix_fee_per_byte: Double, fees_address:String, input_structure_str: String, miner_fee_per_byte: Int32, coordinator_fee: Int32, n_wanted_max_outputs_str: String, n_pool_max_outputs: Int32, callback: @escaping ((String) -> Void)){
    let result = tx0_preview(inputs_value, pool_str, premix_fee_per_byte,fees_address, input_structure_str, miner_fee_per_byte, coordinator_fee, n_wanted_max_outputs_str, n_pool_max_outputs)
    let str =  String(cString: result!)
    callback(str)
  }
  
  @objc func intoPsbt(preview_str:String, tx0_data_str:String, inputs_str:String, address_bank_str:String, change_addr_str:String, callback: @escaping ((String)-> Void)){
    let result = into_psbt(preview_str, tx0_data_str, inputs_str, address_bank_str, change_addr_str)
    let str =  String(cString: result!)
    callback(str)
  }
  
  @objc func tx0push(tx_str:String, pool_id_str:String, callback: @escaping ((String)-> Void)){
    let result = tx0_push(tx_str, pool_id_str)
    let str =  String(cString: result!)
    callback(str)
  }
}

