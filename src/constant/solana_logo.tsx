import solana_Img from "../assets/solana_logo.png";

type SolanaSVGLogoProps = {
    className?: string;
};

export const SolanaSVGLogo: React.FC<SolanaSVGLogoProps> = ({ className }) => {
    return (
        <img
            src={solana_Img}
            alt="Solana Logo"
            className={className}
            draggable={false}
        />
    );
};