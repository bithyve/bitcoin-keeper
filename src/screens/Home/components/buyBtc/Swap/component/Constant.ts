export enum StatusEnum {
  Confirming = 'Confirming',
  Processing = 'Processing',
  Success = 'Success',
}

export function getStatus(status: string): StatusEnum {
  const confirmingStatuses = ['wait', 'confirmation', 'confirmed'];
  const processingStatuses = ['exchanging', 'sending', 'sending_confirmation'];

  if (confirmingStatuses.includes(status)) return StatusEnum.Confirming;
  if (processingStatuses.includes(status)) return StatusEnum.Processing;
  if (status === 'success') return StatusEnum.Success;

  return StatusEnum.Confirming;
}
