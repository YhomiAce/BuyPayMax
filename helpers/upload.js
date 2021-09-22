const multer = require("multer");
const path = require("path");
const fs = require('fs');


const storage = multer.diskStorage({
    destination:function(req,file,cb){
      cb(null,'uploads/')
    },
    filename:function(req,file,cb){
      cb(null,new Date().toISOString().replace(/:/g,'-')+file.originalname)
    }
  })
  
  const filter = (req,file,cb)=>{
    if(file.mimetype === 'image/jpeg' || file.mimetype ===  'image/jpg' || file.mimetype ===  'image/png'){
      cb(null,true)
    }else{
      cb({error:'You can not upload this type of image'},false)
    }
  }
  
  const upload = multer({storage:storage,limits:{
        fileSize:1024*1024*5
      },
      fileFilter:filter
  })

module.exports = upload;

