import Media from "./media";

class Attachment extends Media {
    
    constructor(folder: string) {
        super(folder);
        this.path = 'public/attachments/'.concat(folder);
    }

}

export default Attachment;