// This is your new function. To start, set the name and path on the left.
const superagent = require('superagent'); //make HTTP request to the Datamuse API
function onlyLettersAndQMark(str) { //check if letters and questionmark
  console.log(/^[A-Za-z\?]*$/.test(str));
  return /^[A-Za-z\?]*$/.test(str); //true or false
}
function onlyLetters(str) {
  return /[A-Za-z]/.test(str); //true or false
}
exports.handler = function(context, event, callback) {
  // Here's an example of setting up some TWiML to respond to with this function
	let twiml = new Twilio.twiml.MessagingResponse();
  let greensquares = String(event.green.toLowerCase());
  let yellowsquares = event.yellow.toLowerCase();
  let blacksquares = event.black.toLowerCase();
  console.log(`blacksquares ${blacksquares}, greensquares ${greensquares}, yellowsquares ${yellowsquares}`);
  let arrOfPotentialAnswers = [];
  let inbMsg;
  if(yellowsquares.length == 1) {
    inbMsg = greensquares + `,//${yellowsquares}????`;
  }
  else if(yellowsquares.length == 2) {
    inbMsg = greensquares + `,//${yellowsquares}???`;
  }
  else if(yellowsquares.length == 3) {
    inbMsg = greensquares + `,//${yellowsquares}??`;
  }
  else if(yellowsquares.length == 4) {
    inbMsg = greensquares + `,//${yellowsquares}?`;
  }
  else { //anagram
    inbMsg = greensquares + `,//${yellowsquares}`;
  }
  if (onlyLettersAndQMark(greensquares) && onlyLetters(yellowsquares) && greensquares.length == 5 && onlyLetters(blacksquares)) {
    //let inbMsg = greensquares + `,*${yellowsquares}*`; 
    console.log(`inbMsg ${inbMsg}`);
    superagent.get(`https://api.datamuse.com/words?sp=${inbMsg}`) //hit the Datamuse API
    .end((err, res) => {
      if(res.body.length <= 2) { //Datamuse doesn't have any related words
        console.log("no related words");
        twiml.message(`Oh no, I'm sorry \nDatamuse has no related 5-letter words according to your letters \n\nCheck the letters you sent`); //haiku if no words related to input SMS
        return callback(null, twiml);
      } //if
      res.body.forEach(word => {
        console.log(`word ${word}`);
        if(word.score > 200) { //likelier
          console.log(`word ${word.word}`);
          for (var x = 0; x < blacksquares.length; x++) {
            var c = blacksquares[x];
            let w = String(word.word);
            if(!w.includes(c)) {
              console.log(`!${w}.includes(${c}`);
              arrOfPotentialAnswers.push(word.word);
            }
          }
        } //if
      });
      
      const occurrences = arrOfPotentialAnswers.reduce(function(acc,curr) {
          return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc
      }, {});
      let newArr = [];
      for (const [key, value] of Object.entries(occurrences)) {
        if(value == 4) {
          newArr.push(key);
        }
      }
      console.log(occurrences);
      // let unique = [...new Set(arrOfPotentialAnswers)];
      let msg = `Here is an array of potential answer words in order of likelihood: \n\n ${newArr}`;
      twiml.message(msg);
      return callback(null, twiml);
    });
  }
  else {
    twiml.message(`For green squares🟩, be sure to send something like "??e??" (only 5 characters for a 5-letter Wordle word), and for yellow🟨 and black squares⬛️, send something like "rrr"`);
    return callback(null, twiml);
  }
};