import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';


const calculateFileHash = async (
    filePath,
    algorithm = 'sha256'
) => {
    const fileBuffer = await readFile(filePath);
    const hashSum = createHash(algorithm);

    hashSum.update(fileBuffer);

    return hashSum.digest('hex');
}


export {
    calculateFileHash
}
