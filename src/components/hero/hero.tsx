import { HeaderComponent } from "../header";

export const HeroComponent = () => {
  return (
    <div className="relative flex w-full h-screen items-center">
      <i className="absolute top-0 left-0 z-[1] flex w-full h-screen bg-slate-800 opacity-90" />
      <i
        className="absolute top-0 left-0 z-0 flex w-full h-screen bg-red-500"
        style={{
          backgroundImage: "url('/bg-hero.jpg')",
          backgroundSize: "cover",
        }}
      />
      <div className="flex z-10">
        <HeaderComponent />
      </div>
    </div>
  );
};
