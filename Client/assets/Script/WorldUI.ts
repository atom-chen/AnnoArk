import CvsMain from "./CvsMain";
import BaseUI from "./BaseUI";
import MainCtrl from "./MainCtrl";
import ArkUI from "./ArkUI";
import ArkInWorld from "./ArkInWorld";
import { DataMgr } from "./DataMgr";
import BlockchainMgr from "./BlockchainMgr";
import HomeUI from "./HomeUI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class WorldUI extends BaseUI {
    static Instance: WorldUI;
    onLoad() {
        WorldUI.Instance = this;
        let self = this;
        this.sldZoom.node.getChildByName('Handle').on(cc.Node.EventType.TOUCH_START, function (event) {
            self.pressingZoomSlider = true;
        });
        this.sldZoom.node.getChildByName('Handle').on(cc.Node.EventType.TOUCH_END, function (event) {
            self.pressingZoomSlider = false;
        });
        this.sldZoom.node.getChildByName('Handle').on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
            self.pressingZoomSlider = false;
        });
        this.panPad.on(cc.Node.EventType.TOUCH_MOVE, this.onPanPadTouchMove, this);
        this.panPad.on(cc.Node.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
        this.panPad.on(cc.Node.EventType.TOUCH_END, this.onPanPadTouchEnd, this);

        // cc.systemEvent.on(cc.SystemEvent.EventType.)
    }

    @property(cc.Node)
    mineContainer: cc.Node = null;
    @property(cc.Node)
    islandContainer: cc.Node = null;

    @property(cc.Node)
    arkContainer: cc.Node = null;
    @property(cc.Node)
    arkTemplate: cc.Node = null;

    @property(cc.Node)
    worldMap: cc.Node = null;
    @property(cc.Node)
    earth: cc.Node = null;

    @property(cc.Node)
    panPad: cc.Node = null;
    @property(cc.Slider)
    sldZoom: cc.Slider = null;
    pressingZoomSlider = false;
    zoomScale: number = 0.1;

    onEnable() {
        if (!DataMgr.myData) return;

        this.refreshData();
        this.refreshZoom();
    }
    onBtnBackClick() {
        CvsMain.EnterUI(HomeUI);
    }

    refreshData() {

        //myData
        let neededCount = Object.keys(DataMgr.othersData).length + 1;
        for (let i = this.arkContainer.childrenCount; i < neededCount; i++) {
            let arkNode = cc.instantiate(this.arkTemplate);
            arkNode.parent = this.arkContainer;
        }
        let needToDestroys: cc.Node[] = [];
        for (let i = neededCount; i < this.arkContainer.childrenCount; i++) {
            needToDestroys.push(this.arkContainer.children[i]);
        }
        needToDestroys.forEach(c => c.destroy());

        let arkIW = this.arkContainer.children[0].getComponent(ArkInWorld);
        arkIW.setAndRefresh(DataMgr.myData, this.zoomScale);
        let i = 0;
        for (let address in DataMgr.othersData) {
            const data = DataMgr.othersData[address];
            this.arkContainer.children[i + 1].getComponent(ArkInWorld).
                setAndRefresh(data, this.zoomScale);
                console.log('others ark', data);
            i++;
        }
    }

    refreshMyArk() {
        let arkIW = this.arkContainer.children[0].getComponent(ArkInWorld);
        arkIW.setAndRefresh(DataMgr.myData, this.zoomScale);
    }

    refreshZoom() {
        // let size = 12000 * this.zoomScale;
        this.earth.scale = this.zoomScale;
        // this.arkContainer.children.forEach(c => {
        //     c.getComponent(ArkInWorld).refreshZoom(this.zoomScale);
        // })
        if (this.editSailDestinationMode && this.newDestination) {
            this.sailDestinationIndicator.position = this.newDestination.mul(this.zoomScale);
        }
    }

    update(dt: number) {
        if (DataMgr.changed || MainCtrl.Ticks % 100 == 0) {
            this.refreshData();
            DataMgr.changed = false;
        }
        let prog = this.sldZoom.progress;
        if (!this.pressingZoomSlider) {
            if (prog > 0.5) {
                prog -= 5 * dt;
                if (prog < 0.5) prog = 0.5;
                this.sldZoom.progress = prog;
            } else if (prog < 0.5) {
                prog += 5 * dt;
                if (prog > 0.5) prog = 0.5;
                this.sldZoom.progress = prog;
            }
        }
        if (prog != 0.5) {
            let oldZoomScale = this.zoomScale;
            this.zoomScale *= Math.pow(1.5, (prog - 0.5) * 2 * 5 * dt);
            this.clampZoom();
            let deltaZoom = this.zoomScale / oldZoomScale;
            this.worldMap.position = this.worldMap.position.mul(deltaZoom);
            this.refreshZoom();
        }

        if (this.editSailDestinationMode) {
            this.grpSail.active = true;
            this.sailDestinationIndicator.active = this.newDestination != null;
        } else {
            this.grpSail.active = false;
            this.sailDestinationIndicator.active = false;
        }
    }

    onGotoArkClick() {
        CvsMain.EnterUI(ArkUI);
    }

    onCenterBtnClick() {
        let data = DataMgr.myData;
        let rawPos = data.currentLocation;
        rawPos.mulSelf(this.zoomScale);
        this.worldMap.position = rawPos.neg();
    }

    onPanPadTouchMove(event: cc.Event.EventTouch) {
        let delta = event.getDelta();
        this.worldMap.position = this.worldMap.position.add(new cc.Vec2(delta.x, delta.y));
    }
    onPanPadTouchEnd(event: cc.Event.EventTouch) {
        if (this.editSailDestinationMode) {
            let curLoc = event.getLocation();
            let displacement = new cc.Vec2(curLoc.x, curLoc.y).sub(event.getStartLocation());
            if (displacement.mag() < 20) {
                let touchPos = this.worldMap.convertTouchToNodeSpaceAR(event.touch);
                this.newDestination = touchPos.mul(1 / this.zoomScale);
                this.sailDestinationIndicator.position = this.newDestination.mul(this.zoomScale);
            }
        }
    }
    onMouseWheel(event: cc.Event.EventMouse) {
        let delta = event.getScrollY();
        let oldZoomScale = this.zoomScale;
        this.zoomScale *= Math.pow(1.5, (delta / 120)); //delta每次±120
        this.clampZoom();
        let deltaZoom = this.zoomScale / oldZoomScale;
        this.worldMap.position = this.worldMap.position.mul(deltaZoom);
        this.refreshZoom();
    }
    onZoomSliderChange(slider: cc.Slider) {
        // console.log('sld', slider.progress);
    }
    clampZoom() {
        if (this.zoomScale > 10) this.zoomScale = 10;
        if (this.zoomScale < 0.01) this.zoomScale = 0.01;
    }

    //航行
    editSailDestinationMode = false;
    newDestination: cc.Vec2;
    @property(cc.Node)
    grpSail: cc.Node = null;
    @property(cc.Node)
    sailDestinationIndicator: cc.Node = null;
    @property(cc.Node)
    btnCancelSail: cc.Node = null;
    @property(cc.Node)
    btnConfirmSail: cc.Node = null;
    onBtnSailClick() {
        this.editSailDestinationMode = true;
        this.newDestination = null;
    }
    onCancelSailClick() {
        this.editSailDestinationMode = false;
        this.newDestination = null;
    }
    onConfirmSailClick() {
        console.log('调用合约咯');
        const myData = DataMgr.myData;
        let deltaData = {};
        deltaData['speed'] = 1000;
        deltaData['locationX'] = myData.locationX;
        deltaData['locationY'] = myData.locationY;
        deltaData['destinationX'] = this.newDestination.x;
        deltaData['destinationY'] = this.newDestination.y;
        BlockchainMgr.Instance.setSail(deltaData);
        // DataMgr.myData.speed = 10000;// 100 km/min
        // DataMgr.myData.locationX = DataMgr.myData.currentLocation.x;
        // DataMgr.myData.locationY = DataMgr.myData.currentLocation.y;
        // DataMgr.myData.lastLocationTime = Number(new Date());
        // DataMgr.myData.destinationX = this.newDestination.x;
        // DataMgr.myData.destinationY = this.newDestination.y;
        // setTimeout(() => { this.editSailDestinationMode = false; }, 1000);
    }
}
