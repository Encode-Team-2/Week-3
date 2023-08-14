import { ethers } from "ethers";
import { MyToken__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

const MINT_VALUE = ethers.parseUnits("1");

function setupProvider() {
  const provider = new ethers.JsonRpcProvider(
    process.env.SEPOLIA_RPC_URL ?? ""
  );
  return provider;
}

async function main() {
  const provider = setupProvider();
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);
  const signer = wallet.connect(provider);

  const tokenFactory = new MyToken__factory(signer);
  const tokenContract = tokenFactory.attach(process.env.TOKEN_ADDRESS ?? "");

  const mintTx = await tokenContract.mint(signer.address, MINT_VALUE);
  await mintTx.wait();
  console.log(
    `Minted ${MINT_VALUE.toString()} decimal units to account ${
      signer.address
    }\n`
  );
  const balanceBN = await tokenContract.balanceOf(signer.address);
  console.log(
    `Account ${
      signer.address
    } has ${balanceBN.toString()} decimal units of MyToken\n`
  );
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
