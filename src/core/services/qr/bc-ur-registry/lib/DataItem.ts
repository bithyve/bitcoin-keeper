export class DataItem {
  private tag?: number;
  private data: any;

  constructor(data: any, tag?: number) {
    this.data = data;
    this.tag = tag;
  }

  public setTag = (tag?: number) => {
    this.tag = tag;
  };

  public clearTag = () => {
    this.tag = undefined;
  };

  public getTag = () => {
    return this.tag;
  };

  public getData = () => {
    return this.data;
  };
}
