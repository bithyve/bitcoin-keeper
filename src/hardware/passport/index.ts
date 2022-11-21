export const registerToPassport = async () => {};

export const getPassportDetails = (qrData) => {
  const { p2wsh_p2sh, p2wsh_p2sh_deriv, xfp } = qrData;
  return { xpub: p2wsh_p2sh, derivationPath: p2wsh_p2sh_deriv, xfp };
};

export const getMockPassportDetails = () => {};

export const signWithPassport = async (message) => {};
