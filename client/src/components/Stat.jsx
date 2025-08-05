const Stat = ({info, number, Icon}) => {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 text-center shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
      <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full">
        {Icon}
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-2">
        {number}
      </h3>
      <p className="text-gray-600 font-medium text-base sm:text-lg">{info}</p>
    </div>
  );
};

export default Stat;
