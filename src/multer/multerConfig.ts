//@ts-nocheck
import path from 'path';
import multer from 'multer';
import crypto from 'crypto';

const multerConfig = (destinationPath : string, name?: string) => {
    return {
        dest: path.resolve(__dirname, '..', '..', 'uploads'),
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, path.resolve(__dirname, '..', '..', 'public', 'uploads', destinationPath));
            },
            filename: (req, file, cb) => {
                crypto.randomBytes(16, (err, hash) => {
                    if (err) cb(err);

                    const filename = `${name}.png` ?? `${hash.toString('hex')}-${file.originalname}`;

                    cb(null, filename);
                });
            }
        }),
        limits: {
            fileSize: 2 * 1024 * 1024 * 1024,
        },
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
};

export { multerConfig };