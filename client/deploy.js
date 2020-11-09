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
    let owner = e.target.elements[0].value;
    let backupOwner = e.target.elements[1].value;
    let heir = e.target.elements[2].value;
    let charity = e.target.elements[3].value;
    let approverOne = e.target.elements[4].value;
    let approverTwo = e.target.elements[5].value;
    let approverThree = e.target.elements[6].value;
    let deadline = Number(e.target.elements[7].value);
    let approverDeadline = Number(e.target.elements[8].value);
    let charityDeadline = Number(e.target.elements[9].value);

    let approvers = [];
    // Check if blank or address.
    if (owner == "") {
      owner = accounts[0];
    }
    if (backupOwner == "") {
      backupOwner = constants.ZERO_ADDRESS;
    }
    if (charity == "") {
      charity = constants.ZERO_ADDRESS;
    }
    if (approverOne != "") {
      approvers.push(approverOne);
    }
    if (approverTwo != "") {
      approvers.push(approverTwo);
    }
    if (approverThree != "") {
      approvers.push(approverThree);
    }
    inherichain = await new web3.eth.Contract(Inherichain.abi);
    await inherichain
      .deploy({
        data: Inherichain.bytecode,
        arguments: [
          owner,
          backupOwner,
          heir,
          charity,
          approvers,
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
