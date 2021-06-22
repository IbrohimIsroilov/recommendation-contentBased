import {
  getCosineSimilarityRowVector,
  sortByScore,
  getVibeIndexByDescription,
} from "./common";

function predictWithContentBased(X, VIBES_IN_LIST, _id) {
  const { index } = getVibeIndexByDescription(VIBES_IN_LIST, _id);

  // Compute similarities based on input movie
  const cosineSimilarityRowVector = getCosineSimilarityRowVector(X, index);

  // Enrich the vector to convey all information
  // Use references from before which we kept track of
  const contentBasedRecommendation = cosineSimilarityRowVector.map(
    (value, key) => ({
      score: value,
      vibeId: VIBES_IN_LIST[key]._id,
    })
  );

  return sortByScore(contentBasedRecommendation);
}

export default predictWithContentBased;
