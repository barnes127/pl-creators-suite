function getProcessResourceSnapshot(
  options = {},
) {
  const memory =
    process.memoryUsage();

  const cpu =
    process.cpuUsage();

  return {
    subsystem:
      options.subsystem ||
      "desktop",

    taskId:
      options.taskId ??
      null,

    memoryBytes:
      memory.rss,

    details: {
      heapTotalBytes:
        memory.heapTotal,

      heapUsedBytes:
        memory.heapUsed,

      externalBytes:
        memory.external,

      arrayBuffersBytes:
        memory.arrayBuffers,

      cpuUserMicroseconds:
        cpu.user,

      cpuSystemMicroseconds:
        cpu.system,

      uptimeSeconds:
        process.uptime(),
    },
  };
}

module.exports = {
  getProcessResourceSnapshot,
};
