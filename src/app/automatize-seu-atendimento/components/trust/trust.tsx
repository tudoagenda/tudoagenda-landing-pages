import Image from "next/image";

import SantanderX from "@/app/automatize-seu-atendimento/assets/santander-x.png";
import FoundersClub from "@/app/automatize-seu-atendimento/assets/founders-club.png";

export const TrustComponent = () => {
  return (
    <div className="flex flex-col items-center w-full px-8 md:px-16 py-16">
      <div className="flex gap-8 p-12 w-full max-w-7xl border-y border-y-purple-200 items-center justify-center">
        <Image
          src={SantanderX}
          width={200}
          height={27}
          alt="Santander X logo"
        />
        <Image
          src={FoundersClub}
          width={141}
          height={80}
          alt="Founders Club logo"
        />
      </div>
    </div>
  );
};
