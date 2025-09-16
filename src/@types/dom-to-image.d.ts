declare module 'dom-to-image' {
  const content: {
    toPng(node: Node, opts?: any): Promise<string>;
  };
  export default content;
}

