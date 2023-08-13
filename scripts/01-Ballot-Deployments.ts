import { ethers } from "ethers";
import { TokenizedBallot__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

function setupProvider() {
  const provider = new ethers.JsonRpcProvider(
    process.env.SEPOLIA_RPC_URL ?? ""
  );
  return provider;
}

async function main() {
  // Gather inputs
  const erc20Address = process.env.TOKEN_ADDRESS ?? "";
  const targetBlockNum = process.argv[2];
  const proposals = process.argv.slice(3);
  console.log(`\nDeploying Ballot contract at block number ${targetBlockNum}.`);
  console.log("Proposals: ");
  proposals.forEach((element, index) => {
    console.log(`\tProposal No. ${index + 1}: ${element}`);
  });

  // Deployment
  const provider = setupProvider();
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);
  const balanceBN = await provider.getBalance(wallet.address);
  const balance = Number(ethers.formatUnits(balanceBN));
  console.log(`\nWallet balance ${balance}.`);
  if (balance < 0.01) {
    throw new Error("Not enough ether.");
  }
  const tokenizedBallotFactory = new TokenizedBallot__factory(wallet);
  const tokenizedBallotContract = await tokenizedBallotFactory.deploy(
    proposals.map(ethers.encodeBytes32String),
    erc20Address,
    targetBlockNum
  );
  await tokenizedBallotContract.waitForDeployment();
  const address = await tokenizedBallotContract.getAddress();

  // Display logs
  console.log(`\nBallot contract deployed to the address ${address}.`);
  for (let index = 0; index < proposals.length; index++) {
    const proposal = await tokenizedBallotContract.proposals(index);
    const name = ethers.decodeBytes32String(proposal.name);
    console.log({ index, name, proposal });
  }
  console.log(`Wallet balance ${balance}.`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
