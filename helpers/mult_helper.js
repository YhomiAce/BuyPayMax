const multer = require("multer");
const path = require("path");


module.exports = multer({
    storage: multer.diskStorage({}),
    fileFilter: (req,file,cb)=>{
        let ext = path.extname(file.originalname);
        if(ext === '.jpeg' || ext ===  '.jpg' || ext ===  '.png' || ext === '.pdf' || ext === ".txt" || ext === ".doc"){
          cb(null,true)
        }else{
          cb({error:'You can not upload this type of file'},false)
        }
      }

})
