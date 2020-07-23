interface Muze {
  (): Promise<any>;
  [property: string]: any;
}

declare const muze: Muze;

export default muze;
