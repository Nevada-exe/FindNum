class FindNumberGame {
    constructor() {
        this.numbers = [];
        this.targetNumber = null;
        this.currentLevel = 1;
        this.startTime = null;
        this.timerInterval = null;
        this.gameStarted = false;
        this.combo = 0;
        this.maxCombo = 0;
        this.errors = 0;
        
        this.elements = {};
        this.selectors = {
            grid: '#numbers-grid',
            currentLevel: '#current-level',
            timer: '#timer',
            comboCount: '#combo-count',
            comboFire: '#combo-fire',
            targetNumber: '#target-number',
            startButton: '#start-btn',
            resetButton: '#reset-btn',
            message: '#message',
            finalTime: '#final-time',
            levelComplete: '#level-complete',
            errorMessage: '#error-message',
            statsModal: '#stats-modal',
            statsTime: '#stats-time',
            statsCombo: '#stats-combo',
            statsLevel: '#stats-level',
            statsErrors: '#stats-errors',
            closeStats: '#close-stats'
        };
        
        this.animationTypes = ['blink', 'rotate', 'pulse', 'shake'];
        this.colorPalette = [
            '#FF9AA2', '#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', 
            '#C7CEEA', '#F8B195', '#F67280', '#C06C84', '#6C5B7B',
            '#3498DB', '#2ECC71', '#F1C40F', '#E67E22', '#E74C3C',
            '#9B59B6', '#1ABC9C', '#34495E', '#16A085', '#27AE60'
        ];
        
        this.init();
    }
    
    init() {
        this.cacheElements();
        this.bindEvents();
        this.generateNumbers();
        this.renderNumbers();
        this.updateUI();
    }
    
    cacheElements() {
        for (const [key, selector] of Object.entries(this.selectors)) {
            this.elements[key] = document.querySelector(selector);
        }
    }
    
    bindEvents() {
        this.elements.startButton.addEventListener('click', () => this.startGame());
        this.elements.resetButton.addEventListener('click', () => this.resetGame());
        this.elements.closeStats.addEventListener('click', () => this.elements.statsModal.style.display = 'none');
    }
    
    generateNumbers() {
        this.numbers = [];
        
        const levels = {
            1: { gridSize: 3, min: 100, max: 999 },
            2: { gridSize: 3, min: 500, max: 999 },
            3: { gridSize: 4, min: 100, max: 999 },
            4: { gridSize: 4, min: 500, max: 999 },
            5: { gridSize: 5, min: 1000, max: 5000 },
            6: { gridSize: 5, min: 1000, max: 9999 },
            7: { gridSize: 6, min: 5000, max: 9999 },
            8: { gridSize: 6, min: 1000, max: 9999 },
            9: { gridSize: 7, min: 5000, max: 9999 }
        };
        
        const levelConfig = levels[this.currentLevel] || levels[1];
        const { gridSize, min, max } = levelConfig;
        
        this.totalNumbers = gridSize * gridSize;
        
        const numberSet = new Set();
        while (numberSet.size < this.totalNumbers) {
            numberSet.add(Math.floor(Math.random() * (max - min + 1)) + min);
        }
        
        this.numbers = Array.from(numberSet);
        this.targetNumber = this.numbers[Math.floor(Math.random() * this.numbers.length)];
        this.elements.grid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
        this.elements.grid.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;
    }
    
    renderNumbers() {
        this.elements.grid.innerHTML = '';
        this.elements.grid.classList.remove('slide-left', 'slide-right', 'slide-center');
        this.elements.grid.classList.add('slide-center');
        
        this.numbers.forEach(number => {
            const cell = document.createElement('div');
            cell.className = 'number-cell';
            cell.style.backgroundColor = this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)];
            
            const numberContent = document.createElement('div');
            numberContent.className = 'number-content';
            numberContent.textContent = number;
            
            cell.classList.add(this.animationTypes[Math.floor(Math.random() * this.animationTypes.length)]);
            cell.appendChild(numberContent);
            
            cell.addEventListener('click', () => this.gameStarted && this.handleCellClick(number, cell));
            this.elements.grid.appendChild(cell);
        });
    }
    
    handleCellClick(number, cell) {
        if (number === this.targetNumber) {
            cell.classList.add('found');
            this.combo++;
            if (this.combo > this.maxCombo) this.maxCombo = this.combo;
            this.updateCombo();
            
            this.elements.levelComplete.style.display = 'block';
            
            setTimeout(() => {
                this.elements.levelComplete.style.display = 'none';
                this.currentLevel < 9 ? this.nextLevel() : this.endGame();
            }, 1500);
        } else {
            this.combo = 0;
            this.errors++;
            this.updateCombo();
            this.showError();
        }
    }
    
    showError() {
        this.elements.errorMessage.style.display = 'block';
        setTimeout(() => this.elements.errorMessage.style.display = 'none', 1000);
    }
    
    updateCombo() {
        this.elements.comboCount.textContent = this.combo;
        this.elements.comboFire.style.display = this.combo >= 3 ? 'inline' : 'none';
    }
    
    updateUI() {
        this.elements.currentLevel.textContent = this.currentLevel;
        this.elements.targetNumber.textContent = this.targetNumber;
        this.elements.startButton.style.display = this.currentLevel > 1 ? 'none' : 'inline-block';
    }
    
    startGame() {
        if (this.gameStarted) return;
        
        this.gameStarted = true;
        this.startTime = new Date();
        this.elements.startButton.disabled = true;
        
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((new Date() - this.startTime) / 1000);
            this.elements.timer.textContent = elapsed;
        }, 1000);
    }
    
    nextLevel() {
        this.currentLevel++;
        this.generateNumbers();
        this.renderNumbers();
        this.updateUI();
        
        this.elements.grid.classList.remove('slide-center');
        this.elements.grid.classList.add('slide-left');
        
        setTimeout(() => {
            this.elements.grid.classList.remove('slide-left');
            this.elements.grid.classList.add('slide-center');
        }, 800);
    }
    
    endGame() {
        clearInterval(this.timerInterval);
        const finalTime = Math.floor((new Date() - this.startTime) / 1000);
        
        this.elements.finalTime.textContent = finalTime;
        this.elements.message.classList.add('success');
        this.elements.message.style.display = 'block';
        
        this.showStats(finalTime);
    }
    
    showStats(finalTime) {
        this.elements.statsTime.textContent = `${finalTime} сек`;
        this.elements.statsCombo.textContent = this.maxCombo;
        this.elements.statsLevel.textContent = `${this.currentLevel}/9`;
        this.elements.statsErrors.textContent = this.errors;
        this.elements.statsModal.style.display = 'flex';
    }
    
    resetGame() {
        clearInterval(this.timerInterval);
        
        this.currentLevel = 1;
        this.combo = 0;
        this.maxCombo = 0;
        this.errors = 0;
        this.gameStarted = false;
        this.startTime = null;
        
        this.elements.timer.textContent = '0';
        this.elements.startButton.disabled = false;
        this.elements.startButton.style.display = 'inline-block';
        this.elements.message.style.display = 'none';
        this.elements.message.classList.remove('success');
        
        this.generateNumbers();
        this.renderNumbers();
        this.updateUI();
        this.updateCombo();
    }
}

// Инициализация игры
document.addEventListener('DOMContentLoaded', () => {
    new FindNumberGame();
});