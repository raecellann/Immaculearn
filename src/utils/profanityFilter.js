// Profanity filter utility for censoring inappropriate language
const profanityFilter = {
  // List of profane words (lowercase for case-insensitive matching)
  profaneWords: [
    // English profanity
    'fuck', 'fucking', 'fucked', 'fuckers', 'fucker',
    'shit', 'shitting', 'shitted', 'shits', 'shitter',
    'damn', 'damned', 'damning',
    'bitch', 'bitches', 'bitching', 'bitched',
    'bastard', 'bastards',
    'ass', 'asses', 'asshole', 'assholes', 'assholing',
    'crap', 'crappy', 'crapped', 'crapping',
    'dick', 'dicks', 'dickhead', 'dickheads',
    'piss', 'pissing', 'pissed', 'pisser',
    'cunt', 'cunts', 'cunting', 'cunted',
    'whore', 'whores', 'whoring', 'whored',
    'slut', 'sluts', 'slutting', 'slutted',
    'cock', 'cocks', 'cocksucker', 'cocksuckers',
    'pussy', 'pussies',
    'twat', 'twats',
    'wanker', 'wankers', 'wanking', 'wanked',
    'bollocks', 'bollock',
    'bugger', 'buggers', 'buggering', 'buggered',
    'goddamn', 'goddamned',
    'motherfucker', 'motherfuckers', 'motherfucking',
    'son of a bitch', 'sonofabitch',
    // Common variations and misspellings
    'f*ck', 'fck', 'fuk', 'f*cking', 'fcking',
    'sh*t', 'sh*tting', 'sh1t',
    'a$$', 'a$$hole', 'a$$es',
    'b*tch', 'b1tch',
    'c*nt', 'c*nts',
    'd*ck', 'd*cks',
    // Filipino profanity (comprehensive list)
    'putang ina', 'puta', 'putangina', 'tinapay',
    'gago', 'gaga', 'gago ka', 'gaga ka', 'gagong', 'gaga',
    'gagu', 'gagi', 'gagui', 'gag0', 'g4go', 'g4gu', 'g4gi',
    'bobo', 'bobo ka', 'bobong', 'boba', 'boba ka', 'b0b0', 'b0b0ng',
    'tanga', 'tanga ka', 'tangang', 'tanga', 't0nga', 't4nga',
    'ulol', 'ulol ka', 'ululing', 'sira ulo', 'siraulo', 'sira ulo ka', 'ul0l',
    'pakshet', 'pakyu', 'pakyu ka', 'pakyu mo', 'pakyu', 'p@kyu', 'p@kshet',
    'leche', 'leche ka', 'leche mo', 'leches', 'l3che', 'l3ches',
    'hinayupak', 'hayop ka', 'hayup ka', 'hinayupak ka', 'h1n4yup4k',
    'buwisit', 'buwisit ka', 'buwisit mo', 'buw1s1t',
    'punyeta', 'punyeta ka', 'punyetas', 'puny3t4',
    'tarantado', 'tarantado ka', 'tarantada', 't4r4nt4d0',
    'pucha', 'pucha ka', 'puchang', 'puchang',
    'animal', 'animal ka', 'animal', '4n1m4l',
    'amp', 'ampota', 'ampotahin', 'amputa', '4mp', '4mp0t4',
    'yawa', 'yawaka', 'yawa', 'y4w4',
    'kagwang', 'kagwang ka', 'k4gw4ng',
    'pesteng yawa', 'pesteng', 'p3st3ng y4w4',
    'lintik', 'lintik ka', 'l1nt1k',
    'buwisit', 'buwisit ka', 'buw1s1t',
    'gago', 'gaga', 'gagong', 'g4go', 'g4ga',
    'tangina', 'tangina mo', 'tanginamo', 't4ng1n4',
    'punyemas', 'punyemas ka', 'puny3m4s',
    'shunga', 'shunga ka', 'shungang', 'shung4',
    'baliw', 'baliw ka', 'baliw', 'b4l1w',
    'abnoy', 'abnoy ka', '4bn0y',
    'engot', 'engot ka', 'engot', '3ng0t',
    'pangit', 'pangit ka', 'panget', 'p4ng1t', 'p4ng3t',
    'itlog', 'itlog mo', 'itlog', '1tl0g',
    'puke', 'puki', 'puking', 'puki mo', 'puk1', 'puk1ng',
    'titi', 'tite', 'tite mo', 'titing', 't1t1', 't1t1ng', 't1t3',
    'kantot', 'kantot mo', 'kantutan', 'k4nt0t', 'k4nt0t4n',
    'burat', 'burat mo', 'burating', 'bur4t', 'bur4t1ng',
    'pekpek', 'pekpek mo', 'pekpeking', 'p3kp3k', 'p3kp3k1ng',
    'bilat', 'bilat mo', 'bilating', 'b1l4t', 'b1l4t1ng',
    'kiki', 'kiki mo', 'kiking', 'k1k1', 'k1k1ng',
    // Additional variations and similar-sounding words
    'gagi', 'gag0', 'g4g1', 'gagu', 'gagui', 'gag0',
    'gag0 ka', 'gagi ka', 'gagu ka', 'gagui ka',
    'bobong', 'bobong ka', 'b0b0ng', 'b0b0ng k4',
    'tangang', 'tangang ka', 't4ng4ng', 't4ng4ng k4',
    'ululing', 'ululing ka', 'ul0ling', 'ul0ling k4',
    'gagong', 'gagong ka', 'g4g0ng', 'g4g0ng k4',
    // Common Filipino curse phrases
    'putang ina mo', 'putang ina ninyo', 'putang ina nya',
    'gago ka talaga', 'gaga ka talaga', 'bobong ka',
    'tanga ka talaga', 'ulol ka talaga', 'tarantado ka talaga',
    'leche ka talaga', 'punyeta ka talaga', 'pakshet ka talaga',
    'animal ka talaga', 'hayop ka talaga', 'hinayupak ka talaga',
    'buwisit ka talaga', 'yawa ka talaga', 'lintik ka talaga',
    'gagu ka talaga', 'gagi ka talaga', 'gagui ka talaga',
    // Variations and misspellings
    'put@ng', 'put@ng ina', 'put@ngina', 'put@ng ina mo',
    'g@go', 'g@g@', 'g@g0', 'g@g0 ka', 'g@gu', 'g@gi',
    'b0b0', 'b0b0 ka', 'b0b0ng', 'b0ba',
    't@nga', 't@nga ka', 't@ng@', 't@ngang',
    'ul0l', 'ul0l ka', 's1r4 ul0', 's1r4ul0', 'ul0ling',
    'p@kyu', 'p@kyu ka', 'p@kshet', 'p@kshet ka',
    'l3che', 'l3che ka', 'l3ches',
    'h1n4yup4k', 'h4y0p k4', 'h1n4yup4k k4',
    'buw1s1t', 'buw1s1t ka', 'buw1s1t mo',
    'puny3t4', 'puny3t4 ka', 'puny3t4s',
    't4r4nt4d0', 't4r4nt4d0 ka', 't4r4nt4d4',
    'y4w4', 'y4w4k4', 'y4w4',
    'k4gw4ng', 'k4gw4ng k4',
    'p3st3ng y4w4', 'p3st3ng',
    'l1nt1k', 'l1nt1k k4',
    'g4gu', 'g4gi', 'g4gu1', 'g4g1 k4', 'g4gu k4',
    // Common curse phrases
    'fuck you', 'fuck off', 'go fuck yourself',
    'shit happens', 'holy shit', 'oh shit',
    'what the fuck', 'what the hell', 'what the hell',
    'son of a bitch', 'bastard',
  ],

  /**
   * Check if a text contains profane words
   * @param {string} text - Text to check
   * @returns {boolean} - True if profanity is detected
   */
  containsProfanity(text) {
    if (!text || typeof text !== 'string') return false;
    
    const lowerText = text.toLowerCase();
    
    return this.profaneWords.some(word => {
      // Check for exact word matches or substrings
      return lowerText.includes(word);
    });
  },

  /**
   * Censor profane words in text by replacing them with asterisks
   * @param {string} text - Text to censor
   * @param {string} censorChar - Character to use for censoring (default: '*')
   * @returns {string} - Censored text
   */
  censorText(text, censorChar = '*') {
    if (!text || typeof text !== 'string') return text;
    
    let censoredText = text;
    
    // Sort words by length (longest first) to handle overlapping words
    const sortedWords = [...this.profaneWords].sort((a, b) => b.length - a.length);
    
    sortedWords.forEach(word => {
      const regex = new RegExp(this.escapeRegExp(word), 'gi');
      censoredText = censoredText.replace(regex, (match) => {
        return censorChar.repeat(match.length);
      });
    });
    
    return censoredText;
  },

  /**
   * Get list of profane words found in text
   * @param {string} text - Text to analyze
   * @returns {array} - Array of profane words found
   */
  getProfaneWords(text) {
    if (!text || typeof text !== 'string') return [];
    
    const lowerText = text.toLowerCase();
    const foundWords = [];
    
    this.profaneWords.forEach(word => {
      if (lowerText.includes(word)) {
        foundWords.push(word);
      }
    });
    
    return [...new Set(foundWords)]; // Remove duplicates
  },

  /**
   * Check if text is clean (no profanity)
   * @param {string} text - Text to check
   * @returns {boolean} - True if text is clean
   */
  isClean(text) {
    return !this.containsProfanity(text);
  },

  /**
   * Escape special regex characters
   * @param {string} string - String to escape
   * @returns {string} - Escaped string
   */
  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  },

  /**
   * Add custom profane words to the filter
   * @param {array|string} words - Words to add
   */
  addWords(words) {
    const wordsToAdd = Array.isArray(words) ? words : [words];
    wordsToAdd.forEach(word => {
      const lowerWord = word.toLowerCase();
      if (!this.profaneWords.includes(lowerWord)) {
        this.profaneWords.push(lowerWord);
      }
    });
  },

  /**
   * Remove words from the profanity filter
   * @param {array|string} words - Words to remove
   */
  removeWords(words) {
    const wordsToRemove = Array.isArray(words) ? words : [words];
    wordsToRemove.forEach(word => {
      const lowerWord = word.toLowerCase();
      const index = this.profaneWords.indexOf(lowerWord);
      if (index > -1) {
        this.profaneWords.splice(index, 1);
      }
    });
  }
};

export default profanityFilter;
