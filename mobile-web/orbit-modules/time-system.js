// Orbit-only scientific time pipeline.
// Internal simulation time is kept in UTC Julian Date, while orbital propagation
// uses TT (Terrestrial Time) relative to J2000.

const UNIX_EPOCH_JD = 2440587.5;
const SEC_PER_DAY = 86400;
const J2000_TT_JD = 2451545.0;

// UTC->TT offset approximation:
// TT = UTC + (TAI-UTC) + 32.184s ; with leap seconds = 37s -> 69.184s.
// Kept configurable for future updates.
const DEFAULT_TT_MINUS_UTC_SEC = 69.184;

const jdFromUnixMs = (unixMs) => (unixMs / 86400000) + UNIX_EPOCH_JD;
const unixMsFromJd = (jd) => (jd - UNIX_EPOCH_JD) * 86400000;

const formatUtcIso = (jdUtc) => {
  const unixMs = unixMsFromJd(jdUtc);
  return new Date(unixMs).toISOString().replace("T", " ").replace("Z", " UTC");
};

const formatTtIsoApprox = (jdTt) => {
  const unixMs = unixMsFromJd(jdTt);
  return new Date(unixMs).toISOString().replace("T", " ").replace("Z", " TT*");
};

export const createTimeSystem = (options = {}) => {
  const ttMinusUtcSec = Number.isFinite(options.ttMinusUtcSec)
    ? options.ttMinusUtcSec
    : DEFAULT_TT_MINUS_UTC_SEC;
  const ttMinusUtcDay = ttMinusUtcSec / SEC_PER_DAY;
  let jdUtc = Number.isFinite(options.initialJdUtc)
    ? options.initialJdUtc
    : jdFromUnixMs(Date.now());

  const getUtcJd = () => jdUtc;
  const getTtJd = () => jdUtc + ttMinusUtcDay;
  const getDaysSinceJ2000Tt = () => getTtJd() - J2000_TT_JD;

  const setUtcJd = (nextJdUtc) => {
    jdUtc = Number.isFinite(nextJdUtc) ? nextJdUtc : jdUtc;
    return jdUtc;
  };

  const setDaysSinceJ2000Tt = (daysTt) => {
    const ttJd = J2000_TT_JD + (Number.isFinite(daysTt) ? daysTt : 0);
    jdUtc = ttJd - ttMinusUtcDay;
    return jdUtc;
  };

  const setNow = () => {
    jdUtc = jdFromUnixMs(Date.now());
    return jdUtc;
  };

  const advanceDays = (days) => {
    jdUtc += Number.isFinite(days) ? days : 0;
    return jdUtc;
  };

  const getFormattedUtc = () => formatUtcIso(getUtcJd());
  const getFormattedTt = () => formatTtIsoApprox(getTtJd());

  return {
    constants: {
      SEC_PER_DAY,
      J2000_TT_JD,
      TT_MINUS_UTC_SEC: ttMinusUtcSec
    },
    getUtcJd,
    getTtJd,
    getDaysSinceJ2000Tt,
    setUtcJd,
    setDaysSinceJ2000Tt,
    setNow,
    advanceDays,
    getFormattedUtc,
    getFormattedTt
  };
};
