const mongoose = require("mongoose");
require("dotenv").config();


class DBServer{

    async connect(callback){

        try{
            if(process.env.DB && process.env.USER_NAME && process.env.PASSWORD){

                this.dbName = process.env.DB;
                this.username = process.env.USER_NAME;
                this.password = process.env.PASSWORD;
                this.url = `mongodb+srv://${this.username}:${this.password}@cluster0.wnspbx2.mongodb.net/${this.dbName}?retryWrites=true&w=majority`;
                const client = await mongoose.connect(this.url);
                
                if(client){

                    console.log("DB server is running");
                    callback()

                }else{

                    console.log("DB server is not running");

                }
            }

        }catch(err){

            console.log(`Database does not connect`);

        }

    }
}

module.exports = new DBServer();