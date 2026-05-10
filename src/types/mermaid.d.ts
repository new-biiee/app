declare module 'mermaid' {
  export interface MermaidConfig {
    startOnLoad?: boolean;
    theme?: string;
    themeVariables?: Record<string, string>;
    [key: string]: any;
  }

  export interface RenderResult {
    svg: string;
    [key: string]: any;
  }

  const mermaid: {
    initialize(config: MermaidConfig): void;
    render(id: string, code: string): Promise<RenderResult>;
    contentLoaded(): void;
    [key: string]: any;
  };

  export default mermaid;
}
