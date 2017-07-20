const config = {
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

  $("#player-1-box").html("<p>Waiting for Player 1</p>");
  $("#player-2-box").html("<p>Waiting for Player 2</p>");

  $(document).on('submit', '.player-entry-form', function(e) {
    e.preventDefault();
    if (!playerOneCreated) {
      isPlayerOne = true;
      createAndStorePlayer(1);

    } else if (!playerTwoCreated) {
      isPlayerOne = false;
      createAndStorePlayer(2);

    } else {
      alert("already two players");
    }
    $('#player-input').val('');

  });

  // FB handler initiates game when two players have joined
  database.ref('/players').on('child_added', function (playersSnap) {
    playersSnap.val().player === 1 ? playerOneCreated = true : playerTwoCreated = true;

    if (playersSnap.val().player === 1) {
      playerOne = pullPlayer(playersSnap.val());
      displayPlayerInfo(playersSnap.val());
    } else {
      playerTwo = pullPlayer(playersSnap.val());
      displayPlayerInfo(playersSnap.val());
    }

    if (playerOneCreated && playerTwoCreated) {
      database.ref('/turn').set(1);
    }
  });

  $(document).on('submit', '.player-message-form', function(e) {
    e.preventDefault();
    if (isPlayerOne) {
      // player one
      database.ref('/chat').push(createMessage(playerOne));
    } else {
      // player two
      database.ref('/chat').push(createMessage(playerTwo));
    }
  });

  window.onunload =  function () {
    if (isPlayerOne === false) {
      playerOneCreated = removePlayer(playerTwo);
      playerOne = {};
    } else if (isPlayerOne === true) {
      playerTwoCreated = removePlayer(playerOne);
      playerTwo = {};
    } else {
      database.ref('/chat').remove();
    }
  }

  database.ref('/chat').on('child_added', function (messageSnap) {
    if (isPlayerOne) {
      $('.chat-display').append(messageSnap.val());
    } else {
      $('.chat-display').append(messageSnap.val());
    }
    $("#message-input").val("");
  });

  database.ref('/players').on('child_removed', function (playersSnap) {
    playersSnap.val().player === 1 ? playerOneCreated = false : playerTwoCreated = false;

    let disconnectMessage = `<p class="disconnect-message">~~~ ${playersSnap.val().name} has disconnected ~~~</p>`;
    $(".chat-display").append(disconnectMessage);
    removePlayerInfo(playersSnap.val());

    if (playerOneCreated === false || playerTwoCreated === false) {
      $("#player-1-box").html("");
      $("#player-2-box").html("");
      $("#player-1-div").css("border-color", "white");
      $("#player-2-div").css("border-color", "white");
      database.ref('/turn').remove();
    }
  });

// FB handler that determines which turn it is in the game
  database.ref("/turn").on('value', function (turnSnap) {
    if (turnSnap.val() === 1) {
      $("#player-1-div").css("border-color", "yellow");

      if (isPlayerOne) {
        promptPlayerInput(playerOne);
        rpsButtonEventHandler(playerOne);
      }

    } else if (turnSnap.val() === 2) {

      $("#player-1-div").css("border-color", "white");
      $("#player-1-box").remove(".current-player-options");

      $("#player-2-div").css("border-color", "yellow");
      if (!isPlayerOne) {
        promptPlayerInput(playerTwo);
        rpsButtonEventHandler(playerTwo);
      }

    } else if (turnSnap.val() === 3) {

      $("#player-2-div").css("border-color", "white");
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

      winningCondition(gameResult, playerOne, playerTwo);
      displayPlayerInfo(playerOne);
      displayPlayerInfo(playerTwo);

      $(".rps-button").off();
      database.ref("/players/1/choice").remove();
      database.ref("/players/2/choice").remove();
      database.ref("/turn").set(1);
    }

  });

});

/*-----------------------------FUNCTIONS-------------------------------------*/
// returns playerObj
function createAndStorePlayer(num) {
  let nameInput = $("#player-input").val().trim();
  let playerObj = {
    name: nameInput,
    player: num,
    wins: 0,
    losses: 0
  };
  database.ref("/players/" + playerObj.player).set(playerObj);
  return;
}

function pullPlayer(playerObj) {
  let player = {
    name: playerObj.name,
    player: playerObj.player,
    wins: playerObj.wins,
    losses: playerObj.losses
  };
  return player;
}

function displayPlayerInfo(playerObj) {
  let playerStats =
  `
  <p class="text-center">Wins: <span id="player-${playerObj.player}-wins">${playerObj.wins}</span>
  Losses: <span id="player-${playerObj.player}-losses">${playerObj.losses}</span></p>
  `;

  $("#player-" + playerObj.player + "-box").text("");
  $("#player-" + playerObj.player + "-name").text(playerObj.name);
  $("#player-" + playerObj.player + "-stats").html(playerStats);
  return;
}

function removePlayerInfo(playerObj) {
  $("#player-" + playerObj.player + "-box").html(`<p>${playerObj.name} left. Waiting for new player</p>`);
  $("#player-" + playerObj.player + "-name").text("");
  $("#player-" + playerObj.player + "-stats").html("");
  return;
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

    $("#player-" + playerObj.player + "-box").html(`<h3>${playerChoice}</h3>`);

    if (playerObj.player === 1) {
      database.ref("/turn").set(2);
    } else if (playerObj.player === 2) {
      database.ref("/turn").set(3);
    }
  });
}

function createMessage(playerObj) {

    let messageValue = $("#message-input").val();
    let message = `<p class="player-${playerObj.player}-message">${playerObj.name}: ${messageValue}</p>`;
    return message;

}

function winningCondition(winner, p1Obj, p2Obj) {

  let $displayTag;

  if (winner === p1Obj.player) {

    $displayTag = `<h3 id="display-tag">${p1Obj.name} Wins!</h3>`;

    p1Obj.wins++;
    p2Obj.losses++;

    database.ref("/players/1/wins").set(p1Obj.wins);
    database.ref("/players/2/losses").set(p2Obj.losses);

  } else if (winner === p2Obj.player) {

    $displayTag = `<h3 id="display-tag">${p2Obj.name} Wins!</h3>`;

    p1Obj.losses++;
    p2Obj.wins++;

    database.ref("/players/1/losses").set(p1Obj.losses);
    database.ref("/players/2/wins").set(p2Obj.wins);

  } else {

    $displayTag = `<h3 id='display-tag'>Tie!</h3>`;

  }

  $("#player-results-box").html($displayTag);
  setTimeout(function () {
    $("#display-tag").remove();
  }, 3000);


}


function comparePlayerInputs(p1, p2) {

  if (p1 === "Rock") {

    if (p2 === "Rock") {
      return 'tie';
    } else if (p2 === "Paper") {
      return 2;
    } else if (p2 === "Scissors") {
      return 1;
    }

  } else if (p1 === "Paper") {

    if (p2 === "Rock") {
      return 1;
    } else if (p2 === "Paper") {
      return 'tie';
    } else if (p2 === "Scissors") {
      return 2;
    }

  } else if (p1 === "Scissors") {

    if (p2 === "Rock") {
      return 2;
    } else if (p2 === "Paper") {
      return 1;
    } else if (p2 === "Scissors") {
      return 'tie';
    }

  }
}

function promptPlayerInput(playerObj) {
  let buttonGroup =
  `
  <div class="current-player-options">
    <div class="button-group">
      <button class="rock-button rps-button btn btn-md btn-default">Rock</button>
      <button class="paper-button rps-button btn btn-md btn-default">Paper</button>
      <button class="scissors-button rps-button btn btn-md btn-default">Scissors</button>
    </div>
  </div>
  `;

  if (playerObj !== undefined) {
    $("#player-" + playerObj.player + "-box").html(buttonGroup);
  }
  return;
}
