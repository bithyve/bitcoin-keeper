import config from 'src/utils/service-utilities/config';

const finalURL = `https://www.bitcoinkeeper.app/${config.ENVIRONMENT.toLowerCase()}/ramp/`;

export const fetchRampReservation = ({ receiveAddress }) => {
  try {
    const url = `${config.RAMP_BASE_URL}?\
hostAppName=${'Bitcoin Keeper'}&\
userAddress=${receiveAddress}&\
hostLogoUrl=${'https://static.wixstatic.com/media/6aee8c_164a4e8d6d7246468071075485eb1259~mv2.png/v1/fill/w_328,h_144,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/keeper%20logo.png'}&\
swapAsset=BTC&\
hostApiKey=${config.RAMP_REFERRAL_CODE}&\
finalUrl=${finalURL}
`;
    return url;
  } catch (error) {
    console.log('error generating Ramp link ', error);
    return {
      error,
    };
  }
};


export const fetchSellBtcLink = () => {
  const url = `${config.RAMP_BASE_URL}?\
hostAppName=${'Bitcoin Keeper'}&\
hostLogoUrl=${'https://static.wixstatic.com/media/6aee8c_164a4e8d6d7246468071075485eb1259~mv2.png/v1/fill/w_328,h_144,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/keeper%20logo.png'}&\
swapAsset=BTC&\
hostApiKey=${config.RAMP_REFERRAL_CODE}&\
finalUrl=${finalURL}&\
defaultFlow=OFFRAMP
`;
  return url;
};

export const fetchBuyUsdtLink = ({ receiveAddress }) => {
  const url = `${config.RAMP_BASE_URL}?\
hostAppName=${'Bitcoin Keeper'}&\
userAddress=${receiveAddress}&\
hostLogoUrl=${'https://static.wixstatic.com/media/6aee8c_164a4e8d6d7246468071075485eb1259~mv2.png/v1/fill/w_328,h_144,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/keeper%20logo.png'}&\
swapAsset=TRON_USDT&\
hostApiKey=${config.RAMP_REFERRAL_CODE}&\
finalUrl=${finalURL}
`;
  return url;
};
export const fetchSellUsdtLink = () => {
  const url = `${config.RAMP_BASE_URL}?\
hostAppName=${'Bitcoin Keeper'}&\
hostLogoUrl=${'https://static.wixstatic.com/media/6aee8c_164a4e8d6d7246468071075485eb1259~mv2.png/v1/fill/w_328,h_144,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/keeper%20logo.png'}&\
swapAsset=TRON_USDT&\
hostApiKey=${config.RAMP_REFERRAL_CODE}&\
finalUrl=${finalURL}
defaultFlow=OFFRAMP
`;
  return url;
};



