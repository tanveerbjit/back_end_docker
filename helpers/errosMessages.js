
module.exports = (title,err)=>{

    return {
        success: false,
        fialed: true,
        title,
        message: err.message,
        // stackTrace: err.stack,
      }

}