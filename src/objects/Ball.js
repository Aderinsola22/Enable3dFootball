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
        this.yukaBallPursuit= new YUKA.MovingEntity();
        this.isKicked=false;
        this.possessor=null;
        this.possessorClass=null;
        this.possessorTeam=null;
        this.possessorTeamClass=null;
        this.handBallActive=true;
        this.shotX=null;
        this.shotY=null;
        this.shotZ=null;
        this.shotStartX=null;
        this.shotStartY=null;
        this.shotStartZ=null;
    }
    _createBall(scene,texture=null){
        this.balltexture=texture;
        this.mass=1;
       this.ball=scene.physics.add.sphere({radius:this.radius,x:this.startX,y:this.startY,z:this.startZ,mass:this.mass,collisionGroup:4},{basic:{color:'yellow',map:this.balltexture}})  
 
        this._ballCollider(scene);

        this.ball.body.setFriction(1);
        this.ball.body.ammo.setRollingFriction(1);
        this.ball.body.setBounciness(0.4)
        this.ball.name="Ball";
       this.ball.body.setCcdMotionThreshold(1)
        this.ball.body.setCcdSweptSphereRadius(0.2);
        this.ball.body.setDamping(0.3,0.3);
        this.ball.userData.isKicked=this.isKicked;

        this.yukaBall.setRenderComponent(this.ball,this.yukaSync);
        const boundingBox= new THREE.Box3();
        const boundingSphere = new THREE.Sphere();
        boundingBox.setFromObject(this.ball);
        boundingBox.getBoundingSphere(boundingSphere);
        this.yukaBall.boundingRadius=1.5;
        this.yukaBall.name="YukaBall";
      //  console.log(boundingSphere.radius);

    

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
        //    console.log(bodies[0].name, bodies[1].name, event)
            if(event==='start'){
                  if(bodies[0]!=bodies[1]){
                    const isBallandBodyPart= (bodies[0].name === 'Ball' && bodies[1].name === 'Body Part')||(bodies[1].name === 'Ball' && bodies[0].name === 'Body Part');

                    if(isBallandBodyPart){
                        const ball = (bodies[0].name =='Ball')?bodies[0]:bodies[1];
                        const bodypart=(bodies[0].name =='Body Part')?bodies[0]:bodies[1];
                   //   console.log(`${ball.name} has hit the ${bodypart.userData.bodyPartName} of the ${bodypart.userData.parent.posName} ${bodypart.userData.parent.playerName} from Team ${bodypart.userData.parent.team.teamName}`);
                    this.possessorClass=bodypart.userData.parent
                    this.possessor=this.possessorClass.playerName;
                    this.possessorTeamClass=bodypart.userData.parent.team;
                    this.possessorTeam=this.possessorTeamClass.teamName;
                      const Team1= this.possessorTeamClass;
                      const Team2=Team1.opponent;
                      Team1.lastTouched=true;
                      Team2.lastTouched=false;
                   //   console.log(`${Team1.teamName} ${Team1.lastTouched}`);
                   //   console.log(`${Team2.teamName} ${Team2.lastTouched}`);
                   //   console.log('Possessor:',this.possessor);
                   //   console.log('PossessorTeam:',this.possessorTeam);  
                   //   console.log('Possessor Class:',this.possessorClass);  


                      // TODO: check hand ball for GK if out of Box
                        const bodypartname=bodypart.userData.bodyPartName;
                        const search= bodypartname.toLowerCase().includes('Hand'.toLowerCase())||bodypartname.toLowerCase().includes('Arm'.toLowerCase());
                        if(search && this.handBallActive){
                            if(bodypart.userData.parent.posName !== 'goalkeeper'){
                             console.log("Hand ball Detected");
                            }
                            if(bodypart.userData.parent.posName === 'goalkeeper'){
                                this._checkGkHandball(scene,bodypart);
                            }
                        }
                        else if(!this.handBallActive && search){
                            console.log('Hand ball not Active But No Foul');
                        }

                    }
                  }
            }
          })
       
    }

    _checkGkHandball(scene,bodypart){
        scene.scene.traverse((obj)=>{
            if(obj.name==bodypart.userData.parent.team.teamGoalBox){

                if(!(obj.userData.Box).containsPoint(bodypart.position)){console.log('HandBall outside the Penalty Area')}
                else{console.log('No HandBall outside the Penalty area')}
            }
        })
    }

    _update(){
        if(this.yukaBall && this.ball && this.yukaBallPursuit){
        
        //    console.log("YukaBall Radius",this.yukaBall.neighbors)
            this.yukaBall.position.copy(this.ball.position);
            this.yukaBallPursuit.position.copy(this.ball.position);
            this.yukaBallPursuit.position.y=3;
           
          //  console.log("YukaBall Pursuit Pos",this.yukaBallPursuit.position);
          //  console.log("YukaBall Pos",this.yukaBall.position);
            this.isKicked=this.ball.userData.isKicked;
          //  console.log('Ball has been Kicked',this.ball.userData.isKicked);
      // console.log(this.ball.body.ammo.getLinearVelocity().length().toFixed(2));

        }
        
    }

   SetPossesion(scene){
      //50/50 chance of ball going to either team prior to kickoff set possessor team class
        const Teams= [scene.Team1,scene.Team2];
        this.IntialTeamClass=Teams[Math.floor(Math.random()*Teams.length)];
      //set possessor to the last player class in the teamList that exists and is not a goalkeeper
        const keys= Object.values(this.IntialTeamClass.teamList)
        const initialPossessor=keys.at(-1);
       
     //set initial possessor team class variable 
      this.possessorTeamClass= this.IntialTeamClass;
      this.possessorTeam= this.possessorTeamClass.teamName
      this.possessorClass=initialPossessor;
      this.possessor=initialPossessor.playerName;
  //  console.log('Initial Possessor:', this.possessor);
  //  console.log('Initial Possessor Team:', this.possessorTeam);
  //  console.log('Initial Possessor Class:', this.possessorClass);
  //  console.log('Initial Possessor Team Class:', this.possessorTeamClass);
   }


    _throwin(player){
       // console.log('Pickup Ball');
        const midpoint= new THREE.Vector3().addVectors(player.leftHand.position,player.rightHand.position).multiplyScalar(0.5);
        //console.log("Thrower direction",player.playerTurn);
        const midpointX=player.playerTurn.x;
        const midpointZ=player.playerTurn.z;
        this.ball.position.set(midpoint.x,7,midpoint.z);
        this.ball.body.needUpdate=true;
    }
}