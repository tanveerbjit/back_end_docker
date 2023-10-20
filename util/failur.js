module.exports = (msg) => {
  return {
    success: false,
    error: true,
    status: { msg },
  };
};
