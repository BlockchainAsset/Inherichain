import Web3 from 'web3';
import Inherichain from '../build/contracts/Inherichain.json';

let web3;
let inherichain;
let accounts = [];
let status = ['Initial', 'Heir Claimed', 'Approver Approved', 'Initiated Charity']

const initWeb3 = () => {
    return new Promise((resolve, reject) => {
        // New Metamask
        if(typeof window.ethereum !== 'undefined') {
            web3 = new Web3(window.ethereum);
            window.ethereum.enable()
            .then(() => {
                resolve(
                    new Web3(window.ethereum)
                );
            })
            .catch(error => {
                reject(error);
            });
            return;
        }
        // Old Metamask
        if(typeof window.web3 !== 'undefined') {
            return resolve(
                new Web3(window.web3.currentProvider)
            );
        }
        // For ganache-cli (for Ganache GUI, use 9545 instead of 8545)
        resolve(new Web3('http://localhost:8545'));
    });
};

const initContract = (address) => {
    return new web3.eth.Contract(Inherichain.abi, address);
};

const initAccount = () => {
    web3.eth.getAccounts()
    .then(_accounts => {
        accounts = _accounts;
    })
}

const initWalletAddress = () => {
    const setAddress = document.getElementById('setAddress');
    setAddress.addEventListener('submit', (e) => {
        e.preventDefault();
        const address = e.target.elements[0].value;
        inherichain = initContract(address);
        getData();
    });
}

const getData = () => {
    const currentUserBalance = document.getElementById('currentUserBalance');
    const currentContractBalance = document.getElementById('currentContractBalance');
    const currentOwner = document.getElementById('currentOwner');
    const currentBackupOwner = document.getElementById('currentBackupOwner');
    const currentHeir = document.getElementById('currentHeir');
    const currentCharity = document.getElementById('currentCharity');
    const approverOne = document.getElementById('currentApproverOne');
    const approverTwo = document.getElementById('currentApproverTwo');
    const approverThree = document.getElementById('currentApproverThree');
    const approverCount = document.getElementById('currentApproverCount');
    const deadline = document.getElementById('currentDeadline');
    const approverDeadline = document.getElementById('currentApproverDeadline');
    const charityDeadline = document.getElementById('currentCharityDeadline');
    const contractStatus = document.getElementById('currentContractStatus');
    const claimTime = document.getElementById('currentClaimTime');
    const voteCount = document.getElementById('currentVoteCount');

    web3.eth.getBalance(accounts[0])
        .then(values => {
            currentUserBalance.innerHTML = web3.utils.fromWei(values) + ' ETH';
        })
        .catch(error => {
            currentUserBalance.innerHTML = 'There was an error while reading the data.';
            console.log(error);
        });

    web3.eth.getBalance(inherichain.options.address)
        .then(values => {
            currentContractBalance.innerHTML = web3.utils.fromWei(values) + ' ETH';
        })
        .catch(error => {
            currentContractBalance.innerHTML = 'There was an error while reading the data.';
            console.log(error);
        });

    inherichain.methods.owner()
        .call({from: accounts[0]})
        .then(values => {
            currentOwner.innerHTML = values;
        })
        .catch(error => {
            currentOwner.innerHTML = 'There was an error while reading the data.';
            console.log(error);
        });

    inherichain.methods.backupOwner()
        .call({from: accounts[0]})
        .then(values => {
            currentBackupOwner.innerHTML = values;
        })
        .catch(error => {
            currentBackupOwner.innerHTML = 'There was an error while reading the data.';
            console.log(error);
        });

    inherichain.methods.heir()
        .call({from: accounts[0]})
        .then(values => {
            currentHeir.innerHTML = values;
        })
        .catch(error => {
            currentHeir.innerHTML = 'There was an error while reading the data.';
            console.log(error);
        });

    inherichain.methods.charity()
        .call({from: accounts[0]})
        .then(values => {
            currentCharity.innerHTML = values;
        })
        .catch(error => {
            currentCharity.innerHTML = 'There was an error while reading the data.';
            console.log(error);
        });

    inherichain.methods.approvers(0)
        .call({from: accounts[0]})
        .then(values => {
            approverOne.innerHTML = values;
        })
        .catch(error => {
            approverOne.innerHTML = 'There was an error while reading the data.';
            console.log(error);
        });

    inherichain.methods.approvers(1)
        .call({from: accounts[0]})
        .then(values => {
            approverTwo.innerHTML = values;
        })
        .catch(error => {
            approverTwo.innerHTML = 'There was an error while reading the data.';
            console.log(error);
        });

    inherichain.methods.approvers(2)
        .call({from: accounts[0]})
        .then(values => {
            approverThree.innerHTML = values;
        })
        .catch(error => {
            approverThree.innerHTML = 'There was an error while reading the data.';
            console.log(error);
        });

    inherichain.methods.approversLength()
        .call({from: accounts[0]})
        .then(values => {
            approverCount.innerHTML = values;
        })
        .catch(error => {
            approverCount.innerHTML = 'There was an error while reading the data.';
            console.log(error);
        });

    inherichain.methods.heirDeadline()
        .call({from: accounts[0]})
        .then(values => {
            deadline.innerHTML = values;
        })
        .catch(error => {
            deadline.innerHTML = 'There was an error while reading the data.';
            console.log(error);
        });

    inherichain.methods.heirApprovedDeadline()
        .call({from: accounts[0]})
        .then(values => {
            approverDeadline.innerHTML = values;
        })
        .catch(error => {
            approverDeadline.innerHTML = 'There was an error while reading the data.';
            console.log(error);
        });

    inherichain.methods.charityDeadline()
        .call({from: accounts[0]})
        .then(values => {
            charityDeadline.innerHTML = values;
        })
        .catch(error => {
            charityDeadline.innerHTML = 'There was an error while reading the data.';
            console.log(error);
        });

    inherichain.methods.status()
        .call({from: accounts[0]})
        .then(values => {
            contractStatus.innerHTML = status[values];
        })
        .catch(error => {
            contractStatus.innerHTML = 'There was an error while reading the data.';
            console.log(error);
        });

    inherichain.methods.claimTime()
        .call({from: accounts[0]})
        .then(values => {
            claimTime.innerHTML = values;
        })
        .catch(error => {
            claimTime.innerHTML = 'There was an error while reading the data.';
            console.log(error);
        });

    inherichain.methods.voteCount()
        .call({from: accounts[0]})
        .then(values => {
            voteCount.innerHTML = values;
        })
        .catch(error => {
            voteCount.innerHTML = 'There was an error while reading the data.';
            console.log(error);
        });

}

const clearStatus = () => {
    const userDepositStatus = document.getElementById('userDepositStatus');
    const ownerUpdateBackupOwnerStatus = document.getElementById('ownerUpdateBackupOwnerStatus');
    const ownerUpdateHeirStatus = document.getElementById('ownerUpdateHeirStatus');
    const ownerUpdateCharityStatus = document.getElementById('ownerUpdateCharityStatus');
    const ownerAddApproverStatus = document.getElementById('ownerAddApproverStatus');
    const ownerDeleteApproverStatus = document.getElementById('ownerDeleteApproverStatus');
    const ownerUpdateDeadlineStatus = document.getElementById('ownerUpdateDeadlineStatus');
    const ownerTransferSomeETHStatus = document.getElementById('ownerTransferSomeETHStatus');
    const ownerWithdrawSomeETHStatus = document.getElementById('ownerWithdrawSomeETHStatus');
    const ownerWithdrawAllETHStatus = document.getElementById('ownerWithdrawAllETHStatus');
    const ownerInteractStatus = document.getElementById('ownerInteractStatus');
    const ownerDeployContractStatus = document.getElementById('ownerDeployContractStatus');
    const backupOwnerUpdateOwnerStatus = document.getElementById('backupOwnerUpdateOwnerStatus');
    const heirClaimOwnershipStatus = document.getElementById('heirClaimOwnershipStatus');
    const accessWalletApproverStatus = document.getElementById('accessWalletApproverStatus');
    const accessWalletDeadlineStatus = document.getElementById('accessWalletDeadlineStatus');
    const approverAcceptanceStatus = document.getElementById('approverAcceptanceStatus');
    const initiateCharityStatus = document.getElementById('initiateCharityStatus');
    
    userDepositStatus.innerHTML = '';
    ownerUpdateBackupOwnerStatus.innerHTML = '';
    ownerUpdateHeirStatus.innerHTML = '';
    ownerUpdateCharityStatus.innerHTML = '';
    ownerAddApproverStatus.innerHTML = '';
    ownerDeleteApproverStatus.innerHTML = '';
    ownerUpdateDeadlineStatus.innerHTML = '';
    ownerTransferSomeETHStatus.innerHTML = '';
    ownerWithdrawSomeETHStatus.innerHTML = '';
    ownerWithdrawAllETHStatus.innerHTML = '';
    ownerInteractStatus.innerHTML = '';
    ownerDeployContractStatus.innerHTML = '';
    backupOwnerUpdateOwnerStatus.innerHTML = '';
    heirClaimOwnershipStatus.innerHTML = '';
    accessWalletApproverStatus.innerHTML = '';
    accessWalletDeadlineStatus.innerHTML = '';
    approverAcceptanceStatus.innerHTML = '';
    initiateCharityStatus.innerHTML = '';
}

const initApp = () => {
    const userDepositETH = document.getElementById('userDepositETH');
    const ownerUpdateBackupOwner = document.getElementById('ownerUpdateBackupOwner');
    const ownerUpdateHeir = document.getElementById('ownerUpdateHeir');
    const ownerUpdateCharity = document.getElementById('ownerUpdateCharity');
    const ownerAddApprover = document.getElementById('ownerAddApprover');
    const ownerDeleteApprover = document.getElementById('ownerDeleteApprover');
    const ownerUpdateDeadline = document.getElementById('ownerUpdateDeadline');
    const ownerTransferSomeETH = document.getElementById('ownerTransferSomeETH');
    const ownerWithdrawSomeETH = document.getElementById('ownerWithdrawSomeETH');
    const ownerWithdrawAllETH = document.getElementById('ownerWithdrawAllETH');
    const ownerInteract = document.getElementById('ownerInteract');
    const ownerDeployContract = document.getElementById('ownerDeployContract');
    const backupOwnerUpdateOwner = document.getElementById('backupOwnerUpdateOwner');
    const heirClaimOwnership = document.getElementById('heirClaimOwnership');
    const accessWalletApprover = document.getElementById('accessWalletApprover');
    const accessWalletDeadline = document.getElementById('accessWalletDeadline');
    const approverAcceptance = document.getElementById('approverAcceptance');
    const initiateCharity = document.getElementById('initiateCharity');

    const userDepositStatus = document.getElementById('userDepositStatus');
    const ownerUpdateBackupOwnerStatus = document.getElementById('ownerUpdateBackupOwnerStatus');
    const ownerUpdateHeirStatus = document.getElementById('ownerUpdateHeirStatus');
    const ownerUpdateCharityStatus = document.getElementById('ownerUpdateCharityStatus');
    const ownerAddApproverStatus = document.getElementById('ownerAddApproverStatus');
    const ownerDeleteApproverStatus = document.getElementById('ownerDeleteApproverStatus');
    const ownerUpdateDeadlineStatus = document.getElementById('ownerUpdateDeadlineStatus');
    const ownerTransferSomeETHStatus = document.getElementById('ownerTransferSomeETHStatus');
    const ownerWithdrawSomeETHStatus = document.getElementById('ownerWithdrawSomeETHStatus');
    const ownerWithdrawAllETHStatus = document.getElementById('ownerWithdrawAllETHStatus');
    const ownerInteractStatus = document.getElementById('ownerInteractStatus');
    const ownerDeployContractStatus = document.getElementById('ownerDeployContractStatus');
    const backupOwnerUpdateOwnerStatus = document.getElementById('backupOwnerUpdateOwnerStatus');
    const heirClaimOwnershipStatus = document.getElementById('heirClaimOwnershipStatus');
    const accessWalletApproverStatus = document.getElementById('accessWalletApproverStatus');
    const accessWalletDeadlineStatus = document.getElementById('accessWalletDeadlineStatus');
    const approverAcceptanceStatus = document.getElementById('approverAcceptanceStatus');
    const initiateCharityStatus = document.getElementById('initiateCharityStatus');

    userDepositETH.addEventListener('submit', async (e) => {
        clearStatus();
        userDepositStatus.innerHTML = 'Transaction Pending...';
        e.preventDefault();
        const amount = e.target.elements[0].value;
        await web3.eth.sendTransaction({
            from: accounts[0],
            to: inherichain.options.address,
            value: web3.utils.toWei(amount)
        })
        .then(() => {
            userDepositStatus.innerHTML = 'Success!';
            getData();
        })
        .catch(error => {
            userDepositStatus.innerHTML = 'There was an error asd!';
            console.log(error);
        })
    });

    ownerUpdateBackupOwner.addEventListener('submit', async (e) => {
        clearStatus();
        ownerUpdateBackupOwnerStatus.innerHTML = 'Transaction Pending...';
        e.preventDefault();
        const address = e.target.elements[0].value;
        inherichain.methods.updateBackupOwner(address)
            .send({from: accounts[0]})
            .then(() => {
                ownerUpdateBackupOwnerStatus.innerHTML = 'Success!';
                getData();
            })
            .catch(error => {
                ownerUpdateBackupOwnerStatus.innerHTML = 'There was an error!';
                console.log(error);
            });
    });

    ownerUpdateHeir.addEventListener('submit', async (e) => {
        clearStatus();
        ownerUpdateHeirStatus.innerHTML = 'Transaction Pending...';
        e.preventDefault();
        const address = e.target.elements[0].value;
        inherichain.methods.updateHeir(address)
            .send({from: accounts[0]})
            .then(() => {
                ownerUpdateHeirStatus.innerHTML = 'Success!';
                getData();
            })
            .catch(error => {
                ownerUpdateHeirStatus.innerHTML = 'There was an error!';
                console.log(error);
            });
    });

    ownerUpdateCharity.addEventListener('submit', async (e) => {
        clearStatus();
        ownerUpdateCharityStatus.innerHTML = 'Transaction Pending...';
        e.preventDefault();
        const address = e.target.elements[0].value;
        inherichain.methods.updateCharity(address)
            .send({from: accounts[0]})
            .then(() => {
                ownerUpdateCharityStatus.innerHTML = 'Success!';
                getData();
            })
            .catch(error => {
                ownerUpdateCharityStatus.innerHTML = 'There was an error!';
                console.log(error);
            });
    });

    ownerAddApprover.addEventListener('submit', async (e) => {
        clearStatus();
        ownerAddApproverStatus.innerHTML = 'Transaction Pending...';
        e.preventDefault();
        const address = e.target.elements[0].value;
        inherichain.methods.addApprover(address)
            .send({from: accounts[0]})
            .then(() => {
                ownerAddApproverStatus.innerHTML = 'Success!';
                getData();
            })
            .catch(error => {
                ownerAddApproverStatus.innerHTML = 'There was an error!';
                console.log(error);
            });
    });

    ownerDeleteApprover.addEventListener('submit', async (e) => {
        clearStatus();
        ownerDeleteApproverStatus.innerHTML = 'Transaction Pending...';
        e.preventDefault();
        const address = e.target.elements[0].value;
        inherichain.methods.deleteApprover(address)
            .send({from: accounts[0]})
            .then(() => {
                ownerDeleteApproverStatus.innerHTML = 'Success!';
                getData();
            })
            .catch(error => {
                ownerDeleteApproverStatus.innerHTML = 'There was an error!';
                console.log(error);
            });
    });

    ownerUpdateDeadline.addEventListener('submit', async (e) => {
        clearStatus();
        ownerUpdateDeadlineStatus.innerHTML = 'Transaction Pending...';
        e.preventDefault();
        const deadline = e.target.elements[0].value;
        const approverDeadline = e.target.elements[1].value;
        const charityDeadline = e.target.elements[2].value;
        inherichain.methods.updateDeadline(deadline, approverDeadline, charityDeadline)
            .send({from: accounts[0]})
            .then(() => {
                ownerUpdateDeadlineStatus.innerHTML = 'Success!';
                getData();
            })
            .catch(error => {
                ownerUpdateDeadlineStatus.innerHTML = 'There was an error!';
                console.log(error);
            });
    });

    ownerTransferSomeETH.addEventListener('submit', async (e) => {
        clearStatus();
        ownerTransferSomeETHStatus.innerHTML = 'Transaction Pending...';
        e.preventDefault();
        const amount = web3.utils.toWei(e.target.elements[0].value);
        const address = e.target.elements[1].value;
        inherichain.methods.transferETH(address, amount)
            .send({from: accounts[0]})
            .then(() => {
                ownerTransferSomeETHStatus.innerHTML = 'Success!';
                getData();
            })
            .catch(error => {
                ownerTransferSomeETHStatus.innerHTML = 'There was an error!';
                console.log(error);
            });
    });

    ownerWithdrawSomeETH.addEventListener('submit', async (e) => {
        clearStatus();
        ownerWithdrawSomeETHStatus.innerHTML = 'Transaction Pending...';
        e.preventDefault();
        const amount = web3.utils.toWei(e.target.elements[0].value);
        inherichain.methods.withdrawSomeETH(amount)
            .send({from: accounts[0]})
            .then(() => {
                ownerWithdrawSomeETHStatus.innerHTML = 'Success!';
                getData();
            })
            .catch(error => {
                ownerWithdrawSomeETHStatus.innerHTML = 'There was an error!';
                console.log(error);
            });
    });

    ownerWithdrawAllETH.addEventListener('submit', async (e) => {
        clearStatus();
        ownerWithdrawAllETHStatus.innerHTML = 'Transaction Pending...';
        e.preventDefault();
        inherichain.methods.withdrawAllETH()
            .send({from: accounts[0]})
            .then(() => {
                ownerWithdrawAllETHStatus.innerHTML = 'Success!';
                getData();
            })
            .catch(error => {
                ownerWithdrawAllETHStatus.innerHTML = 'There was an error!';
                console.log(error);
            });
    });

    ownerInteract.addEventListener('submit', async (e) => {
        clearStatus();
        ownerInteractStatus.innerHTML = 'Transaction Pending...';
        e.preventDefault();
        const amount = e.target.elements[0].value;
        const msgData = e.target.elements[1].value;
        await web3.eth.sendTransaction({
            from: accounts[0],
            to: inherichain.options.address,
            value: web3.utils.toWei(amount),
            data: msgData
        })
        .then(() => {
            ownerInteractStatus.innerHTML = 'Success!';
            getData();
        })
        .catch(error => {
            ownerInteractStatus.innerHTML = 'There was an error!';
            console.log(error);
        })
    });

    ownerDeployContract.addEventListener('submit', async (e) => {
        clearStatus();
        ownerDeployContractStatus.innerHTML = 'Transaction Pending...';
        e.preventDefault();
        const amount = e.target.elements[0].value;
        const bytecode = e.target.elements[1].value;
        inherichain.methods.deployContract(amount, bytecode)
            .send({from: accounts[0], value: web3.utils.toWei(amount)})
            .then(() => {
                ownerDeployContractStatus.innerHTML = 'Success!';
                getData();
            })
            .catch(error => {
                ownerDeployContractStatus.innerHTML = 'There was an error!';
                console.log(error);
            });
    });

    backupOwnerUpdateOwner.addEventListener('submit', async (e) => {
        clearStatus();
        backupOwnerUpdateOwnerStatus.innerHTML = 'Transaction Pending...';
        e.preventDefault();
        const address = e.target.elements[0].value;
        inherichain.methods.updateOwner(address)
            .send({from: accounts[0]})
            .then(() => {
                backupOwnerUpdateOwnerStatus.innerHTML = 'Success!';
                getData();
            })
            .catch(error => {
                backupOwnerUpdateOwnerStatus.innerHTML = 'There was an error!';
                console.log(error);
            });
    });

    heirClaimOwnership.addEventListener('submit', async (e) => {
        clearStatus();
        heirClaimOwnershipStatus.innerHTML = 'Transaction Pending...';
        e.preventDefault();
        inherichain.methods.claimOwnership()
            .send({from: accounts[0]})
            .then(() => {
                heirClaimOwnershipStatus.innerHTML = 'Success!';
                getData();
            })
            .catch(error => {
                heirClaimOwnershipStatus.innerHTML = 'There was an error!';
                console.log(error);
            });
    });

    accessWalletApprover.addEventListener('submit', async (e) => {
        clearStatus();
        accessWalletApproverStatus.innerHTML = 'Transaction Pending...';
        e.preventDefault();
        const backupOwner = e.target.elements[0].value;
        const heir = e.target.elements[1].value;
        const approverOne = e.target.elements[2].value;
        const approverTwo = e.target.elements[3].value;
        const approverThree = e.target.elements[4].value;
        const deadline = Number(e.target.elements[5].value);
        const approverDeadline = Number(e.target.elements[6].value);
        inherichain.methods.accessOwnershipFromApprover(
            backupOwner, heir, [approverOne, approverTwo, approverThree], deadline, approverDeadline
        )
            .send({from: accounts[0]})
            .then(() => {
                accessWalletApproverStatus.innerHTML = `Success!`;
                getData();
            })
            .catch(error => {
                accessWalletApproverStatus.innerHTML = `There was an error!`;
                console.log(error);
            });
    });

    accessWalletDeadline.addEventListener('submit', async (e) => {
        clearStatus();
        accessWalletDeadlineStatus.innerHTML = 'Transaction Pending...';
        e.preventDefault();
        const backupOwner = e.target.elements[0].value;
        const heir = e.target.elements[1].value;
        const approverOne = e.target.elements[2].value;
        const approverTwo = e.target.elements[3].value;
        const approverThree = e.target.elements[4].value;
        const deadline = Number(e.target.elements[5].value);
        const approverDeadline = Number(e.target.elements[6].value);
        inherichain.methods.accessOwnershipAfterDeadline(
            backupOwner, heir, [approverOne, approverTwo, approverThree], deadline, approverDeadline
        )
            .send({from: accounts[0]})
            .then(() => {
                accessWalletDeadlineStatus.innerHTML = `Success!`;
                getData();
            })
            .catch(error => {
                accessWalletDeadlineStatus.innerHTML = `There was an error!`;
                console.log(error);
            });
    });

    approverAcceptance.addEventListener('submit', async (e) => {
        clearStatus();
        approverAcceptanceStatus.innerHTML = 'Transaction Pending...';
        e.preventDefault();
        const acceptance = Number(e.target.elements[0].value);
        let value = true;
        if(acceptance == 0){
            value = false;
        }
        inherichain.methods.approveHeir(value)
            .send({from: accounts[0]})
            .then(() => {
                approverAcceptanceStatus.innerHTML = 'Success!';
                getData();
            })
            .catch(error => {
                approverAcceptanceStatus.innerHTML = 'There was an error!';
                console.log(error);
            });
    });

    initiateCharity.addEventListener('submit', async (e) => {
        clearStatus();
        initiateCharityStatus.innerHTML = 'Transaction Pending...';
        e.preventDefault();
        inherichain.methods.initiateCharity()
            .send({from: accounts[0]})
            .then(() => {
                initiateCharityStatus.innerHTML = 'Success!';
                getData();
            })
            .catch(error => {
                initiateCharityStatus.innerHTML = 'There was an error!';
                console.log(error);
            });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initWeb3()
    .then(_web3 => {
        web3 = _web3;
        initAccount();
        initApp();
        initWalletAddress();
    })
    .catch(error => {
        console.log(error);
    });
});