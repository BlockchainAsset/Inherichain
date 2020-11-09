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

function convertSectoDay(n) {
  let day = Number(n / (24 * 3600));

  n = n % (24 * 3600);
  let hour = Number(n / 3600);

  n %= 3600;
  let minutes = Number(n / 60);

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
      .call({from: accounts[0]})
      .then((values) => {
        // Storing the data in localstorage (cache)
        localStorage.setItem("inherichainWalletAddress", address);
        getData();
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
    .call({from: accounts[0]})
    .then((values) => {
      currentOwner.innerHTML = values;
    })
    .catch((error) => {
      currentOwner.innerHTML = "There was an error while reading the data.";
      console.log(error);
    });

  inherichain.methods
    .backupOwner()
    .call({from: accounts[0]})
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
    .call({from: accounts[0]})
    .then((values) => {
      currentHeir.innerHTML = values;
    })
    .catch((error) => {
      currentHeir.innerHTML = "There was an error while reading the data.";
      console.log(error);
    });

  inherichain.methods
    .charity()
    .call({from: accounts[0]})
    .then((values) => {
      currentCharity.innerHTML = values;
    })
    .catch((error) => {
      currentCharity.innerHTML = "There was an error while reading the data.";
      console.log(error);
    });

  inherichain.methods
    .approversLength()
    .call({from: accounts[0]})
    .then((values) => {
      approversLength = values;
      approvers.innerHTML =
        '<div class="col-sm-6">Approver Count : ' + approversLength + "</div>";
      for (let index = 0; index < approversLength; index++) {
        inherichain.methods
          .approvers(index)
          .call({from: accounts[0]})
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
    .call({from: accounts[0]})
    .then((values) => {
      deadline.innerHTML = convertSectoDay(values);
    })
    .catch((error) => {
      deadline.innerHTML = "There was an error while reading the data.";
      console.log(error);
    });

  inherichain.methods
    .heirApprovedDeadline()
    .call({from: accounts[0]})
    .then((values) => {
      approverDeadline.innerHTML = convertSectoDay(values);
    })
    .catch((error) => {
      approverDeadline.innerHTML = "There was an error while reading the data.";
      console.log(error);
    });

  inherichain.methods
    .charityDeadline()
    .call({from: accounts[0]})
    .then((values) => {
      charityDeadline.innerHTML = convertSectoDay(values);
    })
    .catch((error) => {
      charityDeadline.innerHTML = "There was an error while reading the data.";
      console.log(error);
    });

  inherichain.methods
    .status()
    .call({from: accounts[0]})
    .then((values) => {
      contractStatus.innerHTML = status[values];
    })
    .catch((error) => {
      contractStatus.innerHTML = "There was an error while reading the data.";
      console.log(error);
    });

  inherichain.methods
    .claimTime()
    .call({from: accounts[0]})
    .then((values) => {
      claimTime.innerHTML = values;
    })
    .catch((error) => {
      claimTime.innerHTML = "There was an error while reading the data.";
      console.log(error);
    });

  inherichain.methods
    .voteCount()
    .call({from: accounts[0]})
    .then((values) => {
      voteCount.innerHTML = values;
    })
    .catch((error) => {
      voteCount.innerHTML = "There was an error while reading the data.";
      console.log(error);
    });
};

const initApp = () => {
  const userDepositETH = document.getElementById("userDepositETH");

  userDepositETH.addEventListener("submit", async (e) => {
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
};

// document.addEventListener("DOMContentLoaded", () => {
//   initWeb3()
//     .then((_web3) => {
//       web3 = _web3;
//       initAccount();
//       initApp();
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
        initApp();
        initWalletAddress();
      })
      .catch((error) => {
        console.log(error);
      });
  }
});
