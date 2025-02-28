import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Test profile creation",
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
    
    // Verify profile exists
    let profile = chain.callReadOnlyFn(
      'fitgrid',
      'get-user-profile',
      [types.principal(wallet1.address)],
      wallet1.address
    );
    
    profile.result.expectOk();
  }
});

Clarinet.test({
  name: "Test activity logging",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet1 = accounts.get('wallet_1')!;
    
    // Create profile first
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
    
    // Log activity
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
    
    // Verify activity logged
    let activities = chain.callReadOnlyFn(
      'fitgrid',
      'get-user-activities',
      [types.principal(wallet1.address)],
      wallet1.address
    );
    
    activities.result.expectOk();
  }
});

Clarinet.test({
  name: "Test match finding",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    // Create profiles
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
    
    // Find matches
    let matches = chain.callReadOnlyFn(
      'fitgrid',
      'find-matches',
      [types.principal(wallet1.address)],
      wallet1.address
    );
    
    matches.result.expectOk().expectAscii("Running");
  }
});
