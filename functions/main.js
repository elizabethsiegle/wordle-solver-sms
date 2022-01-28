// This is your new function. To start, set the name and path on the left.
const superagent = require('superagent'); //make HTTP request to the Datamuse API
function onlyLettersAndQMark(str) {
  console.log(/^[A-Za-z\?]*$/.test(str));
  return /^[A-Za-z\?]*$/.test(str); //true or false
}
function asteriskAndCommaLetters(str) {
  return str.startsWith("?????,*") && str.endsWith("*") && /[a-z]/.test(str);
}
function slashesAndQMark(str) { 
  return str.startsWith("//") && /[a-z]/.test(str) && str.length() == 7;
}
exports.handler = async function(context, event, callback) {
  // Here's an example of setting up some TWiML to respond to with this function
	let twiml = new Twilio.twiml.MessagingResponse();
  let inbMsg = event.Body.toLowerCase().trim(); //get inbound word
  console.log(`ingMsg ${inbMsg}`);
  let arrOfPotentialAnswers = [];
  if(inbMsg == "?") {
    twiml.message(`Either send 5 letters and if you don't have a letter hint, use a question mark in place of a letter. Ex: send \`b???g\` to find 5-letter words that begin with \`b\` and end with \`g\`. \n\nYou could also send \`?????,*y*\` to find a 5-letter word containing \`y\`, or \`?????,*by*\` to find a 5-letter word containing \`by\` \n\nLastly, to search for 5-letter words containing a letter in any place, you could send \`//we???\` (in this case, that would search for 5-letter words with \`w\` and \`e\` somewhere`);
    return callback(null, twiml);
  }
  else if(onlyLettersAndQMark(inbMsg)) {
    superagent.get(`https://api.datamuse.com/words?sp=${inbMsg}`) //hit the Datamuse API
    .end((err, res) => {
      console.log(`res.body.length ${res.body.length}`);
      if(res.body.length <= 2) { //Datamuse doesn't have any related words
        console.log("no related words");
        twiml.message(`Oh no I'm sorry \n\nDatamuse has no related words according to your letters \nTry a different word`); //haiku if no words related to input SMS
        return callback(null, twiml);
      } //if
      res.body.forEach(word => {
        if(word.score > 2) {
          arrOfPotentialAnswers.push(word.word);
          console.log(`word: ${word.word}`);
        }
      });
      let msg = `Here is an array of potential answers in order of likelihood: \n\n ${arrOfPotentialAnswers}`;
      twiml.message(msg);
      return callback(null, twiml);
    });
  } // if
  else if(asteriskAndCommaLetters(inbMsg)) {
    superagent.get(`https://api.datamuse.com/words?sp=${inbMsg}`) //hit the Datamuse API
    .end((err, res) => {
      if(res.body.length <= 2) { //Datamuse doesn't have any related words
        console.log("no related words");
        twiml.message(`Oh no I'm sorry \nDatamuse has no related 5-letter words according to your letters \n\nTry a different word`); //haiku if no words related to input SMS
        return callback(null, twiml);
      } //if
      res.body.forEach(word => {
        if(word.score > 2) {
          arrOfPotentialAnswers.push(word.word);
          console.log(`word: ${word.word}`);
        }
      });
      let msg = `Here is an array of potential answers in order of likelihood: \n\n ${arrOfPotentialAnswers}`;
      twiml.message(msg);
      return callback(null, twiml);
    });

  }
  else if(slashesAndQMark) { //  //we???
  superagent.get(`https://api.datamuse.com/words?sp=${inbMsg}`) //hit the Datamuse API
    .end((err, res) => {
      if(res.body.length <= 2) { //Datamuse doesn't have any related words
        console.log("no related words");
        twiml.message(`Oh no I'm sorry \n\nDatamuse has no related 5-letter words according to your letters \nTry a different word`); //haiku if no words related to input SMS
        return callback(null, twiml);
      } //if
      res.body.forEach(word => {
        if(word.score > 2) {
          arrOfPotentialAnswers.push(word.word);
          console.log(`word: ${word.word}`);
        }
      });
      let msg = `Here is an array of potential answers in order of likelihood (don't forget to include question marks to represent letter slots you do not know after the letters you want to search for whose position you do not know, ie. \`//oxt??\` will find a 5-letter word containing \`o\`, \`x\`, and \`t\`): \n\n ${arrOfPotentialAnswers}`;
      twiml.message(msg);
      return callback(null, twiml);
    });
  }
  else { //directions
    twiml.message(`Either send 5 letters and if you don't have a letter hint, use a question mark in place of a letter. Ex: send \`b???g\` to find 5-letter words that begin with \`b\` and end with \`g\`. \n\nYou could also send \`?????,*y*\` to find a 5-letter word containing \`y\`, or \`?????,*by*\` to find a 5-letter word containing \`by\` \n\n Lastly, to search for 5-letter words containing a letter in any place, you could send \`//we???\` (in this case, that would search for 5-letter words with \`w\` and \`e\` somewhere`);
    return callback(null, twiml);
  }
}
