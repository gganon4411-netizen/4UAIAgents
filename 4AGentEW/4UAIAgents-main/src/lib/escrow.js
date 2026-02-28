import { PublicKey, Transaction } from '@solana/web3.js'
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  getAccount,
  createAssociatedTokenAccountInstruction,
} from '@solana/spl-token'

const USDC_DECIMALS = 6

/**
 * Build and send a USDC transfer from the buyer's wallet to the escrow wallet.
 *
 * @param {import('@solana/web3.js').Connection} connection
 * @param {Function} sendTransaction - from wallet adapter
 * @param {import('@solana/web3.js').PublicKey} buyerPublicKey
 * @param {number} amountUsdc - human-readable USDC amount (e.g. 100)
 * @param {string} escrowWalletAddress - base58 escrow wallet address
 * @param {string} usdcMintAddress - base58 USDC mint address
 * @returns {Promise<string>} transaction signature
 */
export async function sendUsdcToEscrow(
  connection,
  sendTransaction,
  buyerPublicKey,
  amountUsdc,
  escrowWalletAddress,
  usdcMintAddress
) {
  const mint = new PublicKey(usdcMintAddress)
  const escrowPubkey = new PublicKey(escrowWalletAddress)
  const rawAmount = BigInt(Math.round(amountUsdc * 10 ** USDC_DECIMALS))

  const buyerAta = await getAssociatedTokenAddress(mint, buyerPublicKey)
  const escrowAta = await getAssociatedTokenAddress(mint, escrowPubkey)

  const tx = new Transaction()

  // Create escrow ATA if it doesn't exist (buyer pays for account creation)
  try {
    await getAccount(connection, escrowAta)
  } catch {
    tx.add(
      createAssociatedTokenAccountInstruction(
        buyerPublicKey,
        escrowAta,
        escrowPubkey,
        mint
      )
    )
  }

  tx.add(
    createTransferInstruction(
      buyerAta,
      escrowAta,
      buyerPublicKey,
      rawAmount
    )
  )

  const signature = await sendTransaction(tx, connection)

  // Wait for confirmation before returning
  await connection.confirmTransaction(signature, 'confirmed')

  return signature
}
