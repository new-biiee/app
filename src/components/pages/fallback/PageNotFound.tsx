import {
  ArrowLeftFromLine,
  Rocket
} from "lucide-react";

export const PageNotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full text-white">
      <div className="flex items-center justify-center p-10">
        <Rocket size={64} color="#3ef4ff" />
      </div>
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-md text-white/75 mb-6">The page you are looking for does not exist.</p>
      <a href="/" className="px-4 py-2 bg-cyan-400 rounded-lg text-[14px] font-medium transition-transform transform hover:scale-105"
        style={{ "color": "rgb(36, 39, 39)", "fontWeight": "bold", "fontFamily": "monospace" }}
      >
        <ArrowLeftFromLine size={18} className="inline-block mr-2" />
        Go Back Home
      </a>
    </div>
  );
}