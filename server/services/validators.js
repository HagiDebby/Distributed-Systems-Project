


/**
 * Generic Unix timestamp validator
 * @param {number} timestamp - Unix timestamp to validate
 * @param {string} field - Field name for error messages
 * @param {boolean} mustBeFuture - Whether timestamp must be in future
 * @param {number} maxPastDays - Max days in past allowed (default: 1)
 * @returns {Object} Validation result
 */
const validateEpochTimestamp = (timestamp, field, mustBeFuture = false, maxPastDays = 1) => {
    if (!timestamp || isNaN(timestamp)) {
        return {
            success: false,
            message: `${field} must be a valid timestamp`
        };
    }

    const ts = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
    const currentTime = Math.floor(Date.now() / 1000);

    if (mustBeFuture && ts <= currentTime) {
        return {
            success: false,
            message: `${field} must be in the future`
        };
    }

    // Check if timestamp is too far in the past
    const maxPastTime = currentTime - (maxPastDays * 24 * 60 * 60);
    if (ts < maxPastTime) {
        return {
            success: false,
            message: `${field} cannot be more than ${maxPastDays} day(s) in the past`
        };
    }

    return { success: true, message: `${field} is valid` };
};

exports.validateEpochTimestamp = validateEpochTimestamp;
