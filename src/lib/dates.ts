// ../../lib/dates.ts

const hungarianMonths = [
  'Január', 'Február', 'Március', 'Április', 'Május', 'Június',
  'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'
];

const hungarianDays = [
  'Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat'
];

/**
 * Returns a short date string in the format: "YYYY. Month Day."
 */
export const shortDate = (timestamp: number | undefined) => {
  if (!timestamp || timestamp < 0) {
    return '';
  }
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = hungarianMonths[date.getMonth()];
  const day = date.getDate();
  return `${year}. ${month} ${day}.`;
};

/**
 * Returns a long date string with time in the format: "YYYY. Month Day. HH:MM"
 */
export const longDate = (timestamp: number | undefined) => {
  if (!timestamp || timestamp < 0) {
    return '';
  }
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = hungarianMonths[date.getMonth()];
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}. ${month} ${day}. ${hours}:${minutes}`;
};

/**
 * Returns a very long date string with weekday and optional time.
 */
export const veryLongDate = (timestamp: number | undefined, noTime = false) => {
  if (!timestamp || timestamp < 0) {
    return '';
  }
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = hungarianMonths[date.getMonth()];
  const day = date.getDate();
  const weekday = hungarianDays[date.getDay()];
  if (noTime) {
    return `${year}. ${month} ${day}., ${weekday}`;
  }
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}. ${month} ${day}., ${weekday} ${hours}:${minutes}`;
};

/**
 * Returns a relative time string for past dates (e.g., "10 perce").
 */
export const date = (postTimestamp: number, style: Intl.RelativeTimeFormatStyle = 'long', since?: number) => {
  const today = since ?? Math.floor((new Date()).getTime() / 1000);
  const dateObj = new Date(postTimestamp * 1000);

  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = month * 12;

  const diff = today - postTimestamp;

  if (diff > year) {
    const years = Math.floor(diff / year);
    return { date: dateObj, label: `${years} éve` }; // "1 éve"
  }

  if (diff > month) {
    const months = Math.floor(diff / month);
    return { date: dateObj, label: `${months} hónapja` }; // "2 hónapja"
  }

  if (diff > week) {
    const weeks = Math.floor(diff / week);
    return { date: dateObj, label: `${weeks} hete` }; // "3 hete"
  }

  if (diff > day) {
    const days = Math.floor(diff / day);
    return { date: dateObj, label: `${days} napja` }; // "4 napja"
  }

  if (diff > hour) {
    const hours = Math.floor(diff / hour);
    return { date: dateObj, label: `${hours} órája` }; // "5 órája"
  }

  if (diff > minute) {
    const minutes = Math.floor(diff / minute);
    return { date: dateObj, label: `${minutes} perce` }; // "10 perce"
  }

  return { date: dateObj, label: `${diff} mp` }; // "30 mp" (másodperc)
};

/**
 * Returns a relative time string for future dates (e.g., "10 perc múlva").
 */
export const dateFuture = (postTimestamp: number, style: Intl.RelativeTimeFormatStyle = 'long', since?: number) => {
  const today = since ?? Math.floor((new Date()).getTime() / 1000);
  const dateObj = new Date(postTimestamp * 1000);

  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = month * 12;

  const diff = postTimestamp - today;

  if (diff > year) {
    const years = Math.floor(diff / year);
    return { date: dateObj, label: `${years} év múlva` }; // "1 év múlva"
  }

  if (diff > month) {
    const months = Math.floor(diff / month);
    return { date: dateObj, label: `${months} hónap múlva` }; // "2 hónap múlva"
  }

  if (diff > week) {
    const weeks = Math.floor(diff / week);
    return { date: dateObj, label: `${weeks} hét múlva` }; // "3 hét múlva"
  }

  if (diff > day) {
    const days = Math.floor(diff / day);
    return { date: dateObj, label: `${days} nap múlva` }; // "4 nap múlva"
  }

  if (diff > hour) {
    const hours = Math.floor(diff / hour);
    return { date: dateObj, label: `${hours} óra múlva` }; // "5 óra múlva"
  }

  if (diff > minute) {
    const minutes = Math.floor(diff / minute);
    return { date: dateObj, label: `${minutes} perc múlva` }; // "10 perc múlva"
  }

  return { date: dateObj, label: `${diff} mp múlva` }; // "30 mp múlva" (másodperc)
};