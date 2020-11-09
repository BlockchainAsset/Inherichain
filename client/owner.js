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

const initContract = (address) => {
  return new web3.eth.Contract(Inherichain.abi, address);
};

const initAccount = () => {
  web3.eth.getAccounts().then((_accounts) => {
    accounts = _accounts;
  });
};

const checkRights = () => {
  let ownerHTML = document.getElementById("ownerHTML");
  inherichain.methods
    .owner()
    .call({from: accounts[0]})
    .then((values) => {
      if (values != accounts[0]) {
        window.alert("You don't have the rights of owner.");
      } else {
        ownerHTML.innerHTML =
          '<h3>Welcome Owner!</h3><hr><div class="row"><div class="col-sm-6"><h5>Update Backup Owner</h5><form id="ownerUpdateBackupOwner"><div class="form-group"><label for="updateBackupOwner">Enter New Backup Owner Address :</label><input type="text" id="updateBackupOwner" class="form-control"></div><button type="submit" class="btn btn-secondary">Update</button><div id="ownerUpdateBackupOwnerStatus"></div></form></div><div class="col-sm-6"><h5>Update Heir</h5><form id="ownerUpdateHeir"><div class="form-group"><label for="updateHeir">Enter New Heir Address :</label><input type="text" id="updateHeir" class="form-control"></div><button type="submit" class="btn btn-secondary">Update</button><div id="ownerUpdateHeirStatus"></div></form></div><div class="col-sm-6"><h5>Update Charity</h5><form id="ownerUpdateCharity"><div class="form-group"><label for="updateCharity">Enter New Charity Address :</label><input type="text" id="updateCharity" class="form-control"></div><button type="submit" class="btn btn-secondary">Update</button><div id="ownerUpdateCharityStatus"></div></form></div></div><hr><div class="row"><div class="col-sm-6"><h5>Add New Approver</h5><form id="ownerAddApprover"><div class="form-group"><label for="addApprover">Enter New Approver Address :</label><input type="text" id="addApprover" class="form-control"></div><button type="submit" class="btn btn-primary">Add</button><div id="ownerAddApproverStatus"></div></form></div><div class="col-sm-6"><h5>Delete Approver</h5><form id="ownerDeleteApprover"><div class="form-group"><label for="deleteApprover">Enter Approver Address to Delete :</label><input type="text" id="deleteApprover" class="form-control"></div><button type="submit" class="btn btn-danger">Delete</button><div id="ownerDeleteApproverStatus"></div></form></div></div><hr><div class="row"><div class="col-sm-12"><form id="ownerUpdateDeadline"><h5>Update Deadline & Approver Deadline</h5><div class="form-group"><label for="updateDeadline">Enter New Deadline Duration (in seconds) :</label><input type="text" id="updateDeadline" class="form-control"placeholder="Leave Blank to only update other Deadlines"><label for="updateApproverDeadline">Enter New Approver Deadline Duration (inseconds) :</label><input type="text" id="updateApproverDeadline" class="form-control"placeholder="Leave Blank to only update other Deadlines"><label for="updateCharityDeadline">Enter New Charity Deadline Duration (inseconds) :</label><input type="text" id="updateCharityDeadline" class="form-control"placeholder="Leave Blank to only update other Deadlines"></div><button type="submit" class="btn btn-secondary">Update</button><div id="ownerUpdateDeadlineStatus"></div></form></div></div><hr><div class="row"><div class="col-sm-5"><h5>Transfer ETH</h5><form id="ownerTransferSomeETH"><div class="form-group"><label for="transferSomeETHAmount">Enter ETH to transfer :</label><input type="number" id="transferSomeETHAmount" class="form-control" step="any"><label for="transferSomeETHAddress">Enter the receiver address :</label><input type="text" id="transferSomeETHAddress" class="form-control"></div><button type="submit" class="btn btn-success">Update</button><div id="ownerTransferSomeETHStatus"></div></form></div><div class="col-sm-4"><h5>Withdraw ETH</h5><form id="ownerWithdrawSomeETH"><div class="form-group"><label for="withdrawSomeETH">Enter ETH to withdraw :</label><input type="number" id="withdrawSomeETH" class="form-control" step="any"></div><button type="submit" class="btn btn-success">Withdraw</button><div id="ownerWithdrawSomeETHStatus"></div></form></div><div class="col-sm-3"><h5>Withdraw All ETH</h5><form id="ownerWithdrawAllETH"><div class="form-group"><label for="withdrawAllETH">Click to withdraw All ETH.</label></div><button type="submit" class="btn btn-success">Withdraw</button><div id="ownerWithdrawAllETHStatus"></div></form></div></div><hr><div class="row"><div class="col-sm-6"><form id="ownerInteract"><h5>Interact with other contract (Fallback function)</h5><div class="form-group"><label for="addMsgValue">Enter Value to Sent (in ETH) :</label><input type="number" id="addMsgValue" class="form-control" step="any"><label for="addMsgData">Enter Message Data :</label><input type="text" id="addMsgData" class="form-control"></div><button type="submit" class="btn btn-secondary">Interact</button><div id="ownerInteractStatus"></div></form></div><div class="col-sm-6"><form id="ownerDeployContract"><h5>Deploy Contract</h5><div class="form-group"><label for="addContractValue">Enter Value to Sent (in ETH) :</label><input type="number" id="addContractValue" class="form-control" step="any"><label for="addContractBytecode">Enter Contract Bytecode :</label><input type="text" id="addContractBytecode" class="form-control"></div><button type="submit" class="btn btn-primary">Create</button><div id="ownerDeployContractStatus"></div></form></div></div><hr><hr><hr>';
        initApp();
      }
    })
    .catch((error) => {
      ownerHTML.innerHTML = "There was an error while reading the data.";
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
      .call({from: accounts[0]})
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
  const ownerUpdateBackupOwnerStatus = document.getElementById(
    "ownerUpdateBackupOwnerStatus"
  );
  const ownerUpdateHeirStatus = document.getElementById(
    "ownerUpdateHeirStatus"
  );
  const ownerUpdateCharityStatus = document.getElementById(
    "ownerUpdateCharityStatus"
  );
  const ownerAddApproverStatus = document.getElementById(
    "ownerAddApproverStatus"
  );
  const ownerDeleteApproverStatus = document.getElementById(
    "ownerDeleteApproverStatus"
  );
  const ownerUpdateDeadlineStatus = document.getElementById(
    "ownerUpdateDeadlineStatus"
  );
  const ownerTransferSomeETHStatus = document.getElementById(
    "ownerTransferSomeETHStatus"
  );
  const ownerWithdrawSomeETHStatus = document.getElementById(
    "ownerWithdrawSomeETHStatus"
  );
  const ownerWithdrawAllETHStatus = document.getElementById(
    "ownerWithdrawAllETHStatus"
  );
  const ownerInteractStatus = document.getElementById("ownerInteractStatus");
  const ownerDeployContractStatus = document.getElementById(
    "ownerDeployContractStatus"
  );

  ownerUpdateBackupOwnerStatus.innerHTML = "";
  ownerUpdateHeirStatus.innerHTML = "";
  ownerUpdateCharityStatus.innerHTML = "";
  ownerAddApproverStatus.innerHTML = "";
  ownerDeleteApproverStatus.innerHTML = "";
  ownerUpdateDeadlineStatus.innerHTML = "";
  ownerTransferSomeETHStatus.innerHTML = "";
  ownerWithdrawSomeETHStatus.innerHTML = "";
  ownerWithdrawAllETHStatus.innerHTML = "";
  ownerInteractStatus.innerHTML = "";
  ownerDeployContractStatus.innerHTML = "";
};

const initApp = () => {
  const ownerUpdateBackupOwner = document.getElementById(
    "ownerUpdateBackupOwner"
  );
  const ownerUpdateHeir = document.getElementById("ownerUpdateHeir");
  const ownerUpdateCharity = document.getElementById("ownerUpdateCharity");
  const ownerAddApprover = document.getElementById("ownerAddApprover");
  const ownerDeleteApprover = document.getElementById("ownerDeleteApprover");
  const ownerUpdateDeadline = document.getElementById("ownerUpdateDeadline");
  const ownerTransferSomeETH = document.getElementById("ownerTransferSomeETH");
  const ownerWithdrawSomeETH = document.getElementById("ownerWithdrawSomeETH");
  const ownerWithdrawAllETH = document.getElementById("ownerWithdrawAllETH");
  const ownerInteract = document.getElementById("ownerInteract");
  const ownerDeployContract = document.getElementById("ownerDeployContract");

  const ownerUpdateBackupOwnerStatus = document.getElementById(
    "ownerUpdateBackupOwnerStatus"
  );
  const ownerUpdateHeirStatus = document.getElementById(
    "ownerUpdateHeirStatus"
  );
  const ownerUpdateCharityStatus = document.getElementById(
    "ownerUpdateCharityStatus"
  );
  const ownerAddApproverStatus = document.getElementById(
    "ownerAddApproverStatus"
  );
  const ownerDeleteApproverStatus = document.getElementById(
    "ownerDeleteApproverStatus"
  );
  const ownerUpdateDeadlineStatus = document.getElementById(
    "ownerUpdateDeadlineStatus"
  );
  const ownerTransferSomeETHStatus = document.getElementById(
    "ownerTransferSomeETHStatus"
  );
  const ownerWithdrawSomeETHStatus = document.getElementById(
    "ownerWithdrawSomeETHStatus"
  );
  const ownerWithdrawAllETHStatus = document.getElementById(
    "ownerWithdrawAllETHStatus"
  );
  const ownerInteractStatus = document.getElementById("ownerInteractStatus");
  const ownerDeployContractStatus = document.getElementById(
    "ownerDeployContractStatus"
  );

  ownerUpdateBackupOwner.addEventListener("submit", async (e) => {
    clearStatus();
    ownerUpdateBackupOwnerStatus.innerHTML = "Transaction Pending...";
    e.preventDefault();
    const address = e.target.elements[0].value;
    inherichain.methods
      .updateBackupOwner(address)
      .send({from: accounts[0]})
      .then(() => {
        ownerUpdateBackupOwnerStatus.innerHTML = "Success!";
      })
      .catch((error) => {
        ownerUpdateBackupOwnerStatus.innerHTML = "There was an error!";
        console.log(error);
      });
  });

  ownerUpdateHeir.addEventListener("submit", async (e) => {
    clearStatus();
    ownerUpdateHeirStatus.innerHTML = "Transaction Pending...";
    e.preventDefault();
    const address = e.target.elements[0].value;
    inherichain.methods
      .updateHeir(address)
      .send({from: accounts[0]})
      .then(() => {
        ownerUpdateHeirStatus.innerHTML = "Success!";
      })
      .catch((error) => {
        ownerUpdateHeirStatus.innerHTML = "There was an error!";
        console.log(error);
      });
  });

  ownerUpdateCharity.addEventListener("submit", async (e) => {
    clearStatus();
    ownerUpdateCharityStatus.innerHTML = "Transaction Pending...";
    e.preventDefault();
    const address = e.target.elements[0].value;
    inherichain.methods
      .updateCharity(address)
      .send({from: accounts[0]})
      .then(() => {
        ownerUpdateCharityStatus.innerHTML = "Success!";
      })
      .catch((error) => {
        ownerUpdateCharityStatus.innerHTML = "There was an error!";
        console.log(error);
      });
  });

  ownerAddApprover.addEventListener("submit", async (e) => {
    clearStatus();
    ownerAddApproverStatus.innerHTML = "Transaction Pending...";
    e.preventDefault();
    const address = e.target.elements[0].value;
    inherichain.methods
      .addApprover(address)
      .send({from: accounts[0]})
      .then(() => {
        ownerAddApproverStatus.innerHTML = "Success!";
      })
      .catch((error) => {
        ownerAddApproverStatus.innerHTML = "There was an error!";
        console.log(error);
      });
  });

  ownerDeleteApprover.addEventListener("submit", async (e) => {
    clearStatus();
    ownerDeleteApproverStatus.innerHTML = "Transaction Pending...";
    e.preventDefault();
    const address = e.target.elements[0].value;
    inherichain.methods
      .deleteApprover(address)
      .send({from: accounts[0]})
      .then(() => {
        ownerDeleteApproverStatus.innerHTML = "Success!";
      })
      .catch((error) => {
        ownerDeleteApproverStatus.innerHTML = "There was an error!";
        console.log(error);
      });
  });

  ownerUpdateDeadline.addEventListener("submit", async (e) => {
    clearStatus();
    ownerUpdateDeadlineStatus.innerHTML = "Transaction Pending...";
    e.preventDefault();
    const deadline = e.target.elements[0].value;
    const approverDeadline = e.target.elements[1].value;
    const charityDeadline = e.target.elements[2].value;
    inherichain.methods
      .updateDeadline(deadline, approverDeadline, charityDeadline)
      .send({from: accounts[0]})
      .then(() => {
        ownerUpdateDeadlineStatus.innerHTML = "Success!";
      })
      .catch((error) => {
        ownerUpdateDeadlineStatus.innerHTML = "There was an error!";
        console.log(error);
      });
  });

  ownerTransferSomeETH.addEventListener("submit", async (e) => {
    clearStatus();
    ownerTransferSomeETHStatus.innerHTML = "Transaction Pending...";
    e.preventDefault();
    const amount = web3.utils.toWei(e.target.elements[0].value);
    const address = e.target.elements[1].value;
    inherichain.methods
      .transferETH(address, amount)
      .send({from: accounts[0]})
      .then(() => {
        ownerTransferSomeETHStatus.innerHTML = "Success!";
      })
      .catch((error) => {
        ownerTransferSomeETHStatus.innerHTML = "There was an error!";
        console.log(error);
      });
  });

  ownerWithdrawSomeETH.addEventListener("submit", async (e) => {
    clearStatus();
    ownerWithdrawSomeETHStatus.innerHTML = "Transaction Pending...";
    e.preventDefault();
    const amount = web3.utils.toWei(e.target.elements[0].value);
    inherichain.methods
      .withdrawSomeETH(amount)
      .send({from: accounts[0]})
      .then(() => {
        ownerWithdrawSomeETHStatus.innerHTML = "Success!";
      })
      .catch((error) => {
        ownerWithdrawSomeETHStatus.innerHTML = "There was an error!";
        console.log(error);
      });
  });

  ownerWithdrawAllETH.addEventListener("submit", async (e) => {
    clearStatus();
    ownerWithdrawAllETHStatus.innerHTML = "Transaction Pending...";
    e.preventDefault();
    inherichain.methods
      .withdrawAllETH()
      .send({from: accounts[0]})
      .then(() => {
        ownerWithdrawAllETHStatus.innerHTML = "Success!";
      })
      .catch((error) => {
        ownerWithdrawAllETHStatus.innerHTML = "There was an error!";
        console.log(error);
      });
  });

  ownerInteract.addEventListener("submit", async (e) => {
    clearStatus();
    ownerInteractStatus.innerHTML = "Transaction Pending...";
    e.preventDefault();
    const amount = e.target.elements[0].value;
    const msgData = e.target.elements[1].value;
    await web3.eth
      .sendTransaction({
        from: accounts[0],
        to: inherichain.options.address,
        value: web3.utils.toWei(amount),
        data: msgData,
      })
      .then(() => {
        ownerInteractStatus.innerHTML = "Success!";
      })
      .catch((error) => {
        ownerInteractStatus.innerHTML = "There was an error!";
        console.log(error);
      });
  });

  ownerDeployContract.addEventListener("submit", async (e) => {
    clearStatus();
    ownerDeployContractStatus.innerHTML = "Transaction Pending...";
    e.preventDefault();
    const amount = e.target.elements[0].value;
    const bytecode = e.target.elements[1].value;
    inherichain.methods
      .deployContract(amount, bytecode)
      .send({from: accounts[0], value: web3.utils.toWei(amount)})
      .then(() => {
        ownerDeployContractStatus.innerHTML = "Success!";
      })
      .catch((error) => {
        ownerDeployContractStatus.innerHTML = "There was an error!";
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
