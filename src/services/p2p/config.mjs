// For bare runtime, we'll use environment variables or defaults
const getConfig = (key) => {
  // Try to get from Bare.env if available, otherwise use defaults
  if (typeof Bare !== 'undefined' && Bare.env && Bare.env[key]) {
    return Bare.env[key].trim();
  }
};

// P2P specific config
export const RELAY_PEER_PUB_KEY = getConfig('RELAY_PEER_PUB_KEY') || '';

// Export a default object for compatibility
export default {
  RELAY_PEER_PUB_KEY,
};
