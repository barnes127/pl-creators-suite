module.exports = {
  activate() {
    return {
      status: "active",
      message: "Sample Tool Plugin activated",
    };
  },

  deactivate() {
    return {
      status: "inactive",
      message: "Sample Tool Plugin deactivated",
    };
  },
};
