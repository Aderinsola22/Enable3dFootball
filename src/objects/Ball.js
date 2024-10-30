import {Scene3D, THREE } from 'enable3d'
import { MatchScene } from '../core/MatchScene';
import * as YUKA from 'yuka';

export class Ball{
    constructor(radius,startX,startY,startZ,color){
        this.radius=radius;
        this.startX=startX;
        this.startY=startY;
        this.startZ=startZ;
        this.ball=null;
        this.color=color;
        this.balltexture=null;
        this.yukaBall= new YUKA.GameEntity();
        this.yukaBallPursuit= new YUKA.Vehicle();
       
    }
    _createBall(scene,texture=null){
        this.balltexture=texture;

       this.ball=scene.physics.add.sphere({radius:this.radius,x:this.startX,y:this.startY,z:this.startZ,mass:1,collisionGroup:4},{basic:{color:'yellow',map:this.balltexture}})  
 
        this._ballCollider(scene);

        this.ball.body.setFriction(1);
        this.ball.body.ammo.setRollingFriction(1);
        this.ball.body.setBounciness(0.4)
        this.ball.name="Ball";
        this.ball.body.setCcdMotionThreshold(1)
        this.ball.body.setDamping(0.2,0.2);


        this.yukaBall.setRenderComponent(this.ball,this.yukaSync)

    }
    _setAddManager(yukaEntityManager){
        this.entityManager=yukaEntityManager;
        this.entityManager.add(this.yukaBall);
        this.yukaBall.position.set(this.ball.position.x,this.ball.position.y,this.ball.position.z)
        this.yukaBallPursuit.position.set(this.yukaBall.position);
    }
    yukaSync(entiity,renderComponent){
        renderComponent.matrix.copy(entiity.worldMatrix);
    }
    _ballCollider(scene){
        scene.physics.collisionEvents.on('collision', data => {
            const { bodies, event } = data
            if(event==='start'){
                  if(bodies[0]!=bodies[1]){
                    const isBallandBodyPart= (bodies[0].name === 'Ball' && bodies[1].name === 'Body Part')||(bodies[1].name === 'Ball' && bodies[0].name === 'Body Part');

                    if(isBallandBodyPart){
                        const ball = (bodies[0].name =='Ball')?bodies[0]:bodies[1];
                        const bodypart=(bodies[0].name =='Body Part')?bodies[0]:bodies[1];
                        console.log(`${ball.name} has hit the ${bodypart.userData.bodyPartName} of the ${bodypart.userData.parent.posName} ${bodypart.userData.parent.playerName} from Team ${bodypart.userData.parent.team.teamName}`);
                        // TODO: check hand ball for GK if out of Box
                        const bodypartname=bodypart.userData.bodyPartName;
                        const search= bodypartname.toLowerCase().includes('Hand'.toLowerCase())
                        if(search){
                            console.log("Hand ball Detected");

                        }

                    }
                  }
            }
          })
       
    }

    _update(){
        if(this.yukaBall && this.ball){
        
         //   console.log(this.ball.position)
            this.yukaBall.position.copy(this.ball.position);
            this.yukaBallPursuit.position.copy(this.yukaBall.position);
        }
        
    }
}