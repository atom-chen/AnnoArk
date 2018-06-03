import CsvMain from "./CvsMain";
import BaseUI from "./BaseUI";
import Particle from "./Particle";
import MainCtrl from "./MainCtrl";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Mode0UI extends BaseUI {
    static Instance: Mode0UI;
    onLoad() {
        Mode0UI.Instance = this;
    }

    @property(cc.Label)
    lblEnergy: cc.Label = null;

    @property(cc.Button)
    btnPause: cc.Button = null;
    @property(cc.Button)
    btnResume: cc.Button = null;
    @property(cc.Button)
    btnPack: cc.Button = null;

    @property(cc.Node)
    ingameRange: cc.Node = null;
    @property(cc.Node)
    fallingParticles: cc.Node = null;
    @property(cc.Node)
    attachedParticles: cc.Node = null;
    @property(cc.Node)
    touchPad: cc.Node = null;
    @property(cc.Node)
    handle: cc.Node = null;

    @property(cc.Node)
    amTemplate: cc.Node = null;
    @property(cc.Node)
    pmTemplate: cc.Node = null;

    probabilityPerSecond = 1;

    pause = false;
    explode = false;

    start() {
        this.touchPad.on(cc.Node.EventType.TOUCH_MOVE, function (event: cc.Event.EventTouch) {
            this.moveHandle(event.getDelta());
        }, this);
    }

    onEnable() {
        cc.director.getPhysicsManager().enabled = true;
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
        manager.enabledDebugDraw = true;
        manager.enabledDrawBoundingBox = true;
        this.restart();
    }

    moveHandle(delta: cc.Vec2) {
        let lastX = this.handle.position.x;
        let x = this.handle.position.x + delta.x;
        if (x < -this.ingameRange.width / 2) {
            x = -this.ingameRange.width / 2;
        }
        if (x > this.ingameRange.width / 2) {
            x = this.ingameRange.width / 2;
        }
        let deltaX = x - lastX;
        this.attachedParticles.children.forEach((c) => {
            let rgd = c.getComponent(cc.RigidBody);
            rgd.node.position = new cc.Vec2(rgd.node.position.x + deltaX, rgd.node.position.y);
        })
        this.handle.position = new cc.Vec2(x, this.handle.position.y);
    }

    restart() {
        console.log('restart')
        // this.allCollectedPtcs.forEach((c) => c.destroy());
        // this.allCollectedPtcs = [];

        this.handle.position = new cc.Vec2(0, this.handle.position.y);
        let ptc = cc.instantiate(this.amTemplate);
        ptc.parent = this.attachedParticles;
        ptc.position = this.handle.position;
        // ptc.removeComponent(Particle);
        let ptcComp = ptc.getComponent(Particle);
        ptcComp.isHandle = true;
        ptcComp.state = 1;
        ptcComp.fatherParticle = this.handle;
        ptcComp.relPosition = cc.Vec2.ZERO;
        let rgd = ptc.getComponent(cc.RigidBody);
        // this.allCollectedPtcs.push(rgd);
        rgd.type = cc.RigidBodyType.Static;
        this.pause = false;
        this.explode = false;
        ptc.active = true;
    }

    update(dt: number) {
        
        let pCount = this.attachedParticles.childrenCount
        this.lblEnergy.string = (pCount * pCount).toFixed();

        if (this.explode) {

            this.fallingParticles.children.forEach((c) => {
                c.destroy()
            });
            this.attachedParticles.children.forEach((c) => {
                c.destroy()
            });

            this.restart();
            return;
        }

        if (this.pause) {
            this.btnPause.node.active = false;
            this.btnResume.node.active = true;
            this.btnPack.node.active = true;
        } else {
            this.btnPause.node.active = true;
            this.btnResume.node.active = false;
            this.btnPack.node.active = false;
        }

        if (!this.pause) {
            //落球
            let ran = Math.random();
            if (ran < this.probabilityPerSecond * dt) {
                let ptc = cc.instantiate(this.amTemplate);
                let x = -this.ingameRange.width / 2 + Math.random() * this.ingameRange.width;
                ptc.parent = this.fallingParticles;
                ptc.position = new cc.Vec2(x, this.node.height / 2 + 50);
                ptc.getComponent(cc.RigidBody).linearVelocity = new cc.Vec2(0, -400);
                ptc.active = true;
            }
            ran = Math.random();
            if (ran < this.probabilityPerSecond * dt) {
                let ptc = cc.instantiate(this.pmTemplate);
                let x = -this.ingameRange.width / 2 + Math.random() * this.ingameRange.width;
                ptc.parent = this.fallingParticles;
                ptc.position = new cc.Vec2(x, this.node.height / 2 + 50);
                ptc.getComponent(cc.RigidBody).linearVelocity = new cc.Vec2(0, -400);
                ptc.active = true;
            }
        }
    }

    contactParticle(p: Particle, fatherParticle: cc.Node) {
        let pNode = p.node;
        if (p.isPositiveParticle) {
            let explodeRadius = Math.sqrt(this.attachedParticles.childrenCount) * 20;
            console.log('毁灭', explodeRadius);
            this.explode = true;
        } else {
            let rgd = pNode.getComponent(cc.RigidBody);
            rgd.linearVelocity = cc.Vec2.ZERO;
            p.fatherParticle = fatherParticle;
            p.relPosition = p.node.position.sub(this.handle.position);
            p.node.parent = this.attachedParticles;
        }
    }

    onPauseClick() {
        this.pause = true;
    }
    onResumeClick() {
        this.pause = false;
    }
    onPackClick() {
        console.log('装瓶');
        let pCount = this.attachedParticles.childrenCount
        MainCtrl.Instance.energy = pCount * pCount;
        MainCtrl.Instance.gotoHome();
    }

    onDisable() {
        cc.director.getPhysicsManager().enabled = false;
        var manager = cc.director.getCollisionManager();
        manager.enabled = false;
        manager.enabledDebugDraw = false;
        this.fallingParticles.children.forEach((c) => {
            c.destroy()
        });
        this.attachedParticles.children.forEach((c) => {
            c.destroy()
        });
    }
}
