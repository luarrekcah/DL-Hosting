const fs = require('fs');
const path = require('path');
const pm2 = require('pm2');
const { exec } = require('child_process');

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
      } else if (file === 'index.js' || file === 'index.py') {
        console.log(`Executando o script ${filePath}`);

        if (file.endsWith('.js')) {
          pm2.start({
            script: filePath,
            name: file.replace('.js', '') 
          }, (err, proc) => {
            if (err) {
              console.error(`Erro ao iniciar o script ${filePath}: ${err}`);
            } else {
              console.log(`Script ${filePath} iniciado com sucesso`);
            }
          });
        } else if (file.endsWith('.py')) {
          const pythonProcess = exec(`python ${filePath}`, (err, stdout, stderr) => {
            if (err) {
              console.error(`Erro ao executar o script ${filePath}: ${err}`);
            } else {
              console.log(`Script ${filePath} executado com sucesso`);
            }
          });

          pythonProcess.stdout.on('data', data => {
            console.log(data);
          });

          pythonProcess.stderr.on('data', data => {
            console.error(data);
          });
        }
      }
    });
  });
}

const projectsFolderPath = './projects';

pm2.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao PM2:', err);
    process.exit(1);
  }

  runScriptsInProjectsFolder(projectsFolderPath);
});


/*const fs = require('fs');
const path = require('path');
const pm2 = require('pm2');

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

        pm2.start({
          script: filePath,
          name: file.replace('.js', '') 
        }, (err, proc) => {
          if (err) {
            console.error(`Erro ao iniciar o script ${filePath}: ${err}`);
          } else {
            console.log(`Script ${filePath} iniciado com sucesso`);
          }
        });
      }
    });
  });
}

const projectsFolderPath = './projects';

pm2.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao PM2:', err);
    process.exit(1);
  }

  runScriptsInProjectsFolder(projectsFolderPath);
});*/
