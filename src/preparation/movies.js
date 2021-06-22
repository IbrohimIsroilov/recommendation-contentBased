import natural from "natural";

natural.PorterStemmer.attach();

function prepareVibes(vibesMetaData, vibesKeywords) {
  console.log("Preparing Movies ... \n");

  console.log("(1) Zipping Movies");
  let VIBES_IN_LIST = zip(vibesMetaData, vibesKeywords);
  VIBES_IN_LIST = withTokenizedAndStemmed(VIBES_IN_LIST, "description");
  VIBES_IN_LIST = fromArrayToMap(VIBES_IN_LIST, "description");

  console.log("(2) Creating Dictionaries");
  let DICTIONARIES = prepareDictionaries(VIBES_IN_LIST);

  // console.log(DICTIONARIES);

  console.log("(3) Extracting Features");
  let X = VIBES_IN_LIST.map(toFeaturizedMovies(DICTIONARIES));

  // console.log("dictionaries", X);

  console.log("(4) Calculating Coefficients");
  let { means, ranges } = getCoefficients(X);

  //console.log("means", means);
  //console.log("ranges", ranges);

  console.log("(6) Scaling Features \n");
  X = scaleFeatures(X, means, ranges);

  //console.log("X", X);

  return {
    VIBES_IN_LIST,
    X,
  };
}

export function scaleFeatures(X, means, ranges) {
  return X.map((row) => {
    return row.map((feature, key) => {
      return (feature - means[key]) / ranges[key];
    });
  });
}

export function getCoefficients(X) {
  const M = X.length;

  const initC = {
    sums: [],
    mins: [],
    maxs: [],
  };

  const helperC = X.reduce((result, row) => {
    if (row.includes("undefined")) {
      return result;
    }

    return {
      sums: row.map((feature, key) => {
        if (result.sums[key]) {
          return result.sums[key] + feature;
        } else {
          return feature;
        }
      }),
      mins: row.map((feature, key) => {
        if (result.mins[key] === "undefined") {
          return result.mins[key];
        }

        if (result.mins[key] <= feature) {
          return result.mins[key];
        } else {
          return feature;
        }
      }),
      maxs: row.map((feature, key) => {
        if (result.maxs[key] === "undefined") {
          return result.maxs[key];
        }

        if (result.maxs[key] >= feature) {
          return result.maxs[key];
        } else {
          return feature;
        }
      }),
    };
  }, initC);

  const means = helperC.sums.map((value) => value / M);
  const ranges = helperC.mins.map((value, key) => helperC.maxs[key] - value);

  return { ranges, means };
}

export function prepareDictionaries(vibes) {
  let vibeTagsDictionary = toDictionary(vibes, "vibeTags");
  let descriptionDictionary = toDictionary(vibes, "description");
  //console.log("vibetags", vibeTagsDictionary);

  vibeTagsDictionary = filterByThreshold(vibeTagsDictionary, 100000000000);
  descriptionDictionary = filterByThreshold(descriptionDictionary, 1);

  //console.log("description", descriptionDictionary);
  //console.log("vibetags", vibeTagsDictionary);

  return {
    vibeTagsDictionary,
    descriptionDictionary,
  };
}

export function toFeaturizedMovies(dictionaries) {
  return function toFeatureVector(vibe) {
    const featureVector = [];

    featureVector.push(
      ...toFeaturizedFromDictionary(
        vibe,
        dictionaries.vibeTagsDictionary,
        "vibeTags"
      )
    );
    featureVector.push(
      ...toFeaturizedFromDictionary(
        vibe,
        dictionaries.descriptionDictionary,
        "description"
      )
    );
    return featureVector;
  };
}

export function toFeaturizedFromDictionary(vibe, dictionary, property) {
  const propertyIds = (vibe[property] || []).map((value) => value.id);
  const isIncluded = (value) => (propertyIds.includes(value.id) ? 1 : 0);
  return dictionary.map(isIncluded);
}

export function filterByThreshold(dictionary, threshold) {
  return Object.keys(dictionary)
    .filter((key) => dictionary[key].count > threshold)
    .map((key) => dictionary[key]);
}

export function toDictionary(array, property) {
  const dictionary = {};

  array.forEach((value) => {
    (value[property] || []).forEach((innerValue) => {
      if (!dictionary[innerValue.id]) {
        dictionary[innerValue.id] = {
          ...innerValue,
          count: 1,
        };
      } else {
        dictionary[innerValue.id] = {
          ...dictionary[innerValue.id],
          count: dictionary[innerValue.id].count + 1,
        };
      }
    });
  });
  return dictionary;
}

export function fromArrayToMap(array, property) {
  //  console.log("array", array);
  return array.map((value) => {
    const transformed = value[property].map((value) => ({
      id: value,
      name: value,
    }));

    return { ...value, [property]: transformed };
  });
}

export function withTokenizedAndStemmed(array, property) {
  return array.map((value) => {
    return {
      ...value,
      [property]: value[property].tokenizeAndStem(),
    };
  });
}

export function zip(vibes, keywords) {
  return Object.keys(vibes).map((vibeId) => ({
    ...vibes[vibeId],
    ...keywords[vibeId],
  }));
}

export default prepareVibes;
