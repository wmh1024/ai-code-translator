interface Props {
  baseUrl: string;
  onChange: (baseUrl: string) => void;
}

export const BaseUrlInput: React.FC<Props> = ({baseUrl = "https://ai.wmhwiki.cn/api", onChange}) => {
  return (
    <input
      className="mt-1 h-[24px] w-[280px] rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
      placeholder="OpenAI Base Url"
      value={baseUrl}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};
