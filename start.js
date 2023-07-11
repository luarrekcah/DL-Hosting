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

        // Verifica a extensão do arquivo
        const extension = path.extname(file);

        // Verifica se o módulo está instalado
        try {
          require.resolve(filePath);
        } catch (err) {
          if (err.code === 'MODULE_NOT_FOUND') {
             if (extension === '.py') {
              const projectFolder = path.dirname(filePath);
              const requirementsPath = path.join(projectFolder, 'requirements.txt');
              installPythonPackages(requirementsPath);
            }
          } else {
            console.error(`Erro ao verificar o módulo ${filePath}: ${err}`);
            return;
          }
        }

        if (extension === '.js') {
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
        } else if (extension === '.py') {
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

function installPythonPackages(requirementsPath) {
  console.log(`Instalando pacotes Python a partir de ${requirementsPath}`);

  const installProcess = exec(`pip install -r ${requirementsPath}`);

  installProcess.stdout.on('data', data => {
    console.log(data);
  });

  installProcess.stderr.on('data', data => {
    console.error(data);
  });

  installProcess.on('exit', code => {
    if (code === 0) {
      console.log('Pacotes Python instalados com sucesso');
    } else {
      console.error('Erro ao instalar pacotes Python');
    }
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
