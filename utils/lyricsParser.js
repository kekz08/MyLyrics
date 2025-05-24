import { parse } from 'node-html-parser';

export const extractLyricsFromHTML = (html) => {
  try {
    const root = parse(html);

    // Modern Genius layout: lyrics in <div data-lyrics-container="true">
    const lyricsDivs = root.querySelectorAll('[data-lyrics-container="true"]');
    if (lyricsDivs.length > 0) {
      return lyricsDivs.map(div => div.text.trim()).join('\n\n');
    }

    // Legacy Genius layout: lyrics in <div class="lyrics">
    const legacyDiv = root.querySelector('.lyrics');
    if (legacyDiv) {
      return legacyDiv.text.trim();
    }

    return 'Lyrics not found';
  } catch (error) {
    console.error('Error parsing lyrics:', error);
    return 'Error parsing lyrics';
  }
}; 