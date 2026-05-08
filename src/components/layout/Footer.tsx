import React, { useEffect, useState } from "react";
import {
    m,
} from "framer-motion";
import {
    Package
} from "lucide-react";
import { Link } from "react-router-dom";

const BRAND = {
    green: "#3ef4ff",
    pink: "#3ef4ff",
    blue: "#3ef4ff",
    black: "#000000",
};

const MONO_FONT = '"Space Mono", "JetBrains Mono", monospace';

const GithubIcon = ({ size = 20 }: { size?: number }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
);

const XIcon = ({ size = 20 }: { size?: number }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.49h2.039L6.486 3.24H4.298l13.311 17.403z" />
    </svg>
);

const PanelOptions = [
    {
        key: "docs",
        label: "Documentation",
        href: "/documentation/overview/what-is-carnot",
    },
    // {
    //     key: "sdk",
    //     label: "@carnot-zk/sdk",
    //     href: "https://www.npmjs.com/package/@carnot-zk/sdk",
    // },
    {
        key: "audit",
        label: "Audit Report",
        href: "#",
    },
    {
        key: "security",
        label: "Security Policy",
        href: "#",
    },
]

export const Footer: React.FC = () => {
    const [utcTime, setUtcTime] = useState("");

    useEffect(() => {
        const updateUtc = () => {
            const now = new Date();
            setUtcTime(now.toISOString().replace("T", " ").slice(0, 19) + " UTC");
        };

        updateUtc();
        const timer = setInterval(updateUtc, 1000);

        return () => clearInterval(timer);
    }, []);
    return (
        <footer
            className="max-w-7xl mx-auto px-6 md:px-10 py-10 md:pt-16 md:pb-10 border-t"
            style={{ borderColor: "rgba(255,255,255,0.12)" }}
        >
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-15">
                <div>
                    <div
                        className="text-3xl font-black tracking-[-0.06em]"
                        style={{ color: BRAND.green }}
                    >
                        CARNOT
                    </div>
                    <p
                        className="mt-3 text-sm text-white/72"
                        style={{ fontFamily: MONO_FONT }}
                    >
                        Precision Engineering | Cryptographic Finality
                    </p>
                </div>

                <div className="space-y-2" style={{ fontFamily: MONO_FONT }}>
                    {PanelOptions.map(
                        (option) => (
                            <a
                                key={option.key}
                                href={option.href}
                                className="group block text-sm text-white/78 w-fit"
                            >
                                {option.label}
                                <span
                                    className="block h-[1px] w-0 group-hover:w-full transition-all"
                                    style={{ background: BRAND.pink }}
                                />
                            </a>
                        ),
                    )}
                </div>

                <div style={{ fontFamily: MONO_FONT }}>
                    <div className="flex items-center gap-2 text-sm mb-3">
                        <m.span
                            animate={{ opacity: [0.35, 1, 0.35] }}
                            transition={{
                                duration: 1.4,
                                repeat: Infinity,
                                type: "tween",
                                stiffness: 120,
                                damping: 14,
                            }}
                            className="inline-block w-2.5 h-2.5 rounded-full"
                            style={{ background: BRAND.green }}
                        />
                        <span>NETWORK: OPERATIONAL</span>
                    </div>
                    <p className="text-xs text-white/65">{utcTime}</p>

                    <div className="flex items-center gap-4 mt-6">
                        <a
                            href="https://github.com/carnot-zk"
                            className="text-white/60 transition-colors mb-0.5"
                            style={{ transition: "color 0.2s" }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = BRAND.green)}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "")}
                            aria-label="GitHub"
                        >
                            <GithubIcon size={20} />
                        </a>
                        <a
                            href="#"
                            className="text-white/60 transition-colors"
                            style={{ transition: "color 0.2s" }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = BRAND.green)}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "")}
                            aria-label="X (Twitter)"
                        >
                            <XIcon size={18} />
                        </a>
                        <div>
                            <Link
                                to="https://www.npmjs.com/package/@carnot-zk/sdk"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-sm text-white/78 mt-1 transition-colors"
                                style={{ fontFamily: MONO_FONT }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = BRAND.green)}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "")}
                            >
                                <Package size={22} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div
                className="mt-10 pt-6 border-t text-xs text-white/55"
                style={{
                    borderColor: "rgba(255,255,255,0.08)",
                    fontFamily: MONO_FONT,
                }}
            >
                Copyright © 2026 CARNOT
            </div>
        </footer>
    );
};