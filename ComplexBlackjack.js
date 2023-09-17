// JavaScript source code
// Get references to all the HTML elements by their IDs
const playerHandTextArea = document.getElementById('player-hand');
const dealerHandTextArea = document.getElementById('dealer-hand');
const hitButton = document.getElementById('hit-button');
const standButton = document.getElementById('stand-button');
const newGameButton = document.getElementById('new-game-button');
const outcomeTextArea = document.getElementById('outcome');

//Define a normal deck
const NormDeck = ["A","2","3","4","5","6","7","8","9","J","Q","K"];
//Define our deck, using a loop
//Imaginary numbers are stored as [a,b], meaning a+bi
var deck = [];
for (var a = 0; a < NormDeck.length; a++) {//a is the real value
    for (var b = 0; b < NormDeck.length; b++) {//b is the imaginary value
        deck.push([NormDeck[a],NormDeck[b]]);
    }
}
const ComplexDeck = deck.slice();
var playing = true;
var plyrHand = [];
var dealerHand = [];
//GAMEPLAY FUNCTIONS****

function hit() {
    if (!playing) {
        return; 
    }
    plyrHand.push(drawCard());
    if (isBust(plyrHand)) {
        stand();
    }
    dispHand(plyrHand, playerHandTextArea, true);
}
function stand() {
    if (!playing) {
        return;
    }
    while (getHandValue(dealerHand)[0] <= 32 & getHandValue(dealerHand)[1] <= 32 & !isBust(dealerHand)) { //draw the dealer's cards
        dealerHand.push(drawCard());
    }
    dispHand(dealerHand, dealerHandTextArea, true)
    var winner = betterValue(getHandValue(plyrHand), getHandValue(dealerHand));
    console.log(winner);
    if (winner == 1) {
        outcomeTextArea.innerHTML = "You Win";
    }
    else if (winner == 2) {
        outcomeTextArea.innerHTML = "You Lose";
    }
    else {
        outcomeTextArea.innerHTML = "Push";
    }
    playing = false;
}
function newGame() {
    playing = true;
    deck = ComplexDeck.slice();
    shuffleArray(deck);
    outcomeTextArea.innerHTML = "";
    deal();
}
function deal() {
    plyrHand = [drawCard(), drawCard()];
    dealerHand = [drawCard(), drawCard()];
    dispHand(plyrHand, playerHandTextArea, true);
    dispHand([dealerHand[0]], dealerHandTextArea, false);
}
function dispHand(hand, element, showTotal) {
    var display = "";
    for (i = 0; i < hand.length; i++) {
        display += convertCard(hand[i], "Display") + "\n";
    }
    if (showTotal) {
        let totalDisp = "";
        if (isBust(hand)) {
            totalDisp = "BUST";
            console.log(getHandValue(hand));
        }
        else {
            totalDisp = getHandValue(hand)[0] + "+" + getHandValue(hand)[1] + "i";
        }
        display += "\nTotal: " + totalDisp;
    }
    element.innerHTML = display;
}
function drawCard() {
    var card = deck[0];
    deck.shift();
    return card;
}
//CALCULATION FUNCTIONS**************

/*
 * Shuffles the array that is input
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // Generate a random index within the remaining portion of the array
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements at i and j
    }
}
/*
 * Converts between ways of representing a card:
 * Display: Ex: K+2i, 2+4i, Q+Ai , string
 * Value: Ex: ["K","2"], ["2","4"], ["Q","A"], array of strings
 * Number: Ex: [10,2], [2,4], [10,1], array of integers
 * Aces will be represented by ones when in number format
 * 10's will be converted to kings always from numebr format
*/
function convertCard(value, outType) {
    //convert the values into a common format
    let card;
    if (typeof value == "string") {
        card = [value.substr(0, 1), value.substr(2, 1)];
    }
    else if (typeof value == "object") {
        if (typeof value[0] == "number") {
            card = ["", ""];
            for (var e = 0; e < 2; e++)
                if (value[e] > 9) {
                    card[e] = "K" //any 10 is assumed to be a king
                }
                else {
                    card[e] = NormDeck[value[e] - 1];
                }
        }
        else {
            card = value.slice();
        }
    }
    if (outType == "Display") {
        return card[0] + "+" + card[1] + "i";
    }
    else if (outType == "Number") {
        num = [NormDeck.indexOf(card[0]) + 1, NormDeck.indexOf(card[1]) + 1];
        if (num[0] > 10) {
            num[0] = 10;
        }
        if (num[1] > 10) {
            num[1] = 10;
        }
        return num;
    }
    else {
        return card;
    }
    console.log(card);
}
/*
 * Finds the better card total of 2 values
 * by finding their distance from
 * 42 + 42i on the complex grid
 * 
 * 1 means card 1 is better, 2 means card 2 is better and 0 means a tie
 * 
 * Mathematically, this is not right, but seems to be
 * the best option game-design-wise
 * 
 * cards must be in number format
 */
function betterValue(card1Param, card2Param) {
    card1 = card1Param.slice();
    card2 = card2Param.slice();
    //check for busts
    let bust1 = card1[0] > 42 | card1[1] > 42
    let bust2 = card2[0] > 42 | card2[1] > 42
    if (bust1 & bust2) {
        return 0;
    }
    else if (bust1) {
        return 2;
    }
    else if (bust2) {
        return 1;
    }
    else {
        //find distances
        let dist1 = Math.sqrt(Math.pow(card1[0] - 42, 2) + Math.pow(card1[1] - 42, 2));
        let dist2 = Math.sqrt(Math.pow(card2[0] - 42, 2) + Math.pow(card2[1] - 42, 2));
        console.log(dist1 + " vs " + dist2);
        if (dist1 == dist2) {
            return 0;
        }
        else if (dist1 < dist2) {
            return 1;
        }
        else {
            return 2;
        }
    }
}
/* adds together the total of all cards in a deck
 * and returns the total in number format
 */
function getHandValue(handParam) {
    var hand = handParam.slice();
    let total = [0, 0];
    let realAces = 0;
    let iAces = 0;
    for (var e = 0; e < hand.length; e++) {
        let card = convertCard(hand[e], "Number");
        if (card[0] == 1) {
            realAces++;
        }
        if (card[1] == 1) {
            iAces++;
        }
        total[0] += card[0];
        total[1] += card[1];
    }
    //handle the aces
    var aceBonuses = [];
    for (var r = 0; r <= realAces; r++) {
        for (var i = 0; i <= iAces; i++) {
            aceBonuses.push([r * 9, i * 9]);
        }
    }

    var bestHand = total.slice();
    for (e = 0; e < aceBonuses.length; e++) {
        aceCase = [total[0] + aceBonuses[e][0], total[1] + aceBonuses[e][1]]
        if (betterValue(bestHand ,aceCase ) == 2) {
            bestHand = aceCase.slice();
        }
        console.log(bestHand);
    }
    console.log("Aces: " + aceBonuses);
    return bestHand;
}
/*
 * Checks if the hand is a bust
 */
function isBust(hand) {
    value = getHandValue(hand);
    return value[0] > 42 | value[1] > 42
}
// Add event listeners to the buttons
hitButton.addEventListener('click', hit);
standButton.addEventListener('click', stand);
newGameButton.addEventListener('click', newGame);
//Deal the first game
newGame();
