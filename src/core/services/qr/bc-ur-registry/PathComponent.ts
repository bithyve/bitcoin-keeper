export class PathComponent {
  public static readonly HARDENED_BIT = 0x80000000;

  private index?: number;
  private wildcard: boolean;
  private hardened: boolean;

  constructor(args: { index?: number; hardened: boolean }) {
    this.index = args.index;
    this.hardened = args.hardened;

    if (this.index !== undefined) {
      this.wildcard = false;
    } else {
      this.wildcard = true;
    }

    if (this.index && (this.index & PathComponent.HARDENED_BIT) !== 0) {
      throw new Error(
        `#[ur-registry][PathComponent][fn.constructor]: Invalid index ${this.index} - most significant bit cannot be set`,
      );
    }
  }

  public getIndex = () => this.index;
  public isWildcard = () => this.wildcard;
  public isHardened = () => this.hardened;
}
