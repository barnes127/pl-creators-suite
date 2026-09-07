function createFormatTaskHandlers(
  formatRuntime,
) {
  return {
    preview(input, context) {
      return formatRuntime.preview(
        input.adapterId,
        input.request,
        context,
      );
    },

    import(input, context) {
      return formatRuntime.import(
        input.adapterId,
        input.request,
        context,
      );
    },

    export(input, context) {
      return formatRuntime.export(
        input.adapterId,
        input.request,
        context,
      );
    },
  };
}

module.exports = {
  createFormatTaskHandlers,
};
