// Initial elements
const initialElements = ['Water', 'Fire', 'Earth', 'Air', 'Life', 'Hydrogen', 'Proton','Neutron','Electron'];

// Store discovered elements
let discoveredElements = [...initialElements];

// Game state
let selectedElement1 = null;
let selectedElement2 = null;

// DOM elements
const elementsContainer = document.getElementById('elements-container');
const craftingSlot1 = document.getElementById('element1');
const craftingSlot2 = document.getElementById('element2');
const craftBtn = document.getElementById('craft-btn');
const resultArea = document.getElementById('result');

// Initialize game
function initGame() {
    updateElementsDisplay();
    setupEventListeners();
}

// Update elements display
function updateElementsDisplay() {
    elementsContainer.innerHTML = '';
    discoveredElements.forEach(element => {
        const elementDiv = document.createElement('div');
        elementDiv.className = 'element';
        elementDiv.textContent = element;
        elementDiv.draggable = true;
        elementDiv.addEventListener('dragstart', drag);
        elementsContainer.appendChild(elementDiv);
    });
}

// Set up event listeners
function setupEventListeners() {
    craftingSlot1.addEventListener('dragover', allowDrop);
    craftingSlot1.addEventListener('drop', drop);
    craftingSlot2.addEventListener('dragover', allowDrop);
    craftingSlot2.addEventListener('drop', drop);
    craftBtn.addEventListener('click', craftElements);
}

// Drag and drop functions
function drag(event) {
    event.dataTransfer.setData("text", event.target.textContent);
}

function allowDrop(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    event.target.textContent = data;
    event.target.classList.add('filled');
    updateCraftButton();
}

// Update craft button state
function updateCraftButton() {
    selectedElement1 = craftingSlot1.textContent;
    selectedElement2 = craftingSlot2.textContent;
    craftBtn.disabled = !(selectedElement1 !== 'Drag element here' && selectedElement2 !== 'Drag element here');
}

// Craft elements
async function craftElements() {
    if (selectedElement1 && selectedElement2) {
        const result = await mergeElements(selectedElement1, selectedElement2);
        resultArea.textContent = result;
        updateElementsDisplay();
        resetCraftingArea();
    }
}

// Function to merge elements
async function mergeElements(element1, element2) {
    if (element1 === element2) {
        return element1; // Same elements just return one of them
    }

    // Call Gemini API
    const result = await callGeminiAPI(element1, element2);
    
    if (!discoveredElements.includes(result)) {
        discoveredElements.push(result);
    }

    return result;
}

// Function to call Gemini API
async function callGeminiAPI(element1, element2) {
    const API_KEY = 'AIzaSyB-EjsIy_CPOTOSevnFqp_JsQ5prlH7N3g'; // Replace with your actual API key
    const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    
    const prompt = `What would be created if ${element1} and ${element2} were combined in a crafting game? Respond with a single word or short phrase.`;
    
    try {
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text.trim();
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        return 'Error';
    }
}

// Reset crafting area
function resetCraftingArea() {
    craftingSlot1.textContent = 'Drag element here';
    craftingSlot2.textContent = 'Drag element here';
    craftingSlot1.classList.remove('filled');
    craftingSlot2.classList.remove('filled');
    updateCraftButton();
}

// Initialize the game
initGame();