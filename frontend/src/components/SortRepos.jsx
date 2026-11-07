const BUTTONS = [
  { type: "recent", text: "Most Recent" },
  { type: "stars", text: "Most Stars" },
  { type: "forks", text: "Most Forks" },
];

const SortRepos = ({ onSort, sortType }) => {
  return (
    <div className="flex flex-wrap justify-center lg:justify-end">
      {BUTTONS.map((button) => (
        <button
          key={button.type}
          type="button"
          className={`py-2.5 px-5 me-2 mb-2 text-xs sm:text-sm font-medium focus:outline-none rounded-lg bg-glass ${
            sortType === button.type ? "border-accent" : ""
          }`}
          onClick={() => onSort(button.type)}
        >
          {button.text}
        </button>
      ))}
    </div>
  );
};

export default SortRepos;
