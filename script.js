window.onload = function() {

function Bandit() {
  this.bandit = document.getElementById('js-bandit');
  this.gameField = document.getElementById('js-gamefield');
  this.startButton = document.getElementById('js-start');
  this.message = document.getElementById('js-message');
  this.blood = document.getElementById('js-blood');

  this.timerId = 0;
  this.messageId = 0;

  this.level = 1;
  this.maxLevel = 5;

  this.levelArray = [0,
    {
      offsetY: '0',
      height: '64px',
      speed: '1.5'
    },
    {
      offsetY: '-68px',
      height: '72px',
      speed: '1'
    },
    {
      offsetY: '-144px',
      height: '80px',
      speed: '0.75'
    },
    {
      offsetY: '-228px',
      height: '64px',
      speed: '0.5'
    },
    {
      offsetY: '-296px',
      height: '69px',
      speed: '0.3'
    }];

  this.foulAmount = 0;
  this.maxFoulAmount = 2;
  this.transitionString = 'left 3s linear';
  this.isOn = false;

  this.audioSfx = {
    shot: new Audio('sfx/shot.m4a'),
    shotFall: new Audio('sfx/shot-fall.m4a'),
    wait: new Audio('sfx/wait.m4a'),
    intro: new Audio('sfx/intro.m4a'),
    death: new Audio('sfx/death.m4a'),
    foul: new Audio('sfx/foul.m4a'),
    fire: new Audio('sfx/fire.m4a'),
    win: new Audio('sfx/win.m4a')

  }

}



Bandit.prototype.init = function () {
  var __self = this;
  this.audioSfx.intro.loop = true;
  this.audioSfx.intro.play();

  this.__transitionendWatch = function () {
    __self.stand();
    setTimeout(function () {
      __self.startRound(__self.levelArray[__self.level].speed);
    }, 3000)
  };
  this.bandit.addEventListener('transitionend', this.__transitionendWatch);



  this.startButton.style.display = 'block';
  __self.startBinded = function () {
    __self.audioSfx.intro.pause();
    __self.reset();
    setTimeout(__self.start.bind(__self), 1000);
  };
  this.startButton.addEventListener('click', __self.startBinded);

  this.renderLevel();

};

Bandit.prototype.renderLevel = function () {
  this.bandit.style.backgroundPositionY = this.levelArray[this.level].offsetY;
  this.bandit.style.height = this.levelArray[this.level].height;
};

Bandit.prototype.start = function () {

  this.renderLevel();
  this.renderMessage('level ' + this.level, false);


  this.bandit.style.backgroundPositionX = '0';
  this.bandit.style.transition = this.transitionString;
  this.bandit.style.animationName = 'walk';
  this.bandit.style.animationTimingFunction = 'steps(3)';
  this.bandit.style.animationIterationCount = 'infinite';
  this.bandit.style.left = '170px';

  this.startButton.style.display = 'none';


};

Bandit.prototype.reset = function () {

  this.startButton.style.display = 'none';
  this.bandit.style.backgroundPositionX = '0';
  this.bandit.style.transition = '';
  this.bandit.style.left = '350px';
};

Bandit.prototype.fire = function (level) {

  this.isOn = true;
  this.audioSfx.fire.play();
  this.bandit.style.backgroundPositionX = '-102px';
  this.bandit.style.animationName = 'fire';
  this.bandit.style.animationDuration = level;
  this.bandit.style.animationIterationCount = 1;
};

Bandit.prototype.stand = function () {
  this.bandit.style.animationName = 'stand';
  this.bandit.style.animationTimingFunction = 'steps(4)';
  this.audioSfx.wait.play();

  var __self = this;
  __self.shotBinded = __self.shot.bind(__self);
  this.gameField.addEventListener('click', __self.shotBinded);
};

Bandit.prototype.youLost = function () {
  var __self = this;



  this.gameField.removeEventListener('click',this.shotBinded);

  this.blood.style.display = 'block';
  this.audioSfx.shot.play();
  this.audioSfx.death.play();
  this.renderMessage('YOU LOST', true);
};

Bandit.prototype.youWon = function () {
  if (this.foulAmount >= this.maxFoulAmount) {
    return;
  }
  this.audioSfx.shotFall.play();
  var __self = this;
  clearTimeout(this.timerId);

  console.log('you won!');
  this.gameField.removeEventListener('click', this.shotBinded);

  this.die();

  this.level++;
  this.renderMessage('nice shot!', false);

  if ( !this.checkLevel() ) {
    return;
  }
  setTimeout(function () {
    __self.startButton.innerText = 'Next level';
    __self.startButton.style.display = 'block';
  }, 2000);

};

Bandit.prototype.die = function () {

  this.bandit.style.animationTimingFunction = 'steps(3)';
  this.bandit.style.backgroundPositionX = '-340px';
  this.bandit.style.animationName = 'die';
  this.bandit.style.animationDuration = '2s';
  this.bandit.style.animationIterationCount = 1;
};

Bandit.prototype.foul = function () {
  this.audioSfx.foul.play();
  this.renderMessage('FOUL!!', false);
  this.foulAmount++;
};

Bandit.prototype.shot = function (e) {

  if (!this.isOn && e.target != this.startButton) {

    this.foul();
  } else {
    if (e.target == this.bandit) {

      this.youWon();
    } else {
      this.audioSfx.shot.play();
    }
  }

};

Bandit.prototype.startRound = function (time) {
  var __self = this;



  this.fire(time + 's');
  this.timerId = setTimeout(__self.youLost.bind(__self), time * 1000);
  console.log(this.timerId);
};

Bandit.prototype.checkLevel = function () {




  if (this.level > this.maxLevel) {
    this.bandit.removeEventListener('transitionend',this.__transitionendWatch);
    this.endGame();
    return false;
  }

  return true;
};

Bandit.prototype.endGame = function () {
  this.audioSfx.win.play();
  this.renderMessage('Congratulations, you have won!', true);
};

Bandit.prototype.renderMessage = function (info, permanent) {
  this.message.innerText = info;
  this.message.style.display = 'block';
  clearTimeout(this.messageId);

  var __self = this;

  if (!permanent) {
    this.messageId = setTimeout(function () {
      __self.message.style.display = 'none';
    }, 1500)
  }
};



window.myBandit = new Bandit();
myBandit.init();
}