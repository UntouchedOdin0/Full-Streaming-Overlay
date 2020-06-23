import fs from 'fs';
import path from 'path';

export class baseType
{
    typeName = 'overrideMe'

    initiate (config) {
        this.config = config;
    }

    update (eventMessage, socketServer) {
        fs.writeFileSync(dirs.userConfig() + path.sep + 'cache' + path.sep + this.typeName + '.cache.json', JSON.stringify(eventMessage, '', 2))
    }
}