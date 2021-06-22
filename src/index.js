import predictWithContentBased from "./strategies/contentBased";
import prepareVibes from "./preparation/movies";

import { connectDb, getDb } from "./mongo";

var dbVibes;
var dbLikes;
var vibeTags = [];
var tempArray = [];

connectDb(async () => {
  dbVibes = await getDb("vibes");
  dbLikes = await getDb("likes");

  let index = 1;
  let vibeId = null;

  for (let i = 0; i < dbVibes.length; i++) {
    if (dbVibes[i].vibeTags && dbVibes[i].vibeTags.length > 0) {
      vibeId = dbVibes[i]._id;
      let array = dbVibes[i].vibeTags;
      let map = new Map();
      for (let j = 0; j < array.length; j++) {
        tempArray.push(array[j]);
        map.set(index, array[j]);
        index++;
      }
      let inArray = [];
      for (let [key, value] of map) {
        if (tempArray.includes(value)) {
          let object1 = {};
          let ind = tempArray.indexOf(value);
          object1["id"] = ind;
          object1["name"] = value;
          inArray.push(object1);
        } else {
          let object2 = {};
          object2["id"] = key;
          object2["name"] = value;
          inArray.push(object2);
        }
      }
      // if (vibeId !== null) {
      let vibeObject = {};
      vibeObject["vibeTags"] = inArray;
      vibeTags.push(vibeObject);
      // }
    }
  }

  // for (let i = 0; i < vibeTags.length; i++) {
  //   console.log(vibeTags[i]);
  // }

  let Vibes = [];
  for (let i = 0; i < dbVibes.length; i++) {
    if (dbVibes[i].description && dbVibes[i].description.length > 0) {
      Vibes.push(dbVibes[i]);
    }
  }

  const { VIBES_IN_LIST, X } = prepareVibes(Vibes, vibeTags);

  /* ------------------------- */
  //  Content-Based Prediction //
  //  Cosine Similarity Matrix //
  /* ------------------------- */

  console.log("\n");
  console.log("(B) Content-Based Prediction ... \n");

  console.log("(1) Computing Cosine Similarity \n");
  const _id = "600283a289cc6a63ebabf2e4";

  let result = 0;
  for (let i = 0; i < VIBES_IN_LIST.length; i++) {
    if (VIBES_IN_LIST[i]._id == _id) {
      result = i;
    }
  }
  console.log("result", result);
  const contentBasedRecommendation = predictWithContentBased(
    X,
    VIBES_IN_LIST,
    _id
  );

  console.log(`(2) Prediction based on "${_id}" \n`);
  console.log(contentBasedRecommendation);
  // const scoresss = [];
  // let myob = {};
  // let ct = 0;
  // contentBasedRecommendation.forEach((element) => {
  //   if (!scoresss.includes(element.score)) {
  //     scoresss.push(element.score);
  //     Object.assign(myob, { [element.score]: { count: 1 } });
  //   } else {
  //     myob[element.score].count = myob[element.score].count + 1;
  //   }
  // });
  // contentBasedRecommendation.forEach((e) => {
  //   if (
  //     e.score !== Number("-0.9320510869605926") &&
  //     e.score !== Number("0.9999999999999988")
  //   ) {
  //     console.log("this is what im looking odr", e);
  //   }
  // });
  // console.log("object", myob["-0.9320510869605926"]);
  // console.log(scoresss);
  // console.log("scoresss ct", myob);
  // console.log(sliceAndDice(contentBasedRecommendation, MOVIES_BY_ID, 10, true));
});

function sliceAndDice(recommendations, MOVIES_BY_ID, count, onlyTitle) {
  recommendations = recommendations.filter(
    (recommendation) => MOVIES_BY_ID[recommendation.movieId]
  );

  // console.log('score', recommendations);

  recommendations = onlyTitle
    ? recommendations.map((mr) => ({
        title: MOVIES_BY_ID[mr.movieId].title,
        score: mr.score,
      }))
    : recommendations.map((mr) => ({
        movie: MOVIES_BY_ID[mr.movieId],
        score: mr.score,
      }));

  return recommendations.slice(0, count);
}
