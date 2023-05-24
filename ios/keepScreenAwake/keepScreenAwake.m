//
//  keepScreenAwake.m
//  hexa_keeper
//
//  Created by Shashank Shinde on 05/05/23.
//

#import "keepScreenAwake.h"

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "hexa_keeper-Swift.h"
#import <React/RCTConvert.h>

@implementation KeepScreenAwake

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(keepAwake:(BOOL*) awake){
  if(awake){
    dispatch_async(dispatch_get_main_queue(), ^{
            [[UIApplication sharedApplication] setIdleTimerDisabled:YES];
    });
  } else {
    dispatch_async(dispatch_get_main_queue(), ^{
            [[UIApplication sharedApplication] setIdleTimerDisabled:NO];
    });
  }
}

@end
