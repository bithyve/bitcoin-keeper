export const TIMEOUT = 60;
export const PasswordTimeout = (failedAttempts) => {
  switch (failedAttempts) {
    case 1:
      return TIMEOUT * 5;
    case 2:
      return TIMEOUT * 15;
    case 3:
      return TIMEOUT * 60;
    default:
      return TIMEOUT * (60 * Math.pow(2, failedAttempts - 3));
  }
};

export const formatCoolDownTime = (minutes: number) => {
  minutes = minutes / TIMEOUT;
  if (minutes < 60) {
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  } else if (minutes < 1440) {
    // less than a day
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  } else {
    const days = Math.floor(minutes / 1440);
    return `${days} day${days !== 1 ? 's' : ''}`;
  }
};
