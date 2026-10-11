/**
 * Experience Chronological Sorter Utility
 * Week 12 Dynamic Portfolio - Hassaan Ali Akbar
 * 
 * Rules:
 * 1. Current / PRESENT experiences appear first.
 * 2. Otherwise, experiences with the latest ending dates appear first.
 * 3. Older completed experiences appear afterward.
 * 4. When two experiences have the same ending date, use their start dates as a secondary sorting criterion.
 */

export function parseExperiencePeriod(periodStr) {
  if (!periodStr || typeof periodStr !== 'string') {
    return { isCurrent: false, startVal: 0, endVal: 0 };
  }

  const s = periodStr.trim();
  const lower = s.toLowerCase();

  const isCurrent = (
    lower.includes('present') ||
    lower.includes('current') ||
    lower.includes('now') ||
    lower.includes('ongoing')
  );

  const monthMap = {
    jan: 1, january: 1,
    feb: 2, february: 2,
    mar: 3, march: 3,
    apr: 4, april: 4,
    may: 5,
    jun: 6, june: 6,
    jul: 7, july: 7,
    aug: 8, august: 8,
    sep: 9, sept: 9, september: 9,
    oct: 10, october: 10,
    nov: 11, november: 11,
    dec: 12, december: 12
  };

  function parseSegment(seg, fallbackYear = null, defaultMonth = 1) {
    if (!seg) return { year: fallbackYear, month: defaultMonth };
    const segLower = seg.toLowerCase().trim();

    const yearMatch = segLower.match(/\b(19\d\d|20\d\d)\b/);
    const year = yearMatch ? parseInt(yearMatch[1], 10) : fallbackYear;

    let month = defaultMonth;
    for (const [mName, mNum] of Object.entries(monthMap)) {
      if (new RegExp(`\\b${mName}\\b`).test(segLower)) {
        month = mNum;
        break;
      }
    }
    return { year, month };
  }

  const parts = s.split(/\s*(?:—|–|-|\bto\b)\s*/);

  let startVal = 0;
  let endVal = 0;

  if (parts.length >= 2) {
    const endPart = parts[1].trim();
    const startPart = parts[0].trim();

    const endParsed = parseSegment(endPart, null, 12);
    const startParsed = parseSegment(startPart, endParsed.year, 1);

    const sYear = startParsed.year || 2000;
    const sMonth = startParsed.month || 1;
    startVal = sYear * 100 + sMonth;

    if (isCurrent) {
      endVal = 99999999;
    } else {
      const eYear = endParsed.year || sYear;
      const eMonth = endParsed.month || 12;
      endVal = eYear * 100 + eMonth;
    }
  } else {
    const parsed = parseSegment(s);
    const yr = parsed.year || 2000;
    startVal = yr * 100 + parsed.month;
    endVal = isCurrent ? 99999999 : yr * 100 + 12;
  }

  return { isCurrent, startVal, endVal };
}

export function sortExperienceList(list) {
  if (!Array.isArray(list)) return [];
  return [...list].sort((a, b) => {
    const aPeriod = parseExperiencePeriod(a.period);
    const bPeriod = parseExperiencePeriod(b.period);

    // 1. Current / PRESENT experiences appear first
    if (aPeriod.isCurrent && !bPeriod.isCurrent) return -1;
    if (!aPeriod.isCurrent && bPeriod.isCurrent) return 1;

    // If both are current, latest start date first
    if (aPeriod.isCurrent && bPeriod.isCurrent) {
      if (bPeriod.startVal !== aPeriod.startVal) {
        return bPeriod.startVal - aPeriod.startVal;
      }
    }

    // 2. Latest ending dates appear first
    if (bPeriod.endVal !== aPeriod.endVal) {
      return bPeriod.endVal - aPeriod.endVal;
    }

    // 3. When ending dates are equal, latest start date appears first
    if (bPeriod.startVal !== aPeriod.startVal) {
      return bPeriod.startVal - aPeriod.startVal;
    }

    // 4. Stable tie-break by ID or sort_order
    return (a.sort_order || 0) - (b.sort_order || 0);
  });
}
