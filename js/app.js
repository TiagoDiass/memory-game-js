initialize();

function AudioController () {
    this.bgMusic = new Audio('assets/audio/creepy.mp3');
    this.flipSound = new Audio('assets/audio/flip.wav');
    this.matchSound = new Audio('assets/audio/match.wav');
    this.victorySound = new Audio('assets/audio/victory.wav');
    this.gameOverSound = new Audio('assets/audio/gameOver.wav');
    
    this.bgMusic.volume = 0.05;
    this.bgMusic.loop = true;

    this.victorySound.volume = 0.25;
    this.gameOverSound.volume = 0.25;

    this.startMusic = function () {
        this.bgMusic.play();
    }

    this.stopMusic = function () {
        this.bgMusic.pause();
        this.bgMusic.currentTime = 0;
    }

    this.flip = function () {
        this.flipSound.play();
    }

    this.match = function () {
        this.matchSound.play();
    }

    this.victory = function () {
        this.stopMusic();
        this.victorySound.play();
    }

    this.gameOver = function () {
        this.stopMusic();
        this.gameOverSound.play();
    }
}

function MemoryGame (totalTime, cards) {
    this.cardsArray = cards;
    this.totalTime = totalTime;
    this.timeRemaining = totalTime;
    this.timer = document.getElementById('time-remaining');
    this.flipCounter = document.getElementById('flips');
    this.audioController = new AudioController();

    this.startGame = () => {
        this.cardToCheck = null;
        this.totalClicks = 0;
        this.timeRemaining = this.totalTime;
        this.matchedCards = [];
        this.busy = true;

        setTimeout(() => {
            this.audioController.startMusic();
            this.shuffleCards();
            this.countDown = this.startCountDown();
            this.busy = false;
        }, 500);

        this.hideCards();
        this.timer.innerText = this.timeRemaining;
        this.flipCounter.innerHTML = this.totalClicks;
    }

    this.shuffleCards = () => {
        for (let i = this.cardsArray.length - 1; i > 0; i--) {
            let randomIndex = Math.floor(Math.random() * (i+1));
            this.cardsArray[randomIndex].style.order = i;
            this.cardsArray[i].style.order = randomIndex;
        }
    }

    this.hideCards = () => {
        this.cardsArray.forEach(card => {
            card.classList.remove('visible');
            card.classList.remove('matched');
        });
    }

    this.gameOver = () => {
        clearInterval(this.countDown);
        this.audioController.gameOver();
        document.getElementById('game-over-text').classList.add('visible');
    }

    this.startCountDown = () => {
        return setInterval(() => {
            this.timeRemaining--;
            this.timer.innerHTML = this.timeRemaining;
            if (this.timeRemaining === 0) {
                this.gameOver();
            }
        }, 1000);
    }

    this.victory = () => {
        clearInterval(this.countDown);
        this.audioController.victory();
        document.getElementById('victory-text').classList.add('visible');
        this.hideCards();
    }

    this.flipCard =  card => {
        if (this.canFlipCard(card)) {
            this.audioController.flip();
            this.totalClicks++;
            this.flipCounter.innerHTML = this.totalClicks;
            card.classList.add('visible');

            if (this.cardToCheck !== null) {
                this.checkForCardMatch(card);
            } else {
                this.cardToCheck = card;
            }
        }
    }

    this.canFlipCard = card => {
        return (!this.busy && !this.matchedCards.includes(card) && card !== this.cardToCheck);
    }

    this.checkForCardMatch = card => {
        if (this.getCardType(card) === this.getCardType(this.cardToCheck)) {
            this.cardMatch(card, this.cardToCheck);
        } else {
            this.cardMisMatch(card, this.cardToCheck);
        }

        this.cardToCheck = null;
    }

    this.getCardType = card => {
        return card.querySelector('.card-value').src;
    }

    this.cardMatch = (card1, card2) => {
        this.matchedCards.push(card1);
        this.matchedCards.push(card2);
        card1.classList.add('matched');
        card2.classList.add('matched');
        this.audioController.match();
        
        if (this.matchedCards.length === this.cardsArray.length) {
            this.victory();
        }
    }

    this.cardMisMatch = (card1, card2) => {
        this.busy = true;

        setTimeout(() => {
            card1.classList.remove('visible');
            card2.classList.remove('visible');
            this.busy = false;
        }, 1000);
    }
}

function initialize () {
    let overlays = Array.from(document.getElementsByClassName('overlay-text'));
    let cards = Array.from(document.getElementsByClassName('card'));
    let game = new MemoryGame(100, cards);

    overlays.forEach(overlay => {
        overlay.addEventListener('click', () => {
            overlay.classList.remove('visible');
            game.startGame();
        });
    });
    
    cards.forEach(card => {
        card.addEventListener('click', () => {
            game.flipCard(card);
        });
    })

}