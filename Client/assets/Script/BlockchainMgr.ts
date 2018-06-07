import { DataMgr, UserData, IslandData } from "./DataMgr";
import DialogPanel from "./DialogPanel";
import WorldUI from "./WorldUI";
import ToastPanel from "./UI/ToastPanel";
import ArkInWorld from "./ArkInWorld";
import ArkUI from "./ArkUI";
import CvsMain from "./CvsMain";
import HomeUI from "./HomeUI";

const { ccclass, property } = cc._decorator;

declare var Neb: any;
declare var NebPay: any;
declare var Account: any;
declare var HttpRequest: any;
export const ContractAddress = 'n1nB2VRCu1rs2Hoi4W5D19w9jUkmzLJNi9E';
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

    static CheckWalletInterval = 10;
    static FetchAllDataInterval = 10;

    checkWalletCountdown = 1e9;
    fetchAllDataCountdown = 1e9;

    start() {
        this.checkWalletCountdown = 1;
        this.fetchAllDataCountdown = 1;
    }

    //不断刷新当前钱包地址
    update(dt: number) {
        try {
            Neb; NebPay;
        } catch (error) {
            return;
        }

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
            // const func = 'get_map_info';

            let neb = new Neb();
            neb.setRequest(new HttpRequest(BlockchainMgr.BlockchainUrl));

            var from = BlockchainMgr.WalletAddress ? BlockchainMgr.WalletAddress : Account.NewAccount().getAddressString();
            var value = "0";
            var nonce = "0"
            var gas_price = "1000000"
            var gas_limit = "2000000"
            var callFunction = "get_map_info";
            var contract = {
                "function": callFunction,
                "args": "[]"
            }
            let self = this;
            neb.api.call(from, ContractAddress, value, nonce, gas_price, gas_limit, contract).then(
                self.onGetAllMapData
            ).catch(function (err) {
                console.log("call get_map_info error:" + err.message)
            })

            this.fetchAllDataCountdown = BlockchainMgr.FetchAllDataInterval;
        }
    }

    onGetWalletData(e) {
        if (e.data && e.data.data && e.data.data.account && e.data.data.account.length > 0) {
            var address = e.data.data.account;
            if (BlockchainMgr.WalletAddress != address) {
                console.log('Change wallet address:', address);
                BlockchainMgr.WalletAddress = address;
                this.fetchAllDataCountdown = 0;
                if (WorldUI.Instance.node.active || ArkUI.Instance.node.active) CvsMain.EnterUI(HomeUI);
            }
        }
    }

    onGetAllMapData(resp) {
        console.log('onGetAllMapData', resp);
        let allData = JSON.parse(resp.result).result_data;
        let allArkData = allData.ark_info;
        let allIslandData = allData.island_info;

        allArkData.forEach(arkJson => {
            if (arkJson.address == BlockchainMgr.WalletAddress) {
                if (!DataMgr.myData) {
                    //新前端
                    DataMgr.myData = new UserData();
                }
                DataMgr.myData.arkSize = DataMgr.GetArkSizeByRecharge(arkJson.rechargeOnExpand);
                if (!DataMgr.myData.nickname) DataMgr.myData.nickname = arkJson.nickname;
                DataMgr.myData.address = arkJson.address;
                if (!DataMgr.myData.country) DataMgr.myData.country = arkJson.country;
                DataMgr.myData.speed = arkJson.speed;
                DataMgr.myData.locationX = arkJson.locationX;
                DataMgr.myData.locationY = arkJson.locationY;
                DataMgr.myData.lastLocationTime = arkJson.lastLocationTime;
                DataMgr.myData.destinationX = arkJson.destinationX;
                DataMgr.myData.destinationY = arkJson.destinationY;
                DataMgr.writeData();
            } else {
                let localData = DataMgr.othersData[arkJson.address];
                if (!localData) {
                    localData = new UserData();
                    localData.currentLocation = new cc.Vec2(arkJson.locationX, arkJson.locationY);
                    DataMgr.othersData[arkJson.address] = localData;
                }
                for (let key in arkJson) {
                    localData[key] = arkJson[key];
                }
            }
        });
        allIslandData.forEach(islandJson => {
            let localData: IslandData = DataMgr.allIslandData[islandJson.id];
            if (localData) {
                for (let key in islandJson) {
                    localData[key] = islandJson[key];
                }
            } else {
                console.error('从区块链获取到未知id的island:', islandJson);
            }
        });
    }

    claimArk(value: number) {
        if (window['webExtensionWallet']) {
            try {
                const nickname = HomeUI.Instance.lblNickname.string;
                const country = HomeUI.Instance.country;

                var nebPay = new NebPay();
                var serialNumber;
                var callbackUrl = BlockchainMgr.BlockchainUrl;
                var to = ContractAddress;
                var value = 0;
                var callFunction = 'claim_ark';
                console.log("调用钱包claim_ark(", nickname, );
                var callArgs = '["' + nickname + '","' + country + '"]';
                serialNumber = nebPay.call(to, value, callFunction, callArgs, {
                    qrcode: {
                        showQRCode: false
                    },
                    goods: {
                        name: "test",
                        desc: "test goods"
                    },
                    callback: callbackUrl,
                    listener: this.claimArkCallback
                });
            } catch (error) {
                console.error(error);
            }
        } else {
            DialogPanel.PopupWith2Buttons('您没有安装星云钱包',
                '安装星云钱包，方可使用区块链功能，与全世界玩家互动。',
                '取消', null, '安装',
                () => window.open("https://github.com/ChengOrangeJu/WebExtensionWallet"));
        }
    }
    claimArkCallback(resp: string) {
        console.log("claimArkCallback: ", resp);
        if (resp.toString().substr(0, 5) != 'Error') {
            ToastPanel.Toast('交易发送成功，请等待区块链出块');
        } else {
            ToastPanel.Toast('交易失败:' + resp);
        }
    }

    setSail(deltaData) {
        if (window['webExtensionWallet']) {
            try {
                var nebPay = new NebPay();
                var serialNumber;
                var callbackUrl = BlockchainMgr.BlockchainUrl;

                var to = ContractAddress;
                var value = 0;
                var callFunction = 'udpate_ark';
                // let enc = BlockchainMgr.encrypto(score.toString(), EncKey, 25);
                console.log("调用钱包", deltaData);
                var callArgs = '["' + JSON.stringify(deltaData) + '"]';
                serialNumber = nebPay.call(to, value, callFunction, callArgs, {
                    qrcode: {
                        showQRCode: false
                    },
                    goods: {
                        name: "test",
                        desc: "test goods"
                    },
                    callback: callbackUrl,
                    listener: this.setSailCallback
                });
            } catch (error) {
                console.error(error);
            }
        } else {
            DialogPanel.PopupWith2Buttons('您没有安装星云钱包',
                '安装星云钱包，方可使用区块链功能，与全世界玩家互动。',
                '取消', null, '安装',
                () => window.open("https://github.com/ChengOrangeJu/WebExtensionWallet"));
        }
    }
    setSailCallback(resp: string) {
        console.log("setSailCallback: ", resp);
        if (resp.toString().substr(0, 5) != 'Error') {
            ToastPanel.Toast('方舟引擎开始预热，预计1分钟内出发\n(交易发送成功，请等待区块链出块)');
            WorldUI.Instance.editSailDestinationMode = false;
        } else {
            ToastPanel.Toast('交易失败:' + resp);
        }
    }

    static encrypto(str, xor, hex) {
        if (typeof str !== 'string' || typeof xor !== 'number' || typeof hex !== 'number') {
            return;
        }

        let resultList = [];
        hex = hex <= 25 ? hex : hex % 25;

        for (let i = 0; i < str.length; i++) {
            // 提取字符串每个字符的ascll码
            let charCode: any = str.charCodeAt(i);
            // 进行异或加密
            charCode = (charCode * 1) ^ xor;
            // 异或加密后的字符转成 hex 位数的字符串
            charCode = charCode.toString(hex);
            resultList.push(charCode);
        }

        let splitStr = String.fromCharCode(hex + 97);
        let resultStr = resultList.join(splitStr);
        return resultStr;
    }
}
