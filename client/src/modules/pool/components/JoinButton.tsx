export const JoinPoolButton = ({ onClick, loading }: any) => (
  <button
    onClick={onClick}
    disabled={loading}
    className="w-full mt-5 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg"
  >
    {loading ? "Joining..." : "Join Pool"}
  </button>
);