import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads");

if(!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {recursive: true});
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const suffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `${suffix}-${file.originalname}`);
    }
})

export const upload = multer({storage});