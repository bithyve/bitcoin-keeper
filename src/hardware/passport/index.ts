export const getPassportDetails = (qrData) => {
  const { p2wsh, p2wsh_deriv, xfp } = qrData;
  return { xpub: p2wsh, derivationPath: p2wsh_deriv, xfp };
};
