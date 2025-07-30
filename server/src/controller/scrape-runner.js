import {spawn} from 'child_process';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const runScraper = () => {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, '../../jobsearcher/script-runner.py');
        const pythonProcess = spawn('python', [scriptPath]);
    
        let output = '';
        let errorOutput = '';
    
        pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
        });
    
        pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
        });
    
        pythonProcess.on('close', (code) => {
        if (code !== 0) {
            reject(new Error(`Script exited with code ${code}: ${errorOutput}`));
        } else {
            resolve(output);
        }
        });
    });
}