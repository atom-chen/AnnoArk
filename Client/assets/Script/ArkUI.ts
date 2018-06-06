import CsvMain from "./CvsMain";
import BaseUI from "./BaseUI";
import WorldUI from "./WorldUI";
import { DataMgr, BuildingInfo, IJ, BuildingData } from "./DataMgr";
import BuildPanel from "./BuildPanel";
import Building from "./Building";
import TechPanel from "./TechPanel";
import DialogPanel from "./DialogPanel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ArkUI extends BaseUI {
    static Instance: ArkUI;
    onLoad() {
        ArkUI.Instance = this;
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

        this.cells = [];
        for (let i = -50; i <= 50; i++) {
            this.cells[i] = [];
            for (let j = -50; j < 50; j++) {
                this.cells[i][j] = new Cell();
            }
        }

        this.blueprint.on(cc.Node.EventType.TOUCH_MOVE, this.dragBlueprint.bind(this));

        this.workshopTemplate.active = false;
        this.roadTemplate.active = false;
        this.houseTemplate.active = false;

        let labelNode = cc.instantiate(this.cargoLabelTemplate);
        labelNode.parent = this.cargoLabelContainer;
        let label = labelNode.getComponent(cc.Label);
        label.string = '人口';
        this.cargoLabels['population'] = label;
        DataMgr.CargoConfig.forEach(cargoInfo => {
            let labelNode = cc.instantiate(this.cargoLabelTemplate);
            labelNode.parent = this.cargoLabelContainer;
            let label = labelNode.getComponent(cc.Label);
            label.string = cargoInfo.Name;
            this.cargoLabels[cargoInfo.id] = label;
        });
        this.cargoLabelTemplate.active = false;

        // this.node.getChildByName('GrpBuildInfo').getChildByName('DeselectPad').on(cc.Node.EventType.TOUCH_START, ()=>{ArkUI.Instance.deselectBuilding();});
    }

    @property(cc.Node)
    arkMap: cc.Node = null;

    @property(cc.Node)
    cargoLabelContainer: cc.Node = null;
    @property(cc.Node)
    cargoLabelTemplate: cc.Node = null;
    cargoLabels = {};

    cells: Cell[][];

    @property(cc.Node)
    panPad: cc.Node = null;
    @property(cc.Slider)
    sldZoom: cc.Slider = null;
    pressingZoomSlider = false;
    zoomScale: number = 1;

    onEnable() {
        this.refreshZoom();

        let myData = DataMgr.myData;
        for (let i = -Math.floor(myData.arkSize / 2); i < myData.arkSize / 2; i++) {
            for (let j = -Math.floor(myData.arkSize / 2); j < myData.arkSize / 2; j++) {
                // let cell = new Cell();
                // this.cells[i][j] = cell;
                let cell = this.cells[i][j];
                cell.isLand = true;
                cell.building = null;
            }
        }

        let workers = 0;
        DataMgr.myBuildingData.forEach(data => {
            //b.id
            //b.i,j
            workers += data.workers;
        });

        DataMgr.idleWorkers = myData.population - workers;

        this.deselectBuilding();
    }

    refreshZoom() {
        this.arkMap.scale = this.zoomScale;
    }

    update(dt: number) {
        if (DataMgr.changed) {
            this.refreshData();
            DataMgr.changed = false;
        }

        this.cargoLabels['population'].string =
            `人口 ${DataMgr.myData.population}/${DataMgr.populationLimit} (闲置 ${DataMgr.idleWorkers}) 增长${DataMgr.populationGrowPerMin.toFixed(0)}/min`;
        for (let i = 0; i < DataMgr.CargoConfig.length; i++) {
            const cargoInfo = DataMgr.CargoConfig[i];
            let data = DataMgr.myCargoData.find((value, index, arr) => {
                return value.id == cargoInfo.id;
            });
            this.cargoLabels[cargoInfo.id].string = cargoInfo.Name + '   ' + Math.floor(data.amount).toFixed();
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
            this.arkMap.position = this.arkMap.position.mul(deltaZoom);
            this.refreshZoom();
        }

        if (this.currentHoldingBlueprint) {
            this.blueprint.active = true;
            this.blueprint.position = new cc.Vec2(this.currentBlueprintIJ.i * 100 - 50, this.currentBlueprintIJ.j * 100 - 50);
            this.blueprint.setContentSize(this.currentHoldingBlueprint.length * 100, this.currentHoldingBlueprint.width * 100);
            let ableToBuild = true;
            this.blueprintIndicator.clear();
            for (let i = 0; i < this.currentHoldingBlueprint.length; i++) {
                for (let j = 0; j < this.currentHoldingBlueprint.width; j++) {
                    let cell = this.cells[this.currentBlueprintIJ.i + i][this.currentBlueprintIJ.j + j];
                    this.blueprintIndicator.fillColor = cell.building ? cc.Color.RED : cc.Color.GREEN;
                    if (cell.building) ableToBuild = false;
                    if (!cell.isLand) ableToBuild = false;
                    this.blueprintIndicator.fillRect(i * 100, j * 100, 100, 100);
                }
            }
            this.grpBuild.active = true;
            this.btnConfirmBuild.interactable = ableToBuild;
        } else {
            this.blueprint.active = false;
            this.grpBuild.active = false;
        }
        if (this.selectedBuilding) {
            this.grpBuildingInfo.active = true;
        } else {
            this.grpBuildingInfo.active = false;
        }
    }

    refreshData() { }

    onGotoWorldClick() {
        this.deselectBuilding();
        CsvMain.EnterUI(WorldUI);
    }
    onBuildBtnClick() {
        this.deselectBuilding();
        BuildPanel.Show();
    }
    onTechClick() {
        this.deselectBuilding();
        TechPanel.Show();
    }

    onCenterBtnClick() {
        let data = DataMgr.myData;
        let rawPos = new cc.Vec2(data.arkLocationX, data.arkLocationY);
        rawPos.mulSelf(this.zoomScale);
        this.arkMap.position = rawPos.neg();
    }

    onPanPadTouchMove(event: cc.Event.EventTouch) {
        console.log('drag map');
        let delta = event.getDelta();
        // if (this.currentHoldingBlueprint){
        //     this.dragBlueprint(event);
        // }else{
        this.arkMap.position = this.arkMap.position.add(new cc.Vec2(delta.x, delta.y));
    }
    onMouseWheel(event: cc.Event.EventMouse) {
        let delta = event.getScrollY();
        let oldZoomScale = this.zoomScale;
        this.zoomScale *= Math.pow(1.5, (delta / 120)); //delta每次±120
        this.clampZoom();
        let deltaZoom = this.zoomScale / oldZoomScale;
        this.arkMap.position = this.arkMap.position.mul(deltaZoom);
        this.refreshZoom();
    }
    onZoomSliderChange(slider: cc.Slider) {
        // console.log('sld', slider.progress);
    }
    clampZoom() {
        if (this.zoomScale > 3) this.zoomScale = 3;
        if (this.zoomScale < 0.3) this.zoomScale = 0.3;
    }

    //Build
    @property(cc.Node)
    workshopTemplate: cc.Node = null;
    @property(cc.Node)
    houseTemplate: cc.Node = null;
    @property(cc.Node)
    roadTemplate: cc.Node = null;
    @property(cc.Node)
    buildingContainer: cc.Node = null;
    @property(cc.Node)
    blueprint: cc.Node = null;
    @property(cc.Graphics)
    blueprintIndicator: cc.Graphics = null;
    currentHoldingBlueprint: BuildingInfo = null;
    currentBlueprintIJ: IJ;
    enterBuildMode(buildingInfo: BuildingInfo) {
        this.currentHoldingBlueprint = buildingInfo;
        this.currentBlueprintIJ = IJ.ZERO;
    }
    dragBlueprint(event: cc.Event.EventTouch) {
        let now = event.getLocation();
        let touchPosInArkMap = this.arkMap.convertToNodeSpaceAR(now);
        // this.blueprint.position = touchPosInArkMap;
        this.currentBlueprintIJ.i = Math.round(touchPosInArkMap.x / 100);
        this.currentBlueprintIJ.j = Math.round(touchPosInArkMap.y / 100);
    }
    @property(cc.Node)
    grpBuild: cc.Node = null;
    @property(cc.Button)
    btnConfirmBuild: cc.Button = null;
    onBtnConfirmBuildClick() {
        //检查重叠
        let ableToBuild = true;
        for (let i = 0; i < this.currentHoldingBlueprint.length; i++) {
            for (let j = 0; j < this.currentHoldingBlueprint.width; j++) {
                let cell = this.cells[this.currentBlueprintIJ.i + i][this.currentBlueprintIJ.j + j];
                if (cell.building) ableToBuild = false;
                if (!cell.isLand) ableToBuild = false;
            }
        }
        if (!ableToBuild) return;
        //确定建造
        //检查建筑材料
        let buildMats = [];
        for (let i = 0; i < 4; i++) {
            let mat = this.currentHoldingBlueprint['BuildMat' + i];
            if (mat && mat.length > 0) {
                let count = this.currentHoldingBlueprint['BuildMat' + i + 'Count'];
                buildMats.push([mat, count]);
            }
        }
        let enough = true;
        buildMats.forEach(mat => {
            let cargoData = DataMgr.myCargoData.find(data => data.id == mat[0]);
            if (cargoData.amount < mat[1]) {
                enough = false;
            }
        })
        if (enough) {
            buildMats.forEach(mat => {
                let cargoData = DataMgr.myCargoData.find(data => data.id == mat[0]);
                cargoData.amount -= mat[1];
            })
            this.createBuilding(this.currentHoldingBlueprint, this.currentBlueprintIJ);
            if (this.currentHoldingBlueprint.id == 'road00001') {
                this.currentBlueprintIJ.j += 1;
            } else {
                this.currentHoldingBlueprint = null;
            }
        }
    }
    onBtnCancelBuildClick() {
        this.currentHoldingBlueprint = null;
    }
    createBuilding(blueprint: BuildingInfo, ij: IJ) {
        let prefabName = blueprint['prefab'];
        let buildingNode = cc.instantiate(this[prefabName + 'Template']);
        buildingNode.parent = this.buildingContainer;
        let building = buildingNode.getComponent(Building);
        let data = new BuildingData();
        data.id = blueprint.id;
        data.ij = ij.clone();
        data.workers = 0;
        DataMgr.myBuildingData.push(data);
        building.setInfo(blueprint, data);
        buildingNode.position = new cc.Vec2(ij.i * 100 - 50, ij.j * 100 - 50);
        buildingNode.active = true;
        for (let i = 0; i < blueprint.length; i++) {
            for (let j = 0; j < blueprint.width; j++) {
                let cell = this.cells[ij.i + i][ij.j + j];
                cell.building = building;
            }
        }
    }

    //建筑信息
    selectedBuilding: Building = null;
    @property(cc.Node)
    grpBuildingInfo: cc.Node = null;
    selectBuilding(building: Building) {
        console.log('选中建筑')
        this.selectedBuilding = building;
    }
    deselectBuilding() {
        this.selectedBuilding = null;
    }
    onDemolishBtnClick() {
        let self = ArkUI.Instance;
        if (this.selectedBuilding) {
            DialogPanel.PopupWith2Buttons('确定拆除建筑吗',
                self.selectedBuilding.info.Name
                + '\n建筑材料不予返还',
                '拆除', () => {
                    self.demolishBuilding(self.selectedBuilding);
                    self.deselectBuilding();
                },
                '取消', null);
        }
    }
    demolishBuilding(building: Building) {
        if (!building) return;
        //拆除建筑
        console.log('拆除建筑');
        let index = DataMgr.myBuildingData.findIndex(data => data == building.data);
        if (index >= 0) {
            //施放工人
            let workers = building.data.workers;
            DataMgr.myBuildingData.splice(index, 1);
            building.node.destroy();
            DataMgr.idleWorkers += workers;
        }
    }
}

class Cell {
    isLand = false;
    building: Building = null;
}