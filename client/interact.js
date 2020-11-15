import Web3 from "web3";
import Inherichain from "../build/contracts/Inherichain.json";
import SimpleCentralizedArbitrator from "../build/contracts/SimpleCentralizedArbitrator.json";

let web3;
let inherichain;
let simpleCentralizedArbitrator;
let accounts = [];
let status = [
  "Initial",
  "Heir Claimed",
  "Claim Disputed",
  "Dispute Result Pending",
  "Approver Approved",
  "Arbitrator Approved",
  "Arbitrator Rejected",
  "Initiated Charity",
];

function convertSectoDay(n) {
  let day = parseInt(n / (24 * 3600));

  n = n % (24 * 3600);
  let hour = parseInt(n / 3600);

  n %= 3600;
  let minutes = parseInt(n / 60);

  n %= 60;
  let seconds = n;

  return (
    day +
    " Days, " +
    hour +
    " Hours, " +
    minutes +
    " Minutes, " +
    seconds +
    " Seconds"
  );
}

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

const initializeContent = () => {
  let interactHTML = document.getElementById("interactHTML");
  interactHTML.innerHTML =
    '<h3>Current Status :</h3><div class="row"> <div class="col-sm-6"> User Balance : <div id="currentUserBalance"></div> </div> <div class="col-sm-6"> Contract Balance : <div id="currentContractBalance"></div> </div></div><hr /><div class="row"> <div class="col-sm-6"> Owner : <div id="currentOwner"></div> </div> <div class="col-sm-6"> Backup Owner : <div id="currentBackupOwner"></div> </div></div><hr /><div class="row"> <div class="col-sm-4"> Heir : <div id="currentHeir"></div> </div> <div class="col-sm-4"> Charity : <div id="currentCharity"></div> </div> <div class="col-sm-4"> Arbitrator : <div id="currentArbitrator"></div> </div></div><hr /><div class="row" id="currentApprovers"></div><hr /><div class="row"> <div class="col-sm-6"> Deadline : <div id="currentDeadline"></div> </div> <div class="col-sm-6"> Approver Deadline : <div id="currentApproverDeadline"></div> </div> <div class="col-sm-6"> Charity Deadline : <div id="currentCharityDeadline"></div> </div> <div class="col-sm-6"> Arbitration Fee Deadline : <div id="currentArbitrationFeeDeadline"></div> </div></div><hr /><div class="row"> <div class="col-sm-4"> Contract Status : <div id="currentContractStatus"></div> </div> <div class="col-sm-4"> Claim Time (in Seconds) : <div id="currentClaimTime"></div> </div> <div class="col-sm-4"> Vote Count : <div id="currentVoteCount"></div> </div></div><hr /><hr /><hr /><h3>Welcome User!</h3><div class="row"> <div class="col-sm-12"> <h5>Deposit</h5> <form id="userDepositETH"> <div class="form-group"><label for="amountUser">Enter ETH Amount :</label><input type="number" id="amountUser" class="form-control" step="any" /></div> <button type="submit" class="btn btn-success">Deposit</button> <div id="userDepositStatus"></div> </form> </div></div><div class="row"> <div class="col-sm-6"> <h5>Pay Arbitration Fee For Heir</h5> <form id="userPayArbitrationFeeForHeir"> <div class="form-group"><label for="payArbitrationFeeForHeir">Click to pay the arbitration for Heir.</label></div> <button type="submit" class="btn btn-success">Pay</button> <div id="userPayArbitrationFeeForHeirStatus"></div> </form> </div> <div class="col-sm-6"> <h5>Reclaim Initial Status</h5> <form id="userReclaimInitial"> <div class="form-group"><label for="reclaimInitial">Click to reclaim initial status of Wallet Contract.</label></div> <button type="submit" class="btn btn-primary">Reclaim</button> <div id="userReclaimInitialStatus"></div> </form> </div></div><div class="row"> <div class="col-sm-12"> <h5>Submit Evidence</h5> <form id="userSubmitEvidence"> <div class="form-group"><label for="evidenceUser">Enter Evidence :</label><input type="text" id="evidenceUser" class="form-control" /></div> <button type="submit" class="btn btn-secondary">Submit</button> <div id="userSubmitEvidenceStatus"></div> </form> </div></div><hr /><hr /><hr />';
  initApp();
  getData();
};

const initWalletAddress = () => {
  let interactHTML = document.getElementById("interactHTML");
  interactHTML.innerHTML =
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
        initializeContent();
      })
      .catch((error) => {
        window.alert("Please check if it is an Inherichain Wallet.");
        console.log(error);
      });
  });
};

const getData = () => {
  const currentUserBalance = document.getElementById("currentUserBalance");
  const currentContractBalance = document.getElementById(
    "currentContractBalance"
  );
  const currentOwner = document.getElementById("currentOwner");
  const currentBackupOwner = document.getElementById("currentBackupOwner");
  const currentHeir = document.getElementById("currentHeir");
  const currentCharity = document.getElementById("currentCharity");
  const currentArbitrator = document.getElementById("currentArbitrator");
  const approvers = document.getElementById("currentApprovers");
  const approverCount = document.getElementById("currentApproverCount");
  const deadline = document.getElementById("currentDeadline");
  const approverDeadline = document.getElementById("currentApproverDeadline");
  const charityDeadline = document.getElementById("currentCharityDeadline");
  const contractStatus = document.getElementById("currentContractStatus");
  const claimTime = document.getElementById("currentClaimTime");
  const voteCount = document.getElementById("currentVoteCount");

  let approversLength = 0;

  web3.eth
    .getBalance(accounts[0])
    .then((values) => {
      currentUserBalance.innerHTML = web3.utils.fromWei(values) + " ETH";
    })
    .catch((error) => {
      currentUserBalance.innerHTML =
        "There was an error while reading the data.";
      console.log(error);
    });

  web3.eth
    .getBalance(inherichain.options.address)
    .then((values) => {
      currentContractBalance.innerHTML = web3.utils.fromWei(values) + " ETH";
    })
    .catch((error) => {
      currentContractBalance.innerHTML =
        "There was an error while reading the data.";
      console.log(error);
    });

  inherichain.methods
    .owner()
    .call({ from: accounts[0] })
    .then((values) => {
      currentOwner.innerHTML = values;
    })
    .catch((error) => {
      currentOwner.innerHTML = "There was an error while reading the data.";
      console.log(error);
    });

  inherichain.methods
    .backupOwner()
    .call({ from: accounts[0] })
    .then((values) => {
      currentBackupOwner.innerHTML = values;
    })
    .catch((error) => {
      currentBackupOwner.innerHTML =
        "There was an error while reading the data.";
      console.log(error);
    });

  inherichain.methods
    .heir()
    .call({ from: accounts[0] })
    .then((values) => {
      currentHeir.innerHTML = values;
    })
    .catch((error) => {
      currentHeir.innerHTML = "There was an error while reading the data.";
      console.log(error);
    });

  inherichain.methods
    .charity()
    .call({ from: accounts[0] })
    .then((values) => {
      currentCharity.innerHTML = values;
    })
    .catch((error) => {
      currentCharity.innerHTML = "There was an error while reading the data.";
      console.log(error);
    });

  inherichain.methods
    .arbitrator()
    .call({ from: accounts[0] })
    .then((values) => {
      currentArbitrator.innerHTML = values;
    })
    .catch((error) => {
      currentArbitrator.innerHTML =
        "There was an error while reading the data.";
      console.log(error);
    });

  inherichain.methods
    .approversLength()
    .call({ from: accounts[0] })
    .then((values) => {
      approversLength = values;
      approvers.innerHTML =
        '<div class="col-sm-6">Approver Count : ' + approversLength + "</div>";
      for (let index = 0; index < approversLength; index++) {
        inherichain.methods
          .approvers(index)
          .call({ from: accounts[0] })
          .then((values) => {
            let temp = index + 1;
            approvers.innerHTML +=
              '<div class="col-sm-6">Approver ' +
              temp +
              " : " +
              values +
              "</div>";
          })
          .catch((error) => {
            approvers.innerHTML += "There was an error while reading the data.";
            console.log(error);
          });
      }
    })
    .catch((error) => {
      approverCount.innerHTML = "There was an error while reading the data.";
      console.log(error);
    });

  inherichain.methods
    .heirDeadline()
    .call({ from: accounts[0] })
    .then((values) => {
      deadline.innerHTML = convertSectoDay(values);
    })
    .catch((error) => {
      deadline.innerHTML = "There was an error while reading the data.";
      console.log(error);
    });

  inherichain.methods
    .heirApprovedDeadline()
    .call({ from: accounts[0] })
    .then((values) => {
      approverDeadline.innerHTML = convertSectoDay(values);
    })
    .catch((error) => {
      approverDeadline.innerHTML = "There was an error while reading the data.";
      console.log(error);
    });

  inherichain.methods
    .charityDeadline()
    .call({ from: accounts[0] })
    .then((values) => {
      charityDeadline.innerHTML = convertSectoDay(values);
    })
    .catch((error) => {
      charityDeadline.innerHTML = "There was an error while reading the data.";
      console.log(error);
    });

  inherichain.methods
    .arbitrationFeeDepositTime()
    .call({ from: accounts[0] })
    .then((values) => {
      currentArbitrationFeeDeadline.innerHTML = convertSectoDay(values);
    })
    .catch((error) => {
      currentArbitrationFeeDeadline.innerHTML =
        "There was an error while reading the data.";
      console.log(error);
    });

  inherichain.methods
    .status()
    .call({ from: accounts[0] })
    .then((values) => {
      contractStatus.innerHTML = status[values];
    })
    .catch((error) => {
      contractStatus.innerHTML = "There was an error while reading the data.";
      console.log(error);
    });

  inherichain.methods
    .claimTime()
    .call({ from: accounts[0] })
    .then((values) => {
      claimTime.innerHTML = values;
    })
    .catch((error) => {
      claimTime.innerHTML = "There was an error while reading the data.";
      console.log(error);
    });

  inherichain.methods
    .voteCount()
    .call({ from: accounts[0] })
    .then((values) => {
      voteCount.innerHTML = values;
    })
    .catch((error) => {
      voteCount.innerHTML = "There was an error while reading the data.";
      console.log(error);
    });
};

const clearStatus = () => {
  const userDepositStatus = document.getElementById("userDepositStatus");
  const userPayArbitrationFeeForHeirStatus = document.getElementById(
    "userPayArbitrationFeeForHeirStatus"
  );
  const userReclaimInitialStatus = document.getElementById(
    "userReclaimInitialStatus"
  );
  const userSubmitEvidenceStatus = document.getElementById(
    "userSubmitEvidenceStatus"
  );

  userDepositStatus.innerHTML = "";
  userPayArbitrationFeeForHeirStatus.innerHTML = "";
  userReclaimInitialStatus.innerHTML = "";
  userSubmitEvidenceStatus.innerHTMl = "";
};

const initApp = () => {
  const userDepositETH = document.getElementById("userDepositETH");
  const userPayArbitrationFeeForHeir = document.getElementById(
    "userPayArbitrationFeeForHeir"
  );
  const userReclaimInitial = document.getElementById("userReclaimInitial");
  const userSubmitEvidence = document.getElementById("userSubmitEvidence");

  const userDepositStatus = document.getElementById("userDepositStatus");
  const userPayArbitrationFeeForHeirStatus = document.getElementById(
    "userPayArbitrationFeeForHeirStatus"
  );
  const userReclaimInitialStatus = document.getElementById(
    "userReclaimInitialStatus"
  );
  const userSubmitEvidenceStatus = document.getElementById(
    "userSubmitEvidenceStatus"
  );

  userDepositETH.addEventListener("submit", async (e) => {
    clearStatus();
    userDepositStatus.innerHTML = "Transaction Pending...";
    e.preventDefault();
    const amount = e.target.elements[0].value;
    await web3.eth
      .sendTransaction({
        from: accounts[0],
        to: inherichain.options.address,
        value: web3.utils.toWei(amount),
      })
      .then(() => {
        userDepositStatus.innerHTML = "Success!";
        getData();
      })
      .catch((error) => {
        userDepositStatus.innerHTML = "There was an error asd!";
        console.log(error);
      });
  });

  userPayArbitrationFeeForHeir.addEventListener("submit", async (e) => {
    clearStatus();
    userPayArbitrationFeeForHeirStatus.innerHTML = "Transaction Pending...";
    e.preventDefault();
    inherichain.methods
      .arbitratorExtraData()
      .call({ from: accounts[0] })
      .then((arbitratorExtraData) => {
        inherichain.methods
          .arbitrator()
          .call({ from: accounts[0] })
          .then((arbitratorAddress) => {
            simpleCentralizedArbitrator = new web3.eth.Contract(
              SimpleCentralizedArbitrator.abi,
              arbitratorAddress
            );
            simpleCentralizedArbitrator.methods
              .arbitrationCost(arbitratorExtraData)
              .call({ from: accounts[0] })
              .then((fee) => {
                inherichain.methods
                  .payArbitrationFeeForHeir()
                  .send({ from: accounts[0], value: fee })
                  .then(() => {
                    userPayArbitrationFeeForHeirStatus.innerHTML = "Success!";
                    getData();
                  })
                  .catch((error) => {
                    userPayArbitrationFeeForHeirStatus.innerHTML =
                      "There was an error!";
                    console.log(error);
                  });
              })
              .catch((error) => {
                userPayArbitrationFeeForHeirStatus.innerHTML =
                  "There was an error!";
                console.log(error);
              });
          })
          .catch((error) => {
            userPayArbitrationFeeForHeirStatus.innerHTML =
              "There was an error!";
            console.log(error);
          });
      })
      .catch((error) => {
        userPayArbitrationFeeForHeirStatus.innerHTML = "There was an error!";
        console.log(error);
      });
  });

  userReclaimInitial.addEventListener("submit", async (e) => {
    clearStatus();
    userReclaimInitialStatus.innerHTML = "Transaction Pending...";
    e.preventDefault();
    inherichain.methods
      .reclaimInitialStatus()
      .send({ from: accounts[0] })
      .then(() => {
        userReclaimInitialStatus.innerHTML = "Success!";
        getData();
      })
      .catch((error) => {
        userReclaimInitialStatus.innerHTML = "There was an error!";
        console.log(error);
      });
  });

  userSubmitEvidence.addEventListener("submit", async (e) => {
    clearStatus();
    userSubmitEvidenceStatus.innerHTML = "Transaction Pending...";
    e.preventDefault();
    const evidence = e.target.elements[0].value;
    inherichain.methods
      .submitEvidence(evidence)
      .send({ from: accounts[0] })
      .then(() => {
        userSubmitEvidenceStatus.innerHTML = "Success!";
        getData();
      })
      .catch((error) => {
        userSubmitEvidenceStatus.innerHTML = "There was an error!";
        console.log(error);
      });
  });
};

// document.addEventListener("DOMContentLoaded", () => {
//   initWeb3()
//     .then((_web3) => {
//       web3 = _web3;
//       initAccount();
//       initWalletAddress();
//     })
//     .catch((error) => {
//       console.log(error);
//     });
// });

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
