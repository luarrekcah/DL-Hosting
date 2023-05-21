const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function runScriptsInProjectsFolder(folderPath) {
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error(`Erro ao ler o diretório ${folderPath}: ${err}`);
      return;
    }

    files.forEach(file => {
      const filePath = path.join(folderPath, file);

      if (fs.statSync(filePath).isDirectory()) {
        runScriptsInProjectsFolder(filePath);
      } else if (file === 'index.js') {
        console.log(`Executando o script ${filePath}`);

        const childProcess = spawn('node', [filePath]);

        childProcess.stdout.on('data', data => {
          console.log(data.toString());
        });

        childProcess.stderr.on('data', data => {
          console.error(data.toString());
        });
      }
    });
  });
}

const projectsFolderPath = './projects';

runScriptsInProjectsFolder(projectsFolderPath);
