export const PROJECT_EMOJIS = [
  '8986',
  '9200',
  '128204',
  '127773',
  '127891',
  '127947',
  '128076',
  '128077',
  '128187',
  '128188',
  '128512',
  '128522',
  '128578',
  '128421',
  '9855',
  '127752',
  '128030',
  '128018',
  '129302',
  '9997',
  '129313',
];

export const PROJECT_EMOJI_OPTIONS = PROJECT_EMOJIS.map((code) => ({
  label: String.fromCodePoint(parseInt(code, 10)),
  value: code,
}));
