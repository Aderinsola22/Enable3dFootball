import * as YUKA from 'yuka';
import {THREE } from 'enable3d'
import { e } from 'mathjs';

// Shared states between keeper and players for the state machine

export class IdleState extends YUKA.State {
    constructor(yukaPlayer,playerClass,scene){
        super();
        this.yukaPlayer=yukaPlayer;
        this.playerClass=playerClass;
        this.player=playerClass.player;
        this.scene=scene;
        this.yukaBallPos=new YUKA.Vector3();
    }
    enter(entity) {
    //  console.log(`${entity._renderComponent.name} of ${this.playerClass.team.teamName} is now idle.`);
       this.delta= this.scene.yukaTime.update().getDelta();


    }

    execute(entity) {
        const yukaBall=this.scene.ball.yukaBall;
        this.yukaBallPos.set(yukaBall.position.x,3,yukaBall.position.z);
        this.yukaPlayer.rotateTo(this.yukaBallPos,this.delta);
        this.yukaPlayer.velocity.set(0,0,0);
    }

    exit(entity) {
    //   console.log(`${entity._renderComponent.name} of ${this.playerClass.team.teamName} stops idling.`);
    }
}

export class ResetState extends YUKA.State {
    constructor(yukaPlayer,playerClass,scene){
        super();
        this.yukaPlayer=yukaPlayer;
        this.playerClass=playerClass;
        this.player=playerClass.player;
        this.scene=scene;
    }
    enter(entity) {
     // console.log(`${entity._renderComponent.name} of ${this.playerClass.team.teamName} is now resetting.`);

       if(this.playerClass.posName=='goalkeeper'){
       const ResetPos= this.yukaPlayer.steering.behaviors[2];
  //  console.log('Reset Position:', ResetPos.target);
       }
       else{
       const ResetPos= this.yukaPlayer.steering.behaviors[5];
      // console.log('Reset Position:', ResetPos.target);
       } 
    }

    execute(entity) {
        let ResetPos;
      if(this.playerClass.posName=='goalkeeper'){
        const AvoidPlayer=this.yukaPlayer.steering.behaviors[0]; 
        const TendPost=this.yukaPlayer.steering.behaviors[1];
        ResetPos= this.yukaPlayer.steering.behaviors[2];

        TendPost.weight=0;
      //  TendPost.target=ResetPos.target;
        AvoidPlayer.weight=1;
      }
      else{
      const SeekWBall= this.yukaPlayer.steering.behaviors[0];
      const PursueBall=this.yukaPlayer.steering.behaviors[1]; 
      const AvoidPlayer=this.yukaPlayer.steering.behaviors[2]; 
      const ArriveBall=this.yukaPlayer.steering.behaviors[3];
      const AvoidBall=this.yukaPlayer.steering.behaviors[4]; 
      ResetPos= this.yukaPlayer.steering.behaviors[5];

      SeekWBall.weight=0;
      PursueBall.weight=0;;
      ArriveBall.weight=0;;
      AvoidBall.weight=0;
      AvoidPlayer.weight=1;
      }  
      if(ResetPos){
        ResetPos.active=true;
        //this.playerClass.director.visible=false;
        this.yukaPlayer.maxSpeed=8;
        this.player.body.setVelocity(this.yukaPlayer.velocity.x,this.player.body.velocity.y,this.yukaPlayer.velocity.z);
        if(this.scene.eName!='ThrowIn'){
        if(this.playerClass.ResetDone!=true || this.playerClass.team.check!= true || this.playerClass.team.opponent.check != true){
            
            this.playerClass._hasArrived(ResetPos,this.scene);
          }
         else if(this.playerClass.ResetDone==true && this.playerClass.team.check== true && this.playerClass.team.opponent.check == true){
          //  ResetPos.weight=0;;
          }
        }

        else if(this.scene.eName=='ThrowIn' && this.playerClass ==this.playerClass.team?.throwInTaker){
            if(this.playerClass.ResetDone!=true){
              this.playerClass._hasArrived(ResetPos,this.scene);
            }
          }  

    }
         
    }

    exit(entity) {
     //   console.log(`${entity._renderComponent.name} of ${this.playerClass.team.teamName} stops resetting.`); 
   if(this.playerClass.posName=='goalkeeper'){
    const TendPost=this.yukaPlayer.steering.behaviors[1];
    const ResetPos= this.yukaPlayer.steering.behaviors[2];

    TendPost.weight=1;
    ResetPos.active=false;
   }
    else{
    const ResetPos= this.yukaPlayer.steering.behaviors[5];
    ResetPos.active=false;
    }
    this.playerClass.ResetDone=false;
    }
}
export class ChaseBallState extends YUKA.State {
    constructor(yukaPlayer,playerClass,scene){
        super();
        this.yukaPlayer=yukaPlayer;
        this.playerClass=playerClass;
        this.player=playerClass.player;
        this.scene=scene;

    }
    enter(entity) {
      //  console.log(`${entity._renderComponent.name} of ${this.playerClass.team.teamName} is now Chasing the Ball.`);
      
        const SeekWBall= this.yukaPlayer.steering.behaviors[0];
        const PursueBall=this.yukaPlayer.steering.behaviors[1]; 
        const AvoidPlayer=this.yukaPlayer.steering.behaviors[2];
        const ArriveBall=this.yukaPlayer.steering.behaviors[3];
        const AvoidBall=this.yukaPlayer.steering.behaviors[4]; 

        SeekWBall.weight=0;
        PursueBall.weight=1;
        ArriveBall.weight=0;
        AvoidBall.weight=0;
        AvoidPlayer.weight=1;
    }

    execute(entity) {
        const PursueBall=this.yukaPlayer.steering.behaviors[1];
        const yukaBall= this.scene.ball.yukaBallPursuit;
        PursueBall.evader=yukaBall;
        PursueBall.weight=1;
        // console.log('Pursue target',PursueBall);  
   
    }

    exit(entity) {
    //    console.log(`${entity._renderComponent.name} of ${this.playerClass.team.teamName} stops Chasing the Ball.`);
        const SeekWBall= this.yukaPlayer.steering.behaviors[0];
        const PursueBall=this.yukaPlayer.steering.behaviors[1]; 

        SeekWBall.weight=0;
        PursueBall.weight=0;
    }
}
export class ReceiveBallState extends YUKA.State {
    constructor(yukaPlayer,playerClass,scene){
        super();
        this.yukaPlayer=yukaPlayer;
        this.playerClass=playerClass;
        this.player=playerClass.player;
        this.scene=scene;
        this.lookAtPos=new YUKA.Vector3();
    }
    enter(entity) {
     //  console.log(`${entity._renderComponent.name} is now Receiving the ball.`);
       
        if(this.playerClass.posName!='goalkeeper'){
            const ArriveBall=this.yukaPlayer.steering.behaviors[3];
            this.target=ArriveBall.target;
            
             const Separation = this.yukaPlayer.steering.behaviors[6];
        const Alignment = this.yukaPlayer.steering.behaviors[7];
        const Cohesion = this.yukaPlayer.steering.behaviors[8];

          Separation.weight = 0.7;
        Alignment.weight = 0.2;
        Cohesion.weight = 0.1;

           // console.log('Receiver State target',this.target);
            this._updateSteering();
        }
        else{
            const ArriveBall=this.yukaPlayer.steering.behaviors[1];
            ArriveBall.weight=1;
        }
        this.kick=false;
        this.startPosition = this.scene.ball.yukaBall.position.clone();
        this.timeDiff = 0;        
    }

    execute(entity) {
        if(this.startRectTime){
            const currRecTime = performance.now();
            this.timeDiff = currRecTime - this.startRectTime;
        }
        const yukaBall= this.scene.ball.yukaBall;
        const yukaBallPos=yukaBall.position;
        const ball= this.scene.ball.ball;
        const ballVelocity=ball.body.ammo.getLinearVelocity();
        const ballSpeed=ball.body.ammo.getLinearVelocity().length().toFixed(2);

        this.yukaPlayer.updateOrientation=false;

        this.lookAtPos.set(yukaBallPos.x,3,yukaBallPos.z);

        this.yukaPlayer.lookAt(this.lookAtPos);
        
        const ballDistance = this.startPosition.distanceTo(yukaBallPos);
        const ballDirToPlayer = yukaBallPos.clone().sub(this.yukaPlayer.position);

        const nBallDirToPlayer = ballDirToPlayer.normalize();
        const ballApproaching = this.playerClass.distBall<ballDistance && ballVelocity.dot(nBallDirToPlayer) > 0; 



        if(!this.kick){
            if(ball.userData.isKicked){
                this.kick=true;
                this.startRectTime = performance.now();
            }
            else{
        this.yukaPlayer.velocity.set(0, 0, 0);
            }
        }
       

        if (ballApproaching && ballSpeed > 1.5) {
            this.yukaPlayer.maxSpeed = 0.5
        }
        else if (this.playerClass.distBall > 29) {
            this.yukaPlayer.maxSpeed = THREE.MathUtils.randFloat(4, 5.2); // Random speed for very far distances
        } else if (this.playerClass.distBall > 20) {
            this.yukaPlayer.maxSpeed = 2.5; // Higher speed for farther distances
        } else if (this.playerClass.distBall > 10) {
            this.yukaPlayer.maxSpeed = 2.0; // Medium speed for moderate distances
        } else {
            this.yukaPlayer.maxSpeed = 1.5; // Lower speed for closer distances
        }
       
        if(this.playerClass.posName=='goalkeeper'){
            const ArriveBall=this.yukaPlayer.steering.behaviors[1];
            ArriveBall.target=this.scene.ball.yukaBall.position;
            if(this.playerClass.distBall<3.5 && this.playerClass.ball.position.y<=4){
                const ball= this.playerClass.ball;
                this.playerClass.stateMachine.changeTo('tendGoal');
                // if ball is in the goal area, change to 'catch' or 'intercept' depending on who and how it was touhed last state
                // if ball is not in the goal area, change to 'chaseBall', 'intercept' , clear or dribble or pass
                // this.playerClass.stateMachine.changeTo('chaseBall');
            }
        }
        if(this.playerClass.posName!='goalkeeper'){
            this._updateSteering();
          //  console.log('Current Receive Time',currRecTime);
          //  console.log('Start Receive Time',this.startRectTime);
            if(this.scene.ball.possessorTeamClass!=this.playerClass.team){
                this.playerClass.stateMachine.changeTo('chaseBall');
            }

        }
    }

    exit(entity) {
    // console.log(`${entity._renderComponent.name} stops Receiving the ball.`);
     this.yukaPlayer.updateOrientation=true;

    const PursueBall=this.yukaPlayer.steering.behaviors[1]; 

    PursueBall.weight=0;
       
    }

    _updateSteering(){
        const ball= this.scene.ball.ball;
        const yukaBall= this.scene.ball.yukaBall;
        const yukaBallPos=yukaBall.position;
        const ballSpeed=ball.body.ammo.getLinearVelocity().length().toFixed(2);

        const FastBall= 12
        const SlowBall= 7;

        const SeekWBall= this.yukaPlayer.steering.behaviors[0];
        const PursueBall=this.yukaPlayer.steering.behaviors[1]; 
        const ArriveBall=this.yukaPlayer.steering.behaviors[3];
        const AvoidBall=this.yukaPlayer.steering.behaviors[4];
      
        SeekWBall.weight=0;
        AvoidBall.weight=0;

        if(ballSpeed>FastBall){
            PursueBall.weight=1;
            ArriveBall.weight=0;
        }
        else if(ballSpeed<SlowBall){
            PursueBall.weight=0;
            ArriveBall.weight=1;
            ArriveBall.target={x:yukaBallPos.x,y:3,z:yukaBallPos.z};
        }
      
        else{
            PursueBall.weight=0;
            ArriveBall.weight=1;
            ArriveBall.target={x:this.target.x,y:3,z:this.target.z}
        }

     
    }
}
export class PassBallState extends YUKA.State {
    constructor(yukaPlayer,playerClass,scene){
        super();
        this.yukaPlayer=yukaPlayer;
        this.playerClass=playerClass;
        this.player=playerClass.player;
        this.scene=scene;
        this.ball=this.scene.ball;
        this.pYukaPos=new YUKA.Vector3();
        this.passTarget=new YUKA.Vector3();
    }
    enter(entity) {
    //   console.log(`${entity._renderComponent.name} is now Passing the ball.`);  
    const passReceivers=this.playerClass.availableTeammatePass;
    //   console.log('Pass Receivers',passReceivers);
       const randPlayer= Math.floor(Math.random()*passReceivers.length);
        this.receiver=passReceivers[randPlayer];
    //   console.log('Receiver',this.receiver);
    
    this.passStartTime = performance.now(); 
    this.passDuration = THREE.MathUtils.randInt(150,1500); 
   // console.log('Pass Duration',this.passDuration);
    this.kick=false;

    this.updateReceiver();
       
    }             

   execute(entity){
          const currentTime = performance.now();
         // console.log('currentTime',currentTime)
        //  console.log('passStartTime',this.passStartTime);
          const ball= this.playerClass.ball;
          const yukaBall= this.scene.ball.yukaBall;
          const playerPos=this.player.position;
          const ballPos= ball.position;
          const yukaBallPos=yukaBall.position;
  
          const ArriveBall=this.yukaPlayer.steering.behaviors[3];
          const AvoidBall=this.yukaPlayer.steering.behaviors[4];
                
          ArriveBall.weight=1;
           
          this.pYukaPos.set(this.player.position.x,yukaBallPos.y,this.player.position.z)
  
          const balltoPlayer=yukaBallPos.clone().sub(this.pYukaPos);
          const nBalltoPlayer=balltoPlayer.normalize();
          const balltoRandTarget= yukaBallPos.clone().sub(this.passTarget);
          const nBalltoRandTarget= balltoRandTarget.normalize();
          const positionBehindBall = yukaBallPos.clone().add(nBalltoRandTarget.multiplyScalar(1.65));
          
          const dotP=nBalltoPlayer.dot(balltoRandTarget);
          const paDist= this.yukaPlayer.position.distanceTo(ArriveBall.target)
  
          
          ArriveBall.target={x:positionBehindBall.x,y:3,z:yukaBallPos.z};
          if(paDist<3 && dotP<0 && this.player.userData.dotP>=0.40){  
              AvoidBall.weight=0;
          }
          else if (paDist>=3.5){
           AvoidBall.weight=1;
            }
            
            if(!this.kick){
                        this.updateReceiver();

            if(this.playerClass.distBall<3.5 && this.playerClass.ball.position.y<=4 &&this.player.userData.dotP>=0.60 && dotP<0 && currentTime - this.passStartTime >= this.passDuration){
              this.playerClass.ball.body.setVelocity(0,0,0);
              this.ball.ball.body.setDamping(0.25,0.25);    
              this.passModifier(this.playerClass,this.receiver);
              this.playerClass.ball.body.setVelocity(0,0,0);
              this.playerClass.ball.body.setAngularVelocity(0,0,0);
              this.yukaPlayer.updateOrientation=false;
              this.yukaPlayer.lookAt(this.passTarget);
              this. yukaDirection=this.passTarget.clone().sub(this.yukaPlayer.position).normalize();
              this.playerClass.ball.body.applyImpulse({x:this.yukaDirection.x*this.randPassMod,y:this.randYMod,z:this.yukaDirection.z*this.randPassMod},{x:0,y:0,z:0});   
              const ball= this.playerClass.ball;
              ball.userData.isKicked=true;
             setTimeout(()=>{
             ball.userData.isKicked=false;
             },1500);
              this.kick=true;   
           //  console.log('Ball is kicked, player is passing the ball');
              this.playerClass.team.lastTouched=true;
              this.playerClass.team.opponent.lastTouched=false;
              this.ball.possessorTeamClass=this.playerClass.team;
              this.ball.possessorTeam=this.ball.possessorTeamClass.teamName;
              this.ball.possessorClass=null;
              this.ball.possessor=null;
               if (this.playerClass.posName !== 'goalkeeper') {
                this.playerClass.stateMachine.changeTo('supportAttacker');
                 }
            else {
                this.playerClass.stateMachine.changeTo('tendGoal');
            }
            }
            }
   
      }

    exit(entity) {
  //     console.log(`${entity._renderComponent.name} stops Passing the ball.`);
        this.yukaPlayer.updateOrientation=true;
        if(this.player.anims.current!='soccer_pass'){
          this.player.anims.play('soccer_pass',500,false);              
     }    
    }

    passModifier(passer,receiver){
      const dist = passer.player.position.distanceTo(receiver.player.position);
    // console.log('Distance between passer and receiver',dist);

      const minPassDistance = 10;
      const maxPassDistance =80;
      const normalizedDistance = THREE.MathUtils.clamp((dist-minPassDistance) / (maxPassDistance-minPassDistance), 0.1, 1);  
    //  console.log('Normalized Distance',normalizedDistance);
      let powerBarFill=normalizedDistance* 100;
   // console.log('power bar fill',powerBarFill);

    this.randYMod=THREE.MathUtils.randFloat(0, 0.99) + THREE.MathUtils.randInt(0,4);
    this.randPassMod=9+(powerBarFill/100)*(40-9);
   //  console.log('randYMod',this.randYMod);
   //  console.log('randPassMod',this.randPassMod);
    }

    updateReceiver(){
       
          this.passTarget.set(this.receiver.player.position.x,3,this.receiver.player.position.z);
                //   console.log('pass Target',this.passTarget);          
          
                //   this.kick=false;
                /*  const bias = THREE.MathUtils.randFloat(0.05, 0.3).toFixed(2);
                  this.target= this.scene.CalculateWeightedMidPoint(this.ball.ball.position,this.passTarget,bias);
                  this.target.y=3;
                 // console.log('Passer State target',target);
                 if (this.receiver.posName !== 'goalkeeper') {
                    this.receiver.yukaPlayer.steering.behaviors[3].target=this.target;
                }
                else {
                    this.receiver.yukaPlayer.steering.behaviors[1].target=this.target;  
                }*/
    }
}
