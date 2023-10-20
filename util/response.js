module.exports = (res,satus,data)=>{
    
    
    res.writeHead(satus, { "Content-Type": "application/json" });
    res.write(JSON.stringify(data)); // Use the data variable here
    res.end();

}