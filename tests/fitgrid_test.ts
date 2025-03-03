import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Test profile creation with valid inputs",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet1 = accounts.get('wallet_1')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('fitgrid', 'create-profile',
        [
          types.ascii("John"),
          types.ascii("Running"),
          types.uint(3),
          types.ascii("5k training")
        ],
        wallet1.address
      )
    ]);
    
    block.receipts[0].result.expectOk();
  }
});

Clarinet.test({
  name: "Test profile creation with invalid activity type",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet1 = accounts.get('wallet_1')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('fitgrid', 'create-profile',
        [
          types.ascii("John"),
          types.ascii("InvalidActivity"),
          types.uint(3),
          types.ascii("5k training")
        ],
        wallet1.address
      )
    ]);
    
    block.receipts[0].result.expectErr(types.uint(104));
  }
});

Clarinet.test({
  name: "Test activity logging with validation",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet1 = accounts.get('wallet_1')!;
    
    chain.mineBlock([
      Tx.contractCall('fitgrid', 'create-profile',
        [
          types.ascii("John"),
          types.ascii("Running"),
          types.uint(3),
          types.ascii("5k training")
        ],
        wallet1.address
      )
    ]);
    
    let block = chain.mineBlock([
      Tx.contractCall('fitgrid', 'log-activity',
        [
          types.uint(60),
          types.ascii("Running"),
          types.uint(5)
        ],
        wallet1.address
      )
    ]);
    
    block.receipts[0].result.expectOk();
  }
});

Clarinet.test({
  name: "Test match finding with enhanced criteria",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    chain.mineBlock([
      Tx.contractCall('fitgrid', 'create-profile',
        [
          types.ascii("John"),
          types.ascii("Running"),
          types.uint(3),
          types.ascii("5k training")
        ],
        wallet1.address
      ),
      Tx.contractCall('fitgrid', 'create-profile',
        [
          types.ascii("Jane"),
          types.ascii("Running"),
          types.uint(3),
          types.ascii("5k training")
        ],
        wallet2.address
      )
    ]);
    
    let matches = chain.callReadOnlyFn(
      'fitgrid',
      'find-matches',
      [types.principal(wallet1.address)],
      wallet1.address
    );
    
    matches.result.expectOk();
  }
});
