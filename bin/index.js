#! /usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
const argv = yargs(hideBin(process.argv)).argv;
import { showHelp, showAll, parseSentence, parseLanguage } from "./utils.js";
import chalk from "chalk";
import boxen from "boxen";
import translate from "@vitalets/google-translate-api";

console.log(argv);
if (argv.l || argv.languages) {
  showAll();

  process.exit();
}

if (!argv._.length) {
  showHelp();

  process.exit();
}

let language = "";

// stores the language.
if (argv._.length) language = argv._[0].toLowerCase();

// parsing the language specified to the ISO-639-1 code.
language = parseLanguage(language);

console.log(language);

let sentence = parseSentence(argv._);
const usage = chalk.hex("#83aaff")(
  "\\nUsage: tran <lang_name> sentence to be translated"
);

yargs(hideBin(process.argv))
  .usage(usage)
  .option("l", {
    alias: "languages",
    describe: "List all supported languages.",
    type: "boolean",
    demandOption: false,
  })
  .help(true).argv;

if (sentence == "") {
  console.error("\nThe entered sentence is like John Cena, I can't see it!\n");
  console.log("Enter trboan --help to get started.\n");
  process.exit();
}

translate(sentence, { to: language })
  .then((res) => {
    console.log(
      "\n" +
        boxen(chalk.green("\n" + res.text + "\n"), {
          padding: 1,
          borderColor: "green",
          dimBorder: true,
        }) +
        "\n"
    );
  })
  .catch((err) => {
    console.error(err);
  });
