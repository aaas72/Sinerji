import StarRating from "../StarRating";

type RecommendationCardProps = {
  text: string;
  recommenderName: string;
  recommenderTitle: string;
  rating: number;
  index: number;
};

export default function RecommendationCard({
  text,
  recommenderName,
  recommenderTitle,
  rating,
  index,
}: RecommendationCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#f1f0ea] p-6 shadow-2xs hover:shadow-sm transition-all relative overflow-hidden flex flex-col md:flex-row gap-6">
      {/* Left Side: Index & Text */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-lg bg-[#004d40]/5 flex items-center justify-center text-xs font-bold text-[#004d40] select-none">
            #{index}
          </span>
          <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest select-none">Geri Bildirim</span>
        </div>
        <p className="text-sm text-gray-650 leading-relaxed italic">"{text}"</p>
      </div>

      {/* Right Side: Recommender Info & Rating */}
      <div className="md:w-64 md:pl-6 md:border-l md:border-[#f1f0ea] flex flex-col justify-center space-y-4">
        <div>
          <p className="text-[9px] font-extrabold text-[#004d40] uppercase tracking-wider mb-1.5 select-none">Tavsiye Eden</p>
          <p className="font-bold text-gray-900 text-sm leading-snug">{recommenderName}</p>
          <p className="text-xs text-gray-400 font-semibold leading-normal mt-0.5">{recommenderTitle}</p>
        </div>
        <div>
          <p className="text-[9px] font-extrabold text-[#e28743] uppercase tracking-wider mb-2 select-none">Değerlendirme</p>
          <StarRating rating={rating} />
        </div>
      </div>
    </div>
  );
}
