import WalletUtilities from 'src/services/wallets/operations/utils';

export const manipulateKruxData = (data: string) => {
  const match = data.match(/\[([a-f0-9]+)\/(.+?)\](\w+)/);
  if (!match) return null;
  const [, mfp, derivationPath, xPub] = match;
  return {
    mfp: mfp.toUpperCase(),
    derivationPath: 'm/' + derivationPath.replace(/h/g, "'"),
    xPub,
  };
};

export const manipulateKruxSingleFile = (data: string, callback: (details: string) => void) => {
  const { mfp, derivationPath, xPub } = manipulateKruxData(data);
  const purpose = WalletUtilities.getPurpose(derivationPath);
  callback(JSON.stringify({ [purpose]: { mfp, derivationPath, xPub } }));
};
