// Display helpers, same as h05 (src/common/view-helpers.ts)

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// Waktu relatif ala Twitter: "now", "5m", "3h", "Jan 15", "Jan 15, 2024"
export function timeAgo(date: Date | string, now: number = Date.now()): string {
  const d = new Date(date);
  const diff = now - d.getTime();

  if (diff < MINUTE) return 'now';
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h`;

  const sameYear = d.getFullYear() === new Date(now).getFullYear();
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

// Tanggal lengkap ala Twitter: "10:30 AM · Jan 15, 2024"
export function fullDate(date: Date | string): string {
  const d = new Date(date);
  const time = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  const day = d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return `${time} · ${day}`;
}

export function isoDate(date: Date | string): string {
  return new Date(date).toISOString();
}

// Huruf pertama nama untuk avatar
export function initial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

const AVATAR_COLORS = [
  '#1d9bf0',
  '#7856ff',
  '#f91880',
  '#00ba7c',
  '#ff7a00',
  '#794bc4',
];

// Warna avatar yang selalu sama untuk nama yang sama
export function avatarColor(name: string): string {
  let hash = 0;
  for (const ch of name.trim().toLowerCase()) {
    hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
