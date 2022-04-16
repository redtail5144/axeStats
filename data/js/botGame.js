var pScores = []; // Array of player scores
var pTot = [0,0,0]; // Array of total for each round
var bScores = []; // Array of bot scores
var bTot = [0,0,0]; // Array of total for each round
var round = 0; // Currnet round # - 1
var throwNum = 0; // Current throw
var n1 = ""; // Player 1 name
var n2 = ""; // Player 2 name
var flag = true; // Used to see if bot throws first
var p2w = false; // Used to see if bot plays to win

// Weights of accuracy
// Second row keeps track of values
// Coresponding to wegihts
var botWeights = [0.0, 0.0, 0.0, 0.0];

// Bot clutch call rate
// And hit rate
var botClutch = [0.0, 0.0];

// Initalizes everything
// for the game
function init() {
  chooseBot();
  pScores = [];
  pTot = [0,0,0];
  botScores = [];
  botTot = [0,0,0];
  round = 0;
  document.getElementById("roundDisplay").innerHTML = "Round " + (round + 1);
}

// Sets the bot up
// with scoring probability
function botSetup(name, win) {
  n2 = name;
  p2w = win;
  var black, red, blue, cCall, cHit;

  switch (name) {
    case "Spenny":
      black = 85.1;
      red = 12.4;
      blue = 0;
      cCall = 93.9;
      cHit = 40.3;
      break;
    case "Marksman":
      black = 86.5;
      red = 12.4;
      blue = 0;
      cCall = 24.3;
      cHit = 31.5;
      break;
    case "Rander":
      black = 86;
      red = 9;
      blue = 0.3;
      cCall = 98;
      cHit = 31.1;
      break;
    case "Battle Axe":
      black = 79.7;
      red = 18.8;
      blue = 0;
      cCall = 18.3;
      cHit = 25.6;
      break;
    case "Coltron":
      black = 77.2;
      red = 21.2;
      blue = 0;
      cCall = 66.4;
      cHit = 27;
      break;
  }

  botWeights[0] = black; // Sets black
  botWeights[1] = red; // Sets red
  botWeights[2] = blue; // Sets blue
  botWeights[3] = 100 - black - blue - red; // Sets miss
  botClutch[0] = cCall; // Sets clutch call rate
  botClutch[1] = cHit; // Sets clutch hit rate

  document.getElementById("name2").innerHTML = name;
  document.getElementById("name2.2").innerHTML = name;

  document.getElementById("game").style.display = "block";
  document.getElementById("botStuff").style.display = "none";
}

// When target is clicked
// Value is value of area
function targetClick(value) {
  // If undo button pressed
  if (value == "undo") {
    let temp = document.getElementById("nextBut");
    if (temp != null) temp.remove();
    flag = true;
    // Makes sure there is something to undo
    if (throwNum != 0) {
      // Changes the last element back to '-'
      document.getElementById('paxe'.concat(throwNum)).innerHTML = '-';
      document.getElementById('baxe'.concat(throwNum)).innerHTML = '-';
      // Decrements the throw
      throwNum--;
      // Subtracts last value from total
      pTot[round] -= pScores.pop();
      bTot[round] -= bScores.pop();
    }
  // Number button pressed
  } else {
    throwNum++;

    // Adds value to pScores
    pScores.push(value);
    // Adds value to total
    pTot[round] += value;

    // Same thing but for bot
    if (flag) {
      let bVal = botTurn();
      bScores.push(bVal);
      bTot[round] += bVal;
    }

    // Displays the throws
    let temp = (round * 5) + throwNum;
    document.getElementById('paxe'.concat(throwNum)).innerHTML = pScores[temp-1];
    document.getElementById('baxe'.concat(throwNum)).innerHTML = bScores[temp-1];
  }

  // Updates the total
  document.getElementById('ptot'.concat(round)).innerHTML = pTot[round];
  document.getElementById('btot'.concat(round)).innerHTML = bTot[round];

  // Checks to see if round is done
  if (throwNum != 0 && throwNum % 5 == 0) {
    let but = document.createElement("button");
    but.innerHTML = "Next Round";
    but.id = "nextBut";
    but.onclick = function() {
      moveRound();
    }

    let gam = document.getElementById("game");

    gam.appendChild(but);
    //window.setTimeout(moveRound, 1);
  }

  // Bot throws first if its up
  if (throwNum == 4 && bTot[round] > pTot[round]) {
    flag = false;
    let bVal = botTurn();

    bScores.push(bVal);
    bTot[round] += bVal;

    let temp = (round * 5) + (throwNum + 1);
    document.getElementById('baxe'.concat(throwNum + 1)).innerHTML = bScores[temp-1];
    document.getElementById('btot'.concat(round)).innerHTML = bTot[round];
  }
}

// Bot takes turn
function botTurn() {
  let ac = Math.random() * 100;

  // If final throw
  if (throwNum == 5 || !flag) {
    // If bot is playing to win
    if (p2w) {
      // If bot needs clutch to win
      // Or if it is out of reach
      // Throw Clutch
      if (pTot[round] - bTot[round] >= 5) {
        let temp = (round * 5) + (throwNum - 1);
        if (pTot[round] - pScores[temp] == bTot[round])
          return botPoints();

        return botClutchThrow();
      }

      // Other wise just go for points
      else return botPoints();

    // If bot is not playing to win
    // See if it wants to go clutch
    } else if (ac < botClutch[0])
      return botClutchThrow();
    // if it doesn't go clutch
    else return botPoints();

  // If not last throw
  } else
    return botPoints();
}

// Bot throws for points
// Returns value based on weighted probabilities
function botPoints() {
  let ac = Math.random() * 100;

  if (ac > 100 - botWeights[0])
    return 5;
  // If is in 3 range
  else if (ac > 100 - botWeights[0] - botWeights[1])
    return 3;
  // If is in 1 range
  else if (ac > 100 - botWeights[0] - botWeights[1] - botWeights[2])
    return 1;
  // If is in miss range
  else if (ac > 100 - botWeights[0] - botWeights[1] - botWeights[2] - botWeights[3])
    return 0;
}

// Bot throws for clutch
function botClutchThrow() {
  // Changes background to green to show clutch was called
  document.getElementById("baxe5").style.background = "green";
  let ac = Math.random() * 100;

  if (ac < botClutch[1]) return 7;
  else return 0;
}

// Advances to the next round
function moveRound() {
  flag = true;
  let temp = document.getElementById("nextBut");
  temp.remove();
  // If last round
  if (round == 2) showEnd();
  else {
    throwNum = 0;
    round ++;

    // Reset the display
    document.getElementById("roundDisplay").innerHTML = "Round " + (round + 1);

    // Changes throws back to '-'
    for (let i = 1; i <= 5; i++) {
      document.getElementById("paxe".concat(i)).innerHTML = '-';
      document.getElementById("baxe".concat(i)).innerHTML = '-';
    }
  }

  document.getElementById("baxe5").style.background = "";
}

// Shows the end results of the game
function showEnd() {
  document.getElementById("game").style.display = "none";

  //==========================LEFT=====================================//

  var lDiv = document.createElement("div");
  lDiv.id = "prScores";

  var pScoreDiv = document.createElement("div");
  pScoreDiv.className = "throws";

  let h = document.createElement("h2");
  h.innerHTML = n1;

  lDiv.appendChild(h);

  for (let i = 0; i < 3; i++) {
    let p = document.createElement("p");
    for (let j = 0; j < 5; j++) {

      p.innerHTML += pScores[(i * 5) + j] + ", ";
    }
    pScoreDiv.appendChild(p);
  }

  lDiv.appendChild(pScoreDiv);

  document.body.appendChild(lDiv);

  //==========================MIDDLE==================================//

  var mDiv = document.createElement("div");
  mDiv.id = "endTots";

  for (let i = 0; i < 3; i++) {
    let p = document.createElement("p");
    p.innerHTML = pTot[i] + " : " + bTot[i];
    mDiv.appendChild(p);
  }

  document.body.appendChild(mDiv);

  //==========================RIGHT==================================//

  var rDiv = document.createElement("div");
  rDiv.id = "brScores";

  var bScoreDiv = document.createElement("div");
  bScoreDiv.className = "throws";

  h = document.createElement("h2");
  h.innerHTML = n2;

  rDiv.appendChild(h);

  for (let i = 0; i < 3; i++) {
    let p = document.createElement("p");
    for (let j = 0; j < 5; j++) {

      p.innerHTML += bScores[(i * 5) + j] + ", ";
    }
    bScoreDiv.appendChild(p);
  }

  rDiv.appendChild(bScoreDiv);

  document.body.appendChild(rDiv);

  let but = document.createElement("button");
  but.innerHTML = "RESTART";
  but.onclick = function() {
    alert("Throw Better");
    location.href = "botGame.html";
  }

  document.body.appendChild(but);
}

// Used for choosing AI Opponent
function chooseBot() {
  // Creates a form for Ai
  var form = document.createElement("form");
  form.setAttribute("id","botStuff");

  // Title
  var tit = document.createElement("h2");
  tit.innerHTML = "<b>Setup</b>";

  var n = document.createElement("input");
  n.setAttribute('type',"text");
  n.value = "Name 1";
  var nLab = document.createElement("Label");
  nLab.htmlFor = "text";
  nLab.innerHTML = "<b>Player Name: </b>";

  // Choose which bot to play
  var ai = document.createElement("select");
  ai.setAttribute('id', "ai");
  // Spenny
  var op = new Option();
  op.value = "Spenny";
  op.text = "Spenny";
  ai.options.add(op);
  // Marksman
  var op = new Option();
  op.value = "Marksman";
  op.text = "Marksman";
  ai.options.add(op);
  // Rander
  var op = new Option();
  op.value = "Rander";
  op.text = "Rander";
  ai.options.add(op);
  // Battle Axe
  var op = new Option();
  op.value = "Battle Axe";
  op.text = "Battle Axe";
  ai.options.add(op);
  // Coltron
  var op = new Option();
  op.value = "Coltron";
  op.text = "Coltron";
  ai.options.add(op);
  // Custom Option
  /*var op = new Option();
  op.value = "Custom";
  op.text = "Custom(Currently Does Nothing)";
  ai.options.add(op);*/
  ai.value = "Rander"; // Default
  var aiLab = document.createElement("Label");
  aiLab.htmlFor = "text";
  aiLab.innerHTML = "<br><b>Opponent: </b>";

  var disclaimer = document.createElement("p");
  disclaimer.innerHTML = "This is still a work in Progress. Ai will always throw after you even on final axe when ahead. Big axe is also non-existent until IATF realizes we want big axe stats tracked or I stopped being lazy enough to get the data myself. The bot is also very stupid and not the best representation of its real life counterpart";

  // Play to win function
  var cBox = document.createElement("input");
  cBox.type = 'checkbox';
  cBox.id = 'p2wBut';
  cBox.name = 'p2wBut';
  cBox.value = 'car?';
  var cLab = document.createElement("label");
  cLab.htmlFor = 'p2wBut';
  cLab.innerHTML = "<br><b>Play To Win: <b>";

  // Submit button
  var but = document.createElement("button");
  but.innerHTML = "Submit";
  but.type = "button";
  but.onclick = function() {
    n1 = n.value;
    document.getElementById("name1").innerHTML = n.value;
    document.getElementById("name1.1").innerHTML = n.value;
    botSetup(ai.value, document.getElementById("p2wBut").checked);
  }

  // <p> for styling
  var para = document.createElement("p");

  // Adds everything to the screen
  form.appendChild(tit);
  form.appendChild(nLab);
  form.appendChild(n);
  form.appendChild(aiLab);
  form.appendChild(ai);
  form.appendChild(cLab);
  form.appendChild(cBox);
  form.appendChild(disclaimer);
  form.appendChild(but);
  document.body.appendChild(form);
}
