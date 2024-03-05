export const PasswordTimeout = (failedAttempts) => {
    const TIMEOUT = 60;
    if (failedAttempts === 1) {
        return TIMEOUT * 5
    } else if (failedAttempts === 2) {
        return TIMEOUT * 15
    } else if (failedAttempts === 3) {
        return TIMEOUT * 60
    } else {
        return TIMEOUT * 5
    }
}