import BlockchainMgr from "../BlockchainMgr";
import Island from "../World/Island";
import CurrencyFormatter from "../Utils/CurrencyFormatter";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SponsorIslandPanel extends cc.Component {
    static Instance: SponsorIslandPanel;
    onLoad() { SponsorIslandPanel.Instance = this; this.node.active = false; }

    @property(cc.EditBox)
    edtName: cc.EditBox = null;
    @property(cc.EditBox)
    edtLink: cc.EditBox = null;
    @property(cc.EditBox)
    edtValue: cc.EditBox = null;
    @property(cc.Label)
    lblCurMoney: cc.Label = null;

    island: Island;
    setData(island: Island) {
        this.island = island;
        if (island.data.sponsor == BlockchainMgr.WalletAddress) {
            this.lblCurMoney.string = '0';
        } else {
            let curMoney = this.island.data.money * (1 - Math.exp(-this.island.data.miningRate * (Number(new Date()) - this.island.data.lastMineTime) / (1000 * 3600)));
            this.lblCurMoney.string = CurrencyFormatter.formatNAS(curMoney * 1.101 / 1e18);
        }
    }
    onConfirmClick() {
        BlockchainMgr.Instance.sponsor(this.island.data.id, this.edtName.string, this.edtLink.string, parseFloat(this.edtValue.string));
    }

    close() {
        this.node.active = false;
    }
}