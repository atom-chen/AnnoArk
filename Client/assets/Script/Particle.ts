import Mode0UI from "./Mode0UI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Particle extends cc.Component {

    @property(cc.Boolean)
    isPositiveParticle: boolean = false;


    isHandle: boolean = false;

    state: number = 0;//0-falling 1:attached 2:decay

    fatherParticle: cc.Node = null;

    relPosition: cc.Vec2 = null;

    exploded = false;
    decayCountdown: number = null;

    update(dt: number) {
        switch (this.state) {
            case 0: {
                if (this.fatherParticle) {
                    let rgd = this.getComponent(cc.RigidBody); rgd.type = cc.RigidBodyType.Static;
                    rgd.linearVelocity = cc.Vec2.ZERO;
                    this.node.position = Mode0UI.Instance.handle.position.add(this.relPosition);
                    rgd.enabledContactListener = false;
                    this.state = 1;
                } else if (this.node.position.y < -1200) {
                    this.node.destroy();
                }
                break;
            }
            case 1: {
                this.node.position = Mode0UI.Instance.handle.position.add(this.relPosition);
                break;
            }
        }
    }

    只在两个碰撞体开始接触时被调用一次
    onBeginContact(contact, selfCollider, otherCollider) {
        if (this.state != 0 || this.fatherParticle) return;
        let fatherPtc = otherCollider.getComponent(Particle);
        if (fatherPtc && fatherPtc.state == 1) {
            Mode0UI.Instance.contactParticle(this, fatherPtc);
        }
    }
}