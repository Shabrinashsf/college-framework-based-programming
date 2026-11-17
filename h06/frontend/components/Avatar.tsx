import { avatarColor, initial } from "../lib/view-helpers";

export default function Avatar({
  name,
  size,
}: {
  name: string;
  size?: "sm" | "lg";
}) {
  return (
    <span
      className={size ? `avatar avatar-${size}` : "avatar"}
      style={{ background: avatarColor(name) }}
    >
      {initial(name)}
    </span>
  );
}
