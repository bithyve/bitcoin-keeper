//
//  iCloud.m
//  hexa_keeper
//  Created by Shashank Shinde
//
#import "iCloud.h"
#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "hexa_keeper  -Swift.h"

@implementation iCloud


RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(startBackup:(NSString*) json
                  get:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject){
  NSLog(@"into native startBackup %@",json);
  iCloudBackup *backup = [[iCloudBackup alloc]init];
  [backup startBackupWithJson:json callback:^(NSString * _Nonnull isUploaded) {
    NSLog(@"isUploaded",isUploaded);

    resolve(isUploaded);
  }];
  
}

RCT_EXPORT_METHOD(downloadBackup:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject){
  NSLog(@"into native download backup");
  iCloudRestore *restore = [[iCloudRestore alloc]init];
  [restore getBackupWithCallback:^(NSString * _Nonnull jsonContent) {
     NSLog(@"jsonContent",jsonContent);
     resolve(jsonContent);
  }];
}


@end
