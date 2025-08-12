import {Scene3D,ExtendedObject3D ,THREE } from 'enable3d'
import * as YUKA from 'yuka';
import * as SharedStates from './SharedStates.js';
import { re } from 'mathjs';

export class OutFieldStates extends YUKA.StateMachine{
    constructor(yukaPlayer,playerClass,scene){
        super(yukaPlayer);
        // add global state
        this.globalState= new GlobalState(yukaPlayer,playerClass,scene);
        // add shared states
        this.add('idle', new SharedStates.IdleState(yukaPlayer,playerClass,scene));  
        this.add('reset', new SharedStates.ResetState(yukaPlayer,playerClass,scene));  
        this.add('chaseBall', new SharedStates.ChaseBallState(yukaPlayer,playerClass,scene));
        this.add('receiveBall', new SharedStates.ReceiveBallState(yukaPlayer,playerClass,scene));
        this.add('passBall', new SharedStates.PassBallState(yukaPlayer,playerClass,scene));
        // add player specific states
        this.add('dribble', new DribbleState(yukaPlayer,playerClass,scene));
        this.add('shoot', new ShootState(yukaPlayer,playerClass,scene));
        this.add('supportAttacker', new SupportAttackerState(yukaPlayer,playerClass,scene)); 
        this.add('goHome', new GoHomeState(yukaPlayer,playerClass,scene));//implement after everything above works
        this.add('throwIn',new ThrowInState(yukaPlayer,playerClass,scene));
        this.add('cornerKick',new CornerKickState(yukaPlayer,playerClass,scene));
        this.add('supportDefence', new SupportDefenceState(yukaPlayer,playerClass,scene));
        //this.add('tackle', new TackleState());    
            
        
    }
    update(delta){
        super.update(delta);
    }

}  
class GlobalState extends YUKA.State{
    constructor(yukaPlayer,playerClass,scene){
        super();
        this.yukaPlayer=yukaPlayer;
        this.playerClass=playerClass;
        this.player=playerClass.player;
        this.scene=scene;
    }

    execute(entity){
        //TODO: Set player speed with and without possession of the ball and if they are in close proximity to the ball
      /*  if(this.scene.ball.possessorClass==this.playerClass && this.scene.ball.possessorTeamClass==this.playerClass.team && this.playerClass.distBall<=8){
           this.yukaPlayer.maxSpeed=4;
       //    console.log(this.player.name,'is the main possessor');

        }
        else{
            this.yukaPlayer.maxSpeed=5.2;
  
        }*/
        // Adjust maxSpeed based on the current state of the state machine
        const currentState = this.playerClass.stateMachine.currentState;
        if(currentState!=this.playerClass.stateMachine.get('receiveBall')){
            if(currentState==this.playerClass.stateMachine.get('supportAttacker')){
                this.yukaPlayer.maxSpeed=6;
            }
            else if(currentState==this.playerClass.stateMachine.get('dribble')){
                this.yukaPlayer.maxSpeed=4;
            }
            else{
                this.yukaPlayer.maxSpeed=5.2;
            }
        }
        else{
            this.yukaPlayer.maxSpeed=3.5;
        }
    }
}
// player specific states

 /*class DribbleState extends YUKA.State{
    constructor(yukaPlayer,playerClass,scene){
        super();
        this.yukaPlayer=yukaPlayer;
        this.playerClass=playerClass;
        this.player=playerClass.player;
        this.scene=scene;
        this.dribbleTarget= new YUKA.Vector3();
    }
    enter(entity){
        //do checks that this player is also the possessor otherwise this function can be empty or omitted
        //      console.log(entity._renderComponent.name,'of',this.playerClass.team.teamName,' has started dribbling ball.');
              const goalTarget=this.playerClass.team.goalineTargetName;
              this.scene.scene.traverse((obj)=>{
                if(obj.name==goalTarget){
                    this.goal=obj;
                }
            });
            this.sideline1=this.scene.field.sideline1;
            this.sideline2=this.scene.field.sideline2;   

          this.delta= this.scene.yukaTime.update().getDelta();
          this.updateDribbleTarget();

    }

    execute(entity){
   

        const ball= this.playerClass.ball;
        const yukaBall= this.scene.ball.yukaBall;
        const playerPos=this.player.position;
        const ballPos= ball.position;
        const yukaBallPos=yukaBall.position;

        const sideLineBallDist1=Math.abs(ballPos.z-this.sideline1.position.z);
        const sideLineBallDist2=Math.abs(ballPos.z-this.sideline2.position.z);

      //  console.log('Side Line 1 DistBall',sideLineBallDist1);
      //  console.log('Side Line 2 DistBall',sideLineBallDist2);

        const ArriveBall=this.yukaPlayer.steering.behaviors[3];
        const AvoidBall=this.yukaPlayer.steering.behaviors[4];
              
            ArriveBall.weight=1;
         
        //calculate arrive position behind the ball that also makes the ball between player and target vector 
        const ballDribbleDist= yukaBallPos.distanceTo(this.dribbleTarget);
        const xBallDribbleDist= Math.abs(yukaBallPos.x-this.dribbleTarget.x);
        
        const lookVec= new YUKA.Vector3(yukaBallPos.x,3,yukaBallPos.z)

        this.yukaPlayer.rotateTo(lookVec,this.delta); 

        const pYukaPos= new YUKA.Vector3(
           this.player.position.x,
           yukaBallPos.y,
           this.player.position.z 
        );

        const balltoPlayer=yukaBallPos.clone().sub(pYukaPos);
        const nBalltoPlayer=balltoPlayer.normalize();
        const balltoDribbleTarget= yukaBallPos.clone().sub(this.dribbleTarget);
        const nBalltoDribbleTarget= balltoDribbleTarget.normalize();
        
        const dotPlayerForward= this.player.userData.dotP;
        const dotToTarget=nBalltoPlayer.dot(nBalltoDribbleTarget);

        const positionBehindBall = yukaBallPos.clone() .clone()
        .add(nBalltoDribbleTarget.clone().multiplyScalar(1.615))
        

        const sideLine1Pos= new YUKA.Vector3(
           yukaBallPos.x ,
           3,
           this.sideline1.position.z
        );

        const sideLine2Pos= new YUKA.Vector3(
            yukaBallPos.x ,
           3,
           this.sideline2.position.z
        );
 

        const balltoSideLine1=yukaBallPos.clone().sub(sideLine1Pos);
        const balltoSideLine2=yukaBallPos.clone().sub(sideLine2Pos);

        const nSideLine1=balltoSideLine1.normalize();
        const nSideLine2=balltoSideLine2.normalize();

        const betweenBallSideline1= yukaBallPos.clone().add(nSideLine1.multiplyScalar(1.5));
        const betweenBallSideline2= yukaBallPos.clone().add(nSideLine2.multiplyScalar(1.5));



     

     if((ballDribbleDist<2 || xBallDribbleDist <2)||(ballDribbleDist>6 || xBallDribbleDist >6)){
        this.updateDribbleTarget();
    }

        if(sideLineBallDist1<15){
            ArriveBall.target={x:positionBehindBall.x,y:3,z:betweenBallSideline2.z};
            AvoidBall.weight=1;
        }
        else if(sideLineBallDist2<15){
            ArriveBall.target={x:positionBehindBall.x,y:3,z:betweenBallSideline1.z};
            AvoidBall.weight=1;
        }
        else{
            ArriveBall.target={x:positionBehindBall.x,y:3,z:positionBehindBall.z};

       const isBehindBall =  dotToTarget<0 && dotPlayerForward >0.4  

        if(this.playerClass.distBall<8 && isBehindBall){
         AvoidBall.weight=0;
       }  

        else if(this.playerClass.distBall<8 && !isBehindBall) {
            AvoidBall.weight=1;
        }

        
        }

      //  this.scene.corner1.position.copy(ArriveBall.target);
      //  this.scene.corner1.position.y=1.5;

      //  this.scene.corner3.position.copy(this.dribbleTarget);
      //  this.scene.corner3.position.y=1.5;


    }

    exit(entity){
   //    console.log(entity._renderComponent.name,'of',this.playerClass.team.teamName,' has stopped dribbling the ball.');
       const ArriveBall=this.yukaPlayer.steering.behaviors[3];
       const AvoidBall=this.yukaPlayer.steering.behaviors[4];

       ArriveBall.weight=0;
       AvoidBall.weight=0;

       this.playerClass.dribbleTarget=null;
    }

    updateDribbleTarget(){
        const ball= this.playerClass.ball;
        const yukaBall= this.scene.ball.yukaBall;
        const ballPos= ball.position;
        const yukaBallPos=yukaBall.position;

        const dirGoal = new YUKA.Vector3(
            this.goal.position.x - yukaBallPos.x,
            0,
            this.goal.position.z - yukaBallPos.z
        ).normalize();

        const xRand= THREE.MathUtils.randInt(5,10);
        const zRand= THREE.MathUtils.randInt(-10,10);

        const xDir= dirGoal.x <0 ? -1 : 1

        const xTarget=  yukaBallPos.x + (xDir * xRand);
        const zTarget=  yukaBallPos.z + (zRand);

        this.dribbleTarget.set(xTarget,3,zTarget);
        this.playerClass.dribbleTarget=this.dribbleTarget;

    }
}*/
class DribbleState extends YUKA.State {
    constructor(yukaPlayer, playerClass, scene) {
        super();
        this.yukaPlayer = yukaPlayer;
        this.playerClass = playerClass;
        this.player = playerClass.player;
        this.scene = scene;

        this.dribbleTarget = new YUKA.Vector3();

        // Reusable vectors to avoid GC
        this.goal = null;
        this.sideline1 = null;
        this.sideline2 = null;

        this.pYukaPos = new YUKA.Vector3();
        this.lookVec = new YUKA.Vector3();
        this.balltoPlayer = new YUKA.Vector3();
        this.nBalltoPlayer = new YUKA.Vector3();
        this.balltoDribbleTarget = new YUKA.Vector3();
        this.nBalltoDribbleTarget = new YUKA.Vector3();
        this.positionBehindBall = new YUKA.Vector3();

        this.sideLine1Pos = new YUKA.Vector3();
        this.sideLine2Pos = new YUKA.Vector3();
        this.balltoSideLine1 = new YUKA.Vector3();
        this.balltoSideLine2 = new YUKA.Vector3();
        this.nSideLine1 = new YUKA.Vector3();
        this.nSideLine2 = new YUKA.Vector3();
        this.betweenBallSideline1 = new YUKA.Vector3();
        this.betweenBallSideline2 = new YUKA.Vector3();
    }

    enter(entity) {
        const goalTarget = this.playerClass.team.goalineTargetName;
        this.scene.scene.traverse((obj) => {
            if (obj.name === goalTarget) {
                this.goal = obj;
            }
        });

        this.sideline1 = this.scene.field.sideline1;
        this.sideline2 = this.scene.field.sideline2;

        this.delta = this.scene.yukaTime.update().getDelta();
        this.updateDribbleTarget();
    }

    execute(entity) {
        const ball = this.playerClass.ball;
        const yukaBall = this.scene.ball.yukaBall;
        const ballPos = ball.position;
        const yukaBallPos = yukaBall.position;

        const sideLineBallDist1 = Math.abs(ballPos.z - this.sideline1.position.z);
        const sideLineBallDist2 = Math.abs(ballPos.z - this.sideline2.position.z);

        const ArriveBall = this.yukaPlayer.steering.behaviors[3];
        const AvoidBall = this.yukaPlayer.steering.behaviors[4];

        ArriveBall.weight = 1;

        const ballDribbleDist = yukaBallPos.distanceTo(this.dribbleTarget);
        const xBallDribbleDist = Math.abs(yukaBallPos.x - this.dribbleTarget.x);

        this.lookVec.set(yukaBallPos.x, 3, yukaBallPos.z);
        this.yukaPlayer.rotateTo(this.lookVec, this.delta);

        this.pYukaPos.set(this.player.position.x, yukaBallPos.y, this.player.position.z);

        this.balltoPlayer.subVectors(yukaBallPos, this.pYukaPos);
        this.nBalltoPlayer.copy(this.balltoPlayer).normalize();

        this.balltoDribbleTarget.subVectors(yukaBallPos, this.dribbleTarget);
        this.nBalltoDribbleTarget.copy(this.balltoDribbleTarget).normalize();

        const dotPlayerForward = this.player.userData.dotP;
        const dotToTarget = this.nBalltoPlayer.dot(this.nBalltoDribbleTarget);

        this.positionBehindBall
            .copy(yukaBallPos)
            .add(this.nBalltoDribbleTarget.clone().multiplyScalar(1.615));

        this.sideLine1Pos.set(yukaBallPos.x, 3, this.sideline1.position.z);
        this.sideLine2Pos.set(yukaBallPos.x, 3, this.sideline2.position.z);

        this.balltoSideLine1.subVectors(yukaBallPos, this.sideLine1Pos);
        this.balltoSideLine2.subVectors(yukaBallPos, this.sideLine2Pos);

        this.nSideLine1.copy(this.balltoSideLine1).normalize();
        this.nSideLine2.copy(this.balltoSideLine2).normalize();

        this.betweenBallSideline1.copy(yukaBallPos).add(this.nSideLine1.multiplyScalar(1.5));
        this.betweenBallSideline2.copy(yukaBallPos).add(this.nSideLine2.multiplyScalar(1.5));

        if ((ballDribbleDist < 2 || xBallDribbleDist < 2) || (ballDribbleDist > 6 || xBallDribbleDist > 6)) {
            this.updateDribbleTarget();
        }

        if (sideLineBallDist1 < 15) {
            ArriveBall.target = {
                x: this.positionBehindBall.x,
                y: 3,
                z: this.betweenBallSideline2.z
            };
            AvoidBall.weight = 1;
        } else if (sideLineBallDist2 < 15) {
            ArriveBall.target = {
                x: this.positionBehindBall.x,
                y: 3,
                z: this.betweenBallSideline1.z
            };
            AvoidBall.weight = 1;
        } else {
            ArriveBall.target = {
                x: this.positionBehindBall.x,
                y: 3,
                z: this.positionBehindBall.z
            };

            const isBehindBall = dotToTarget < 0 && dotPlayerForward > 0.4;

            if (this.playerClass.distBall < 8 && isBehindBall) {
                AvoidBall.weight = 0;
            } else if (this.playerClass.distBall < 8 && !isBehindBall) {
                AvoidBall.weight = 1;
            }
        }
    }

    exit(entity) {
        const ArriveBall = this.yukaPlayer.steering.behaviors[3];
        const AvoidBall = this.yukaPlayer.steering.behaviors[4];

        ArriveBall.weight = 0;
        AvoidBall.weight = 0;

        this.playerClass.dribbleTarget = null;
    }

    updateDribbleTarget() {
        const ball = this.playerClass.ball;
        const yukaBall = this.scene.ball.yukaBall;
        const yukaBallPos = yukaBall.position;

        const dirGoal = new YUKA.Vector3(
            this.goal.position.x - yukaBallPos.x,
            0,
            this.goal.position.z - yukaBallPos.z
        ).normalize();

        const xRand = THREE.MathUtils.randInt(5, 10);
        const zRand = THREE.MathUtils.randInt(-10, 10);
        const xDir = dirGoal.x < 0 ? -1 : 1;

        const xTarget = yukaBallPos.x + (xDir * xRand);
        const zTarget = yukaBallPos.z + zRand;

        this.dribbleTarget.set(xTarget, 3, zTarget);
        this.playerClass.dribbleTarget = this.dribbleTarget;
    }
}




/*class SupportAttackerState extends YUKA.State {
    constructor(yukaPlayer, playerClass, scene) {
        super();
        this.yukaPlayer = yukaPlayer;
        this.playerClass = playerClass;
        this.player = playerClass.player;
        this.scene = scene;

        this.offset= new YUKA.Vector3();
        this.fieldMax = new YUKA.Vector3(102, 3, 53);
        this.fieldMin = new YUKA.Vector3(-102, 3, -53);
        this.minSupportDistance = 15;
        this.maxSupportDistance = 45;
        this.offsetPos=new YUKA.Vector3();

        
    }

    enter(entity) {
       //console.log(entity._renderComponent.name, 'of', this.playerClass.team.teamName, ' is now Supporting the Attacker');
        
        const SeekWBall = this.yukaPlayer.steering.behaviors[0];
        const PursueBall = this.yukaPlayer.steering.behaviors[1];
        const AvoidPlayer = this.yukaPlayer.steering.behaviors[2];
        const ArriveBall = this.yukaPlayer.steering.behaviors[3];
        const AvoidBall = this.yukaPlayer.steering.behaviors[4];
        const Separation = this.yukaPlayer.steering.behaviors[6];
        const Alignment = this.yukaPlayer.steering.behaviors[7];
        const Cohesion = this.yukaPlayer.steering.behaviors[8];

        // Adjust behavior weights
        ArriveBall.weight = 1;
        AvoidBall.weight = 1;
        AvoidPlayer.weight = 1;
        SeekWBall.weight = 0;
        PursueBall.weight = 0;
        Separation.weight = 0.7;
        Alignment.weight = 0.2;
        Cohesion.weight = 0.1;

        const ballCarrier = this.scene.ball.possessorClass;
        const targetEntity = ballCarrier ? ballCarrier.yukaPlayer : this.scene.ball.yukaBall;

        this.frameCounter=0;
        this.updateInterval = 180;

        this.prevBallCarrier=null;
        this.lastTargetPos = new YUKA.Vector3().copy(targetEntity.position);
        this.computeOffset(targetEntity.position);

    }

    execute(entity) {
          const ballCarrier = this.scene.ball.possessorClass;
        const targetEntity = ballCarrier ? ballCarrier.yukaPlayer : this.scene.ball.yukaBall;

        // Recompute if ball carrier changes
        if (ballCarrier !== this.prevBallCarrier) {
         
            this.prevBallCarrier = ballCarrier;
            this.computeOffset(targetEntity.position);
            this.lastTargetPos.copy(targetEntity.position);
            return;
        }

        // Recompute every `updateInterval` frames or if target moved significantly
        const movedDistance = this.lastTargetPos.distanceTo(targetEntity.position);
        if (this.frameCounter >= this.updateInterval || movedDistance > 20) {
        
            this.computeOffset(targetEntity.position);
            this.lastTargetPos.copy(targetEntity.position);
            this.frameCounter = 0;
          return;
        }

        if(this.player.position.z> this.fieldMax.z || this.player.position.z < this.fieldMin.z){
            this.computeOffset(targetEntity.position);
            this.lastTargetPos.copy(targetEntity.position);
            this.frameCounter = 0;
            return;
        }
        this.frameCounter++;
    }

    exit(entity) {
    const ArriveBall = this.yukaPlayer.steering.behaviors[3];
         const Separation = this.yukaPlayer.steering.behaviors[6];
        const Alignment = this.yukaPlayer.steering.behaviors[7];
        const Cohesion = this.yukaPlayer.steering.behaviors[8];

    ArriveBall.weight = 1;
    Separation.weight = 0;
    Alignment.weight = 0;
    Cohesion.weight = 0;
    this.frameCounter=0;
    }

    computeOffset(position){
        const ArriveBall = this.yukaPlayer.steering.behaviors[3];
        let forwardDirection,lateralDirection,forwardOffset,lateralOffset,supportPos, cSupportPos;
        // Store preferred movement directions
        if(this.playerClass.team.supportAttackers.includes(this.playerClass)){
            lateralDirection = Math.random() < 0.5 ? THREE.MathUtils.randInt(0,1) : THREE.MathUtils.randInt(-1,0);
            lateralOffset = THREE.MathUtils.randFloat(0, this.maxSupportDistance) * lateralDirection;

             if(this.playerClass.posName=='defender'){
                forwardDirection = Math.random() < 0.9 ? -this.playerClass.team.attackDirection : this.playerClass.team.attackDirection;
                forwardOffset = THREE.MathUtils.randFloat(this.minSupportDistance, 20) * forwardDirection;
             }
             else if(this.playerClass.posName=='midfielder'){
                 forwardDirection = Math.random() < 0.8 ? this.playerClass.team.attackDirection : -this.playerClass.team.attackDirection;
                 forwardOffset = THREE.MathUtils.randFloat(this.minSupportDistance, 35) * forwardDirection;
             }

             else{
                forwardDirection = Math.random() < 0.95 ? this.playerClass.team.attackDirection : -this.playerClass.team.attackDirection;
                forwardOffset = THREE.MathUtils.randFloat(this.minSupportDistance, this.maxSupportDistance) * forwardDirection;
             }    
            
        }
        else{
           forwardDirection=this.playerClass.team.xDirection; 
           lateralDirection = Math.random() < 0.5 ? THREE.MathUtils.randInt(0,1) : THREE.MathUtils.randInt(-1,0);
           lateralOffset = THREE.MathUtils.randFloat(0, this.maxSupportDistance) * lateralDirection;

           if(this.playerClass.posName=='defender'){
            forwardOffset = THREE.MathUtils.randFloat(40,this.maxSupportDistance) * forwardDirection;
           }
           else if(this.playerClass.posName=='midfielder'){
            forwardOffset =  THREE.MathUtils.randFloat(30,35) * forwardDirection;
           }
           else{
            forwardOffset =  THREE.MathUtils.randFloat(this.minSupportDistance,20) * forwardDirection;
           }

  
        }
        
         supportPos= new YUKA.Vector3(position.x+forwardOffset,3,position.z+lateralOffset); 
         cSupportPos=  supportPos.clone().clamp(this.fieldMin,this.fieldMax);
    //   console.log('forwardOffset',forwardOffset,' lateralOffset:',lateralOffset); 
      //  console.log(this.yukaPlayer._renderComponent.name, 'of', this.playerClass.team.teamName ,'Support Position:', supportPos);
        ArriveBall.target= new YUKA.Vector3(cSupportPos.x, 3, cSupportPos.z);
        this.lastTargetPos.copy(position);
        
    }

   
}*/
class SupportAttackerState extends YUKA.State {
    constructor(yukaPlayer, playerClass, scene) {
        super();
        this.yukaPlayer = yukaPlayer;
        this.playerClass = playerClass;
        this.player = playerClass.player;
        this.scene = scene;

        this.offset = new YUKA.Vector3();
        this.fieldMax = new YUKA.Vector3(102, 3, 53);
        this.fieldMin = new YUKA.Vector3(-102, 3, -53);
        this.minSupportDistance = 15;
        this.maxSupportDistance = 45;
        this.offsetPos = new YUKA.Vector3();

        // GC optimizations
        this.lastTargetPos = new YUKA.Vector3();
        this.tempSupportPos = new YUKA.Vector3();
        this.clampedSupportPos = new YUKA.Vector3();

        this.frameCounter = 0;
        this.updateInterval = 180;
        this.prevBallCarrier = null;
    }

    enter(entity) {
        const SeekWBall = this.yukaPlayer.steering.behaviors[0];
        const PursueBall = this.yukaPlayer.steering.behaviors[1];
        const AvoidPlayer = this.yukaPlayer.steering.behaviors[2];
        const ArriveBall = this.yukaPlayer.steering.behaviors[3];
        const AvoidBall = this.yukaPlayer.steering.behaviors[4];
        const Separation = this.yukaPlayer.steering.behaviors[6];
        const Alignment = this.yukaPlayer.steering.behaviors[7];
        const Cohesion = this.yukaPlayer.steering.behaviors[8];

        ArriveBall.weight = 1;
        AvoidBall.weight = 1;
        AvoidPlayer.weight = 1;
        SeekWBall.weight = 0;
        PursueBall.weight = 0;
        Separation.weight = 0.7;
        Alignment.weight = 0.2;
        Cohesion.weight = 0.1;

        const ballCarrier = this.scene.ball.possessorClass;
        const targetEntity = ballCarrier ? ballCarrier.yukaPlayer : this.scene.ball.yukaBall;

        this.frameCounter = 0;
        this.prevBallCarrier = null;
        this.lastTargetPos.copy(targetEntity.position);
        this.computeOffset(targetEntity.position);
    }

    execute(entity) {
        const ballCarrier = this.scene.ball.possessorClass;
        const targetEntity = ballCarrier ? ballCarrier.yukaPlayer : this.scene.ball.yukaBall;

        if (ballCarrier !== this.prevBallCarrier) {
            this.prevBallCarrier = ballCarrier;
            this.computeOffset(targetEntity.position);
            this.lastTargetPos.copy(targetEntity.position);
            return;
        }

        const movedDistance = this.lastTargetPos.distanceTo(targetEntity.position);
        if (this.frameCounter >= this.updateInterval || movedDistance > 20) {
            this.computeOffset(targetEntity.position);
            this.lastTargetPos.copy(targetEntity.position);
            this.frameCounter = 0;
            return;
        }

        if (
            this.player.position.z > this.fieldMax.z ||
            this.player.position.z < this.fieldMin.z
        ) {
            this.computeOffset(targetEntity.position);
            this.lastTargetPos.copy(targetEntity.position);
            this.frameCounter = 0;
            return;
        }

        this.frameCounter++;
    }

    exit(entity) {
        const ArriveBall = this.yukaPlayer.steering.behaviors[3];
        const Separation = this.yukaPlayer.steering.behaviors[6];
        const Alignment = this.yukaPlayer.steering.behaviors[7];
        const Cohesion = this.yukaPlayer.steering.behaviors[8];

        ArriveBall.weight = 1;
        Separation.weight = 0;
        Alignment.weight = 0;
        Cohesion.weight = 0;
        this.frameCounter = 0;
    }

    computeOffset(position) {
        const ArriveBall = this.yukaPlayer.steering.behaviors[3];
        let forwardDirection, lateralDirection, forwardOffset, lateralOffset;

        if (this.playerClass.team.supportAttackers.includes(this.playerClass)) {
            lateralDirection = Math.random() < 0.5 ? THREE.MathUtils.randInt(0, 1) : THREE.MathUtils.randInt(-1, 0);
            lateralOffset = THREE.MathUtils.randFloat(0, this.maxSupportDistance) * lateralDirection;

            if (this.playerClass.posName === 'defender') {
                forwardDirection = Math.random() < 0.9 ? -this.playerClass.team.attackDirection : this.playerClass.team.attackDirection;
                forwardOffset = THREE.MathUtils.randFloat(this.minSupportDistance, 20) * forwardDirection;
            } else if (this.playerClass.posName === 'midfielder') {
                forwardDirection = Math.random() < 0.8 ? this.playerClass.team.attackDirection : -this.playerClass.team.attackDirection;
                forwardOffset = THREE.MathUtils.randFloat(this.minSupportDistance, 35) * forwardDirection;
            } else {
                forwardDirection = Math.random() < 0.95 ? this.playerClass.team.attackDirection : -this.playerClass.team.attackDirection;
                forwardOffset = THREE.MathUtils.randFloat(this.minSupportDistance, this.maxSupportDistance) * forwardDirection;
            }
        } else {
            forwardDirection = this.playerClass.team.xDirection;
            lateralDirection = Math.random() < 0.5 ? THREE.MathUtils.randInt(0, 1) : THREE.MathUtils.randInt(-1, 0);
            lateralOffset = THREE.MathUtils.randFloat(0, this.maxSupportDistance) * lateralDirection;

            if (this.playerClass.posName === 'defender') {
                forwardOffset = THREE.MathUtils.randFloat(40, this.maxSupportDistance) * forwardDirection;
            } else if (this.playerClass.posName === 'midfielder') {
                forwardOffset = THREE.MathUtils.randFloat(30, 35) * forwardDirection;
            } else {
                forwardOffset = THREE.MathUtils.randFloat(this.minSupportDistance, 20) * forwardDirection;
            }
        }

        this.tempSupportPos.set(position.x + forwardOffset, 3, position.z + lateralOffset);
        this.clampedSupportPos.copy(this.tempSupportPos).clamp(this.fieldMin, this.fieldMax);

        ArriveBall.target = this.offset.set(
            this.clampedSupportPos.x,
            3,
            this.clampedSupportPos.z
        );
        this.lastTargetPos.copy(position);
    }
}




/*class SupportDefenceState extends YUKA.State {
       constructor(yukaPlayer, playerClass, scene) {
        super();
        this.yukaPlayer = yukaPlayer;
        this.playerClass = playerClass;
        this.player = playerClass.player;
        this.scene = scene;

        this.offset= new YUKA.Vector3();
        this.fieldMax = new YUKA.Vector3(102, 3, 56);
        this.fieldMin = new YUKA.Vector3(-102, 3, -56);
        this.minSupportDistance = 15;
        this.maxSupportDistance = 45;
        this.offsetPos=new YUKA.Vector3();

        
    }

    enter(entity) {
       //console.log(entity._renderComponent.name, 'of', this.playerClass.team.teamName, ' is now Supporting the Attacker');
        
        const SeekWBall = this.yukaPlayer.steering.behaviors[0];
        const PursueBall = this.yukaPlayer.steering.behaviors[1];
        const AvoidPlayer = this.yukaPlayer.steering.behaviors[2];
        const ArriveBall = this.yukaPlayer.steering.behaviors[3];
        const AvoidBall = this.yukaPlayer.steering.behaviors[4];
        const Separation = this.yukaPlayer.steering.behaviors[6];
        const Alignment = this.yukaPlayer.steering.behaviors[7];
        const Cohesion = this.yukaPlayer.steering.behaviors[8];

        // Adjust behavior weights
        ArriveBall.weight = 1;
        AvoidBall.weight = 1;
        AvoidPlayer.weight = 1;
        SeekWBall.weight = 0;
        PursueBall.weight = 0;
        Separation.weight = 0.7;
        Alignment.weight = 0.2;
        Cohesion.weight = 0.1;

        const ballCarrier = this.scene.ball.possessorClass;
        const targetEntity = ballCarrier ? ballCarrier.yukaPlayer : this.scene.ball.yukaBall;

        this.frameCounter=0;
        this.updateInterval = 180;

        this.prevBallCarrier=null;
        this.lastTargetPos = new YUKA.Vector3().copy(targetEntity.position);
        this.computeOffset(targetEntity.position);

    }

    execute(entity) {
          const ballCarrier = this.scene.ball.possessorClass;
        const targetEntity = ballCarrier ? ballCarrier.yukaPlayer : this.scene.ball.yukaBall;

        // Recompute if ball carrier changes
        if (ballCarrier !== this.prevBallCarrier) {
       
            this.prevBallCarrier = ballCarrier;
            this.computeOffset(targetEntity.position);
            this.lastTargetPos.copy(targetEntity.position);
            this.frameCounter = 0;
            return;
        }

        // Recompute every `updateInterval` frames or if target moved significantly
        const movedDistance = this.lastTargetPos.distanceTo(targetEntity.position);
        if (this.frameCounter >= this.updateInterval || movedDistance > 25) {
        
            this.computeOffset(targetEntity.position);
            this.lastTargetPos.copy(targetEntity.position);
            this.frameCounter = 0;
            return;
        }

        if(this.player.position.z> this.fieldMax.z || this.player.position.z < this.fieldMin.z){
            this.computeOffset(targetEntity.position);
            this.lastTargetPos.copy(targetEntity.position);
            this.frameCounter = 0;
            return;
        }
        this.frameCounter++;
    }

    exit(entity) {
    const ArriveBall = this.yukaPlayer.steering.behaviors[3];
         const Separation = this.yukaPlayer.steering.behaviors[6];
        const Alignment = this.yukaPlayer.steering.behaviors[7];
        const Cohesion = this.yukaPlayer.steering.behaviors[8];

    ArriveBall.weight = 1;
    Separation.weight = 0;
    Alignment.weight = 0;
    Cohesion.weight = 0;
    this.frameCounter=0;
    }

    computeOffset(position){
        const ArriveBall = this.yukaPlayer.steering.behaviors[3];
        let forwardDirection,lateralDirection,forwardOffset,lateralOffset,supportPos, cSupportPos;
        // Store preferred movement directions
        if(!this.playerClass.team.chasers.includes(this.playerClass)){
           forwardDirection=this.playerClass.team.xDirection; 
           lateralDirection = Math.random() < 0.5 ? THREE.MathUtils.randInt(0,1) : THREE.MathUtils.randInt(-1,0);
           lateralOffset = THREE.MathUtils.randInt(0, this.maxSupportDistance) * lateralDirection;

           if(this.playerClass.posName=='defender'){
            forwardOffset = THREE.MathUtils.randFloat(40,this.maxSupportDistance) * forwardDirection;
           }
           else if(this.playerClass.posName=='midfielder'){
            forwardOffset =  THREE.MathUtils.randFloat(30,35) * forwardDirection;
           }
           else{
            forwardOffset =  THREE.MathUtils.randInt(this.minSupportDistance,20) * forwardDirection;
           }

        }
      
        
         supportPos= new YUKA.Vector3(position.x+forwardOffset,3,this.playerClass.StartZ+lateralOffset); 
         cSupportPos=  supportPos.clone().clamp(this.fieldMin,this.fieldMax);
      //  console.log(this.yukaPlayer._renderComponent.name, 'of', this.playerClass.team.teamName ,'Support Defense Position:', supportPos);
        ArriveBall.target= new YUKA.Vector3(cSupportPos.x, 3, cSupportPos.z);
        this.lastTargetPos.copy(position);
        
    }
}*/
class SupportDefenceState extends YUKA.State {
    constructor(yukaPlayer, playerClass, scene) {
        super();
        this.yukaPlayer = yukaPlayer;
        this.playerClass = playerClass;
        this.player = playerClass.player;
        this.scene = scene;

        this.offset = new YUKA.Vector3();
        this.fieldMax = new YUKA.Vector3(102, 3, 56);
        this.fieldMin = new YUKA.Vector3(-102, 3, -56);
        this.minSupportDistance = 15;
        this.maxSupportDistance = 45;
        this.offsetPos = new YUKA.Vector3();

        // Pre-allocate for reuse in computeOffset
        this.forwardDirection = 0;
        this.lateralDirection = 0;
        this.forwardOffset = 0;
        this.lateralOffset = 0;
        this.supportPos = new YUKA.Vector3();
        this.cSupportPos = new YUKA.Vector3();
    }

    enter(entity) {
        const SeekWBall = this.yukaPlayer.steering.behaviors[0];
        const PursueBall = this.yukaPlayer.steering.behaviors[1];
        const AvoidPlayer = this.yukaPlayer.steering.behaviors[2];
        const ArriveBall = this.yukaPlayer.steering.behaviors[3];
        const AvoidBall = this.yukaPlayer.steering.behaviors[4];
        const Separation = this.yukaPlayer.steering.behaviors[6];
        const Alignment = this.yukaPlayer.steering.behaviors[7];
        const Cohesion = this.yukaPlayer.steering.behaviors[8];

        ArriveBall.weight = 1;
        AvoidBall.weight = 1;
        AvoidPlayer.weight = 1;
        SeekWBall.weight = 0;
        PursueBall.weight = 0;
        Separation.weight = 0.7;
        Alignment.weight = 0.2;
        Cohesion.weight = 0.1;

        const ballCarrier = this.scene.ball.possessorClass;
        const targetEntity = ballCarrier ? ballCarrier.yukaPlayer : this.scene.ball.yukaBall;

        this.frameCounter = 0;
        this.updateInterval = 180;

        this.prevBallCarrier = null;
        this.lastTargetPos = new YUKA.Vector3().copy(targetEntity.position);
        this.computeOffset(targetEntity.position);
    }

    execute(entity) {
        const ballCarrier = this.scene.ball.possessorClass;
        const targetEntity = ballCarrier ? ballCarrier.yukaPlayer : this.scene.ball.yukaBall;

        if (ballCarrier !== this.prevBallCarrier) {
            this.prevBallCarrier = ballCarrier;
            this.computeOffset(targetEntity.position);
            this.lastTargetPos.copy(targetEntity.position);
            this.frameCounter = 0;
            return;
        }

        const movedDistance = this.lastTargetPos.distanceTo(targetEntity.position);
        if (this.frameCounter >= this.updateInterval || movedDistance > 25) {
            this.computeOffset(targetEntity.position);
            this.lastTargetPos.copy(targetEntity.position);
            this.frameCounter = 0;
            return;
        }

        if (this.player.position.z > this.fieldMax.z || this.player.position.z < this.fieldMin.z) {
            this.computeOffset(targetEntity.position);
            this.lastTargetPos.copy(targetEntity.position);
            this.frameCounter = 0;
            return;
        }

        this.frameCounter++;
    }

    exit(entity) {
        const ArriveBall = this.yukaPlayer.steering.behaviors[3];
        const Separation = this.yukaPlayer.steering.behaviors[6];
        const Alignment = this.yukaPlayer.steering.behaviors[7];
        const Cohesion = this.yukaPlayer.steering.behaviors[8];

        ArriveBall.weight = 1;
        Separation.weight = 0;
        Alignment.weight = 0;
        Cohesion.weight = 0;
        this.frameCounter = 0;
    }

    computeOffset(position) {
        const ArriveBall = this.yukaPlayer.steering.behaviors[3];

        if (!this.playerClass.team.chasers.includes(this.playerClass)) {
            // lateralDirection is randomly -1 or 0 or 1 as per original logic
            this.lateralDirection = Math.random() < 0.5 ? THREE.MathUtils.randInt(0, 1) : THREE.MathUtils.randInt(-1, 0);
            this.lateralOffset = THREE.MathUtils.randInt(0, this.maxSupportDistance) * this.lateralDirection;

            if (this.playerClass.posName === 'defender') {
                this.forwardDirection = this.playerClass.team.xDirection;
                this.forwardOffset = THREE.MathUtils.randFloat(40, this.maxSupportDistance) * this.forwardDirection;
            } else if (this.playerClass.posName === 'midfielder') {
                this.forwardDirection = this.playerClass.team.xDirection;
                this.forwardOffset = THREE.MathUtils.randFloat(30, 35) * this.forwardDirection;
            } else {
                this.forwardDirection = this.playerClass.team.xDirection;
                this.forwardOffset = THREE.MathUtils.randInt(this.minSupportDistance, 20) * this.forwardDirection;
            }
        }

        this.supportPos.set(position.x + this.forwardOffset, 3, this.playerClass.StartZ + this.lateralOffset);
        this.cSupportPos.copy(this.supportPos).clamp(this.fieldMin, this.fieldMax);

        ArriveBall.target = new YUKA.Vector3(this.cSupportPos.x, 3, this.cSupportPos.z);
        this.lastTargetPos.copy(position);
    }
}





/*class GoHomeState extends YUKA.State{
    constructor(yukaPlayer,playerClass,scene){
        super();
        this.yukaPlayer=yukaPlayer;
        this.playerClass=playerClass;
        this.player=playerClass.player;
        this.scene=scene;
    }
    enter(entity){
    // console.log(entity._renderComponent.name,'of',this.playerClass.team.teamName,' is about to go home');
      this.delta= this.scene.yukaTime.update().getDelta();


      const SeekWBall= this.yukaPlayer.steering.behaviors[0];
      const PursueBall=this.yukaPlayer.steering.behaviors[1];  
      const AvoidPlayer=this.yukaPlayer.steering.behaviors[2]; 
      const ArriveBall=this.yukaPlayer.steering.behaviors[3];
      const AvoidBall=this.yukaPlayer.steering.behaviors[4]; 

      SeekWBall.weight=0;
      PursueBall.weight=0;
      AvoidBall.weight=0;
      AvoidPlayer.weight=1;
      ArriveBall.weight=1;

      ArriveBall.target={x:this.playerClass.StartX,y:3,z:this.playerClass.StartZ};

    }

    execute(entity){
    const ArriveBall=this.yukaPlayer.steering.behaviors[3];
    const yukaBall=this.scene.ball.yukaBall;
    const yukaBallPos=new YUKA.Vector3(
                          yukaBall.position.x,
                          3,
                          yukaBall.position.z 
                       );

      const paDist= this.player.position.distanceTo(ArriveBall.target)
    //  console.log(' Player to Arrive Dist',paDist);

      if(paDist<1.5){
        this.yukaPlayer.rotateTo(yukaBallPos,this.delta); 
        this.yukaPlayer.velocity.set(0,0,0);

      }
    }

    exit(entity){
   //         console.log(entity._renderComponent.name,'of',this.playerClass.team.teamName,' has gotten home.');
    }
 }*/
class GoHomeState extends YUKA.State {
    constructor(yukaPlayer, playerClass, scene) {
        super();
        this.yukaPlayer = yukaPlayer;
        this.playerClass = playerClass;
        this.player = playerClass.player;
        this.scene = scene;

        // Reuse preallocated YUKA.Vector3 objects
        this._yukaBallPos = new YUKA.Vector3();
    }

    enter(entity) {
        // console.log(entity._renderComponent.name,'of',this.playerClass.team.teamName,' is about to go home');
        this.delta = this.scene.yukaTime.update().getDelta();

        const SeekWBall = this.yukaPlayer.steering.behaviors[0];
        const PursueBall = this.yukaPlayer.steering.behaviors[1];
        const AvoidPlayer = this.yukaPlayer.steering.behaviors[2];
        const ArriveBall = this.yukaPlayer.steering.behaviors[3];
        const AvoidBall = this.yukaPlayer.steering.behaviors[4];

        SeekWBall.weight = 0;
        PursueBall.weight = 0;
        AvoidBall.weight = 0;
        AvoidPlayer.weight = 1;
        ArriveBall.weight = 1;

        ArriveBall.target = {
            x: this.playerClass.StartX,
            y: 3,
            z: this.playerClass.StartZ
        };
    }

    execute(entity) {
        const ArriveBall = this.yukaPlayer.steering.behaviors[3];
        const yukaBall = this.scene.ball.yukaBall;

        // Reuse the preallocated vector
        this._yukaBallPos.set(
            yukaBall.position.x,
            3,
            yukaBall.position.z
        );

        const paDist = this.player.position.distanceTo(ArriveBall.target);
        // console.log(' Player to Arrive Dist',paDist);

        if (paDist < 1.5) {
            this.yukaPlayer.rotateTo(this._yukaBallPos, this.delta);
            this.yukaPlayer.velocity.set(0, 0, 0);
        }
    }

    exit(entity) {
        // console.log(entity._renderComponent.name,'of',this.playerClass.team.teamName,' has gotten home.');
    }
}






/*class ThrowInState extends YUKA.State{
    constructor(yukaPlayer,playerClass,scene){
        super();
        this.yukaPlayer=yukaPlayer;
        this.playerClass=playerClass;
        this.player=playerClass.player;
        this.scene=scene;
        this.ball=this.scene.ball;
        this.ball.ball.body.setDamping(0.25,0.25);    
}

    enter(entity){
      // console.log(entity._renderComponent.name,'of',this.playerClass.team.teamName,' is about to take the throw in');
        this.delta= this.scene.yukaTime.update().getDelta();
        this.ball.handBallActive=false;
        const throwInreceivers=this.playerClass.team.throwInreceivers;
        this.throwInTarget= throwInreceivers[Math.floor(Math.random()*throwInreceivers.length)];
     //   console.log('Throw in Target',this.throwInTarget); 

        this.yukaTargetPos= new YUKA.Vector3(
            this.throwInTarget.yukaPlayer.position.x ,
             3,
            this.throwInTarget.yukaPlayer.position.z
         ) 

         this.yukaPlayer.updateOrientation=false;
         this.yukaPlayer.lookAt(this.yukaTargetPos);
         this. yukaDirection=this.yukaTargetPos.clone().sub(this.yukaPlayer.position).normalize();
         this.ball.ball.body.setCollisionFlags(2);
        const distance=this.yukaPlayer.position.distanceTo(this.yukaTargetPos);    
        this.throw=false;
        this.XZrand=Math.round(Math.random() * (15 - 5) + 5);
}       

    execute(entity){
      
        this.ball._throwin(this.playerClass);
        if(this.player.anims.current!=='throw_in_ip'){
            this.player.anims.play('throw_in_ip',500,false);
        }
        const animRun=this.player.anims.get(this.player.anims.current).isRunning();

        if(!animRun && !this.throw){
            this.ball.ball.body.once.update(()=>{
                this.ball.ball.body.setCollisionFlags(0);
                this.ball.ball.body.setVelocity(0,0,0);
                this.ball.ball.body.setAngularVelocity(0,0,0);
                this.ball.ball.body.applyImpulse({x:this.yukaDirection.x*this.XZrand,y:5,z:this.yukaDirection.z*this.XZrand},{x:0,y:0,z:0});
            })
            
            this.throw=true;
            this.scene.ResumeThrowIn();         
            this.playerClass.stateMachine.changeTo('supportAttacker');
        }   
    }
    exit(entity){
    //   console.log(entity._renderComponent.name,'of',this.playerClass.team.teamName,' has stopped taking the throw in');
        
        this.playerClass.team.lastTouched=true;
        this.playerClass.team.opponent.lastTouched=false;
        this.ball.possessorTeamClass=this.playerClass.team;
        this.ball.possessorTeam=this.ball.possessorTeamClass.teamName;
        this.ball.possessorClass=this.throwInTarget;
        this.ball.possessor=this.ball.possessorClass.playerName; 

        this.ball.handBallActive=true;
        this.yukaPlayer.updateOrientation=true;
        setTimeout(()=>{this.scene.eventsAvailable=true;},500);   

    }   
} */
class ThrowInState extends YUKA.State {
    constructor(yukaPlayer, playerClass, scene) {
        super();
        this.yukaPlayer = yukaPlayer;
        this.playerClass = playerClass;
        this.player = playerClass.player;
        this.scene = scene;
        this.ball = this.scene.ball;

        this.ball.ball.body.setDamping(0.25, 0.25);

        // Preallocate reusable vectors
        this.yukaTargetPos = new YUKA.Vector3();
        this.yukaDirection = new YUKA.Vector3();
    }

    enter(entity) {
        // console.log(entity._renderComponent.name, 'of', this.playerClass.team.teamName, ' is about to take the throw in');

        this.delta = this.scene.yukaTime.update().getDelta();
        this.ball.handBallActive = false;

        const throwInreceivers = this.playerClass.team.throwInreceivers;
        this.throwInTarget = throwInreceivers[Math.floor(Math.random() * throwInreceivers.length)];
        // console.log('Throw in Target', this.throwInTarget);

        this.yukaTargetPos.set(
            this.throwInTarget.yukaPlayer.position.x,
            3,
            this.throwInTarget.yukaPlayer.position.z
        );

        this.yukaPlayer.updateOrientation = false;
        this.yukaPlayer.lookAt(this.yukaTargetPos);

        this.yukaDirection.copy(this.yukaTargetPos)
            .sub(this.yukaPlayer.position)
            .normalize();

        this.ball.ball.body.setCollisionFlags(2);

        this.throw = false;
        this.XZrand = Math.round(Math.random() * (15 - 5) + 5);
    }

    execute(entity) {
        this.ball._throwin(this.playerClass);

        if (this.player.anims.current !== 'throw_in_ip') {
            this.player.anims.play('throw_in_ip', 500, false);
        }

        const animRun = this.player.anims.get(this.player.anims.current).isRunning();

        if (!animRun && !this.throw) {
            this.ball.ball.body.once.update(() => {
                this.ball.ball.body.setCollisionFlags(0);
                this.ball.ball.body.setVelocity(0, 0, 0);
                this.ball.ball.body.setAngularVelocity(0, 0, 0);
                this.ball.ball.body.applyImpulse(
                    {
                        x: this.yukaDirection.x * this.XZrand,
                        y: 5,
                        z: this.yukaDirection.z * this.XZrand
                    },
                    { x: 0, y: 0, z: 0 }
                );
            });

            this.throw = true;
            this.scene.ResumeThrowIn();
            this.playerClass.stateMachine.changeTo('supportAttacker');
        }
    }

    exit(entity) {
        // console.log(entity._renderComponent.name, 'of', this.playerClass.team.teamName, ' has stopped taking the throw in');

        this.playerClass.team.lastTouched = true;
        this.playerClass.team.opponent.lastTouched = false;

        this.ball.possessorTeamClass = this.playerClass.team;
        this.ball.possessorTeam = this.ball.possessorTeamClass.teamName;
        this.ball.possessorClass = this.throwInTarget;
        this.ball.possessor = this.ball.possessorClass.playerName;

        this.ball.handBallActive = true;
        this.yukaPlayer.updateOrientation = true;

        setTimeout(() => {
            this.scene.eventsAvailable = true;
        }, 500);
    }
}





/*class CornerKickState extends YUKA.State{
    constructor(yukaPlayer,playerClass,scene){
        super();
        this.yukaPlayer=yukaPlayer;
        this.playerClass=playerClass;
        this.player=playerClass.player;
        this.scene=scene;
        this.ball=this.scene.ball;
        this.ball.ball.body.setDamping(0.25,0.25);    
    
    }
    enter(entity){
      //  console.log(entity._renderComponent.name,'of',this.playerClass.team.teamName,' is about to take the corner kick');
        
        const cornerReceivers=Object.values(this.playerClass.team.teamList).filter(pl => pl.posName != 'goalkeeper'&& pl != this.playerClass);
        this.cornerTarget= cornerReceivers[Math.floor(Math.random()*cornerReceivers.length)];

        this.yukaTargetPos= new YUKA.Vector3(
            this.cornerTarget.yukaPlayer.position.x ,
             3,
            this.cornerTarget.yukaPlayer.position.z
         ) 

        this.kick=false;
        this.animRun=false;
        this.prevAnimRun=false;
        this.anim='strike_forward';

        let powerBarFill=0;
        powerBarFill=THREE.MathUtils.randFloat(0, 0.99) + THREE.MathUtils.randInt(9,99);
//console.log('power bar fill',powerBarFill);

        const randMin=THREE.MathUtils.randInt(0,7);
        this.Zrand=15+(powerBarFill/100)*(45-15);
        this.Xrand=this.Zrand;
        if(powerBarFill<60){
            this.Yrand=THREE.MathUtils.randFloat(0, 0.99) + THREE.MathUtils.randInt(randMin,24*0.65);
        }
        else if (powerBarFill >= 60 ) {
              this.Yrand=THREE.MathUtils.randFloat(0, 0.99) + THREE.MathUtils.randInt(randMin,24)
              
        }      
        
}

    execute(entity){
        this.animRun=this.player.anims.get(this.anim).isRunning();
      
        this.yukaPlayer.updateOrientation=false;
        this.yukaPlayer.lookAt(this.yukaTargetPos);

        if(!this.kick){
            this.kick=true;
            setTimeout(() => {
                this.kick = true;
                this.player.body.setVelocity(0, 0, 0);
                this.player.anims.play(this.anim, 500, false);
            }, 3500);
        }


        if (this.prevAnimRun==false && this.animRun==true) {
      //      console.log("Animation started!");
        }
    
        else if (this.prevAnimRun==true && this.animRun==false) {
        //    console.log("Animation finished!");
            this.ball.ball.body.setVelocity(0,0,0);
            this.ball.ball.body.setAngularVelocity(0,0,0);

            this. yukaDirection=this.yukaTargetPos.clone().sub(this.yukaPlayer.position).normalize();

            this.playerClass.team.lastTouched=true;
            this.playerClass.team.opponent.lastTouched=false;

            this.ball.possessorTeamClass=this.playerClass.team;
            this.ball.possessorTeam=this.ball.possessorTeamClass.teamName;
            this.ball.possessorClass=this.cornerTawarget;
            this.ball.possessor=this.ball.possessorClass.playerName; 

            const cornerX=this.yukaDirection.x*this.Xrand;
            const cornerY=this.Yrand;
            const cornerZ=this.yukaDirection.z*this.Zrand;

          //  console.log('cornerX',cornerX);
          //  console.log('cornerY',cornerY);
          //  console.log('cornerZ',cornerZ);

            this.ball.ball.body.applyImpulse({x:cornerX,y:cornerY,z:cornerZ},{x:0,y:0,z:0});

           this.playerClass.stateMachine.changeTo('chaseBall');
           this.scene.ResumeThrowIn();  

                 
        }
        this.prevAnimRun = this.animRun;

    }
    exit(entity){
    //    console.log(entity._renderComponent.name,'of',this.playerClass.team.teamName,' has stopped taking the corner kick');
        
        
        this.ball.handBallActive=true;
        this.yukaPlayer.updateOrientation=true;
        setTimeout(()=>{this.scene.eventsAvailable=true;},500);
   

    }
    
}*/
class CornerKickState extends YUKA.State {
    constructor(yukaPlayer, playerClass, scene) {
        super();
        this.yukaPlayer = yukaPlayer;
        this.playerClass = playerClass;
        this.player = playerClass.player;
        this.scene = scene;
        this.ball = this.scene.ball;

        this.ball.ball.body.setDamping(0.25, 0.25);

        // Preallocated reusable vectors
        this.yukaTargetPos = new YUKA.Vector3();
        this.yukaDirection = new YUKA.Vector3();
    }

    enter(entity) {
        // console.log(entity._renderComponent.name, 'of', this.playerClass.team.teamName, ' is about to take the corner kick');

        const cornerReceivers = Object.values(this.playerClass.team.teamList)
            .filter(pl => pl.posName !== 'goalkeeper' && pl !== this.playerClass);

        this.cornerTarget = cornerReceivers[Math.floor(Math.random() * cornerReceivers.length)];

        this.yukaTargetPos.set(
            this.cornerTarget.yukaPlayer.position.x,
            3,
            this.cornerTarget.yukaPlayer.position.z
        );

        this.kick = false;
        this.animRun = false;
        this.prevAnimRun = false;
        this.anim = 'strike_forward';

        let powerBarFill = THREE.MathUtils.randFloat(0, 0.99) + THREE.MathUtils.randInt(9, 99);

        const randMin = THREE.MathUtils.randInt(0, 7);
        this.Zrand = 15 + (powerBarFill / 100) * (45 - 15);
        this.Xrand = this.Zrand;

        if (powerBarFill < 60) {
            this.Yrand = THREE.MathUtils.randFloat(0, 0.99) + THREE.MathUtils.randInt(randMin, 24 * 0.65);
        } else {
            this.Yrand = THREE.MathUtils.randFloat(0, 0.99) + THREE.MathUtils.randInt(randMin, 24);
        }
    }

    execute(entity) {
        this.animRun = this.player.anims.get(this.anim).isRunning();

        this.yukaPlayer.updateOrientation = false;
        this.yukaPlayer.lookAt(this.yukaTargetPos);

        if (!this.kick) {
            this.kick = true;
            setTimeout(() => {
                this.kick = true;
                this.player.body.setVelocity(0, 0, 0);
                this.player.anims.play(this.anim, 500, false);
            }, 3500);
        }

        if (!this.prevAnimRun && this.animRun) {
            // console.log("Animation started!");
        } else if (this.prevAnimRun && !this.animRun) {
            // console.log("Animation finished!");

            this.ball.ball.body.setVelocity(0, 0, 0);
            this.ball.ball.body.setAngularVelocity(0, 0, 0);

            this.yukaDirection.copy(this.yukaTargetPos)
                .sub(this.yukaPlayer.position)
                .normalize();

            this.playerClass.team.lastTouched = true;
            this.playerClass.team.opponent.lastTouched = false;

            this.ball.possessorTeamClass = this.playerClass.team;
            this.ball.possessorTeam = this.ball.possessorTeamClass.teamName;
            this.ball.possessorClass = this.cornerTarget;
            this.ball.possessor = this.ball.possessorClass.playerName;

            const cornerX = this.yukaDirection.x * this.Xrand;
            const cornerY = this.Yrand;
            const cornerZ = this.yukaDirection.z * this.Zrand;

            this.ball.ball.body.applyImpulse(
                { x: cornerX, y: cornerY, z: cornerZ },
                { x: 0, y: 0, z: 0 }
            );

            this.playerClass.stateMachine.changeTo('chaseBall');
            this.scene.ResumeThrowIn();
        }

        this.prevAnimRun = this.animRun;
    }

    exit(entity) {
        // console.log(entity._renderComponent.name, 'of', this.playerClass.team.teamName, ' has stopped taking the corner kick');

        this.ball.handBallActive = true;
        this.yukaPlayer.updateOrientation = true;

        setTimeout(() => {
            this.scene.eventsAvailable = true;
        }, 500);
    }
}




/*class ShootState extends YUKA.State{
    constructor(yukaPlayer,playerClass,scene){
        super();
        this.yukaPlayer=yukaPlayer;
        this.playerClass=playerClass;
        this.player=playerClass.player;
        this.scene=scene;
        this.ball=this.scene.ball;
        this.ball.ball.body.setDamping(0.25,0.25);    
    }
    enter(entity){
         //     console.log(entity._renderComponent.name,' is now shooting ball.');

              const goalTarget=this.playerClass.team.goalineTargetName;
              this.scene.scene.traverse((obj)=>{
                if(obj.name==goalTarget){
                    this.goal=obj;
                }
            });
            const AvoidPlayer=this.yukaPlayer.steering.behaviors[2]; 
        
        const ball= this.playerClass.ball;
        const ballPos= ball.position;
        const yukaBall= this.scene.ball.yukaBall;
        const yukaBallPos=yukaBall.position;

        const distToGoal= this.playerClass.ball.position.distanceTo(this.goal.position);
        const zShot=(Math.random() * 24 - 12);
        const errorMultiplier= Math.random()*1+1;
        const shotError= (0.1 * distToGoal + Math.random() * 0.5) * errorMultiplier;
        const randomShootError= (Math.random()*2-1) * shotError
        this.shotTarget= new YUKA.Vector3(
           this.goal.position.x,
           3 ,
          zShot  + randomShootError
        );
        // console.log('original z',zShot);
       //  console.log('Shot Error',shotError);
       //  console.log('error Multiplier',errorMultiplier)
       //  console.log('Random Error',randomShootError);
       //  console.log('shot Target',this.shotTarget);

        let powerBarFill=0;
        powerBarFill=THREE.MathUtils.randFloat(0, 0.99) + THREE.MathUtils.randInt(9,99);
        //console.log('power bar fill',powerBarFill);

        const randMin=THREE.MathUtils.randInt(0,7);
        const randMax=THREE.MathUtils.randInt(17,24);
        this.randShotMod=19+(powerBarFill/100)*(59-19);

        if(powerBarFill<60){
            this.randYMod=THREE.MathUtils.randFloat(0, 0.99) + THREE.MathUtils.randInt(randMin,24*0.65);
        }
        else if (powerBarFill >= 60 ) {
              this.randYMod=THREE.MathUtils.randFloat(0, 0.99) + THREE.MathUtils.randInt(randMin,randMax);
              this.ball.shotY=this.randYMod;
        }      


         this.kick=false;

      //   this.scene.corner1.position.copy(this.shotTarget);
      // this.scene.corner1.position.y=1.5;
    

    }

    execute(entity){
        const balls= this.playerClass.ball;
        const yukaBall= this.scene.ball.yukaBall;
        const playerPos=this.player.position;
        const ballPos= balls.position;
        const yukaBallPos=yukaBall.position;

        const ArriveBall=this.yukaPlayer.steering.behaviors[3];
        const AvoidBall=this.yukaPlayer.steering.behaviors[4];
              
            ArriveBall.weight=1;
         
        const pYukaPos= new YUKA.Vector3(
           this.player.position.x,
           yukaBallPos.y,
           this.player.position.z 
        );


        const balltoPlayer=yukaBallPos.clone().sub(pYukaPos);
        const nBalltoPlayer=balltoPlayer.normalize();
        const balltoRandTarget= yukaBallPos.clone().sub(this.shotTarget);
        const nBalltoRandTarget= balltoRandTarget.normalize();
        const positionBehindBall = yukaBallPos.clone().add(nBalltoRandTarget.multiplyScalar(1.65));
        
        const dotP=nBalltoPlayer.dot(balltoRandTarget);
        const paDist= this.yukaPlayer.position.distanceTo(ArriveBall.target)

        
        ArriveBall.target={x:positionBehindBall.x,y:3,z:yukaBallPos.z};
        if(paDist<3 && dotP<0 && this.player.userData.dotP>=0.40){  
            AvoidBall.weight=0;
        }
  
         else if (paDist=>3.5){
         AvoidBall.weight=1;
          }
          
            
        if(this.playerClass.distBall<3.5 && this.playerClass.ball.position.y<=4 &&this.player.userData.dotP>=0.55 && dotP<0 && !this.kick){
                       
            this.playerClass.ball.body.setVelocity(0,0,0);
            this.playerClass.ball.body.setAngularVelocity(0,0,0);

            this.yukaPlayer.updateOrientation=false;
            this.yukaPlayer.lookAt(this.shotTarget);
            this. yukaDirection=this.shotTarget.clone().sub(this.yukaPlayer.position).normalize();
            this.ball.shotX=this.yukaDirection.x*this.randShotMod;
            this.ball.shotY=this.randYMod;
            this.ball.shotZ=this.yukaDirection.z*this.randShotMod;

           // console.log('shotX',this.ball.shotX);
           // console.log('shotY',this.ball.shotY);
           // console.log('shotZ',this.ball.shotZ);
  

            this.playerClass.team.lastTouched=true;
            this.playerClass.team.opponent.lastTouched=false;
            this.ball.possessorClass=null;
            this.ball.possessor=null;

            this.playerClass.ball.body.applyImpulse({x:this.ball.shotX,y:this.ball.shotY,z:this.ball.shotZ},{x:0,y:0,z:0});
            this.ball.shotStartX=ballPos.x;
            this.ball.shotStartY=ballPos.y;
            this.ball.shotStartZ=ballPos.z;

           

            this.kick=true;
            //console.log('the ball has been shot');

            this.playerClass.stateMachine.changeTo('chaseBall');
        }
    }

    exit(entity){
        const ball= this.playerClass.ball;
        //    console.log(entity._renderComponent.name,' has stopped shooting ball.');
            this.yukaPlayer.updateOrientation=true;
            if(this.player.anims.current!='strike_forward'){
                this.player.anims.play('strike_forward',500,false);              
           }
          

           ball.userData.isKicked=true;
           setTimeout(()=>{
           ball.userData.isKicked=false;
           },1500);
    }
}*/
class ShootState extends YUKA.State {
    constructor(yukaPlayer, playerClass, scene) {
        super();
        this.yukaPlayer = yukaPlayer;
        this.playerClass = playerClass;
        this.player = playerClass.player;
        this.scene = scene;
        this.ball = this.scene.ball;
        this.ball.ball.body.setDamping(0.25, 0.25);

        // Reusable vectors
        this.pYukaPos = new YUKA.Vector3();
        this.balltoPlayer = new YUKA.Vector3();
        this.nBalltoPlayer = new YUKA.Vector3();
        this.balltoRandTarget = new YUKA.Vector3();
        this.nBalltoRandTarget = new YUKA.Vector3();
        this.positionBehindBall = new YUKA.Vector3();
        this.shotTarget = new YUKA.Vector3();
        this.yukaDirection = new YUKA.Vector3();
    }

    enter(entity) {
        const goalTarget = this.playerClass.team.goalineTargetName;
        this.scene.scene.traverse(obj => {
            if (obj.name === goalTarget) {
                this.goal = obj;
            }
        });

        const yukaBall = this.scene.ball.yukaBall;
        const distToGoal = this.playerClass.ball.position.distanceTo(this.goal.position);

        const zShot = (Math.random() * 24 - 12);
        const errorMultiplier = Math.random() * 1 + 1;
        const shotError = (0.1 * distToGoal + Math.random() * 0.5) * errorMultiplier;
        const randomShootError = (Math.random() * 2 - 1) * shotError;

        this.shotTarget.set(
            this.goal.position.x,
            3,
            zShot + randomShootError
        );

        let powerBarFill = THREE.MathUtils.randFloat(0, 0.99) + THREE.MathUtils.randInt(9, 99);
        const randMin = THREE.MathUtils.randInt(0, 7);
        const randMax = THREE.MathUtils.randInt(17, 24);
        this.randShotMod = 19 + (powerBarFill / 100) * (59 - 19);

        if (powerBarFill < 60) {
            this.randYMod = THREE.MathUtils.randFloat(0, 0.99) + THREE.MathUtils.randInt(randMin, 24 * 0.65);
        } else {
            this.randYMod = THREE.MathUtils.randFloat(0, 0.99) + THREE.MathUtils.randInt(randMin, randMax);
            this.ball.shotY = this.randYMod;
        }

        this.kick = false;
    }

    execute(entity) {
        const balls = this.playerClass.ball;
        const yukaBall = this.scene.ball.yukaBall;
        const ballPos = balls.position;
        const yukaBallPos = yukaBall.position;

        const ArriveBall = this.yukaPlayer.steering.behaviors[3];
        const AvoidBall = this.yukaPlayer.steering.behaviors[4];

        ArriveBall.weight = 1;

        this.pYukaPos.set(this.player.position.x, yukaBallPos.y, this.player.position.z);
        this.balltoPlayer.copy(yukaBallPos).sub(this.pYukaPos);
        this.nBalltoPlayer.copy(this.balltoPlayer).normalize();
        this.balltoRandTarget.copy(yukaBallPos).sub(this.shotTarget);
        this.nBalltoRandTarget.copy(this.balltoRandTarget).normalize();
        this.positionBehindBall.copy(yukaBallPos).add(this.nBalltoRandTarget.clone().multiplyScalar(1.65));

        const dotP = this.nBalltoPlayer.dot(this.balltoRandTarget);
        const paDist = this.yukaPlayer.position.distanceTo(ArriveBall.target);

        ArriveBall.target = { x: this.positionBehindBall.x, y: 3, z: yukaBallPos.z };

        if (paDist < 3 && dotP < 0 && this.player.userData.dotP >= 0.40) {
            AvoidBall.weight = 0;
        } else if (paDist >= 3.5) {
            AvoidBall.weight = 1;
        }

        if (
            this.playerClass.distBall < 3.5 &&
            this.playerClass.ball.position.y <= 4 &&
            this.player.userData.dotP >= 0.55 &&
            dotP < 0 &&
            !this.kick
        ) {
            this.playerClass.ball.body.setVelocity(0, 0, 0);
            this.playerClass.ball.body.setAngularVelocity(0, 0, 0);

            this.yukaPlayer.updateOrientation = false;
            this.yukaPlayer.lookAt(this.shotTarget);

            this.yukaDirection.copy(this.shotTarget).sub(this.yukaPlayer.position).normalize();
            this.ball.shotX = this.yukaDirection.x * this.randShotMod;
            this.ball.shotY = this.randYMod;
            this.ball.shotZ = this.yukaDirection.z * this.randShotMod;

            this.playerClass.team.lastTouched = true;
            this.playerClass.team.opponent.lastTouched = false;
            this.ball.possessorClass = null;
            this.ball.possessor = null;

            this.playerClass.ball.body.applyImpulse(
                { x: this.ball.shotX, y: this.ball.shotY, z: this.ball.shotZ },
                { x: 0, y: 0, z: 0 }
            );

            this.ball.shotStartX = ballPos.x;
            this.ball.shotStartY = ballPos.y;
            this.ball.shotStartZ = ballPos.z;

            this.kick = true;

            this.playerClass.stateMachine.changeTo('chaseBall');
        }
    }

    exit(entity) {
        const ball = this.playerClass.ball;
        this.yukaPlayer.updateOrientation = true;

        if (this.player.anims.current !== 'strike_forward') {
            this.player.anims.play('strike_forward', 500, false);
        }

        ball.userData.isKicked = true;
        setTimeout(() => {
            ball.userData.isKicked = false;
        }, 1500);
    }
}




/*class TackleState extends YUKA.State{
    enter(entity){
        console.log(`${entity.name} is now tackling.`);
    }

    execute(entity){
        console.log(`${entity.name} is tackling...`);
    }

    exit(entity){
        console.log(`${entity.name} stops tackling.`);
    }
}*/