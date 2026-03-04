import project from '../aurelia.json';
import { CLIOptions } from 'aurelia-cli';
import path from 'path';
import fs from 'fs';

let hasCleaned = false;

function deleteFolderRecursive(folderPath) {
    if (fs.existsSync(folderPath)) {
        fs.readdirSync(folderPath).forEach((file) => {
            const curPath = path.join(folderPath, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
    }
}

export default function clean() {
    const env = CLIOptions.getEnvironment();

    // Clean on every production build (since hashes change)
    // Or clean on the first build of a development/watch session
    if (env === 'prod' || !hasCleaned) {
        const outputDir = path.resolve(__dirname, '../../', project.platform.output);
        console.log('Cleaning build output directory: ' + project.platform.output);

        deleteFolderRecursive(outputDir);
        hasCleaned = true;
    }

    return Promise.resolve();
}
