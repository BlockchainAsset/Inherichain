import Web3 from 'web3';

let web3;
let accounts = [];

const initWeb3 = () => {
    return new Promise((resolve, reject) => {
        // New Metamask
        if(typeof window.ethereum !== 'undefined') {
            const web3 = new Web3(window.ethereum);
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

const initApp = () => {

    web3.eth.getAccounts()
    .then(_accounts => {
        accounts = _accounts;
    })

}

document.addEventListener('DOMContentLoaded', () => {
    initWeb3()
    .then(_web3 => {
        web3 = _web3;
        initApp();
    })
    .catch(error => {
        console.log(error);
    });
});