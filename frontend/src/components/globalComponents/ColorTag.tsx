export type TagTone = "green" | "yellow" | "blue" | "pink" | "gray";

const TONES: Record<TagTone, string> = {
  green: "bg-green-100 text-green-700",
  yellow: "bg-yellow-100 text-yellow-700",
  blue: "bg-blue-100 text-blue-700",
  pink: "bg-pink-100 text-pink-700",
  gray: "bg-gray-100 text-gray-700",
};

export default function ColorTag({
  label,
  tone = "gray",
}: {
  label: string;
  tone?: TagTone;
}) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full font-medium text-xs whitespace-nowrap ${TONES[tone]}`}
    >
      {label}
    </span>
  );
}
