

module.exports =function (input, schema, policy){
 
    const diff = {};

/// check for schema

for (const key in schema) {
  if (key in input) {
      console.log(schema[key],"...",typeof input[key]);
      if(schema[key] !== typeof input[key]){
          diff[key] = `type missmatch please use valid ${schema[key]}`
        }
}}


if(Object.keys(diff).length > 0){
  return diff
}


 // Check for missing property
 if (policy === "POST") {
   for (const key in schema) {
     if (!(key in input)) {
       diff[key] = "missing property";
     } else if (key in input) {
       diff[key] = "match";
     }
   }
 }

 // Check for similar property
 if (policy === "PUT") {
   for (const key in input) {
     if (key in schema) {
       console.log("true");
       diff[key] = "match";
     }
   }
 }

 // Check for extra property
 if (policy === "POST" || policy === "PUT") {
   for (const key in input) {
     if (!(key in schema)) {
       diff[key] = "invalid property please remove this property";
     }
   }
 }


// Check for min max in input
for (const key in input) {
    if (diff[key] === "match") {
      if(!isNaN(input[key])){
        if( input[key] < 1 || input[key] > 100000){
          diff[key] = "Input must be between 1 to 100000";
        }
      }
    }
}



 // Check for undefined or empty fields in input
 for (const key in input) {
   if (input[key] === undefined || input[key] === "") {
     if (diff[key] === "match") {
       diff[key] = "property must be filled";
     }
   }
   if (diff[key] === "match") {
     delete diff[key];
   }
 }

 return diff;
};
