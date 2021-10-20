import axios from "axios";
import cheerio from "cheerio";

const animeUrl = "https://nontonanimeid.com/";

const slugify = (title) => {
  const cleanned = title.replace(/[\W_]+/g, " ");

  const splitAndLowerCase = cleanned.trim().toLowerCase().split(" ");
  const joinWithHypen = splitAndLowerCase.join("-");

  return joinWithHypen;
};

const searchAnimeHTML = async (query) => {
  const { data } = await axios.get(`${animeUrl}?s=${query}`);

  return data;
};

const getSearchResults = (searchHTML) => {
  const $ = cheerio.load(searchHTML);

  const results = $("div.result ul li");

  if (!results.html()) {
    throw new Error("Anime not found!");
  } else {
    return results;
  }
};

const parseSearchResults = (searchResults) => {
  let animeList = [];

  for (let i = 0; i < searchResults.length; i++) {
    const $ = cheerio.load(searchResults[i]);

    let anime = {
      title: "",
      url: "",
    };

    anime.url = $("a").attr("href");
    anime.title = $("h2").text();

    animeList.push(anime);
  }

  return animeList;
};

const fetchAnimePage = async (animeUrl) => {
  const { data } = await axios.get(animeUrl);

  return data;
};

const getAnimeEpisodes = (animePage) => {
  let animeEpisodes = {
    first: {
      episode: -1,
      url: "",
    },
    last: {
      episode: -1,
      url: "",
    },
  };

  const $ = cheerio.load(animePage);

  const episodeTags = $("div.latestepisode a");

  if (episodeTags.length > 1) {
    const firstEpisodeTag = cheerio.load(episodeTags[0]);
    const lastEpisodeTag = cheerio.load(episodeTags[1]);

    const firstEpisode = firstEpisodeTag.text().split(" ")[1];
    const lastEpisode = lastEpisodeTag.text().split(" ")[1];

    animeEpisodes.first.episode =
      firstEpisode > lastEpisode ? lastEpisode : firstEpisode;
    animeEpisodes.last.episode =
      lastEpisode > firstEpisode ? lastEpisode : firstEpisode;
  } else {
    const firstEpisodeTag = cheerio.load(episodeTags[0]);

    const firstEpisode = firstEpisodeTag.text().split(" ")[1];
    const episodeUrl = episodeTags[0].attribs["href"];

    animeEpisodes.first.episode = firstEpisode;
    animeEpisodes.first.url = episodeUrl;
  }

  return animeEpisodes;
};

const fetchEpisodePage = async (episode, episodes, animeTitle) => {
  const animeSlug = slugify(animeTitle);

  if (episodes.last.episode === -1) {
    const { data } = await axios.get(`${animeUrl}${animeSlug}`);

    console.log(data);
    return data;
  } else {
    const { data } = await axios.get(`${animeUrl}${animeSlug}-${episode}`);

    console.log(data);
    return data;
  }
};

const getEpisodeVideoUrls = (episodePage) => {
  let videoUrls = [];

  const $ = cheerio.load(episodePage);
  const videoTags = $("video source");

  console.log(videoTags);

  for (let i = 0; i < videoTags.length; i++) {
    const videoUrl = videoTags[i].attribs["src"];
    const videoQuality = videoTags[i].attribs["size"];

    const video = {
      url: videoUrl,
      quality: videoQuality,
    };

    videoUrls.push(video);
  }

  if (videoUrls.length === 0) {
    throw new Error("Video broken!");
  }
  console.log(videoUrls);
};

const html = await searchAnimeHTML("kimetsu");
const searchResult = getSearchResults(html);
const animeList = parseSearchResults(searchResult);
const animePage = await fetchAnimePage(animeList[0].url);
const episodes = getAnimeEpisodes(animePage);
const episodePage = await fetchEpisodePage(1, episodes, animeList[0].title);
getEpisodeVideoUrls(episodePage);

// console.log(animeList);
// console.log(episodes);
