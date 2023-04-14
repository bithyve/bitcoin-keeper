export const swiperData = [
  {
    id: '1',
    firstContentHeading: {
      contentTitle: 'Pool',
      contentSubTitle: 'The denonination of the pool you have selected for this mix.',
    },
    secondContentHeading: {
      contentTitle: 'UTXO’s created',
      contentSubTitle: 'The number of unspent outputs that will be created with fresh histories.',
    },
    firstContentFooter: {
      contentTitle: 'Deterministic links',
      contentSubTitle:
        'The number of deterministically linked inputs and outputs in the resulting mix transaction',
    },
    secondContentFooter: {
      contentTitle: 'Combinations',
      contentSubTitle:
        'The number of potential combinations when attempting to link inputs to outputs of a single mix transaction',
    },
  },
  {
    id: '2',
    firstContentHeading: {
      contentTitle: 'Entropy',
      contentSubTitle:
        'The score of the resulting transaction when measured with the Boltzmann transaction analyzer tool.',
    },
    secondContentHeading: {
      contentTitle: 'Pool Fee',
      contentSubTitle: 'The fixed fee required to enter the pool',
    },
    firstContentFooter: {
      contentTitle: 'Total Premix Fee',
      contentSubTitle: 'The total miner fees for the Premix outputs created',
    },
    secondContentFooter: {
      contentTitle: 'Miner Fee',
      contentSubTitle: 'The miner fee for the Tx0 transaction being created',
    },
  },
];