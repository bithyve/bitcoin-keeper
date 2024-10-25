export enum notificationType {
  contact = 'contact',
  approveKeeper = 'approveKeeper',
  uploadSecondaryShare = 'uploadSecondaryShare',
  reShare = 'reShare',
  reShareResponse = 'reShareResponse',
  smUploadedForPK = 'smUploadedForPK',
  newFCM = 'newFCM',
  newKeeperInfo = 'newKeeperInfo',
  FNF_REQUEST = 'FNF_REQUEST',
  FNF_TRANSACTION = 'FNF_TRANSACTION',
  RELEASE = 'RELEASE',
  FNF_REQUEST_ACCEPTED = 'FNF_REQUEST_ACCEPTED',
  FNF_REQUEST_REJECTED = 'FNF_REQUEST_REJECTED',
  FNF_KEEPER_REQUEST = 'FNF_KEEPER_REQUEST',
  FNF_KEEPER_REQUEST_ACCEPTED = 'FNF_KEEPER_REQUEST_ACCEPTED',
  FNF_KEEPER_REQUEST_REJECTED = 'FNF_KEEPER_REQUEST_REJECTED',
  GIFT_ACCEPTED = 'GIFT_ACCEPTED',
  GIFT_REJECTED = 'GIFT_REJECTED',
  REMOTE_KEY_SHARE = 'REMOTE_KEY_SHARE',
}

export enum notificationTag {
  IMP = 'IMP',
  notIMP = 'not-IMP',
  mandatory = 'mandatory',
  notMandatory = 'not-mandatory',
} // IMP/notIMP for directed notifications & mandatory/notMandatory for release notifications
