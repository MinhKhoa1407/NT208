type Props = {
  match: number;
};

export default function MatchProgress({ match }: Props) {

  return (
    <div className="mt-5">

      <div className="flex justify-between mb-2">

        <span className="text-sm font-medium text-gray-600">
          Match Score
        </span>

        <span className="text-sm font-bold text-blue-600">
          {match}%
        </span>

      </div>

      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">

        <div
          className="
          h-full
          bg-gradient-to-r
          from-blue-500
          to-indigo-600
          rounded-full
          transition-all
          duration-500
          "
          style={{ width: `${match}%` }}
        />

      </div>

    </div>
  );
}