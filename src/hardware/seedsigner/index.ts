export const getSeedSignerDetails = (qrData) => {
  const xpub = qrData.slice(qrData.indexOf(']') + 1);
  const xfp = qrData.slice(1, 9);
  const derivationPath = qrData
    .slice(qrData.indexOf('[') + 1, qrData.indexOf(']'))
    .replace(xfp, 'm');
  return { xpub, derivationPath, xfp };
};
