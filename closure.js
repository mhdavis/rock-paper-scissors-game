function winKeeper() {
  let playerOneWinsCount = 0;
  let playerTwoWinsCount = 0;

  function incrementWins(num) {
    switch (num) {
      case 1:
        playerOneWinsCount++;
        break;
      case 2:
        playerTwoWinsCount++;
        break;
    }
    return [playerOneWinsCount, playerTwoWinsCount];
  }

  return incrementWins;
}

const winTracker = winKeeper();

// when player 1 wins
winTracker(1); // [1,0]
// when player 2 wins
winTracker(2); // [1,1]

function createPlayer(num) {
  let numStr = num === 1 ? "one" : "two";

  let nameInput = $("#player-input").val().trim();

  database.ref("/players/" + num).set({
    name: nameInput,
    player: num,
    wins: 0,
    losses: 0
  });

  $("#player-" + numStr + "-name").text(nameInput);
  $("#player-" + numStr + "-wins").text(0);
  $("#player-" + numStr + "-losses").text(0);
}

function rpsButtonEventHandler(num) {
  let numStr = num === 1 ? "one" : "two";

  $(".rps-button").on("click", function (event) {
    playerChoice = $(event.target).text();
    database.ref("/players/" + num + "/choice").set(playerChoice);
    $("#player-" + numStr + "-box")
    .removeClass("current-player")
    .html(`<h3>${playerChoice}</h3>`);

    if (num === 1) {
      database.ref("/turn").set(2);
    } else {
      database.ref("/turn").set(3);
    }
  });
}

function winningCondition(num) {

  let $winnerTag = $('<h3>')
  .addClass('show-result')
  .text('Player' + winner + 'Wins');

  $("player-results-box").append($winnerTag);
  setTimeout(function () {
    $("player-results-box").remove($winnerTag);
  }, 6000);

  if (num === 1) {

    playerOneWins++;
    playerTwoLosses++;
    database.ref("/players/1/wins").set(playerOneWins);
    database.ref("/players/2/losses").set(playerTwoLosses);
    $("#player-one-wins").text(playerOneWins);
    $("#player-two-losses").text(playerTwoLosses);

  } else if (num === 2) {

    playerOneLosses++;
    playerTwoWins++;
    database.ref("/players/1/losses").set(playerOneLosses);
    database.ref("/players/2/wins").set(playerTwoWins);
    $("#player-one-losses").text(playerOneLosses);
    $("#player-two-wins").text(playerTwoWins);
    
  }

  database.ref("/players/1/choice").remove();
  database.ref("/players/2/choice").remove();
  database.ref("/turn").set(1);
}
