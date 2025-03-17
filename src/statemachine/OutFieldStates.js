import {Scene3D,ExtendedObject3D ,THREE } from 'enable3d'
import { MatchScene } from '../core/MatchScene';
import { Keyboard } from '@yandeu/keyboard';
import * as YUKA from 'yuka';
import * as SharedStates from './SharedStates.js';
import {Player} from '../objects/Player.js';

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
        if(this.scene.ball.possessorClass==this.playerClass && this.scene.ball.possessorTeamClass==this.playerClass.team && this.playerClass.distBall<=8){
           this.yukaPlayer.maxSpeed=4;
       //    console.log(this.player.name,'is the main possessor');

        }
        else{
            this.yukaPlayer.maxSpeed=5.2;
  
        }

    }
}
// player specific states
 class DribbleState extends YUKA.State{
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

        if(ballDribbleDist<2 || xBallDribbleDist <2){
            this.updateDribbleTarget();
        }

        const pYukaPos= new YUKA.Vector3(
           this.player.position.x,
           yukaBallPos.y,
           this.player.position.z 
        );

        const balltoPlayer=yukaBallPos.clone().sub(pYukaPos);
        const nBalltoPlayer=balltoPlayer.normalize();
        const playertoDribbleTarget= yukaBallPos.clone().sub(this.dribbleTarget);
        const nBalltoDribbleTarget= playertoDribbleTarget.normalize();
        const positionBehindBall = yukaBallPos.clone().add(nBalltoDribbleTarget.multiplyScalar(1.67));
        

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




        const dotP=nBalltoPlayer.dot(nBalltoDribbleTarget);

     //   console.log('dot P',dotP);
     //   console.log('dot PG',this.player.userData.dotP);


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
            
            const paDist= this.yukaPlayer.position.distanceTo(ArriveBall.target)


        if(paDist<3.5 && dotP<0 && this.player.userData.dotP>=0.40){  
          //  this.yukaPlayer.rotateTo(yukaBallPos,this.delta); 
          AvoidBall.weight=0;
      }

       else if (paDist=>3.5){
       AvoidBall.weight=1;
        }
        
        }


      //  this.scene.corner1.position.copy(ArriveBall.target);
      // this.scene.corner1.position.y=1.5;

      //  this.scene.corner3.position.copy(this.dribbleTarget);
     //   this.scene.corner3.position.y=1.5;


    }

    exit(entity){
   //    console.log(entity._renderComponent.name,'of',this.playerClass.team.teamName,' has stopped dribbling the ball.');
       const ArriveBall=this.yukaPlayer.steering.behaviors[3];
       const AvoidBall=this.yukaPlayer.steering.behaviors[4];

       ArriveBall.weight=0;
       AvoidBall.weight=0;
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

        const xRand= Math.floor(Math.random() *(10 - 5 + 1 ) + 5);
        const zRand= Math.floor(Math.random() *(10 - (-10) + 1) -10 );

        const xDir= dirGoal.x <0 ? -1 : 1

        const xTarget=  yukaBallPos.x + (xDir * xRand);
        const zTarget=  yukaBallPos.z + (zRand);

        this.dribbleTarget.set(xTarget,3,zTarget);
        this.playerClass.dribbleTarget=this.dribbleTarget;

    }
}

class SupportAttackerState extends YUKA.State{
    constructor(yukaPlayer,playerClass,scene){
        super();
        this.yukaPlayer=yukaPlayer;
        this.playerClass=playerClass;
        this.player=playerClass.player;
        this.scene=scene;
    }
    enter(entity){
    //    console.log(entity._renderComponent.name,'of',this.playerClass.team.teamName,' is now Supporting the Attacker');
        const SeekWBall= this.yukaPlayer.steering.behaviors[0];
        const PursueBall=this.yukaPlayer.steering.behaviors[1];   
        const AvoidPlayer=this.yukaPlayer.steering.behaviors[2]; 
        const AvoidBall=this.yukaPlayer.steering.behaviors[4];
        const ArriveBall=this.yukaPlayer.steering.behaviors[3];
        
        ArriveBall.weight=1;
        AvoidBall.weight=1;
        AvoidPlayer.weight=1;
        SeekWBall.weight=0;
        PursueBall.weight=0;
      
        this.supporterPos=new YUKA.Vector3();
        this.previousSupporterPos= new YUKA.Vector3();
        this.fieldMax=new YUKA.Vector3(102,3,56);
        this.fieldMin=new YUKA.Vector3(-102,3,-56); 

        this.updateSupportTarget(this.supporterPos);              
    }

    execute(entity){
        const ball=this.scene.ball.ball;
        const yukaBall=this.scene.ball.yukaBall;
        const yukaBallPos=yukaBall.position;

      //  const ballDistance=this.yukaPlayer.position.distanceTo(yukaBallPos);

        let yukaBallCarrier;
        let ballCarrierDist;
        const ballCarrier=this.scene.ball.possessorClass;
       // console.log('ball carrier', typeof ballCarrier);
       
        if(ballCarrier != null || ballCarrier != undefined){
        yukaBallCarrier=ballCarrier.yukaPlayer;
     //   ballCarrierDist=this.yukaPlayer.position.distanceTo(yukaBallCarrier.position);
        this.supporterPos=yukaBallCarrier.position;
        
        }
        else{
          this.supporterPos=yukaBallPos;
          ballCarrierDist=0;
        }
        const xBallSupportDist= Math.abs(yukaBallPos.x-this.supporterPos.x);
        const zBallSupportDist= Math.abs(yukaBallPos.z-this.supporterPos.z);

        if (!this.previousSupporterPos.equals(this.supporterPos) &&( xBallSupportDist<3 || zBallSupportDist<3)) {
            this.updateSupportTarget(this.supporterPos);
        }

        const ArriveBall=this.yukaPlayer.steering.behaviors[3]; 
        ArriveBall.target=this.offsetPos.clone(); 
        this.previousSupporterPos=this.supporterPos.clone();

    }

    exit(entity){
            //  console.log(entity._renderComponent.name,'of',this.playerClass.team.teamName,' has stopped Supporting the Attacker.');
               const AvoidBall=this.yukaPlayer.steering.behaviors[4];
               AvoidBall.weight=0;
    }

    updateSupportTarget(supporterPos){
     if(!supporterPos) return;

     let forwardOffsetRange, lateralOffsetRange;
     switch (this.playerClass.posName) {
         case 'defender':
             forwardOffsetRange = [30, 50];
             lateralOffsetRange = [0, 50];
             break;
         case 'midfielder':
             forwardOffsetRange = [20, 30];
             lateralOffsetRange = [0, 40];
             break;
         case 'forward':
             forwardOffsetRange = [15, 20];
             lateralOffsetRange = [0, 30];
             break;
         default:
             forwardOffsetRange = [15, 30];
             lateralOffsetRange = [0, 30];
     }

     this.forwardDirection= Math.random() < 0.5 ? 1 : -1; 
     this.lateralDirection = Math.random() < 0.5 ? 1 : -1;

     this.offsetX = THREE.MathUtils.randInt(...forwardOffsetRange) * this.forwardDirection; 
     this.offsetZ = THREE.MathUtils.randInt(...lateralOffsetRange) * this.lateralDirection;
     this.offset= new YUKA.Vector3(this.offsetX,0,this.offsetZ);
     const OffsetPosX= this.supporterPos.x+this.offsetX;
     const OffsetPosZ= this.supporterPos.z+this.offsetZ; 
     this.offsetPos=new YUKA.Vector3(OffsetPosX,3,OffsetPosZ).clamp(this.fieldMin,this.fieldMax);

   //  console.log(this.player.name,'of',this.playerClass.team.teamName,"Offset",this.offset);
    // console.log(this.player.name,'of',this.playerClass.team.teamName,"New Offset Pos",this.offsetPos);

    }
}
 class GoHomeState extends YUKA.State{
    constructor(yukaPlayer,playerClass,scene){
        super();
        this.yukaPlayer=yukaPlayer;
        this.playerClass=playerClass;
        this.player=playerClass.player;
        this.scene=scene;
    }
    enter(entity){
    //  console.log(entity._renderComponent.name,'of',this.playerClass.team.teamName,' is about to go home');
      this.delta= this.scene.yukaTime.update().getDelta();


      const SeekWBall= this.yukaPlayer.steering.behaviors[0];
      const PursueBall=this.yukaPlayer.steering.behaviors[1];  
      const AvoidPlayer=this.yukaPlayer.steering.behaviors[2]; 
      const ArriveBall=this.yukaPlayer.steering.behaviors[3];
      const AvoidBall=this.yukaPlayer.steering.behaviors[4]; 

      SeekWBall.active=false;
      PursueBall.active=false;
      AvoidBall.active=false;
      AvoidPlayer.active=true;
      ArriveBall.active=true;

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
 }

class ThrowInState extends YUKA.State{
    constructor(yukaPlayer,playerClass,scene){
        super();
        this.yukaPlayer=yukaPlayer;
        this.playerClass=playerClass;
        this.player=playerClass.player;
        this.scene=scene;
        this.ball=this.scene.ball;
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
            this.playerClass.stateMachine.changeTo('supportAttacker');
            this.scene.ResumeThrowIn();         
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
} 
class CornerKickState extends YUKA.State{
    constructor(yukaPlayer,playerClass,scene){
        super();
        this.yukaPlayer=yukaPlayer;
        this.playerClass=playerClass;
        this.player=playerClass.player;
        this.scene=scene;
        this.ball=this.scene.ball;
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

        this.Yrand=Math.round(Math.random() * (30 - 0) + 0);
        this.Zrand=Math.round(Math.random() * (55 - 10) + 10);
        this.Xrand=Math.round(Math.random() * (40 - 10) + 10);

        
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
            this.ball.possessorClass=this.cornerTarget;
            this.ball.possessor=this.ball.possessorClass.playerName; 

            this.ball.ball.body.applyImpulse({x:this.yukaDirection.x*this.Xrand,y:this.Yrand,z:this.yukaDirection.z*this.Zrand},{x:0,y:0,z:0});

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
    
} 

class ShootState extends YUKA.State{
    constructor(yukaPlayer,playerClass,scene){
        super();
        this.yukaPlayer=yukaPlayer;
        this.playerClass=playerClass;
        this.player=playerClass.player;
        this.scene=scene;
        this.ball=this.scene.ball;
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

         this.randYMod=Math.round(Math.random() * (25 - 0) + 0);
         this.randShotMod=Math.round(Math.random() * (60 - 30) + 30);

      //   console.log('randYMod',this.randYMod);
       //  console.log('randShotMod X and Z',this.randShotMod);

         this.kick=false;

       //  this.scene.corner1.position.copy(this.shotTarget);
        //this.scene.corner1.position.y=1.5;
    

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
          
            
        if(this.playerClass.distBall<3.5 && this.playerClass.ball.position.y<=4 &&this.player.userData.dotP>=0.60 && dotP<0 && !this.kick){
                       
            this.playerClass.ball.body.setVelocity(0,0,0);
            this.playerClass.ball.body.setAngularVelocity(0,0,0);

            this.yukaPlayer.updateOrientation=false;
            this.yukaPlayer.lookAt(this.shotTarget);
            this. yukaDirection=this.shotTarget.clone().sub(this.yukaPlayer.position).normalize();
            this.ball.shotX=this.yukaDirection.x*this.randShotMod;
            this.ball.shotY=this.randYMod;
            this.ball.shotZ=this.yukaDirection.z*this.randShotMod;

            this.playerClass.team.lastTouched=true;
            this.playerClass.team.opponent.lastTouched=false;
            this.ball.possessorClass=null;
            this.ball.possessor=null;

            this.playerClass.ball.body.applyImpulse({x:this.ball.shotX,y:this.ball.shotY*2,z:this.ball.shotZ},{x:0,y:0,z:0});
            this.ball.shotStartX=ballPos.x;
            this.ball.shotStartY=ballPos.y;
            this.ball.shotStartZ=ballPos.z;

           

            this.kick=true;
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