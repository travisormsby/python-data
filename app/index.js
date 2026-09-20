const DEBUG = false // Script is not scrambled and assets not cached if true
const AVAILABLE_SCRIPTS = [
    { name: "pydantic_type_coercion", label: "1. Coerce types when instantiating Pydantic models" },
    { name: "pydantic_from_csv", label: "2. Instantiate Pydantic models from a csv" },
    { name: "polars_total_pop", label: "3. Use Polars to filter and aggregate data" },
    { name: "polars_region_area", label: "4. Use Polars to aggregate data by group" },
    { name: "polars_pop_density", label: "5. Use Polars to calculate and sort a field " },
    { name: "duckdb_method_chaining", label: "6. Use method chaining with a DuckDB relation" },
    { name: "duckdb_sql", label: "7. Use SQL queries with a DuckDB relation" },
    { name: "duckdb_parameterized", label: "8: Use parameterized queries in DuckDB" }
];
const DEFAULT_SCRIPT = 'pydantic_type_coercion'

let pyodide;
let currentFileName;
let originalUnscrambledCode;
const listContainer = document.getElementById('sortable-list');
const outputBox = document.getElementById('output-box');
const runBtn = document.getElementById('run-btn');
const outputBtn = document.getElementById('output-btn')
const revealBtn = document.getElementById('reveal-btn');
const statusDiv = document.getElementById('status');
const scriptSelect = document.getElementById('script-select');

function populateDropdown(selectedFile) {
    scriptSelect.innerHTML = ""; // Clear any placeholders

    AVAILABLE_SCRIPTS.forEach(script => {
        const opt = document.createElement('option');
        opt.value = script.name;
        opt.textContent = script.label;
        scriptSelect.appendChild(opt);
    });

    // Lock the dropdown index onto our target script
    scriptSelect.value = selectedFile;
}

// Register service worker to enable caching of assets
if (!DEBUG) {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./service-worker.js')
                .then(reg => { console.log('Service worker registered:', reg); })
                .catch(err => { console.warn('Service worker registration failed:', err); });
        });
    }
}
async function initPyodide() {
    try {
        runBtn.disabled = true;
        outputBtn.disabled = true

        // Determine what file we should ultimately load based on URL or defaults
        const urlParams = new URLSearchParams(window.location.search);
        const targetScript = urlParams.get('problem') || DEFAULT_SCRIPT;
        const scriptPromise = loadSelectedScript(targetScript);
        populateDropdown(targetScript);

        statusDiv.textContent = "Downloading Python WebAssembly core...";
        pyodide = await loadPyodide();

        statusDiv.textContent = "Loading libraries...";
        await pyodide.loadPackage("micropip");
        await pyodide.runPythonAsync(`
            import micropip
            await micropip.install("pydantic")
            await micropip.install("pyarrow")
            await micropip.install("wheels/duckdb-1.5.0-cp313-cp313-pyodide_2025_0_wasm32.whl")
            await micropip.install("wheels/polars-1.33.1-cp313-cp313-pyodide_2025_0_wasm32.whl")
        `);

        statusDiv.textContent = "Python environment ready! Fetching problem...";

        // Populate dropdown only after successful script processing
        statusDiv.textContent = "Problem loaded! Loading data...";

        const resp = await fetch('data.zip');
        if (!resp.ok) {
            throw new Error(`Failed to load data.zip: ${resp.status}`);
        }

        const bytes = new Uint8Array(await resp.arrayBuffer());
        pyodide.FS.writeFile('/data.zip', bytes);

        await pyodide.runPythonAsync(`
        import zipfile
        with zipfile.ZipFile('/data.zip') as z:
            z.extractall('/')
        `);
        pyodide.FS.unlink('/data.zip');  // optional cleanup
        pyodide.FS.chdir('/');

        statusDiv.textContent = "Ready!";

        runBtn.disabled = false;
        outputBtn.disabled = false;
    } catch (err) {
        statusDiv.textContent = "Failed to load Python.";
        outputBox.textContent = `Initialization Error:\n${err.message || err}`;
        console.error(err);
    }
}

initPyodide();

async function loadSelectedScript() {
    // Check the dropdown menu first. 
    // If it's blank or uninitialized, fall back to the URL parameter, then the default file.
    const urlParams = new URLSearchParams(window.location.search);
    const scriptName = scriptSelect.value || urlParams.get('problem') || DEFAULT_SCRIPT;

    // Keep the dropdown box visually synced with the file we are loading
    scriptSelect.value = scriptName;

    // Update our export file name reference based on the selected file path
    currentFileName = scriptName;

    // Clear out old scrambled elements from the list container
    listContainer.innerHTML = "";
    outputBox.textContent = "Loading new script data...";

    // Update query parameters to match new script
    const url = new URL(window.location);
    url.searchParams.set('problem', scriptName);
    window.history.pushState({}, '', url); // Updates the URL text without reloading the page

    try {
        // Use browser Fetch API to pull down the raw text from the external file
        revealBtn.textContent = "See answer";
        outputBtn.textContent = "See expected output";

        // Map clean filenames back to the right subfolder
        const fetchPath = `scripts/${scriptName}.py`;
        const response = await fetch(fetchPath);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const rawCode = await response.text();
        originalUnscrambledCode = rawCode;

        // Process, scramble, and generate elements from file text
        setupProblem(rawCode.trim());
        outputBox.textContent = "Problem loaded. Drag lines to arrange.";



    } catch (err) {
        outputBox.textContent = `${err.message}\n${scriptName} not found `;
    }
}

function setupProblem(codeText) {
    const lines = codeText.split('\n');
    const scrambled = [...lines];
    if (!DEBUG) {
        // Fisher-Yates Scramble Algorithm
        for (let i = scrambled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
        }
    }

    // Render scrambled code blocks
    scrambled.forEach(lineText => {
        const li = document.createElement('li');
        li.className = 'draggable-line';
        li.draggable = true;

        const codeSpan = document.createElement('span');
        codeSpan.className = 'code-block';
        codeSpan.textContent = lineText;

        li.appendChild(codeSpan);
        listContainer.appendChild(li);
    });
}

// Toggle CSS properties for dragging elements
listContainer.addEventListener('dragstart', (e) => {
    if (e.target.classList.contains('draggable-line')) {
        e.target.classList.add('dragging');
    }
});

listContainer.addEventListener('dragend', (e) => {
    if (e.target.classList.contains('draggable-line')) {
        e.target.classList.remove('dragging');
    }
});

// Place dragged element
listContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
    const draggingItem = document.querySelector('.dragging');
    const siblings = [...listContainer.querySelectorAll('.draggable-line:not(.dragging)')];

    const nextSibling = siblings.find(sibling => {
        const box = sibling.getBoundingClientRect();
        return e.clientY <= box.top + box.height / 2;
    });

    listContainer.insertBefore(draggingItem, nextSibling);
});

function getCompiledCode() {
    const currentLines = [...listContainer.querySelectorAll('.code-block')]
        .map(span => span.textContent);
    return currentLines.join('\n');
}

function normalizeCodeForComparison(codeStr) {
    return codeStr
        .split('\n')
        .map(line => line.trimEnd())             // Ignore accidental trailing spaces
        .filter(line => line.trim() !== "")      // Completely ignore blank lines
        .join('\n');
}

async function getOutput(codeText) {

    runBtn.disabled = true;
    outputBtn.disabled = true;


    let consoleBuffer = "";

    // Write pyodide output to consoleBuffer
    pyodide.setStdout({
        batched: (text) => { consoleBuffer += text + "\n"; }
    });
    pyodide.setStderr({
        batched: (text) => { consoleBuffer += text + "\n"; }
    });
    try {
        await pyodide.runPythonAsync(codeText)
    } catch (err) {
        consoleBuffer = consoleBuffer + err.message
    } finally {
        runBtn.disabled = false;
        outputBtn.disabled = false;
    }

    return consoleBuffer
}


async function runCode() {
    if (!pyodide) return;
    outputBox.textContent = "";
    revealBtn.textContent = "See answer"
    outputBtn.textContent = "See expected output"

    const currentUserCode = getCompiledCode();
    const currentUserOutput = await getOutput(currentUserCode)
    const correctOutput = await getOutput(originalUnscrambledCode);
    if (currentUserOutput === correctOutput) {
        outputBox.textContent = `🎉 Success! This code produces the correct output\n\n${currentUserOutput}`;
    } else {
        outputBox.textContent = `❌ This code does not produce the correct output\n\n${currentUserOutput}`;
    }
}

async function checkOutput() {
    // Check if we are already displaying the expected output by inspecting the button text
    if (outputBtn.textContent === "See expected output") {
        expectedOutput = await getOutput(originalUnscrambledCode)
        outputBox.textContent = `--- EXPECTED OUTPUT REFERENCE ---\n\n${expectedOutput}`
        outputBtn.textContent = "Hide expected output"
        revealBtn.textContent = "See answer"
    } else {
        // 2. Clear out the answer code block and return to normal status
        outputBox.textContent = "Ready to run.";
        outputBtn.textContent = "See expected output";
    }

}

function revealSolution() {

    if (!originalUnscrambledCode) return;

    // Check if we are already displaying the answer by inspecting the button text
    if (revealBtn.textContent === "See answer") {
        // 1. Save any current output text if you want to prevent completely losing errors (optional)
        outputBox.textContent = `--- CORRECT SOLUTION REFERENCE ---\n\n${originalUnscrambledCode}`;
        revealBtn.textContent = "Hide answer";
        outputBtn.textContent = "See expected output"
    } else {
        // 2. Clear out the answer code block and return to normal status
        outputBox.textContent = "Ready to run.";
        revealBtn.textContent = "See answer";
    }
}

async function copyCodeToClipboard() {
    const copyBtn = document.getElementById('copy-btn');
    const codeToCopy = getCompiledCode();

    try {
        await navigator.clipboard.writeText(codeToCopy);

        const originalText = copyBtn.textContent;
        copyBtn.textContent = "Copied!";
        copyBtn.style.backgroundColor = "#2b8a3e";

        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.backgroundColor = "";
        }, 2000);

    } catch (err) {
        outputBox.textContent = `Failed to copy code to clipboard:\n${err.message}`;
    }
}

function exportToPyFile() {
    const codeToExport = getCompiledCode();

    const blob = new Blob([codeToExport], { type: 'text/plain;charset=utf-8' });
    const tempLink = document.createElement('a');
    tempLink.href = URL.createObjectURL(blob);
    tempLink.download = `solved_${currentFileName}.py`; // Outputs file name e.g., "solved_calculator.py"

    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
    URL.revokeObjectURL(tempLink.href);
}