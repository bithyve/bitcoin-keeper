export const PasswordTimeout = (failedAttempts) => {
    const TIMEOUT = 60;
    var waitingTime = 0;
    if (failedAttempts === 1) {
        return waitingTime = TIMEOUT * 5
    } else if (failedAttempts === 2) {
        return waitingTime = TIMEOUT * 15
    } else if (failedAttempts === 3) {
        return waitingTime = TIMEOUT * 60
    } else {
        return waitingTime = TIMEOUT * 5
    }
}