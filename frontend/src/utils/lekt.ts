import { Phrase, Voice } from "types";

// TODO 22/03/20 psacawa: because JS regex doesn't have support for diacritics \w,
// we have to hardcode by language the diacritics that are used.
// Get a better solution PLEASE, this is prime cruft
const diacriticMap: Record<string, string> = {
  en: "",
  es: "áñéííóúü",
  fr: "àâçéèêëîïôöúùûü",
  ru: "фисвуапршолдьтщзйкыегмцчня",
  pt: "áÁàâÂãçéÉèêíÍîôõóÓúÚü",
  de: "àâäÄéêñöÖßüÜ",
  pl: "áâäąčçćĆéÉëęíłŁńôöóšŠşśŚúüÜźŹżŻ",
  nl: "áàâÅäçéèêëíîïñôöóúûü",
};

export function getAudioUrl(voice: Voice, phrase: Phrase) {
  const domain = process.env.REACT_AUDIO_CDN_DOMAIN;
  const lid = voice.aid.slice(0, 2);
  console.log(`lid=${lid}`);
  const diacritics = diacriticMap[lid];
  const regex = new RegExp(`[^\\w${diacritics}]+`, "g");
  console.log(regex);
  const urlPhraseText = phrase.text.replace(regex, "-");
  const name = voice.name;
  return `https://${domain}/${name}/${urlPhraseText}.mp3`;
}
