const fs = require('fs');

let files = fs.readdirSync('.');

files = files.filter((e)=>{ return e.endsWith('.png')});

// files = files.filter((e)=>{e.endsWith('png')})

let json = JSON.stringify(files);

fs.writeFileSync('flag.json',json,'utf-8');

