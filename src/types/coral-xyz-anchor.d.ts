declare module '@coral-xyz/anchor' {
  export class AnchorProvider {
    constructor(connection: any, wallet: any, opts?: any);
    connection: any;
    wallet: any;
  }

  export class Program {
    constructor(idl: any, provider: any);
    account: any;
    instruction: any;
    methods: any;
  }

  export class BN {
    constructor(value: string | number | any);
    toNumber(): number;
    toString(): string;
    static isBN(value: any): value is BN;
    isZero(): boolean;
    mul(other: BN | number | string): BN;
    div(other: BN | number | string): BN;
    gt(other: BN | number | string): boolean;
    lt(other: BN | number | string): boolean;
    gte(other: BN | number | string): boolean;
    lte(other: BN | number | string): boolean;
    eq(other: BN | number | string): boolean;
    add(other: BN | number | string): BN;
    sub(other: BN | number | string): BN;
    mod(other: BN | number | string): BN;
    neg(): BN;
    abs(): BN;
  }

  export interface EventCoder {
    decode(data: Buffer | string): any;
  }

  export interface IdlAccounts {
    [key: string]: any;
  }

  export interface IdlEvent {
    name: string;
    fields: any[];
  }

  export interface Idl {
    version: string;
    name: string;
    accounts?: IdlAccounts[];
    instructions: any[];
    events?: IdlEvent[];
  }

  export function web3(): any;
}
