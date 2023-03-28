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

RCT_EXPORT_METHOD(getTx0Data:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject){
  WhirlpoolHelper *helper = [[WhirlpoolHelper alloc]init];
  [helper getTx0DataWithCallback:^(NSString * _Nonnull response) {
    resolve(response);
  }];
}

@end
