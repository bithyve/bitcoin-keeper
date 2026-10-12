#import <Foundation/Foundation.h>

#if defined(KEEPER_RECOVERABLE_PREVIEW) && KEEPER_RECOVERABLE_PREVIEW

#import <React/RCTBridgeModule.h>
#import <Security/Security.h>

static NSString *const KeeperPreviewBundleID = @"io.hexawallet.hexakeeper.recoverablepreview";
static NSString *const KeeperPreviewSeedService = @"io.hexawallet.hexakeeper.recoverablepreview.mobile-key.v1";
static NSString *const KeeperPreviewSeedAccount = @"seed-v1";

static NSDictionary *KeeperPreviewSeedQuery(void)
{
  return @{
    (__bridge id)kSecClass: (__bridge id)kSecClassGenericPassword,
    (__bridge id)kSecAttrService: KeeperPreviewSeedService,
    (__bridge id)kSecAttrAccount: KeeperPreviewSeedAccount,
    (__bridge id)kSecAttrSynchronizable: @NO,
    (__bridge id)kSecReturnData: @YES,
    (__bridge id)kSecMatchLimit: (__bridge id)kSecMatchLimitOne,
  };
}

static void KeeperPreviewClearSeed(NSMutableData *seed)
{
  // Volatile writes keep clearing of owned native buffers from being optimized away.
  volatile uint8_t *bytes = (volatile uint8_t *)seed.mutableBytes;
  for (NSUInteger index = 0; index < seed.length; index++) bytes[index] = 0;
}

static OSStatus KeeperPreviewReadSeed(NSMutableData **seed)
{
  CFTypeRef result = NULL;
  OSStatus status = SecItemCopyMatching((__bridge CFDictionaryRef)KeeperPreviewSeedQuery(), &result);
  if (status != errSecSuccess) {
    if (result != NULL) CFRelease(result);
    return status;
  }
  if (result == NULL || CFGetTypeID(result) != CFDataGetTypeID()) {
    if (result != NULL) CFRelease(result);
    return errSecDecode;
  }
  NSData *value = CFBridgingRelease(result);
  *seed = [value mutableCopy];
  return [(*seed) length] == 32 ? errSecSuccess : errSecDecode;
}

@interface KeeperPreviewMobileKey : NSObject <RCTBridgeModule>
- (void)resolveSeedWithCreation:(BOOL)createIfMissing
                      resolver:(RCTPromiseResolveBlock)resolve
                      rejecter:(RCTPromiseRejectBlock)reject;
@end

@implementation KeeperPreviewMobileKey

RCT_EXPORT_MODULE(KeeperPreviewMobileKey);

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

RCT_EXPORT_METHOD(getOrCreateSeedBase64:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  [self resolveSeedWithCreation:YES resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(readExistingSeedBase64:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  [self resolveSeedWithCreation:NO resolver:resolve rejecter:reject];
}

- (void)resolveSeedWithCreation:(BOOL)createIfMissing
                      resolver:(RCTPromiseResolveBlock)resolve
                      rejecter:(RCTPromiseRejectBlock)reject
{
  NSBundle *bundle = [NSBundle mainBundle];
  if (![[bundle bundleIdentifier] isEqualToString:KeeperPreviewBundleID] ||
      ![[bundle objectForInfoDictionaryKey:@"KeeperRecoverablePreview"] isEqual:@YES]) {
    reject(@"PREVIEW_ONLY", @"Mobile Key requires the testnet preview app", nil);
    return;
  }

  @synchronized([KeeperPreviewMobileKey class]) {
    NSMutableData *stored = nil;
    OSStatus status = KeeperPreviewReadSeed(&stored);
    if (status == errSecSuccess) {
      NSString *encoded = [stored base64EncodedStringWithOptions:0];
      KeeperPreviewClearSeed(stored);
      resolve(encoded);
      return;
    }
    KeeperPreviewClearSeed(stored);
    if (status != errSecItemNotFound || !createIfMissing) {
      reject(@"MOBILE_KEY_STORAGE_UNAVAILABLE", @"Mobile Key secure storage is unavailable", nil);
      return;
    }

    NSMutableData *created = [NSMutableData dataWithLength:32];
    if (SecRandomCopyBytes(kSecRandomDefault, created.length, created.mutableBytes) != errSecSuccess) {
      KeeperPreviewClearSeed(created);
      reject(@"MOBILE_KEY_STORAGE_UNAVAILABLE", @"Mobile Key secure storage is unavailable", nil);
      return;
    }

    NSDictionary *item = @{
      (__bridge id)kSecClass: (__bridge id)kSecClassGenericPassword,
      (__bridge id)kSecAttrService: KeeperPreviewSeedService,
      (__bridge id)kSecAttrAccount: KeeperPreviewSeedAccount,
      (__bridge id)kSecAttrSynchronizable: @NO,
      (__bridge id)kSecAttrAccessible: (__bridge id)kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
      (__bridge id)kSecValueData: created,
    };
    status = SecItemAdd((__bridge CFDictionaryRef)item, NULL);
    if (status != errSecSuccess && status != errSecDuplicateItem) {
      KeeperPreviewClearSeed(created);
      reject(@"MOBILE_KEY_STORAGE_UNAVAILABLE", @"Mobile Key secure storage is unavailable", nil);
      return;
    }

    NSMutableData *readback = nil;
    OSStatus readStatus = KeeperPreviewReadSeed(&readback);
    if (readStatus != errSecSuccess ||
        (status == errSecSuccess && ![readback isEqualToData:created])) {
      KeeperPreviewClearSeed(created);
      KeeperPreviewClearSeed(readback);
      reject(@"MOBILE_KEY_STORAGE_UNAVAILABLE", @"Mobile Key secure storage is unavailable", nil);
      return;
    }
    // SecItemAdd is create-if-absent. On a duplicate, use the winner's seed.
    NSString *encoded = [readback base64EncodedStringWithOptions:0];
    KeeperPreviewClearSeed(readback);
    KeeperPreviewClearSeed(created);
    resolve(encoded);
  }
}

@end

#endif
