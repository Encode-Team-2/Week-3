import { ethers } from "ethers";
import { MyToken, MyToken__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

const MINT_VALUE = ethers.parseUnits("1");
// tx value is mint value divided by the no of team members (4) for equal distribution
const TX_VALUE = MINT_VALUE / 4n;

function setupProvider() {
  const provider = new ethers.JsonRpcProvider(
    process.env.RPC_ENDPOINT_URL ?? ""
  );
  return provider;
}

async function main() {
  // Read destination address specified when calling the script
  const addressTo = process.argv[2];
  // Define provider and wallet
  const provider = setupProvider();
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);
  const signer = wallet.connect(provider);

  // Attach
  const tokenContractFactory = new MyToken__factory(signer);
  const tokenContract = tokenContractFactory.attach(
    process.env.VOTING_TOKEN_ADDRESS ?? ""
  ) as MyToken;

  // transfer from deployer to input account
  const transferTx = await tokenContract
    .connect(signer)
    .transfer(addressTo, TX_VALUE);
  await transferTx.wait();
  console.log(
    `Transfered ${TX_VALUE.toString()} decimal units to account ${addressTo}.\n`
  );
  // read balance of deployer account
  const balanceBN = await tokenContract.balanceOf(signer.address);
  console.log(
    `Account ${
      signer.address
    } has ${balanceBN.toString()} decimal units of VoteToken.\n`
  );
  // read balance of destination account
  const balanceToAfterTransfer = await tokenContract.balanceOf(addressTo);
  console.log(
    `Account ${addressTo} has ${balanceToAfterTransfer.toString()} decimal units of VoteToken.\n`
  );
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
