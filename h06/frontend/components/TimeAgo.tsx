import { fullDate, isoDate, timeAgo } from "../lib/view-helpers";

export default function TimeAgo({ date }: { date: string }) {
  return (
    <time dateTime={isoDate(date)} title={fullDate(date)}>
      {timeAgo(date)}
    </time>
  );
}
