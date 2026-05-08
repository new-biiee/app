import jupiter from "../assets/JupiterIcon.png";

type JupiterLogoProps = {
    className?: string;
};

export const JupiterLogo: React.FC<JupiterLogoProps> = ({ className }) => {
    return (
        <img
            src={jupiter}
            alt="Jupiter Logo"
            className={className}
            draggable={false}
        />
    );
};