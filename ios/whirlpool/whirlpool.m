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

RCT_EXPORT_METHOD(sayHello:(NSString*) name
                  get:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject){
  WhirlpoolHelper *helper = [[WhirlpoolHelper alloc]init];
  [helper helloWorldWithName:name callback:^(NSString * _Nonnull response) {
    resolve(response);
  }];
}

RCT_EXPORT_METHOD(initiate:(NSString*) torPort
                  get:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject){
  WhirlpoolHelper *helper = [[WhirlpoolHelper alloc]init];
  [helper initiateClientWithTorPort:torPort callback:^(NSString * _Nonnull response) {
    resolve(response);
  }];
}

@end
