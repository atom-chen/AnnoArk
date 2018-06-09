import { IslandData, DataMgr } from "../DataMgr";
import CurrencyFormatter from "../Utils/CurrencyFormatter";

const { ccclass, property } = cc._decorator;

@ccclass
export default class IslandInfoFrame extends cc.Component {

    @property(cc.Label)
    lblName: cc.Label = null;
    @property(cc.Label)
    lblLeftMoney: cc.Label = null;
    @property(cc.Label)
    lblMiningSpeed: cc.Label = null;
    @property(cc.Label)
    lblOccupant: cc.Label = null;


    refresh(data: IslandData) {
        if (!data) return;
        this.lblName.string = data.sponsorName + ' 资源岛';
        let curMoney = data.money * (1 - Math.exp(-data.miningRate * (Number(new Date()) - data.lastMineTime) / (1000 * 3600)));
        this.lblLeftMoney.string = CurrencyFormatter.formatNAS(curMoney / 1e18) + 'NAS';
        let speed = data.miningRate * curMoney / 1e18;
        this.lblMiningSpeed.string = CurrencyFormatter.formatNAS(speed) + 'NAS/小时';
        if (data.occupant && data.occupant.length > 0) {
            let occupant = data.occupant == DataMgr.myData.address ? DataMgr.myData : DataMgr.othersData[data.occupant];
            this.lblOccupant.string = (occupant ? occupant.nickname : data.occupant);
        } else {
            this.lblOccupant.string = '(无)';
        }
    }
}