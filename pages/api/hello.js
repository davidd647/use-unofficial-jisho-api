// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import 'unofficial-jisho-api';

import JishoAPI from 'unofficial-jisho-api';

const jisho = new JishoAPI();


export default function handler(req, res) {
  // jisho.searchForPhrase('日').then(result => {
  //   console.log(result);
  // });

  console.log(req.query.term);
  const searchTerm = req.query.term;

  jisho.searchForPhrase(searchTerm).then((result) => {
    let kanji, furigana, english;

    console.log("˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰");
    console.log("searchTerm: " + searchTerm);
    console.log("˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰˰");
    // console.log(result.data);

    if (result.data.length == 0) {
      kanji = "no data";
      furigana = "-";
      english = "-";
    } else {
      // kanji = result.data[0].japanese[0].word;
      kanji = "";

      console.log("japanese words: ");
      var words = [];
      result.data[0].japanese.forEach((word, i) => {
        word.word !== undefined ? words.push(word.word) : null;

        // console.log(
        //   `reading ${i}: ${word.reading} - - - (kanji: ${word.word})`
        // );
      });
      kanji = words.join("/");

      furigana = result.data[0].japanese[0].reading;

      if (kanji == undefined || kanji == "") {
        console.log("kanji reassigned because undefined or blank string...");
        kanji = furigana;
      }
      english = result.data[0].senses[0].english_definitions[0];

      console.log("  ");

      var englishWords = [];
      result.data[0].senses.forEach((sense, i) => {
        // console.log(`sense for ${i}: ${sense}`);
        // console.log(sense);
        sense.english_definitions.forEach((def, j) => {
          console.log(`sense ${i} - ${j} - ${def}`);
          if (def !== undefined && def !== "") {
            englishWords.push(def);
          }
        });

        console.log(" --- ");
      });

      // use two top english terms if more than one exists...
      if (englishWords[1] !== undefined) {
        english = [englishWords[0], englishWords[1]].join("/");
      }

      english = english.replace(/,/g, " -");
      english = english.replace(/\"/g, " -");
    }

    console.log(`entries found: ${result.data.length}`);
    console.log(`"${kanji},${furigana},${english}"`);

    console.log("˅˅˅˅˅˅˅˅˅˅˅˅˅˅˅˅˅˅˅˅˅˅˅˅˅˅˅˅˅˅˅˅˅˅˅˅˅˅˅˅˅˅˅˅˅˅˅˅˅˅");

    return res.status(200).json(result.data, 0, 2);
  });
}
