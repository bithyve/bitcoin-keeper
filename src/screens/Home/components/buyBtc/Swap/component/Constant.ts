export enum StatusEnum {
  Confirming = 'Confirming',
  Processing = 'Processing',
  Success = 'Success',
  OverDue = 'Overdue',
  Refund = 'Refund',
}

export function getStatus(status: string): StatusEnum {
  const confirmingStatuses = ['wait', 'confirmation', 'confirmed'];
  const processingStatuses = ['exchanging', 'sending', 'sending_confirmation'];
  const errorStatuses = ['aml_check_failed', 'overdue', 'error'];

  if (confirmingStatuses.includes(status)) return StatusEnum.Confirming;
  if (processingStatuses.includes(status)) return StatusEnum.Processing;
  if (errorStatuses.includes(status)) return StatusEnum.OverDue;
  if (status === 'success') return StatusEnum.Success;
  if (status === 'refund') return StatusEnum.Refund;

  return StatusEnum.Confirming;
}
