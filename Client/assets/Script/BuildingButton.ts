import BuildPanel from "./BuildPanel";
import ArkUI from "./ArkUI";
import { BuildingInfo } from "./DataMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BuildingButton extends cc.Component {

    @property(cc.Label)
    lblName: cc.Label = null;
    @property(cc.Label)
    lblSize: cc.Label = null;

    @property(cc.Label)
    lblRaws: cc.Label = null;

    info: BuildingInfo;

    setAndRefresh(info: BuildingInfo) {
        this.info = info;
        this.lblName.string = info.Name;
        this.lblSize.string = info.length + '*' + info.width;
    }

    onClick() {
        BuildPanel.Hide();
        ArkUI.Instance.enterBuildMode(this.info);
    }
}
