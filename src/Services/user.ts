import fs from 'fs';
import path from 'path';
import multer from 'multer';
import crypto from 'crypto';

class Service {

    public multerConfig(destinationPath: string, name?: string) {
        return {
            dest: path.resolve(__dirname, '..', '..', 'uploads'),
            storage: multer.diskStorage({
                destination: (req, file, cb) => {
                    cb(null, path.resolve(__dirname, '..', '..', 'public', 'uploads', destinationPath));
                },
                filename: (req, file, cb) => {
                    crypto.randomBytes(16, (err, hash) => {
                        //@ts-ignoree
                        if (err) cb(err);

                        const filename = `${name}.png` ?? `${hash.toString('hex')}-${file.originalname}`;

                        cb(null, filename);
                    });
                }
            }),
            limits: {
                fileSize: 2 * 1024 * 1024 * 1024,
            },
            //@ts-ignoree
            fileFilter: (req, file, cb) => {
                const allowedMimes = [
                    'image/jpeg',
                    'image/pjpeg',
                    'image/png',
                    'image/bmp'
                ];

                if (allowedMimes.includes(file.mimetype)) {
                    cb(null, true);
                } else {
                    cb(new Error('Formato de arquivo inválido'));
                }
            }
        }
    }

    public async getProfilePicture(uuid: string) {
        const publicPath = '../../public';
        const filePath = path.join(__dirname, `${publicPath}/uploads/user/${uuid}.png`);
        const defaultPath = path.join(__dirname, `${publicPath}/default-avatar.jpg`);

        if (fs.existsSync(filePath)) {
            const file = fs.readFileSync(filePath);
            return file;
        }

        const defaultFile = fs.readFileSync(defaultPath);
        return defaultFile;
    }

}

export default new Service();