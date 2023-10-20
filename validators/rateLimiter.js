const fs = require("fs");
const path = require("path");
const mailer = require("../service_container/MailService");

class RateLimiter {

  constructor() {
    this.ip = ""; // Initialize ip property
  }
 
  permission(req) {
    this.ip = req.connection.remoteAddress.split(":")[3]; //decorate ip
    return this.checker();
  }

  checker() {
    let col = this._readCollection();
    const data = col.filter((element) => element.ip === this.ip); /// chek ip exist

    if (data.length < 1) {

      // if url hit first time
      col.push({ ip: this.ip, ht: new Date(), cnt: 1, block: false });
      this._writeCollection(col);


    } else {

      // if url hit multiple time

      /// check if user is blockable
      const b_data = this.block_unblock(data);

      /// if blocked then notify the admin
      if(b_data.block){
        mailer.sendEmail(
          "bjit_mern@mail.com",
          "illigal activities",
          `someone from ${this.ip} ip trying to do some illigal activities`
        );
        return false;
      }else{
        /// update the url hit and allow to access 

        console.log(b_data);
        const updateData = col.filter((element) => element.ip !== this.ip);
        updateData.push({...b_data,cnt: b_data.cnt+1 });
        this._writeCollection(updateData);
        return true;
      }

    }

    return true;
  }

  /// if data user is blocked or not if not then check condition 
  block_unblock(data) {

    const inputDate = new Date(data[0].ht);
    const currentDate = new Date();
    const timeDifferenceInSeconds = Math.floor((currentDate - inputDate) / 1000);

    if(data[0].block){
      if(timeDifferenceInSeconds > 10){
        return { ...data[0], cnt: 1, block: false, ht: new Date() };
      }
    }else{
      if(timeDifferenceInSeconds < 10){
        if(data[0].cnt < 5){
          return { ...data[0], cnt: data[0].cnt + 1};
        }else{
          return { ...data[0], cnt: 1, ht: new Date(), block:true  };
        }
      }
    }
  
  }


  configpath() {
    this.path = path.join(__dirname, "..", "data", `blockList.json`);
    return this.path;
  }

  _readCollection() {
    try {
      const data = fs.readFileSync(this.configpath(), "utf8");
      return JSON.parse(data);
    } catch (err) {
      throw err;
    }
  }

  _writeCollection(col) {
    fs.writeFileSync(this.configpath(), JSON.stringify(col));
  }
}

module.exports = new RateLimiter();
