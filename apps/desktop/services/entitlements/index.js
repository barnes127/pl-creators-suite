const DEFAULT_FEATURE_FLAGS = Object.freeze({
  plugins: true,
  localAi: false,
  cloudSync: false,
  paidExtensions: false,
  marketplace: false,
});

async function getFeatureFlags() {
  return { ...DEFAULT_FEATURE_FLAGS };
}

async function isFeatureEnabled(feature) {
  const key = String(feature || "").trim();
  const flags = await getFeatureFlags();
  return Boolean(flags[key]);
}

module.exports = {
  DEFAULT_FEATURE_FLAGS,
  getFeatureFlags,
  isFeatureEnabled,
};
