function HTMLActuator() {
  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer   = document.querySelector(".score-container");
  this.bestContainer    = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");
  this.sharingContainer = document.querySelector(".score-sharing");

  this.score = 0;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);

    if (metadata.terminated) {
      if (metadata.over) {
        self.message(false); // You lose
      } else if (metadata.won) {
        self.message(true); // You win!
      }
    }

  });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continue = function () {
  if (typeof ga !== "undefined") {
    ga("send", "event", "game", "restart");
  }

  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile) {
  var text=new Array(18);
   text[0] = " ";
  text[1] = "柯<br>小花";
  text[2] = "荆如风";
  text[3] = "黄九郎";
  text[4] = "李连城";
  text[5] = "段飞鹰";
  text[6] = "江云起";
  text[7] = "萧墨存";
  text[8] = "洪三";
  text[9] = "篱清";
  text[10] = "炼峥云";
  text[11] = "玄霄";
  text[12] = "狐不归";
  text[13] = "柯王府";
  text[14] = "字幕组";
  text[15] = "狐妮妮";
  text[16] = "月半半";
  text[17] = "柯暮卿";
  var self = this;
  var text2 = function (n) { var r = 0; while (n > 1) r++, n >>= 1; return r; }

  var wrapper   = document.createElement("div");
  var inner     = document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];

  if (tile.value > 131072) classes.push("tile-super");

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");
  inner.innerHTML = text[text2(tile.value)];

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }

  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);

  // Put the tile on the board
  this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.bestContainer.textContent = bestScore;
};

HTMLActuator.prototype.message = function (won) {
  var mytxt=new Array(14);
  mytxt[0]="寨贱づづ~";
  mytxt[1]="连成：你这里……说不够……我是小花~~可爱的小花~~~";
  mytxt[2]="段飞鹰：好辣的脾气，我就喜欢这样的人。";
  mytxt[3]="把桌上的文书签了，晌午过门儿，今夜圆房。by江云起";
  mytxt[4]="缱绻如梦亦如丝，思尽其联翩";
  mytxt[5]="一点浩然气，千里快哉风";
  mytxt[6]="庸脂俗粉算得了嘛~狐王才是真绝色";
  mytxt[7]="凤霸天下<(╰_╯)╯";
  mytxt[8]="胡闹！";
  mytxt[9]="你等我两年。我定会为你复仇，定会让你过上好日子！";
  mytxt[10]="王府欢迎你，用下限感动你";
  mytxt[11]="上来吧~上来吧~~这无边的麦序╰（｀Ｏ′）╯";
  mytxt[12]="天上掉下个狐妮妮";
  mytxt[13]="月半半，月弯弯";
我是小花~~可爱的小花~~~
情深缘浅情起缘灭,已误红尘多少年？
红线只为一人系..多情犹记...
  var text3 = function (m) { var r = 0; while (m > 1) r++, m >>= 1; return r; }
  var type    = won ? "game-won" : "game-over";
  var message = won ? "恭喜你召唤出水兵服美少铝~壮士！柯小象！" : mytxt[text3(maxscore)-3];

  if (typeof ga !== "undefined") {
    ga("send", "event", "game", "end", type, this.score);
  }

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;

  this.clearContainer(this.sharingContainer);
  this.sharingContainer.appendChild(this.scoreTweetButton());
  twttr.widgets.load();
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
};

HTMLActuator.prototype.scoreTweetButton = function () {
  var tweet = document.createElement("a");
  tweet.classList.add("twitter-share-button");
  tweet.setAttribute("href", "https://twitter.com/share");
  tweet.setAttribute("data-via", "oprilzeng");
  tweet.setAttribute("data-url", "http://oprilzeng.github.io/2048/full");
  tweet.setAttribute("data-counturl", "http://oprilzeng.github.io/2048/full/");
  tweet.textContent = "炫耀一下";

  var text = "I scored " + this.score + " points at PRC2048-Full edition, a game where you " +
             "join numbers to score high! #PRC2048";
  tweet.setAttribute("data-text", text);

  return tweet;
};
