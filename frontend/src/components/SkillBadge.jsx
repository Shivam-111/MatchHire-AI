export default function SkillBadge({ skill, type = "default" }) {
  const getTypeStyles = () => {
    switch (type) {
      case "matched":
        return "bg-green-100 text-green-700 border-green-200";
      case "missing":
        return "bg-red-100 text-red-700 border-red-200";
      case "recommended":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getTypeStyles()}`}
    >
      {skill}
    </span>
  );
}

