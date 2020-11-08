import constants from "@openzeppelin/test-helpers/src/constants";
import Web3 from "web3";
import Inherichain from "../build/contracts/Inherichain.json";

let web3;
let inherichain;
let accounts = [];

const initWeb3 = () => {
  return new Promise((resolve, reject) => {
    // New Metamask
    if (typeof window.ethereum !== "undefined") {
      web3 = new Web3(window.ethereum);
      window.ethereum
        .enable()
        .then(() => {
          resolve(new Web3(window.ethereum));
        })
        .catch((error) => {
          reject(error);
        });
      return;
    }
    // Old Metamask
    if (typeof window.web3 !== "undefined") {
      return resolve(new Web3(window.web3.currentProvider));
    }
    // For ganache-cli (for Ganache GUI, use 9545 instead of 8545)
    resolve(new Web3("http://localhost:8545"));
  });
};

const initAccount = () => {
  web3.eth.getAccounts().then((_accounts) => {
    accounts = _accounts;
  });
};

const initApp = () => {
  const createWallet = document.getElementById("createWallet");
  const createWalletStatus = document.getElementById("createWalletStatus");

  createWallet.addEventListener("submit", async (e) => {
    createWalletStatus.innerHTML = "Transaction Pending...";
    e.preventDefault();
    const owner = e.target.elements[0].value;
    const backupOwner = e.target.elements[1].value;
    const heir = e.target.elements[2].value;
    const charity = e.target.elements[3].value;
    const approverOne = e.target.elements[4].value;
    const approverTwo = e.target.elements[5].value;
    const approverThree = e.target.elements[6].value;
    const deadline = Number(e.target.elements[7].value);
    const approverDeadline = Number(e.target.elements[8].value);
    const charityDeadline = Number(e.target.elements[9].value);
    inherichain = await new web3.eth.Contract(Inherichain.abi);
    await inherichain
      .deploy({
        data: Inherichain.bytecode,
        arguments: [
          owner,
          backupOwner,
          heir,
          charity,
          [approverOne, approverTwo, approverThree],
          deadline,
          approverDeadline,
          charityDeadline,
        ],
      })
      .send({
        from: accounts[0],
      })
      .then((instance) => {
        inherichain = instance;
        createWalletStatus.innerHTML = `Wallet was successfully created with address: ${inherichain.options.address}. Please keep this address saved somewhere.`;
      })
      .catch((err) => {
        createWalletStatus.innerHTML = `There was an error while creating a new Wallet.`;
        console.log(err);
      });
  });
};

document.addEventListener("DOMContentLoaded", () => {
  initWeb3()
    .then((_web3) => {
      web3 = _web3;
      initAccount();
      initApp();
    })
    .catch((error) => {
      console.log(error);
    });
});
