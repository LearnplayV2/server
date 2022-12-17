import type { Prisma } from "@prisma/client";


function prisma_user_selection(props: {avoid?: string[]}) : Prisma.userSelect {
    const {avoid} = props;
    
    const attributes: Prisma.userSelect = {
        createdAt: true,
        updatedAt: true,
        uuid: true,
        name: true,
        email: true,
        status: true,
        password: true
    };

    if(typeof avoid != 'undefined') {
        let newAttributes = attributes;
        for(let prevent of avoid) {
            //@ts-ignore
            delete newAttributes[prevent];
        }
        return newAttributes;
    }
    
    return attributes;
}

export default prisma_user_selection;