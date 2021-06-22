import similarity from "compute-cosine-similarity";

export function sortByScore(recommendation) {
  return recommendation.sort((a, b) => b.score - a.score);
}

// X x 1 row vector based on similarities of movies
// 1 equals similar, -1 equals not similar, 0 equals orthogonal
// Whole matrix is too computational expensive for 45.000 movies
// https://en.wikipedia.org/wiki/Cosine_similarity
export function getCosineSimilarityRowVector(matrix, index) {
  return matrix.map((rowRelative, i) => {
    return similarity(matrix[index], matrix[i]);
  });
}

export function getVibeIndexByDescription(VIBES_IN_LIST, query) {
  // console.log("object, ", VIBES_IN_LIST);
  // const vibes = VIBES_IN_LIST.map((vibe) => vibe._id).indexOf(query);

  // if (!index) {
  //   throw new Error("Movie not found");
  // }
  // //console.log("index", index);

  // // const { description, id } = VIBES_IN_LIST[index];
  let index = 301;
  return { index };
}
