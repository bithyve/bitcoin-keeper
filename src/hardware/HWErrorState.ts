import { HWErrorType } from 'src/common/data/enums/Hardware';

const ErrorMessageMap = {
  [HWErrorType.INCORRECT_HW]: 'Please interact with the right hardware',
  [HWErrorType.INVALID_SIG]: 'Please export the xPub from the instructed section of the hardware',
  [HWErrorType.INCORRECT_NETWORK]:
    'Please check if the device is set to the right blockchain network',
};
class HWError extends Error {
  type: HWErrorType;

  constructor(type) {
    super(ErrorMessageMap[type]);
    this.name = 'HWError';
    this.type = type;
  }
}

export default HWError;
