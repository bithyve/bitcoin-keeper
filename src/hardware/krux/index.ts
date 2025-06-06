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
