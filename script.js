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

let playerOneWins = 0;
let playerOneLosses = 0;
let playerTwoWins = 0;
let playerTwoLosses = 0;

let p1choice;
let p2choice;

let playerOne = false;
let playerTwo = false;

$(document).ready(function() {

  $(document).on('submit', '.player-entry-form', function(e) {
    e.preventDefault();
    if (!playerOne) {
      database.ref("/players/1").set({
        name: $("#player-input").val().trim(),
        player: 1,
        wins: 0,
        losses: 0
      });
    } else if (!playerTwo) {
      database.ref("/players/2").set({
        name: $("#player-input").val().trim(),
        player: 2,
        wins: 0,
        losses: 0
      });
    } else {
      alert("already two players");
    }
    $('#player-input').val('');
  });

  database.ref('/players').on('child_added', function (snapshot) {
    snapshot.val().player === 1 ? playerOne = true : playerTwo = true;
    if (playerOne && playerTwo) {
      database.ref('/turn').set(1);
    }
  });

  // database.ref("/players/1").onDisconnect(function () {
  //   database.ref("/players/1").remove();
  //   playerOne = false;
  // });
  //
  // database.ref("/players/2").onDisconnect().remove(function () {
  //
  // });
  //   playerTwo = false;
  // });

  database.ref("/turn").on('value', function (turnSnap) {
    if (turnSnap.val() === 1) {
      $("#player-one-box").addClass("current-player");

      promptPlayerInput();

      $(".rps-button").on("click", function () {
        p1choice = $(this).text();
        database.ref("/players/1/choice").set(p1choice);
        $("#player-one-box")
        .removeClass("current-player")
        .html(`<h3>${p1choice}</h3>`);
        database.ref("/turn").set(2);
      });


    } else if (turnSnap.val() === 2) {
      $("#player-two-box").addClass("current-player");

      promptPlayerInput();

      $(".rps-button").on("click", function () {
        console.log("button worked");
        p2choice = $(this).text();
        database.ref("/players/2/choice").set(p2choice);
        $("#player-two-box")
        .removeClass("current-player")
        .html(`<h3>${p2choice}</h3>`);
        database.ref("/turn").set(3);
      });

    } else if (turnSnap.val() === 3) {
        console.log("P1 Choice: " + p1choice);
        console.log("P2 Choice: " + p2choice);
        let p1choiceVal = database.ref("/players/1/choice").on('value', function (choiceSnap) {
          return choiceSnap.val();
        });
        let p2choiceVal = database.ref("/players/2/choice").on('value', function (choiceSnap) {
          return choiceSnap.val();
        });;
        console.log("P1 db choice:" + p1choiceVal);
        console.log("P2 db choice:" + p2choiceVal);
        $(".rps-button").off();
        let output = comparePlayerInputs(p1choice, p2choice);
        let $resultsBox = $("player-results-box");

        if (output === 'one') {
          let $showResultElem = '<h3 class="show-result">Player One Wins</h3>';
          $resultsBox.html($showResultElem);
          setTimeout(function () {
            $resultsBox.remove($showResultElem);
          }, 6000);
          playerOneWins++;
          playerTwoLosses++;
          database.ref("/players/1/wins").set(playerOneWins);
          database.ref("/players/2/losses").set(playerTwoLosses);

        } else if (output === 'two') {
          let $showResultElem = '<h3 class="show-result">Player Two Wins</h3>';
          $resultsBox.html($showResultElem);
          setTimeout(function () {
            $resultsBox.remove($showResultElem);
          }, 6000);
          playerOneLosses++;
          playerTwoWins++;
          database.ref("/players/1/losses").set(playerOneLosses);
          database.ref("/players/2/wins").set(playerTwoWins);
        }

        database.ref("/players/1/choice").remove();
        database.ref("/players/2/choice").remove();
        database.ref("/turn").set(1);
    }

  });

function comparePlayerInputs(a, b) {

  switch (a === "Rock") {
    case (b === "Rock"):
      return 'tie';
      break;
    case (b === "Scissors"):
      return 'one';
      break;
    case (b === "Paper"):
      return 'two';
      break;
  }

  switch (a === "Paper") {
    case (b === "Rock"):
      return 'one';
      break;
    case (b === "Scissors"):
      return 'two';
      break;
    case (b === "Paper"):
      return 'tie';
      break;
  }

  switch (a === "Scissors") {
    case (b === "Rock"):
      return 'two';
      break;
    case (b === "Scissors"):
      return 'tie';
      break;
    case (b === "Paper"):
      return 'one';
      break;
  }

};

function promptPlayerInput() {
  var buttonGroup =
    `
  <div class="button-group">
    <button class="rps-button btn btn-md btn-default">Rock</button>
    <button class="rps-button btn btn-md btn-default">Paper</button>
    <button class="rps-button btn btn-md btn-default">Scissors</button>
  </div>
  `;
  $("div.current-player").html(buttonGroup);
  return;
}

});

// beforeunload event to detect reloading of page
