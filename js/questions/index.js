/*
 * Quiz topics: one per tool. A topic appears in the quiz once ready is true,
 * which means its question file js/questions/<id>.js exists and has passed
 * the checks. Each question file adds its list to QUESTIONS[<id>].
 *
 * Question format (see CLAUDE.md for the writing rules):
 *   { id: 'magnets-e01', level: 'easy' | 'medium' | 'hard',
 *     q: 'The question',
 *     options: ['four', 'different', 'answer', 'options'],
 *     answer: 0,            // position of the correct option in the list above
 *     why: 'One or two sentences that explain the answer.' }
 */
window.QUESTIONS = window.QUESTIONS || {};
window.QUIZ_TOPICS = [
  { id: 'classify', name: 'Living Things Sorter', level: 3, theme: 'Diversity', ready: true },
  { id: 'materials', name: 'Materials Tester', level: 3, theme: 'Diversity', ready: true },
  { id: 'lifecycles', name: 'Life Cycles', level: 3, theme: 'Cycles', ready: true },
  { id: 'magnets', name: 'Magnets Lab', level: 3, theme: 'Interactions', ready: true },
  { id: 'matter', name: 'States of Matter', level: 4, theme: 'Cycles', ready: true },
  { id: 'shadows', name: 'Light and Shadows', level: 4, theme: 'Energy', ready: true },
  { id: 'heat', name: 'Heat and Temperature', level: 4, theme: 'Energy', ready: true },
  { id: 'plantparts', name: 'Plant Parts', level: 4, theme: 'Systems', ready: true },
  { id: 'digestion', name: 'Digestive Journey', level: 4, theme: 'Systems', ready: true },
  { id: 'watercycle', name: 'Water Cycle and Changes of State', level: 5, theme: 'Cycles', ready: true },
  { id: 'plantrepro', name: 'Plant Reproduction', level: 5, theme: 'Cycles', ready: true },
  { id: 'transport', name: 'Plant Transport', level: 5, theme: 'Systems', ready: true },
  { id: 'heartlungs', name: 'Heart and Lungs', level: 5, theme: 'Systems', ready: true },
  { id: 'cells', name: 'Cells', level: 5, theme: 'Systems', ready: true },
  { id: 'circuits', name: 'Electric Circuits', level: 5, theme: 'Systems', ready: true },
  { id: 'friction', name: 'Friction Ramp', level: 6, theme: 'Interactions: Forces', ready: true },
  { id: 'spring', name: 'Spring Stretch', level: 6, theme: 'Interactions: Forces', ready: true },
  { id: 'gravity', name: 'Drop Race', level: 6, theme: 'Interactions: Forces', ready: true },
  { id: 'energy', name: 'Energy Conversion', level: 6, theme: 'Energy', ready: true },
  { id: 'pendulum', name: 'Swinging Pendulum', level: 6, theme: 'Energy', ready: true },
  { id: 'photosynthesis', name: 'Photosynthesis Lab', level: 6, theme: 'Energy', ready: true },
  { id: 'foodweb', name: 'Food Chain and Food Web', level: 6, theme: 'Interactions: Living things and the environment', ready: true },
  { id: 'adaptations', name: 'Adaptations Explorer', level: 6, theme: 'Interactions: Living things and the environment', ready: true }
];

// Structure checks used by the teacher sheet and the tests. Returns a list of problems (empty if all is well).
window.checkQuestions = function (topicId, list) {
  var problems = [];
  var counts = { easy: 0, medium: 0, hard: 0 };
  var ids = {}, texts = {};
  (list || []).forEach(function (q, i) {
    var name = q.id || ('question ' + (i + 1));
    if (!q.id || q.id.indexOf(topicId + '-') !== 0) problems.push(name + ': id should start with "' + topicId + '-"');
    if (ids[q.id]) problems.push(name + ': id used twice');
    ids[q.id] = true;
    if (counts[q.level] === undefined) problems.push(name + ': level must be easy, medium or hard');
    else counts[q.level] += 1;
    if (!q.q || q.q.length < 12) problems.push(name + ': question text missing or too short');
    var key = (q.q || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    if (texts[key]) problems.push(name + ': same question text as ' + texts[key]);
    texts[key] = name;
    if (!q.options || q.options.length !== 4) problems.push(name + ': needs exactly 4 options');
    else {
      var seen = {};
      q.options.forEach(function (o) {
        var k = String(o).toLowerCase().trim();
        if (!k) problems.push(name + ': empty option');
        if (seen[k]) problems.push(name + ': two options are the same');
        seen[k] = true;
        if (/\b(all|none) of the above\b|\bboth [a-d] and [a-d]\b/i.test(o)) problems.push(name + ': option uses a banned phrase');
      });
    }
    if (typeof q.answer !== 'number' || q.answer < 0 || q.answer > 3 || q.answer !== Math.floor(q.answer)) problems.push(name + ': answer must be 0, 1, 2 or 3');
    if (!q.why || q.why.length < 20) problems.push(name + ': explanation missing or too short');
  });
  ['easy', 'medium', 'hard'].forEach(function (lv) {
    if (counts[lv] < 10) problems.push(topicId + ': only ' + counts[lv] + ' ' + lv + ' questions (needs at least 10)');
  });
  if ((list || []).length < 30) problems.push(topicId + ': only ' + (list || []).length + ' questions (needs at least 30)');
  return problems;
};
