import { UploadedFile } from 'express-fileupload';
import { FileTypeResult, fromBuffer } from 'file-type';
import fs from 'fs';
import { RequestError } from 'request-error';

class Media {
    private path = '';
    
    constructor(folder: string) {
        this.path = 'src/media/'.concat(folder);
    }
    
    async saveFile(id : string, file: UploadedFile | string) {
        let fileType : (FileTypeResult | null) = null;
        let buffer : Buffer | null = null;
        
        if(typeof file === 'string') {
            buffer = await this.convertBase64ToBuffer(file);
        } else {
            buffer = file.data;
        }
        
        fileType = await this.fileType(buffer);
        
        if (!fileType || !buffer) throw RequestError(`Erro no upload do arquivo: ${id}`, 422);

        const fileNewName = `${id}.${fileType.ext}`;
        const path = `${this.path}/${fileNewName}`;
        if (!fs.existsSync(this.path)) fs.mkdirSync(this.path, {recursive: true});

        if(typeof file !== 'string') {
            console.log(fileType)
            file.mv(path, (err) => {
                if (err) throw RequestError(`Erro no upload do arquivo: ${id}`, 422);
            });
            return;
        }

        const writeFile = () => fs.writeFileSync(path, buffer);
        
        // create file in directory
        if (!this.fileExists(fileNewName)) {
            writeFile();
        } else {
            await this.removeFile(fileNewName);
            writeFile();
        }

        return fileNewName;
    }

    async getBase64File(fileTitle: string) : Promise<string | undefined> {
        console.log('get base64 file');
        let currentPath = `${this.path}/${fileTitle}`;
        if(this.fileExists(fileTitle)) {
            const find = fs.readdirSync(this.path).find(fn => fn.startsWith(fileTitle));
            if(find) {
                let extSplit = find.split('.');
                const ext = extSplit[extSplit.length - 1];
                currentPath = currentPath.concat(`.${ext}`);
                const file = fs.readFileSync(currentPath, {encoding: 'base64'});
                const buffer = Buffer.from(file, 'base64');
                const fileType = await fromBuffer(buffer);
                const base64 = `data:${fileType?.mime};base64,${file}`;
    
                return base64;
            }
        }

        return undefined;
        
    }

    async removeFile(fileName: string) {
        const path = `${this.path}/${fileName}`;
        if(this.fileExists(fileName)) {
            fs.unlinkSync(path);
        }
    }

    private async convertBase64ToBuffer(base64: string) {
        if (base64.includes(';base64,')) base64 = base64.split(';base64,')[1];
        const buffer = Buffer.from(base64, 'base64');
        return buffer;
    }
    
    private async fileType(buffer: Buffer) {
        const fileType = await fromBuffer(buffer);
        return fileType;
    }
    
    private fileExists(fileName: string) {
        const file = fileName.split('.');
        const findByFileName = fs.readdirSync(this.path).some(fn => fn.startsWith(file[0]));
        
        return findByFileName;
    }
}

export default Media;
