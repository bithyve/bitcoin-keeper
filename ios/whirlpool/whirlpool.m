//
//  whirlpool.m
//  hexa_keeper
//
//  Created by Praneeth G on 13/03/23.
//
#import "whirlpool.h"

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "hexa_keeper-Swift.h"
#import <React/RCTConvert.h>

@implementation Whirlpool


RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(hello:(NSString*) name
                  get:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject){
  WhirlpoolHelper *helper = [[WhirlpoolHelper alloc]init];
  [helper helloWithName:name callback:^(NSString * _Nonnull response) {
    resolve(response);
  }];
}

RCT_EXPORT_METHOD(initiate:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject){
  WhirlpoolHelper *helper = [[WhirlpoolHelper alloc]init];
  [helper initiateClientWithCallback:^(NSString * _Nonnull response) {
    resolve(response);
  }];
}

RCT_EXPORT_METHOD(getPools:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject){
  WhirlpoolHelper *helper = [[WhirlpoolHelper alloc]init];
  [helper getPoolsWithCallback:^(NSString * _Nonnull response) {
    resolve(response);
  }];
}

RCT_EXPORT_METHOD(getTx0Data:(NSString*) scode
                  :(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject){
  WhirlpoolHelper *helper = [[WhirlpoolHelper alloc]init];
  [helper getTx0DataWithScode:scode callback:^(NSString * _Nonnull response) {
    resolve(response);
  }];
}

RCT_EXPORT_METHOD(tx0Preview:(NSString *)inputs_value
                  pool_str:(NSString *)pool_str
                  fees_address:(NSString *)fees_address
                  input_structure_str:(NSString *)input_structure_str
                  miner_fee_per_byte:(NSString *)miner_fee_per_byte
                  coordinator_fee:(NSString *)coordinator_fee
                  n_wanted_max_outputs_str:(NSString *)n_wanted_max_outputs_str
                  n_pool_max_outputs:(NSString *)n_pool_max_outputs
                  premix_fee_per_byte:(NSString *)premix_fee_per_byte
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  WhirlpoolHelper *helper = [[WhirlpoolHelper alloc]init];
  
  [helper tx0PreviewWithInputs_value:inputs_value pool_str:pool_str fees_address:fees_address input_structure_str:input_structure_str miner_fee_per_byte:miner_fee_per_byte coordinator_fee:coordinator_fee n_wanted_max_outputs_str:n_wanted_max_outputs_str n_pool_max_outputs:n_pool_max_outputs premix_fee_per_byte:premix_fee_per_byte callback:^(NSString * _Nonnull response) {
    resolve(response);
  }];
}

RCT_EXPORT_METHOD(intoPsbt:(NSString *)preview_str
                  tx0_data_str:(NSString *)tx0_data_str
                  inputs_str:(NSString *)inputs_str
                  address_bank_str:(NSString *)address_bank_str
                  change_addr_str:(NSString *)change_addr_str
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  WhirlpoolHelper *helper = [[WhirlpoolHelper alloc]init];
  
  [helper intoPsbtWithPreview_str:preview_str tx0_data_str:tx0_data_str inputs_str:inputs_str address_bank_str:address_bank_str change_addr_str:change_addr_str callback:^(NSString * _Nonnull response) {
    resolve(response);
  }];
}

RCT_EXPORT_METHOD(tx0Push:(NSString *)tx_str
                  pool_id_str:(NSString *)pool_id_str
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  WhirlpoolHelper *helper = [[WhirlpoolHelper alloc]init];
  
  [helper tx0pushWithTx_str:tx_str pool_id_str:pool_id_str callback:^(NSString * _Nonnull response) {
    resolve(response);
  }];
}

RCT_EXPORT_METHOD(blocking:(NSString *)input_str
                  private_key_str:(NSString *)private_key_str
                  destination_addr_str:(NSString *)destination_addr_str
                  pool_id:(NSString *)pool_id
                  denomination_str:(NSString *)denomination_str
                  pre_user_hash_str:(NSString *)pre_user_hash_str
                  network_str:(NSString *)network_str
                  block_height_str:(NSString *)block_height_str
                  signedRegistrationMessage:(NSString *)signedRegistrationMessage
                  app_id:(NSString *)app_id
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  WhirlpoolHelper *helper = [[WhirlpoolHelper alloc]init];
  
  [helper blockingWithInput_str:input_str private_key_str:private_key_str destination_addr_str:destination_addr_str pool_id:pool_id denomination_str:denomination_str pre_user_hash_str:pre_user_hash_str network_str:network_str block_height_str:block_height_str signedRegistrationMessage:signedRegistrationMessage app_id:app_id callback:^(NSString * _Nonnull response) {
    resolve(response);
  }];
}


@end
