import { DataMgr, UserData } from "./DataMgr";
import MainCtrl from "./MainCtrl";
import WorldUI from "./WorldUI";
import { FlagMgr } from "./UI/FlagMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ArkInWorld extends cc.Component {

    @property(cc.Sprite)
    sprArk: cc.Sprite = null;
    @property(cc.Sprite)
    sprFlag: cc.Sprite = null;
    @property(cc.Label)
    lblName: cc.Label = null;

    data: UserData;

    // btnNode: cc.Node;

    onLoad() {
        // this.btnNode = new cc.Node();
        // this.btnNode.parent = this.node;
        // this.btnNode.on(cc.Node.EventType.TOUCH_END, this.onClick);
    }

    setAndRefresh(data: UserData, zoomScale: number) {
        this.data = data;
        this.sprArk.node.setContentSize(data.arkSize, data.arkSize);
        this.lblName.string = data.nickname;
        this.refreshZoom(zoomScale);

        FlagMgr.setFlag(this.sprFlag, data.country);
    }

    refreshZoom(zoomScale: number) {
        this.node.position = new cc.Vec2(this.data.currentLocation.x, this.data.currentLocation.y).mul(zoomScale);
        // this.btnNode.setContentSize(this.node.width + 50, this.node.height + 50);
    }

    update(dt: number) {
        this.refreshZoom(WorldUI.Instance.zoomScale);
    }

    onClick() {
        WorldUI.Instance.selectArk(this.node);
    }
}
