function openFullscreen() {
  const element = document.documentElement; // Target the entire document

  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) { // Firefox
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullscreen) { // Chrome, Safari, and Opera
    element.webkitRequestFullscreen();
  } else if (element.msRequestFullscreen) { // IE/Edge
    element.msRequestFullscreen();
  }
}

// Call the function when the page loads
window.addEventListener('load', openFullscreen); 
document.body.style.cursor="none";
const output = document.getElementById('output');
const input = document.getElementById('input');
const blink = document.createElement('span');
output.innerHTML="<div>Welcome to the terminal. Type help for commands.</div>"
blink.className = 'blink';
blink.textContent = '|';
let fileSystem = {
    files: {},
    directories: {
        root: {}
    }
};
let currentDirectory = 'root';
let previousDirectory = '';
let isEditing = false;
let editingFile = '';

input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        const command = input.value.trim();
        input.value = '';
        if (isEditing) {
            handleEdit(command);
        } else {
            handleCommand(command);
        }
        input.focus();  // Ensure the input field regains focus after handling the command
    }
});

function handleCommand(command) {
    const [cmd, ...args] = command.split(' ');
    switch (cmd) {
        case 'clear':
            clear();
            break;
        case 'help':
            help();
            break;
        case 'mkdir':
            createDirectory(args[0]);
            break;
        case 'cd':
            changeDirectory(args[0]);
            break;
        case 'ls':
            listDirectory();
            break;
        case 'touch':
            createFile(args[0]);
            break;
        case 'ed':
            startEditingFile(args[0]);
            break;
        case 'print':
            printFile(args[0]);
            break;
        case 'delete':
            deleteFile(args[0]);
            break;
        case 'run':
            runFile(args[0]);
            break;
        case 'save':
            saveToFile();
            break;
        case 'load':
            loadFromFile(args[0]);
            break;
        default:
            output.innerHTML += `<div>Unknown command: ${cmd}</div>`;
    }
    updateOutput();
}

function handleEdit(line) {
    if (line === ':wq') {
        isEditing = false;
        output.innerHTML += `<div>File saved: ${editingFile}</div>`;
        editingFile = '';
    } else {
        fileSystem.files[`${currentDirectory}/${editingFile}`] += line + '\n';
    }
}

function createDirectory(name) {
    const path = `${currentDirectory}/${name}`;
    if (!fileSystem.directories[path]) {
        fileSystem.directories[path] = {};
        output.innerHTML += `<div>Directory created: ${name}</div>`;
    } else {
        output.innerHTML += `<div>Directory already exists: ${name}</div>`;
    }
}

function changeDirectory(name) {
    if (name === '~') {
        const parts = currentDirectory.split('/');
        parts.pop();
        previousDirectory = currentDirectory;
        currentDirectory = parts.join('/') || 'root';
    } else if (name === '-') {
        const tempDirectory = currentDirectory;
        currentDirectory = previousDirectory;
        previousDirectory = tempDirectory;
    } else {
        const path = `${currentDirectory}/${name}`;
        if (fileSystem.directories[path]) {
            previousDirectory = currentDirectory;
            currentDirectory = path;
        } else {
            output.innerHTML += `<div>Directory does not exist: ${name}</div>`;
        }
    }
    output.innerHTML += `<div>Current directory: ${currentDirectory}</div>`;
}

function listDirectory() {
    const contents = Object.keys(fileSystem.directories).filter(dir => dir.startsWith(currentDirectory));
    const files = Object.keys(fileSystem.files).filter(file => file.startsWith(currentDirectory));
    output.innerHTML += `<div>Directories:</div>`;
    contents.forEach(content => {
        if (content !== currentDirectory) {
            const name = content.replace(`${currentDirectory}/`, '');
            output.innerHTML += `<div>${name}</div>`;
        }
    });
    output.innerHTML += `<div>Files:</div>`;
    files.forEach(file => {
        const name = file.replace(`${currentDirectory}/`, '');
        output.innerHTML += `<div>${name}</div>`;
    });
}

function createFile(name) {
    const path = `${currentDirectory}/${name}`;
    if (!fileSystem.files[path]) {
        fileSystem.files[path] = '';
        output.innerHTML += `<div>File created: ${name}</div>`;
    } else {
        output.innerHTML += `<div>File already exists: ${name}</div>`;
    }
}

function startEditingFile(name) {
    const path = `${currentDirectory}/${name}`;
    if (fileSystem.files[path] !== undefined) {
        isEditing = true;
        editingFile = name;
        output.innerHTML += `<div>Editing ${name}. Type ':wq' to save and quit.</div>`;
    } else {
        output.innerHTML += `<div>File does not exist: ${name}</div>`;
    }
}

function printFile(name) {
    const path = `${currentDirectory}/${name}`;
    if (fileSystem.files[path] !== undefined) {
        output.innerHTML += `<div>${name}: ${fileSystem.files[path]}</div>`;
    } else {
        output.innerHTML += `<div>File does not exist: ${name}</div>`;
    }
}

function deleteFile(name) {
    const path = `${currentDirectory}/${name}`;
    if (fileSystem.files[path] !== undefined) {
        delete fileSystem.files[path];
        output.innerHTML += `<div>File deleted: ${name}</div>`;
    } else {
        output.innerHTML += `<div>File does not exist: ${name}</div>`;
    }
}

function runFile(name) {
    const path = `${currentDirectory}/${name}`;
    if (fileSystem.files[path] !== undefined) {
        try {
            eval(fileSystem.files[path]);
        } catch (e) {
            output.innerHTML += `<div>Error running file: ${e}</div>`;
        }
    } else {
        output.innerHTML += `<div>File does not exist: ${name}</div>`;
    }
}

function saveToFile() {
    const json = JSON.stringify(fileSystem);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `FloppyDisk.json`;
    link.click();
    output.innerHTML += `<div>File system saved to a floppt disk.</div>`;
}

function loadFromFile(name) {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => {
            fileSystem = JSON.parse(reader.result);
            output.innerHTML += `<div>File system loaded from ${file.name}</div>`;
        };
    };
    input.click();
}

function updateOutput() {
    output.scrollTop = output.scrollHeight;
    blink.remove();
    output.appendChild(blink);
}
function help(){
    output.innerHTML+="<div>To create a directory: mkir [directory-name]<br>To create a file: touch [file-name]<br>To edit a file: ed [file-name]<br>To view a file's text contents: print [file-name]<br>To run a javascript file: run [file-name]<br>To list directories: ls<br>To open a directory: cd [directory-name]<br>To go the previous directory: cd -<br>To go to the root directory: cd ~<br>To save your files and directories to a floppy disk: save<br>To mount a floppy disk: load<br>To clear terminal: clear</div>";
}
function clear(){
    output.innerHTML="<div>Welcome to the terminal. Type help for commands.</div>";
}
