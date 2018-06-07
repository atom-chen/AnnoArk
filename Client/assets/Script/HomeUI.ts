import CvsMain from "./CvsMain";
import BaseUI from "./BaseUI";
import MainCtrl from "./MainCtrl";
import { DataMgr, UserData, CargoData, TechData } from "./DataMgr";
import WorldUI from "./WorldUI";
import ToastPanel from "./UI/ToastPanel";
import BlockchainMgr from "./BlockchainMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HomeUI extends BaseUI {
    static Instance: HomeUI;
    onLoad() {
        HomeUI.Instance = this;
    }

    @property(cc.Button)
    btnClaim0: cc.Button = null;
    @property(cc.Button)
    btnClaim1: cc.Button = null;
    @property(cc.Button)
    btnClaim2: cc.Button = null;
    
    @property(cc.Label)
    lblBlockchainAddress: cc.Label = null;

    start() {
        if (DataMgr.myData) {
            if (!DataMgr.myData.arkSize) {
                DataMgr.myData = null;
            }
        }
        if (DataMgr.myData) {
            CvsMain.EnterUI(WorldUI);
        }

        ToastPanel.Toast('正在读取您的钱包信息，如果您在用钱包玩游戏，请稍候');
    }

    update() {
        this.lblBlockchainAddress.string = BlockchainMgr.WalletAddress;
    }

    onClaim(event, index: string) {
        switch (index) {
            case '0': {
                DataMgr.myData = MainCtrl.Instance.generateNewArk(9);
                this.enterGameWithArk();
                break;
            }
            case '1': {
                //TODO:调用合约
                break;
            }
            case '2': {
                //TODO:调用合约
                break;
            }
        }
        DataMgr.myBuildingData = [];
    }

    enterGameWithArk() {
        DataMgr.myCargoData = [];
        DataMgr.CargoConfig.forEach(cargoInfo=>{
            let data = new CargoData();
            data.id = cargoInfo.id;
            data.amount = 0;
            DataMgr.myCargoData.push(data);
        })
        DataMgr.myTechData = [];
        DataMgr.TechConfig.forEach(techInfo=>{
            let data = new TechData();
            data.id = techInfo.id;
            data.filledWork = 0;
            data.finished = false;
            DataMgr.myTechData.push(data);
        })
        CvsMain.EnterUI(WorldUI);
        console.log('pop', DataMgr.myData.population)
    }

    onBookClick() {
        console.log('哪有白皮书')
    }
}
