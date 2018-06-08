import { IslandData, DataMgr } from "../DataMgr";
import MainCtrl from "../MainCtrl";
import CurrencyFormatter from "../Utils/CurrencyFormatter";
import WorldUI from "../WorldUI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Island extends cc.Component {

    @property(cc.Label)
    lblName: cc.Label = null;
    @property(cc.Label)
    lblLeftMoney: cc.Label = null;
    @property(cc.Label)
    lblMiningSpeed: cc.Label = null;
    @property(cc.Label)
    lblOccupant: cc.Label = null;

    data: IslandData;
    e;
    
    btnNode: cc.Node;

    onLoad() {
        this.btnNode = new cc.Node();
        this.btnNode.parent = this.node;
        this.btnNode.on(cc.Node.EventType.TOUCH_END, this.onClick.bind(this));
    }

    setData(data: IslandData) {
        this.data = data;
    }
    update() {
        if (MainCtrl.Ticks % 60 == 0) {
            this.refresh();
        }
        this.node.position = this.data.location.mul(WorldUI.Instance.zoomScale);
    }
    refresh() {
        if (!this.data) return;
        this.lblName.string = this.data.sponsorName + ' 资源岛';
        this.lblLeftMoney.string = '当前储量' + CurrencyFormatter.formatNAS(this.data.money / 1e18) + 'NAS';
        let speed = Math.max(this.data.minMiningSpeed, this.data.miningRate * this.data.money / 1e18);
        this.lblMiningSpeed.string = '采集速度' + CurrencyFormatter.formatNAS(speed) + 'NAS/小时';
        if (this.data.occupant && this.data.occupant.length > 0) {
            const occupant = DataMgr.othersData[this.data.occupant];
            this.lblOccupant.string = '占领者 ' + (occupant ? occupant.nickname : this.data.occupant);
        } else {
            this.lblOccupant.string = '无人占领';
        }
        this.btnNode.setContentSize(this.node.width + 50, this.node.height + 50);
    }

    onLinkClick() {
        let link = this.data.sponsorLink;
        if (link && link.length > 0) window.open(link);
    }

    onClick() {
        WorldUI.Instance.selectIsland(this.node);
    }
}
