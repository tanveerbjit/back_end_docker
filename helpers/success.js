module.exports = (title, obj) => {
  return {
    success: true,
    fialed: false,
    title,
    data: obj,
    // stackTrace: err.stack,
  };
};
