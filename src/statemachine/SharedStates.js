import * as YUKA from 'yuka';

// Shared states between keeper and players for the state machine

export class IdleState extends YUKA.State {
    constructor(yukaPlayer,playerClass,scene){
        super();
        this.yukaPlayer=yukaPlayer;
        this.playerClass=playerClass;
        this.player=playerClass.player;
        this.scene=scene;
    }
    enter(entity) {
    //  console.log(`${entity._renderComponent.name} of ${this.playerClass.team.teamName} is now idle.`);
       this.delta= this.scene.yukaTime.update().getDelta();


    }

    execute(entity) {
        const yukaBall=this.scene.ball.yukaBall;
        const yukaBallPos=new YUKA.Vector3(
                   yukaBall.position.x,
                   3,
                   yukaBall.position.z 
                );
        this.yukaPlayer.rotateTo(yukaBallPos,this.delta);
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
    //    console.log(`${entity._renderComponent.name} of ${this.playerClass.team.teamName} is now resetting.`);

    }

    execute(entity) {
        let ResetPos;
      if(this.playerClass.posName=='goalkeeper'){
        const AvoidPlayer=this.yukaPlayer.steering.behaviors[0]; 
        const TendPost=this.yukaPlayer.steering.behaviors[1];
        ResetPos= this.yukaPlayer.steering?.behaviors[2];

        TendPost.weight=0;
        TendPost.target=ResetPos.target;
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
       // this.playerClass.director.visible=false;
        this.yukaPlayer.maxSpeed=8;
        this.player.body.setVelocity(this.yukaPlayer.velocity.x,this.player.body.velocity.y,this.yukaPlayer.velocity.z);
        if(this.scene.eName!='ThrowIn'){
        if(this.playerClass.ResetDone!=true || this.playerClass.team.check!= true || this.playerClass.team.opponent.check != true){
            
            this.playerClass._hasArrived(ResetPos,this.scene);
          }
         else if(this.playerClass.ResetDone==true && this.playerClass.team.check== true && this.playerClass.team.opponent.check == true){
            ResetPos.weight=0;;
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
    TendPost.weight=1;
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
        const AvoidBall=this.yukaPlayer.steering.behaviors[4]; 

        SeekWBall.weight=0;
        PursueBall.active=true;
        AvoidBall.weight=0;
    }

    execute(entity) {
       
        const PursueBall=this.yukaPlayer.steering.behaviors[1]; 
        const yukaBall= this.scene.ball.yukaBall;
        const AvoidBall=this.yukaPlayer.steering.behaviors[4]; 

           PursueBall.weight=1;
   
    }

    exit(entity) {
    //    console.log(`${entity._renderComponent.name} of ${this.playerClass.team.teamName} stops Chasing the Ball.`);
        const SeekWBall= this.yukaPlayer.steering.behaviors[0];
        const PursueBall=this.yukaPlayer.steering.behaviors[1]; 

        SeekWBall.weight=0;
        PursueBall.weight=0;;
    }
}
export class ReceiveBallState extends YUKA.State {
    constructor(yukaPlayer,playerClass,scene){
        super();
        this.yukaPlayer=yukaPlayer;
        this.playerClass=playerClass;
        this.player=playerClass.player;
        this.scene=scene;
    }
    enter(entity) {
    //    console.log(`${entity._renderComponent.name} is now Receiving the ball.`);

       

        if(this.playerClass.posName!='goalkeeper'){
            const SeekWBall= this.yukaPlayer.steering.behaviors[0];
            const PursueBall=this.yukaPlayer.steering.behaviors[1]; 
            const ArriveBall=this.yukaPlayer.steering.behaviors[3];
            const AvoidBall=this.yukaPlayer.steering.behaviors[4];
            SeekWBall.weight=0;
            PursueBall.weight=1;
            ArriveBall.weight=0;
            AvoidBall.weight=0;
        }
        else{
            const ArriveBall=this.yukaPlayer.steering.behaviors[1];
            ArriveBall.weight=1;
        }
    }

    execute(entity) {
        const ArriveBall=this.yukaPlayer.steering.behaviors[3];
        if(this.playerClass.posName=='goalkeeper'){
            ArriveBall.target=this.scene.ball.yukaBall.position;
        }
    }

    exit(entity) {
  //   console.log(`${entity._renderComponent.name} stops Receiving the ball.`);
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
    }
    enter(entity) {
    //    console.log(`${entity._renderComponent.name} is now Passing the ball.`);  

         const passReceivers=this.playerClass.availableTeammatePass;
      //   console.log('Pass Receivers',passReceivers);
         const randPlayer= Math.floor(Math.random()*passReceivers.length);
          this.receiver=passReceivers[randPlayer];
      //   console.log('Receiver',this.receiver);

        this.passTarget= new YUKA.Vector3(
                   this.receiver.player.position.x,
                   3 ,
                   this.receiver.player.position.z
                );
       //          console.log('original z',zShot);
       //          console.log('Shot Error',shotError);
       //          console.log('Random Error',randomShootError);
                // console.log('pass Target',this.passTarget);
        
                 this.randYMod=Math.round(Math.random() * (3 - 0) + 0);
                 this.randPassMod=Math.round(Math.random() * (35 - 15) + 15);
        
              //   console.log('randYMod',this.randYMod);
               //  console.log('randShotMod X and Z',this.randShotMod);
        
                 this.kick=false;
                 this.receiver.stateMachine.changeTo('receiveBall');
    }             

   execute(entity){
          const ball= this.playerClass.ball;
          const yukaBall= this.scene.ball.yukaBall;
          const playerPos=this.player.position;
          const ballPos= ball.position;
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
          const balltoRandTarget= yukaBallPos.clone().sub(this.passTarget);
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
       
             
              
             // console.log('Player is in passing range');
              this.playerClass.ball.body.setVelocity(0,0,0);
              this.playerClass.ball.body.setAngularVelocity(0,0,0);
  
              this.yukaPlayer.updateOrientation=false;
              this.yukaPlayer.lookAt(this.passTarget);
              this. yukaDirection=this.passTarget.clone().sub(this.yukaPlayer.position).normalize();
              this.playerClass.ball.body.applyImpulse({x:this.yukaDirection.x*this.randPassMod,y:this.randYMod,z:this.yukaDirection.z*this.randPassMod},{x:0,y:0,z:0});
  
              

              this.kick=true;
              this.playerClass.stateMachine.changeTo('supportAttacker');

          }
      }

    exit(entity) {
      //  console.log(`${entity._renderComponent.name} stops Passing the ball.`);
        this.yukaPlayer.updateOrientation=true;
        if(this.player.anims.current!='soccer_pass'){
          this.player.anims.play('soccer_pass',500,false);              
     }

     this.playerClass.team.lastTouched=true;
              this.playerClass.team.opponent.lastTouched=false;
              this.ball.possessorTeamClass=this.playerClass.team;
              this.ball.possessorTeam=this.ball.possessorTeamClass.teamName;
              this.ball.possessorClass=this.receiver;
              this.ball.possessor=this.ball.possessorClass.playerName;

     const ball= this.playerClass.ball;
     ball.userData.isKicked=true;
     setTimeout(()=>{
     ball.userData.isKicked=false;
     },1500);
    }
}
