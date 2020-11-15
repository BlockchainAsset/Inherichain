import Web3 from "web3";
import Inherichain from "../build/contracts/Inherichain.json";

let web3;
let inherichain;
let accounts = [];
let status = [
  "Initial",
  "Heir Claimed",
  "Approver Approved",
  "Initiated Charity",
];

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

const initContract = (address) => {
  return new web3.eth.Contract(Inherichain.abi, address);
};

const initAccount = () => {
  web3.eth.getAccounts().then((_accounts) => {
    accounts = _accounts;
  });
};

const checkRights = () => {
  let backupOwnerHTML = document.getElementById("backupOwnerHTML");
  inherichain.methods
    .backupOwner()
    .call({ from: accounts[0] })
    .then((values) => {
      if (values != accounts[0]) {
        window.alert("You don't have the rights of backup owner.");
      } else {
        backupOwnerHTML.innerHTML =
          '<h3>Welcome Backup Owner!</h3><hr><div class="row"><div class="col-sm-12"><h5>Update Owner</h5><form id="backupOwnerUpdateOwner"><div class="form-group"><label for="updateOwner">Enter New Owner Address :</label><input type="text" id="updateOwner" class="form-control"></div><button type="submit" class="btn btn-secondary">Update</button><div id="backupOwnerUpdateOwnerStatus"></div></form></div></div><hr><hr><hr>';
        initApp();
      }
    })
    .catch((error) => {
      backupOwnerHTML.innerHTML = "There was an error while reading the data.";
      console.log(error);
    });
};

const initWalletAddress = () => {
  let backupOwnerHTML = document.getElementById("backupOwnerHTML");
  backupOwnerHTML.innerHTML =
    '<div class="row"><div class="col-sm-12"><h1>Interact with your Wallet Contract</h1><div class="row"><div class="col-sm-12"><form id="setAddress"><div class="form-group"><label for="walletAddress">Wallet Contract Address :</label><input id="walletAddress" type="text" class="form-control"></div><button type="submit" class="btn btn-info">Interact</button><div id="interactStatus"></div></form></div></div></div></div>';
  const setAddress = document.getElementById("setAddress");
  const walletAddress = document.getElementById("walletAddress");
  walletAddress.value = localStorage.getItem("inherichainWalletAddress");
  setAddress.addEventListener("submit", (e) => {
    e.preventDefault();
    const address = e.target.elements[0].value;
    inherichain = initContract(address);
    inherichain.methods
      .heir()
      .call({ from: accounts[0] })
      .then((values) => {
        // Storing the data in localstorage (cache)
        localStorage.setItem("inherichainWalletAddress", address);
        checkRights();
      })
      .catch((error) => {
        window.alert("Please check if it is an Inherichain Wallet.");
        console.log(error);
      });
  });
};

const clearStatus = () => {
  const backupOwnerUpdateOwnerStatus = document.getElementById(
    "backupOwnerUpdateOwnerStatus"
  );

  backupOwnerUpdateOwnerStatus.innerHTML = "";
};

const initApp = () => {
  const backupOwnerUpdateOwner = document.getElementById(
    "backupOwnerUpdateOwner"
  );

  const backupOwnerUpdateOwnerStatus = document.getElementById(
    "backupOwnerUpdateOwnerStatus"
  );

  backupOwnerUpdateOwner.addEventListener("submit", async (e) => {
    clearStatus();
    backupOwnerUpdateOwnerStatus.innerHTML = "Transaction Pending...";
    e.preventDefault();
    const address = e.target.elements[0].value;
    inherichain.methods
      .updateOwner(address)
      .send({ from: accounts[0] })
      .then(() => {
        backupOwnerUpdateOwnerStatus.innerHTML = "Success!";
      })
      .catch((error) => {
        backupOwnerUpdateOwnerStatus.innerHTML = "There was an error!";
        console.log(error);
      });
  });
};

ethereum.on("accountsChanged", function (acc) {
  // Time to reload your interface with accounts[0]!
  if (acc.length === 0) {
    // MetaMask is locked or the user has not connected any accounts
    console.log("Please connect to MetaMask.");
  } else {
    initWeb3()
      .then((_web3) => {
        web3 = _web3;
        initAccount();
        initWalletAddress();
      })
      .catch((error) => {
        console.log(error);
      });
  }
});
