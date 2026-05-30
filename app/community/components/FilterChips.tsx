"use client";

type Props = {
  filters: string[];

  selected: string;

  setSelected: (
    value: string
  ) => void;
};

export default function FilterChips({
  filters,
  selected,
  setSelected,
}: Props) {

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-3">

      {filters.map((item) => (

        <button
          key={item}

          onClick={() =>
            setSelected(item)
          }

          className={`
            px-4
            py-2
            rounded-full
            border
            text-sm
            font-medium
            shadow-sm
            transition-all
            duration-200

            ${
              selected === item

                ? "bg-blue-600 text-white border-blue-600"

                : "bg-white border-gray-200 hover:bg-blue-600 hover:text-white hover:border-blue-600"
            }
          `}
        >
          {item}
        </button>

      ))}

    </div>
  );
}
