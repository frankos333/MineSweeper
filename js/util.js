'use strict'
function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
}
function parseTimer(num) {
    var minutes = Math.floor(num / 100 / 60);
    var seconds = Math.floor((num - (minutes * 100 * 60)) / 100);
    var miliseconds = num % 100

    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    if (miliseconds < 10) {miliseconds = "0"+miliseconds}
    return minutes+':'+seconds+':'+miliseconds
}