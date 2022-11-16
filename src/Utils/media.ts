import { fromBuffer } from 'file-type';
import fs from 'fs';
import { RequestError } from 'request-error';

class Media {
    static path = 'src/media/user/profile-picture';

    static async saveFiles(id : string, base64: string) {
        if (base64.includes(';base64,')) base64 = base64.split(';base64,')[1];
        const buffer = Buffer.from(base64, 'base64');

        const fileType = await fromBuffer(buffer);

        if (!fileType) throw RequestError(`Erro no upload do arquivo: ${id}`, 422);

        const fileNewName = `${id}.${fileType.ext}`;

        if (!fs.existsSync(this.path)) fs.mkdirSync(this.path, {recursive: true});
    
        const writeFile = () => fs.writeFileSync(`${this.path}/${fileNewName}`, buffer);
        
        // create file in directory
        if (!this.fileExists(fileNewName)) {
            writeFile();
        } else {
            await this.removeFile(fileNewName);
            writeFile();
        }

        return fileNewName;
    }

    static async getBase64File(fileTitle: string) : Promise<string> {
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

        return this.getBase64File('404.jpg');
        
    }

    static async removeFile(fileName: string) {
        const path = `${this.path}/${fileName}`;
        if(this.fileExists(fileName)) {
            fs.unlinkSync(path);
        }
    }

    private static fileExists(fileName: string) {
        const file = fileName.split('.');
        const findByFileName = fs.readdirSync(this.path).some(fn => fn.startsWith(file[0]));
        
        return findByFileName;
    }
}

export default Media;
