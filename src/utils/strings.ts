export const addSpaceIfCamelCase = (str: string) =>
  str.replace(/([a-z])([A-Z])/g, '$1 $2');

export const replaceUnderscoreIfSnakeCase = (str: string) =>
  str.replace(/_/g, ' ');

export const capitalizeFirstLetter = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const truncateText = (str: string, length: number) => {
  if (!str || str === '') return '';

  return str.length > length ? `${str.substring(0, length)}...` : str;
};

export const createSimilarString = (str: string) => {
  const shuffled = str
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');

  return shuffled;
};

const fallbackCopyTextToClipboard = (text: string) => {
  const textArea = document.createElement('textarea');
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.position = 'fixed';

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  document.body.removeChild(textArea);
};

export const copyTextToClipboard = async (text: string) => {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  await navigator.clipboard.writeText(text);
};

const wordsVector = (str: string) => {
  const words = str.split(' ');
  const vector: any = {};
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (vector[word]) {
      vector[word] += 1;
    } else {
      vector[word] = 1;
    }
  }
  return vector;
};

export const cosineSimilarity = (a: string, b: string) => {
  const vectorA = wordsVector(a.trim());
  const vectorB = wordsVector(b.trim());

  const vectorAKeys = Object.keys(vectorA);
  const vectorBKeys = Object.keys(vectorB);

  const union = vectorAKeys.concat(vectorBKeys);

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < union.length; i++) {
    const key = union[i];
    const valueA = vectorA[key] || 0;
    const valueB = vectorB[key] || 0;
    dotProduct += valueA * valueB;
    magnitudeA += valueA * valueA;
    magnitudeB += valueB * valueB;
  }

  return dotProduct / Math.sqrt(magnitudeA * magnitudeB);
};

export const getFirstCharacters = (str: string) => {
  const words = str.trim().split(' ');
  if (words.length === 1) {
    return words[0].charAt(0);
  } else {
    return words[0].charAt(0) + words[1].charAt(0);
  }
};
