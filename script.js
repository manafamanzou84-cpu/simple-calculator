const display = document.getElementById('display');

// Ajouter un caractère au display
function appendToDisplay(value) {
    if (display.value === '0') {
        display.value = value;
    } else {
        display.value += value;
    }
}

// Effacer le display
function clearDisplay() {
    display.value = '0';
}

// Supprimer le dernier caractère
function deleteLast() {
    if (display.value.length > 1) {
        display.value = display.value.slice(0, -1);
    } else {
        display.value = '0';
    }
}

// Calculer le résultat
function calculate() {
    try {
        // Remplacer les virgules par des points pour le calcul
        let expression = display.value.replace(',', '.');
        
        // Évaluer l'expression
        let result = eval(expression);
        
        // Afficher le résultat avec un format limité
        display.value = Math.round(result * 100000000) / 100000000;
    } catch (error) {
        display.value = 'Erreur';
        setTimeout(() => {
            display.value = '0';
        }, 1500);
    }
}

// Permettre l'utilisation du clavier
document.addEventListener('keydown', function(event) {
    if (event.key >= '0' && event.key <= '9') {
        appendToDisplay(event.key);
    } else if (event.key === '+' || event.key === '-' || event.key === '*' || event.key === '/') {
        appendToDisplay(event.key);
    } else if (event.key === '.' || event.key === ',') {
        appendToDisplay('.');
    } else if (event.key === 'Enter' || event.key === '=') {
        event.preventDefault();
        calculate();
    } else if (event.key === 'Backspace') {
        event.preventDefault();
        deleteLast();
    } else if (event.key === 'Escape') {
        clearDisplay();
    }
});
