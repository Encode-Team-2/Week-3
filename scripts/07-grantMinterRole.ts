import { ethers } from "ethers";
import { MyToken, MyToken__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

function setupProvider() {
  const provider = new ethers.JsonRpcProvider(
    process.env.SEPOLIA_RPC_URL ?? ""
  );
  return provider;
}

async function main() {
  const futureMinerAddress = process.argv[2];
  const provider = setupProvider();
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);
  const signer = wallet.connect(provider);

  const tokenFactory = new MyToken__factory(signer);
  const tokenContract = tokenFactory.attach(
    process.env.TOKEN_ADDRESS ?? ""
  ) as MyToken;

  const grantTx = await tokenContract.grantMinterRole(futureMinerAddress);
  await grantTx.wait();
  // TODO print transaction hash
  console.log(`Granted minter role to account ${futureMinerAddress}.\n`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
