import { DataMgr, UserData } from "./DataMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ArkInWorld extends cc.Component {

    @property(cc.Sprite)
    sprArk: cc.Sprite = null;
    @property(cc.Label)
    lblName: cc.Label = null;

    data: UserData;

    setAndRefresh(data: UserData, zoomScale: number) {
        console.log('sar', data);
        this.data = data;
        this.sprArk.node.setContentSize(data.arkSize, data.arkSize);
        this.lblName.string = data.nickname;
        this.refreshZoom(zoomScale);
    }

    refreshZoom(zoomScale: number) {
        let rawPos = new cc.Vec2(this.data.arkLocationX, this.data.arkLocationY);
        rawPos.mulSelf(zoomScale);
        this.node.position = rawPos;
    }

    // update (dt) {}
}
