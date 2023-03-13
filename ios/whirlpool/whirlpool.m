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

RCT_EXPORT_METHOD(hello_world:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject){
  WhirlpoolHelper *helper = [[WhirlpoolHelper alloc]init];
  [helper helloWorldWithCallback:^(NSString * _Nonnull jsonContent) {
     NSLog(@"jsonContent",jsonContent);
     resolve(jsonContent);
  }];
}


@end
