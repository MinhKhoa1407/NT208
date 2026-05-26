type Props = {
  skills: string[];
};

export default function SkillTags({ skills }: Props) {

  return (
    <div className="flex flex-wrap gap-2 mt-4">

      {skills.map((skill) => (
        <span
          key={skill}
          className="
          px-3
          py-1
          rounded-full
          bg-blue-100
          text-blue-700
          text-sm
          font-medium
          "
        >
          #{skill}
        </span>
      ))}

    </div>
  );
}