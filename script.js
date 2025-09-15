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
        this.isAnimating = false; // Флаг для предотвращения кликов во время анимации
        
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
        
        this.numbers.forEach(number => {
            const cell = document.createElement('div');
            cell.className = 'number-cell';
            cell.style.backgroundColor = this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)];
            
            const numberContent = document.createElement('div');
            numberContent.className = 'number-content';
            numberContent.textContent = number;
            
            cell.classList.add(this.animationTypes[Math.floor(Math.random() * this.animationTypes.length)]);
            cell.appendChild(numberContent);
            
            cell.addEventListener('click', () => {
                if (this.gameStarted && !this.isAnimating) {
                    this.handleCellClick(number, cell);
                }
            });
            this.elements.grid.appendChild(cell);
        });
        
        // Плавное появление ячеек
        setTimeout(() => {
            this.elements.grid.classList.add('visible');
        }, 50);
    }
    
    handleCellClick(number, cell) {
        if (this.isAnimating) return;
        
        if (number === this.targetNumber) {
            this.isAnimating = true;
            cell.classList.add('found');
            this.combo++;
            if (this.combo > this.maxCombo) this.maxCombo = this.combo;
            this.updateCombo();
            
            // Анимация правильного ответа
            this.elements.levelComplete.style.display = 'block';
            this.elements.levelComplete.style.opacity = '0';
            this.elements.levelComplete.style.transform = 'translate(-50%, -50%) scale(0.5)';
            
            let opacity = 0;
            const fadeIn = setInterval(() => {
                opacity += 0.1;
                this.elements.levelComplete.style.opacity = opacity;
                this.elements.levelComplete.style.transform = `translate(-50%, -50%) scale(${0.5 + opacity * 0.7})`;
                
                if (opacity >= 1) {
                    clearInterval(fadeIn);
                    
                    setTimeout(() => {
                        const fadeOut = setInterval(() => {
                            opacity -= 0.1;
                            this.elements.levelComplete.style.opacity = opacity;
                            this.elements.levelComplete.style.transform = `translate(-50%, -50%) scale(${0.5 + opacity * 0.7})`;
                            
                            if (opacity <= 0) {
                                clearInterval(fadeOut);
                                this.elements.levelComplete.style.display = 'none';
                                this.currentLevel < 9 ? this.nextLevel() : this.endGame();
                            }
                        }, 50);
                    }, 800);
                }
            }, 50);
        } else {
            this.combo = 0;
            this.errors++;
            this.updateCombo();
            this.showError(cell);
        }
    }
    
    showError(cell) {
        this.isAnimating = true;
        
        // Анимация ошибки - легкое дрожание
        cell.style.transition = 'transform 0.1s ease';
        cell.style.transform = 'translateX(-5px)';
        
        setTimeout(() => {
            cell.style.transform = 'translateX(5px)';
            
            setTimeout(() => {
                cell.style.transform = 'translateX(-5px)';
                
                setTimeout(() => {
                    cell.style.transform = 'translateX(0)';
                    
                    setTimeout(() => {
                        cell.style.transition = '';
                        this.isAnimating = false;
                    }, 100);
                }, 100);
            }, 100);
        }, 100);
        
        this.elements.errorMessage.style.display = 'block';
        this.elements.errorMessage.style.opacity = '0';
        
        let opacity = 0;
        const fadeIn = setInterval(() => {
            opacity += 0.2;
            this.elements.errorMessage.style.opacity = opacity;
            
            if (opacity >= 1) {
                clearInterval(fadeIn);
                
                setTimeout(() => {
                    const fadeOut = setInterval(() => {
                        opacity -= 0.2;
                        this.elements.errorMessage.style.opacity = opacity;
                        
                        if (opacity <= 0) {
                            clearInterval(fadeOut);
                            this.elements.errorMessage.style.display = 'none';
                        }
                    }, 50);
                }, 500);
            }
        }, 50);
    }
    
    updateCombo() {
        this.elements.comboCount.textContent = this.combo;
        this.elements.comboFire.style.display = this.combo >= 3 ? 'inline' : 'none';
        
        // Анимация комбо
        if (this.combo >= 3) {
            this.elements.comboFire.style.transition = 'transform 0.3s ease';
            this.elements.comboFire.style.transform = 'scale(1.5)';
            
            setTimeout(() => {
                this.elements.comboFire.style.transform = 'scale(1)';
            }, 300);
        }
    }
    
    updateUI() {
        this.elements.currentLevel.textContent = this.currentLevel;
        this.elements.targetNumber.textContent = this.targetNumber;
        this.elements.startButton.style.display = this.currentLevel > 1 ? 'none' : 'inline-block';
        
        // Плавное изменение целевого числа
        this.elements.targetNumber.style.transition = 'transform 0.3s ease';
        this.elements.targetNumber.style.transform = 'scale(1.2)';
        
        setTimeout(() => {
            this.elements.targetNumber.style.transform = 'scale(1)';
        }, 300);
    }
    
    startGame() {
        if (this.gameStarted) return;
        
        this.gameStarted = true;
        this.startTime = new Date();
        this.elements.startButton.disabled = true;
        
        // Плавное скрытие кнопки старта
        this.elements.startButton.style.transition = 'opacity 0.5s ease';
        this.elements.startButton.style.opacity = '0';
        
        setTimeout(() => {
            this.elements.startButton.style.display = 'none';
        }, 500);
        
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((new Date() - this.startTime) / 1000);
            this.elements.timer.textContent = elapsed;
        }, 1000);
    }
    
    nextLevel() {
        this.isAnimating = true;
        
        // Плавное исчезновение текущей сетки
        this.elements.grid.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        this.elements.grid.style.opacity = '0';
        this.elements.grid.style.transform = 'scale(0.8) translateY(20px)';
        
        setTimeout(() => {
            this.currentLevel++;
            this.generateNumbers();
            this.renderNumbers();
            this.updateUI();
            
            // Плавное появление новой сетки
            this.elements.grid.style.opacity = '0';
            this.elements.grid.style.transform = 'scale(0.8) translateY(-20px)';
            
            setTimeout(() => {
                this.elements.grid.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                this.elements.grid.style.opacity = '1';
                this.elements.grid.style.transform = 'scale(1) translateY(0)';
                
                setTimeout(() => {
                    this.isAnimating = false;
                    this.elements.grid.style.transition = '';
                }, 500);
            }, 50);
        }, 500);
    }
    
    endGame() {
        clearInterval(this.timerInterval);
        const finalTime = Math.floor((new Date() - this.startTime) / 1000);
        
        this.elements.finalTime.textContent = finalTime;
        this.elements.message.classList.add('success');
        
        // Плавное появление сообщения о победе
        this.elements.message.style.display = 'block';
        this.elements.message.style.opacity = '0';
        this.elements.message.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            this.elements.message.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            this.elements.message.style.opacity = '1';
            this.elements.message.style.transform = 'translateY(0)';
        }, 50);
        
        this.showStats(finalTime);
        this.isAnimating = false;
    }
    
    showStats(finalTime) {
        this.elements.statsTime.textContent = `${finalTime} сек`;
        this.elements.statsCombo.textContent = this.maxCombo;
        this.elements.statsLevel.textContent = `${this.currentLevel}/9`;
        this.elements.statsErrors.textContent = this.errors;
        
        // Плавное появление статистики
        this.elements.statsModal.style.display = 'flex';
        this.elements.statsModal.style.opacity = '0';
        
        setTimeout(() => {
            this.elements.statsModal.style.transition = 'opacity 0.3s ease';
            this.elements.statsModal.style.opacity = '1';
        }, 50);
    }
    
    resetGame() {
        if (this.isAnimating) return;
        
        clearInterval(this.timerInterval);
        
        this.currentLevel = 1;
        this.combo = 0;
        this.maxCombo = 0;
        this.errors = 0;
        this.gameStarted = false;
        this.startTime = null;
        
        this.elements.timer.textContent = '0';
        this.elements.startButton.disabled = false;
        
        // Плавное появление кнопки старта
        this.elements.startButton.style.display = 'inline-block';
        this.elements.startButton.style.opacity = '0';
        
        setTimeout(() => {
            this.elements.startButton.style.transition = 'opacity 0.5s ease';
            this.elements.startButton.style.opacity = '1';
        }, 50);
        
        // Плавное скрытие сообщения
        if (this.elements.message.style.display === 'block') {
            this.elements.message.style.transition = 'opacity 0.3s ease';
            this.elements.message.style.opacity = '0';
            
            setTimeout(() => {
                this.elements.message.style.display = 'none';
                this.elements.message.classList.remove('success');
                this.elements.message.style.opacity = '1';
            }, 300);
        }
        
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