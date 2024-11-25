#import "cloudbackup.h"

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "hexa_keeper-Swift.h"
#import <React/RCTConvert.h>

@implementation CloudBackup

RCT_EXPORT_MODULE();


RCT_EXPORT_METHOD(backupBsms:(NSString *)data
                  password:(NSString *)password
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject){
  CloudBackupHelper *helper = [[CloudBackupHelper alloc]init];
  [ helper backupBsmsWithData:data password:password callback:^(NSString * _Nonnull response) {
      resolve(response);
    }];
}

RCT_EXPORT_METHOD(bsmsHealthCheck:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    CloudBackupHelper *helper = [[CloudBackupHelper alloc]init];
    [helper bsmsHealthCheckWithCallback:^(NSString * _Nonnull response) {
        resolve(response);
    }];
}


@end
