import { BuildingInfo, BuildingData, DataMgr } from "./DataMgr";
import Building from "./Building";

const { ccclass, property } = cc._decorator;

@ccclass
export default class WorkshopBuilding extends Building {

    @property(cc.Label)
    lblConsumption: cc.Label = null;
    @property(cc.Label)
    lblOutput: cc.Label = null;
    @property(cc.Label)
    lblWorkers: cc.Label = null;
    @property(cc.Node)
    nodeGear: cc.Node = null;
    @property(cc.Button)
    btnDecWork: cc.Button = null;
    @property(cc.Button)
    btnIncWork: cc.Button = null;

    setInfo(info: BuildingInfo, data: BuildingData) {
        this.info = info;
        this.data = data;
        this.lblName.string = info.Name;
        let strInfoLines = [];
        for (let i = 0; i < 4; i++) {
            const rawid = info['Raw' + i];
            if (rawid && rawid.length > 0) {
                const rawRate = info['Raw' + i + 'Rate'];
                const cargoInfo = DataMgr.CargoConfig.find(c => c.id == rawid);
                strInfoLines.push(`消耗 ${rawRate}${cargoInfo.Name}/min`);
            }
        }
        for (let i = 0; i < 4; i++) {
            const outid = info['Out' + i];
            if (outid && outid.length > 0) {
                const outRate = info['Out' + i + 'Rate'];
                const cargoInfo = DataMgr.CargoConfig.find(c => c.id == outid);
                strInfoLines.push(`生产 ${outRate}${cargoInfo.Name}/min`);
            }
        }
        if (strInfoLines.length > 0) {
            let str = strInfoLines[0];
            for (let i = 1; i < strInfoLines.length; i++) {
                const line = strInfoLines[i];
                str += '\n' + line;
            }
            this.lblConsumption.string = str;
        } else {
            this.lblConsumption.string = '';
        }
        this.node.setContentSize(info.Length * 100, info.Width * 100);
    }

    changeWorkers(event, arg) {
        if (arg == '-') {
            let reduce = Math.min(this.data.workers, 1);
            this.data.workers -= reduce;
            DataMgr.idleWorkers += reduce;
        } else if (arg == '+') {
            let add = Math.min(DataMgr.idleWorkers, 1, this.info['MaxHuman'] - this.data.workers);
            this.data.workers += add;
            DataMgr.idleWorkers -= add;
        }
    }

    update(dt: number) {
        this.lblWorkers.string = '工人 ' + this.data.workers.toFixed();
        if (this.data.isWorking) {
            this.nodeGear.rotation += 90 * this.data.workers * dt;
        }
        this.btnDecWork.interactable = this.data.workers > 0;
        this.btnIncWork.interactable = this.data.workers < this.info['MaxHuman'];
    }
}
