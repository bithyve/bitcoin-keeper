import { MixStatus } from '../../../nativemodules/interface';

export const MOCK_POOL_DATA = [
  {
    id: '0.01btc',
    denomination: 1000000,
    fee_value: 50000,
    must_mix_balance_min: 1000170,
    must_mix_balance_cap: 1009690,
    min_anonymity_set: 5,
    min_must_mix: 2,
    tx0_max_outputs: 70,
    n_registered: 345,
    mix_status: MixStatus.ConfirmInput,
    elapsed_time: 23752,
    n_confirmed: 2,
  },
  {
    id: '0.001btc',
    denomination: 100000,
    fee_value: 5000,
    must_mix_balance_min: 100170,
    must_mix_balance_cap: 109690,
    min_anonymity_set: 5,
    min_must_mix: 2,
    tx0_max_outputs: 25,
    n_registered: 325,
    mix_status: MixStatus.ConfirmInput,
    elapsed_time: 297971,
    n_confirmed: 2,
  },
  {
    id: '0.05btc',
    denomination: 5000000,
    fee_value: 175000,
    must_mix_balance_min: 5000170,
    must_mix_balance_cap: 5009690,
    min_anonymity_set: 5,
    min_must_mix: 2,
    tx0_max_outputs: 70,
    n_registered: 218,
    mix_status: MixStatus.ConfirmInput,
    elapsed_time: 247030,
    n_confirmed: 2,
  },
  {
    id: '0.5btc',
    denomination: 50000000,
    fee_value: 1750000,
    must_mix_balance_min: 50000170,
    must_mix_balance_cap: 50009690,
    min_anonymity_set: 5,
    min_must_mix: 2,
    tx0_max_outputs: 70,
    n_registered: 69,
    mix_status: MixStatus.ConfirmInput,
    elapsed_time: 5539993,
    n_confirmed: 2,
  },
];

export const MOCK_TX0_DATA = [
  {
    pool_id: '0.01btc',
    fee_payment_code:
      'PM8TJbEnXU7JpR8yMdQee9H5C4RNWTpWAgmb2TVyQ4zfnaQBDMTJ4yYVP9Re8NVsZDSwXvogYbssrqkfVwac9U1QnxdCU2G1zH7Gq6L3JJjzcuWGjB9N',
    fee_value: 42500,
    fee_change: 0,
    fee_discount_percent: 0,
    message: 'None',
    fee_payload_64: '0096101e=b00ic20000000000000000000000000000000000000000000',
    fee_address: 'tb1qhh2pdl203j27acmfdphrlhe3uhl7f7w5nxvytt',
    fee_output_signature:
      'H+LHNMd4uOy5Nr/iMQqW+4IifA5v7WPQFnoxuoBQw0++aMFfeuYl1PFUXnKHqqotYg8oDvtcpA0ZhwGS+suGPAU=',
  },
  {
    pool_id: '0.001btc',
    fee_payment_code:
      'PM8TJbEnXU7JpR8yMdQee9H5C4RNWTpWAgmb2TVyQ4zfnaQBDMTJ4yYVP9Re8NVsZDSwXvogYbssrqkfVwac9U1QnxdCU2G1zH7Gq6L3JJjzcuWGjB9N',
    fee_value: 5000,
    fee_change: 0,
    fee_discount_percent: 0,
    message: 'None',
    fee_payload_64: '0096101e=b00ic20000000000000000000000000000000000000000000',
    fee_address: 'tb1qhh2pdl203j27acmfdphrlhe3uhl7f7w5nxvytt',
    fee_output_signature:
      'IBMiVqEBy8fSWr8xJs7W2ENURVoqjXyUM9oFdhNoQL7xOySl197WRBnw59TB5hk+nBd4r95N9OVJrvLNwKFQ/J4=',
  },
  {
    pool_id: '0.05btc',
    fee_payment_code:
      'PM8TJbEnXU7JpR8yMdQee9H5C4RNWTpWAgmb2TVyQ4zfnaQBDMTJ4yYVP9Re8NVsZDSwXvogYbssrqkfVwac9U1QnxdCU2G1zH7Gq6L3JJjzcuWGjB9N',
    fee_value: 148750,
    fee_change: 0,
    fee_discount_percent: 0,
    message: 'None',
    fee_payload_64: '0096101e=b00ic20000000000000000000000000000000000000000000',
    fee_address: 'tb1qhh2pdl203j27acmfdphrlhe3uhl7f7w5nxvytt',
    fee_output_signature:
      'ICI3MP51k0O1vHzvKz2TDG2mHrF7r0q+dOr5AEw6HJv1cRDNNsdzo+HIksIpDCR3FFYYksQ1FAHfQyjoSBej83k=',
  },
  {
    pool_id: '0.5btc',
    fee_payment_code:
      'PM8TJbEnXU7JpR8yMdQee9H5C4RNWTpWAgmb2TVyQ4zfnaQBDMTJ4yYVP9Re8NVsZDSwXvogYbssrqkfVwac9U1QnxdCU2G1zH7Gq6L3JJjzcuWGjB9N',
    fee_value: 1487500,
    fee_change: 0,
    fee_discount_percent: 0,
    message: null,
    fee_payload_64: '0096101n&c00ic20000000000000000000000000000000000000000000',
    fee_address: 'tb1qkk4ktf6zdz8xt3e7w7qptv7y23dny26cezs2av',
    fee_output_signature:
      'HzTej3nmr4NYYeENw3bLA+K9Eib9kKkQ50y61AIAQjS4Gi4twZyhrTPbokRZcbbVBgqXlcCAJqH/f27w77yfwW0=',
  },
];
