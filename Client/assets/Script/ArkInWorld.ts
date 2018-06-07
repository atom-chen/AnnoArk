import { DataMgr, UserData } from "./DataMgr";
import MainCtrl from "./MainCtrl";
import WorldUI from "./WorldUI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ArkInWorld extends cc.Component {

    @property(cc.Sprite)
    sprArk: cc.Sprite = null;
    @property(cc.Label)
    lblName: cc.Label = null;

    data: UserData;

    setAndRefresh(data: UserData, zoomScale: number) {
        this.data = data;
        this.sprArk.node.setContentSize(data.arkSize, data.arkSize);
        this.lblName.string = data.nickname;
        this.refreshZoom(zoomScale);
    }

    refreshZoom(zoomScale: number) {
        this.node.position = this.data.currentLocation.mul(zoomScale);
    }

    update(dt: number) {
        this.refreshZoom(WorldUI.Instance.zoomScale);
    }
}
