export type Swap = {
  timestamp: number;
  from_address: string;
  to_address: string;
  txn_hash: string;
  lp_fee: string;
  amount: string;
  asset: string;
  status: string;
};

export type LPDeposit = {
  timestamp: number;
  lp: string;
  lp_fee: string;
  amount: string;
  asset: string;
  status: string;
};
