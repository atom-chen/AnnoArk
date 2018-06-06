
const { ccclass, property } = cc._decorator;

declare var Neb: any;
declare var NebPay: any;
declare var Account: any;
declare var HttpRequest: any;
export const ContractAddress = 'n132idsojgs';
export const EncKey = 37234;

@ccclass
export default class BlockchainMgr extends cc.Component {
    static Instance: BlockchainMgr;
    onLoad() {
        BlockchainMgr.Instance = this;
    }

    // static BlockchainUrl: string = 'https://mainnet.nebulas.io';
    static BlockchainUrl: string = 'https://testnet.nebulas.io';
    static WalletAddress: string;

    static CheckWalletInterval = 3;
    static FetchAllDataInterval = 10;

    checkWalletCountdown = 1e9;
    fetchAllDataCountdown = 1e9;

    start() {
        this.checkWalletCountdown = BlockchainMgr.CheckWalletInterval;
        this.fetchAllDataCountdown = BlockchainMgr.FetchAllDataInterval;
    }

    //不断刷新当前钱包地址
    update(dt: number) {
        this.checkWalletCountdown -= dt;
        this.fetchAllDataCountdown -= dt;

        if (this.checkWalletCountdown <= 0) {
            try {
                let self = this;
                let neb = new Neb();
                neb.setRequest(new HttpRequest(BlockchainMgr.BlockchainUrl));
                neb.api.getNebState().then(function (state) {
                    // self.nebState = state;
                    window.addEventListener('message', self.onGetWalletData);
                    window.postMessage({
                        "target": "contentscript",
                        "data": {},
                        "method": "getAccount",
                    }, "*");
                });
            } catch (error) {
                console.error(error);
            }
            this.checkWalletCountdown = BlockchainMgr.CheckWalletInterval;
        }
        if (this.fetchAllDataCountdown <= 0) {


            this.fetchAllDataCountdown = BlockchainMgr.FetchAllDataInterval;
        }
    }

    onGetWalletData(e) {
        if (e.data && e.data.data) {
            if (e.data.data.account) {
                var address = e.data.data.account;
                if (BlockchainMgr.WalletAddress != address) {
                    console.log('Change wallet address:', address);
                    BlockchainMgr.WalletAddress = address;
                    this.fetchAllDataCountdown = 0;
                }
            }
        }
    }

    onUploadBtnClick() {
        if (window.webExtensionWallet) {
            try {
                let score = MainCtrl.Instance.lastScore;
                let donateAmount = parseFloat(this.edtDonate.string);
                let comment = this.edtComment.string;
                let operation = [];
                MainCtrl.Instance.lastTradeHistory.forEach(trade => {
                    operation.push(trade[0] * 10 + trade[2]);
                });

                var nebPay = new NebPay();
                var serialNumber;
                var callbackUrl = MainCtrl.BlockchainUrl;

                var to = ContractAddress;
                var value = donateAmount;
                var callFunction = 'submit';
                let encScore = UploadUI.encrypto(score.toString(), EncKey, 25);
                console.log("调用钱包", score, donateAmount, comment, operation, encScore);
                var callArgs = '["' + encScore + '","' + comment + '",[' + operation.toString() + ']]';
                serialNumber = nebPay.call(to, value, callFunction, callArgs, {
                    qrcode: {
                        showQRCode: false
                    },
                    goods: {
                        name: "test",
                        desc: "test goods"
                    },
                    callback: callbackUrl,
                    listener: this.listener
                });
            } catch (error) {
                console.error(error);
            }
        } else {
            window.open("https://github.com/ChengOrangeJu/WebExtensionWallet");
        }
    }
}
