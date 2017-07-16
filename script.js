// Score not updating
// Displaying proper stuff for each player on the DOM

var config = {
  apiKey: "AIzaSyCHJWoeCMbyK6mmhQlxCPIQwPzCZXSa_bU",
  authDomain: "rock-paper-scissors-game-b4885.firebaseapp.com",
  databaseURL: "https://rock-paper-scissors-game-b4885.firebaseio.com",
  projectId: "rock-paper-scissors-game-b4885",
  storageBucket: "",
  messagingSenderId: "977002967515"
};
firebase.initializeApp(config);

let database = firebase.database();

/*------------------------------VARIABLEs-------------------------------------*/
let playerOne;
let playerTwo;

let playerOneCreated = false;
let playerTwoCreated = false;

let isPlayerOne;

/*--------------------------DOCUMENT READY------------------------------------*/

$(document).ready(function() {

  $(document).on('submit', '.player-entry-form', function(e) {
    e.preventDefault();
    if (!playerOneCreated) {
      playerOne = createPlayer(1);
      setPlayer(playerOne);
      isPlayerOne = true;

    } else if (!playerTwoCreated) {
      playerTwo = createPlayer(2);
      setPlayer(playerTwo);
      isPlayerOne = false;

    } else {
      alert("already two players");
    }
    $('#player-input').val('');

  });

  window.onunload =  function () {
    if (isPlayerOne === false) {
      playerOneCreated = removePlayer(playerTwo);
      playerOne = {};
    } else if (isPlayerOne === true) {
      playerTwoCreated = removePlayer(playerOne);
      playerTwo = {};
    } else {
      console.log("No Players in Game");
    }
  }

// FB handler initiates game when two players have joined
  database.ref('/players').on('child_added', function (playersSnap) {
    playersSnap.val().player === 1 ? playerOneCreated = true : playerTwoCreated = true;

    displayPlayerInfo(playersSnap.val());

    if (playerOneCreated && playerTwoCreated) {
      database.ref('/turn').set(1);
    }
  });

  database.ref('/players').on('child_removed', function (playersSnap) {
    playersSnap.val().player === 1 ? playerOneCreated = false : playerTwoCreated = false;
    if (playerOneCreated || playerTwoCreated) {
      database.ref('/turn').remove();
    }
  });

// FB handler that determines which turn it is in the game
  database.ref("/turn").on('value', function (turnSnap) {
    if (turnSnap.val() === 1) {

      if (!isPlayerOne) {
        //player one is picker
      }

      promptPlayerInput(1);
      rpsButtonEventHandler(playerOne);

    } else if (turnSnap.val() === 2) {

      if (isPlayerOne) {

      }

      $("#player-1-box").remove(".current-player-options");

      promptPlayerInput(2);
      rpsButtonEventHandler(playerTwo);

    } else if (turnSnap.val() === 3) {

      $("#player-2-box").remove(".current-player-options");

      let p1choice;
      let p2choice;

      database.ref("/players/1/choice").on('value', function (choiceSnap) {
        p1choice = choiceSnap.val();
      });

      database.ref("/players/2/choice").on('value', function (choiceSnap) {
        p2choice = choiceSnap.val();
      });;


      let gameResult = comparePlayerInputs(p1choice, p2choice);

      if (!(gameResult === "tie")) {
        winningCondition(gameResult, playerOne, playerTwo);
      }

      $(".rps-button").off();
      database.ref("/players/1/choice").remove();
      database.ref("/players/2/choice").remove();
      database.ref("/turn").set(1);
    }

  });

});

/*-----------------------------FUNCTIONS-------------------------------------*/
// returns playerObj
function createPlayer(num) {
  let nameInput = $("#player-input").val().trim();
  let playerObj = {
    name: nameInput,
    player: num,
    wins: 0,
    losses: 0
  };
  $("#player-" + num + "-name").text(playerObj.name);
  $("#player-" + num + "-wins").text(playerObj.wins);
  $("#player-" + num + "-losses").text(playerObj.losses);

  return playerObj;
}

// appends playerObj to FB
function setPlayer(playerObj) {
  database.ref("/players/" + playerObj.player).set(playerObj);
  return;
}

function displayPlayerInfo(playerObj) {
  $("#player-" + playerObj.player + "-name").text(playerObj.name);
  $("#player-" + playerObj.player + "-wins").text(playerObj.wins);
  $("#player-" + playerObj.player + "-losses").text(playerObj.losses);
}

function removePlayer(playerObj) {
  if (playerObj === undefined) {
    return;
  } else {
    database.ref("/players/" + playerObj.player).remove();
    return false;
  }
}

function rpsButtonEventHandler(playerObj) {
  let playerChoice;

  $(".rps-button").on("click", function (event) {
    playerChoice = $(event.target).text();
    database.ref("/players/" + playerObj.player + "/choice").set(playerChoice);
    $("#player-" + playerObj.player + "-box")
    .removeClass("current-player")
    .html(`<h3>${playerChoice}</h3>`);

    if (playerObj.player === 1) {
      database.ref("/turn").set(2);
    } else if (playerObj.player === 2) {
      database.ref("/turn").set(3);
    }
  });
}

function winningCondition(winner, p1Obj, p2Obj) {

  let $winnerTag;

  if (winner === p1Obj.player) {
    $winnerTag = `<h3 id="winner-tag">${p1Obj.name} Wins!</h3>`;

    p1Obj.wins++;
    p2Obj.losses++;

    database.ref("/players/1/wins").set(p1Obj.wins);
    database.ref("/players/2/losses").set(p2Obj.losses);

  } else if (winner === p2Obj.player) {
    $winnerTag = `<h3 id="winner-tag">${p2Obj.name} Wins!</h3>`;

    p1Obj.losses++;
    p2Obj.wins++;

    database.ref("/players/1/losses").set(p1Obj.losses);
    database.ref("/players/2/wins").set(p2Obj.wins);
  }

  $("#player-1-wins").text(p1Obj.wins);
  $("#player-1-losses").text(p1Obj.losses);
  $("#player-2-wins").text(p2Obj.wins);
  $("#player-2-losses").text(p2Obj.losses);

  $("#player-results-box").html($winnerTag);
  setTimeout(function () {
    $("#winner-tag").remove();
  }, 2000);
}


function comparePlayerInputs(a, b) {

  switch (a === "Rock") {
    case (b === "Rock"):
      return 'tie';
      break;
    case (b === "Scissors"):
      return 1;
      break;
    case (b === "Paper"):
      return 2;
      break;
  }

  switch (a === "Paper") {
    case (b === "Rock"):
      return 1;
      break;
    case (b === "Scissors"):
      return 2;
      break;
    case (b === "Paper"):
      return 'tie';
      break;
  }

  switch (a === "Scissors") {
    case (b === "Rock"):
      return 2;
      break;
    case (b === "Scissors"):
      return 'tie';
      break;
    case (b === "Paper"):
      return 1;
      break;
  }

};

function promptPlayerInput(num) {
  var buttonGroup =
  `
  <div class="current-player-options">
    <div class="button-group">
      <button class="rps-button btn btn-md btn-default">Rock</button>
      <button class="rps-button btn btn-md btn-default">Paper</button>
      <button class="rps-button btn btn-md btn-default">Scissors</button>
    </div>
  </div>
  `;
  $("player-" + num + "-box").html(buttonGroup);
  return;
}
