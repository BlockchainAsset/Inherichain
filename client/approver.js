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
  let approverHTML = document.getElementById("approverHTML");
  inherichain.methods
    .approverStatus(accounts[0])
    .call({ from: accounts[0] })
    .then((values) => {
      if (!values) {
        window.alert("You don't have the rights of approver.");
      } else {
        let approverHTML = document.getElementById("approverHTML");
        approverHTML.innerHTML =
          '<h3>Welcome Approver!</h3><hr><div class="row"><div class="col-sm-6"><h5>Approve or Reject Heir</h5><form id="approverAcceptance"><div class="form-group"><label for="acceptHeir">Accept</label><input type="number" id="acceptHeir" placeholder="0 = Reject and 1 = Accept."></div><button type="submit" class="btn btn-secondary">Vote</button><div id="approverAcceptanceStatus"></div></form></div><div class="col-sm-6"><h5>Initiate Charity?</h5><form id="initiateCharity"><div class="form-group"><label for="acceptHeir">Click to initiate the Charity.</label></div><button type="submit" class="btn btn-secondary">Initiate</button><div id="initiateCharityStatus"></div></form></div></div><hr><hr><hr>';
        initApp();
      }
    })
    .catch((error) => {
      approverHTML.innerHTML = "There was an error while reading the data.";
      console.log(error);
    });
};

const initWalletAddress = () => {
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
  const approverAcceptanceStatus = document.getElementById(
    "approverAcceptanceStatus"
  );
  const initiateCharityStatus = document.getElementById(
    "initiateCharityStatus"
  );

  approverAcceptanceStatus.innerHTML = "";
  initiateCharityStatus.innerHTML = "";
};

const initApp = () => {
  const approverAcceptance = document.getElementById("approverAcceptance");
  const initiateCharity = document.getElementById("initiateCharity");

  const approverAcceptanceStatus = document.getElementById(
    "approverAcceptanceStatus"
  );
  const initiateCharityStatus = document.getElementById(
    "initiateCharityStatus"
  );

  approverAcceptance.addEventListener("submit", async (e) => {
    clearStatus();
    approverAcceptanceStatus.innerHTML = "Transaction Pending...";
    e.preventDefault();
    const acceptance = Number(e.target.elements[0].value);
    let value = true;
    if (acceptance == 0) {
      value = false;
    }
    inherichain.methods
      .approveHeir(value)
      .send({ from: accounts[0] })
      .then(() => {
        approverAcceptanceStatus.innerHTML = "Success!";
      })
      .catch((error) => {
        approverAcceptanceStatus.innerHTML = "There was an error!";
        console.log(error);
      });
  });

  initiateCharity.addEventListener("submit", async (e) => {
    clearStatus();
    initiateCharityStatus.innerHTML = "Transaction Pending...";
    e.preventDefault();
    inherichain.methods
      .initiateCharity()
      .send({ from: accounts[0] })
      .then(() => {
        initiateCharityStatus.innerHTML = "Success!";
      })
      .catch((error) => {
        initiateCharityStatus.innerHTML = "There was an error!";
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
