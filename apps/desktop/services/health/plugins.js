function createPluginHealthCollector(pluginRegistry) {
  if (
    !pluginRegistry ||
    typeof pluginRegistry.listPlugins !== "function"
  ) {
    throw new Error("Plugin registry is required.");
  }

  return {
    id: "extensions",
    displayName: "Extensions",
    category: "extension",
    owner: "extension-registry",
    async collect() {
      const plugins =
        await pluginRegistry
          .listPlugins();
      const enabled =
        plugins.filter(
          (plugin) =>
            plugin.enabled,
        );
      return {
        source: {
          id: "extensions",
          displayName: "Extensions",
          category: "extension",
          owner: "extension-registry",
          status: "healthy",
          severity: "healthy",
          summary:
            plugins.length === 0
              ? "No extensions are registered."
              : `${enabled.length} of ${plugins.length} extension(s) enabled.`,
          details: {
            total: plugins.length,
            enabled: enabled.length,
            disabled: plugins.length - enabled.length,
            plugins:
              plugins.map(
                (plugin) => ({
                  id: plugin.id,
                  name: plugin.name,
                  version: plugin.version,
                  type: plugin.type,
                  enabled: plugin.enabled,
                  apiVersion: plugin.apiVersion,
                }),
              ),
          },
        },
        findings: [],
      };
    },
  };
}
module.exports = {
  createPluginHealthCollector,
};
