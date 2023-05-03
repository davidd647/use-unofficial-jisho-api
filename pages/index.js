import Head from 'next/head'
import styles from '../styles/Home.module.css'
import React, { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Tooltip from '@mui/material/Tooltip';
import Image from 'next/image';

function getMobileOperatingSystem() {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // Windows Phone must come first because its UA also contains "Android"
  if (/windows phone/i.test(userAgent)) {
    return "Windows Phone";
  }

  if (/android/i.test(userAgent)) {
    return "Android";
  }

  // iOS detection from: http://stackoverflow.com/a/9039885/177710
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return "iOS";
  }

  return "unknown";
}

async function test() {
  const res = await fetch('./api/hello');
  const body = await res.json(); //.body();
  console.log(body);
}

test();

export default function Home() {
  const [sourceMaterial, setSourceMaterial] = useState('');
  const [collection, setCollection] = useState('');
  const [pending, setPending] = useState('');
  const [more, setMore] = useState(false);
  const [device, setDevice] = useState('');
  useEffect(() => {
    setDevice(getMobileOperatingSystem());
  }, []); // need the array here so that the accordions don't auto-close (don't understand why)

  const handleAddTerm = () => {
    if (pending === '') return;
    setCollection(collection === '' ? pending : `${collection}\n${pending}`);
    setPending('');
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      console.log("add the word...");
      handleAddTerm();
    }
  }

  const handleQuickKeyPress = (e) => {
    if (e.key === "Enter" || e.keyCode === 32) {
      // 32 is space...
      e.preventDefault();

      handleAddTerm();
    }
  }

  const getSelectedText = (lineIndex, charIndex) => {
    const selectedLineContent = sourceMaterial.split('\n')[lineIndex];

    let lineStartIndex = charIndex;
    let lineEndIndex = -1;

    const fromStart = selectedLineContent.substring(lineStartIndex);
    const firstNonAlpha = fromStart.match(/[.,\/#!！$%\^&\*;:{}=\-_`~()\n\s]/);
    const firstNonAlphaIndex = fromStart.indexOf(firstNonAlpha);
    lineEndIndex =
      firstNonAlphaIndex === -1
        ? selectedLineContent.length
        : lineStartIndex + firstNonAlphaIndex;

    const selectedText = selectedLineContent.substring(lineStartIndex, lineEndIndex);

    return selectedText;
  }

  const consultDictionary = async (query) => {
    let definition = '';

    await fetch(`./api/hello?term=${query}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(" - - - - - - - - - - - - -");
        console.log(`found ${data.length} entries`);
        console.log(data);
        // console.log(JSON.stringify(data, 0, 2));
        var tmpKanji = "";
        var tmpFurigana = "";
        var tmpEnglish = "";
        var tmpWords = [];

        if (data[0] !== undefined) {
          data[0].japanese.forEach((word, i) => {
            if (word.word !== undefined) {
              tmpWords.push(word.word);
            }
          });
        }
        tmpKanji = tmpWords.join("/");

        if (data[0] !== undefined) {
          tmpFurigana = data[0].japanese[0].reading;
        }

        if (tmpKanji === undefined || tmpKanji === "") {
          console.log("kanji reassigned because undefined or blank string...");
          tmpKanji = tmpFurigana;
        }

        if (data[0] !== undefined) {
          tmpEnglish = data[0].senses[0].english_definitions[0];
        }

        var tmpEnglishWords = [];

        if (data[0] !== undefined) {
          data[0].senses.forEach((sense, i) => {
            sense.english_definitions.forEach((def, j) => {
              if (def !== undefined && def !== "") {
                tmpEnglishWords.push(def);
              }
            });
          });
        }

        if (tmpEnglishWords[1] !== undefined) {
          tmpEnglish = [tmpEnglishWords[0], tmpEnglishWords[1]].join("/");
        }

        tmpEnglish = tmpEnglish.replace(/,/g, " -");
        tmpEnglish = tmpEnglish.replace(/\"/g, " -"); // eslint-disable-line

        var compiledData = "";
        if (tmpKanji === "") {
          compiledData = "Sorry, no items found";
        } else {
          compiledData = `${tmpEnglish},${tmpKanji}/${tmpFurigana}`;
        }

        console.log(" - - - - - - - - - - - - -");
        definition = compiledData; // data;
      });
    return definition;
  }

  const addToPending = async (e, lineIndex, charIndex, char) => {
    const selectedText = getSelectedText(lineIndex, charIndex);

    console.log(selectedText);

    setPending('Loading...');

    const toAddToPending = await consultDictionary(selectedText);

    setPending(toAddToPending);
  }

  return (
    <>
      <Head>
        <title>Japanese Subs Vocab List Builder</title>
        <meta name="description" content="Convert Subs to Japanese/English comma-spaced values (CSV)" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"
          integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous" />
      </Head>

      <main className={styles.main}>
        <div className="container d-flex flex-column" style={{ height: '100%' }} >
          <div className="mx-2">
            <h1 className="mt-3 mb-1" style={{ fontSize: '32px', textAlign: 'center', textDecoration: 'underlined', color: '#787878' }}>Japanese Subs Vocab List Builder</h1>
            <div className="small pb-3" style={{ textAlign: 'center', color: '#787878' }}>Convert Subs to Japanese/English comma-spaced values (CSV)</div>
            {(device === 'iOS' ||
              device === 'Android') ? <div style={{ textAlign: 'center', color: 'red' }}>(This web page is designed for use with desktop browsers)</div> : <></>}

            <div className="mb-3 small">
              Searching every individual word for my animes on jisho.org and formatting them for Anki/Echo Prof was hard, so I built this page to paste subs, and click the words I didn't know. It translates them to auto-build En/Jp vocab lists.<br /> Makes it easy to paste into Anki/Echo Prof, too!
            </div>

          </div>
          <Tooltip
            PopperProps={{
              disablePortal: true,
            }}
            open={sourceMaterial === '' && collection.split('\n').length < 3}
            disableFocusListener
            disableHoverListener
            disableTouchListener
            arrow
            placement="bottom-end"
            title="Step 1. Copy, and paste your article or subtitles here!"
          >
            <TextField
              label="Subtitles:"
              multiline={true}
              rows={3}
              className="m-2"
              value={sourceMaterial}
              onChange={e => setSourceMaterial(e.target.value)}
              variant="filled"
            />
          </Tooltip>
          <div className="text-muted small mx-2">(Subs for Japanese shows can be found at <a href="https://kitsunekko.net/" target="_blank">Kitsunekko's website</a>)</div>
          <Tooltip
            PopperProps={{
              disablePortal: true,
            }}
            open={sourceMaterial !== '' && pending === '' && collection.split('\n').length < 3}
            disableFocusListener
            disableHoverListener
            disableTouchListener
            arrow
            placement="bottom-end"
            title="Step 2. Click the Japanese term you want to study!"
          >
            <div
              id="container-content"
              className="border m-2 p-2"
              style={{ overflowY: "scroll", maxHeight: '300px' }}
              onKeyDown={(e) => handleQuickKeyPress(e)}
              tabIndex="0"
            >
              {sourceMaterial.split('\n').map((line, lineIndex) => {
                return (<span key={`line-${lineIndex}`} style={{ display: 'block' }}>
                  {line.split("").map((char, charIndex) => {
                    return (<span
                      key={`char-${lineIndex}-${charIndex}`}

                      onClick={(event) => {
                        addToPending(event, lineIndex, charIndex, char);
                      }}
                      className="hoverable-char">
                      {char}
                    </span>);
                  })}
                </span>);
              })}
              <br />
              <br />
            </div>
          </Tooltip>
          <TextField
            label="*Clicked vocab will appear here..."
            className="m-2"
            value={pending}
            onKeyDown={(e) => handleKeyPress(e)}
            onChange={e => setPending(e.target.value)}
            variant="filled"
          />
          {/* </Tooltip> */}
          <Tooltip
            PopperProps={{
              disablePortal: true,
            }}
            open={sourceMaterial !== '' && pending !== '' && collection.split('\n').length < 3}
            disableFocusListener
            disableHoverListener
            disableTouchListener
            arrow
            placement="bottom-end"
            title="Step 3. Click 'ADD TERM' to add it to the collection!"
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddTerm}
              className="m-2"
            >
              Add Term
            </Button>
          </Tooltip>
          <TextField
            label={`Collection (${collection === '' ? '0' : collection.split('\n').length}):`}
            multiline={true}
            rows={5}
            className="m-2"
            variant="filled"
            value={collection}
            onChange={e => setCollection(e.target.value)}
          />
          <div className="mx-2 mb-5">
            I encourage you to use your CSV's with <a href="https://www.echoprof.com/" target="_blank">Echo Prof <Image src="/logo192-2.png" alt="Echo Prof" width="32" height="32" style={{ borderRadius: '10px' }} /></a> and/or <a href=" https://www.ankiweb.net/" target="_blank">Anki <Image src="/anki-icon.png" alt="Anki" width="32" height="32" /></a> !
          </div>
          <div className="card pt-3 text-muted">
            <div className="mx-2 small">
              <p>
                *More translations and info for clicked vocab is in the JavaScript console. <a href="#" onClick={() => setMore(true)}>Click here for more info</a>.
              </p>

              {(!more) ? <></> : <div className="card p-1 mb-2">
                <p>To open the JavaScript console and see extra vocab information:</p>

                <ul>
                  <li>Chrome on Windows or macOS: Press Ctrl + Shift + J (Windows) or Cmd + Option + J (macOS) on your keyboard.</li>
                  <li>Firefox on Windows or macOS: Press Ctrl + Shift + K (Windows) or Cmd + Option + K (macOS) on your keyboard.</li>
                </ul>
                <p className="m-0">Once the console is open, you should be able to see and navigate the extra vocab data.</p>
              </div>}
            </div>
            <div className="mx-2">
              <p className="small">
                Ten thousand thanks to <a href="https://kitsunekko.net/" target="_blank">kitsunekko subtitles</a>, <a href="https://www.jisho.org" target="_blank">jisho.org</a> and the <a href="https://www.npmjs.com/package/unofficial-jisho-api" target="_blank">unofficial Jisho API on NPM</a>.
              </p>
              <p className="small">This webpage is open-source, and the code can be found <a href="https://github.com/davidd647/use-unofficial-jisho-api" target="_blank">here</a></p>
            </div>
          </div>
        </div>
      </main >
    </>
  )
}
