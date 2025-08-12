import {Scene3D,ExtendedObject3D ,THREE } from 'enable3d'
import { MatchScene } from '../core/MatchScene';
import { Keyboard } from '@yandeu/keyboard';
import * as YUKA from 'yuka';
import * as SharedStates from './SharedStates.js';
import {Keeper} from '../objects/Keeper.js';
import _, { set } from 'lodash-es';
import { e } from 'mathjs';




//keeper specific states

export class KeeperStates extends YUKA.StateMachine{
    constructor(yukaPlayer,playerClass,scene){
        super(yukaPlayer);
        this.yukaPlayer=yukaPlayer;
        this.playerClass=playerClass
        this.player=playerClass.player;
        this.scene=scene;

         // add global state
        this.globalState= new GlobalState(yukaPlayer,playerClass);
         // add shared states
        this.add('idle', new SharedStates.IdleState(yukaPlayer,playerClass,scene));  
        this.add('reset', new SharedStates.ResetState(yukaPlayer,playerClass,scene));  
        this.add('receiveBall', new SharedStates.ReceiveBallState(yukaPlayer,playerClass,scene));
        this.add('passBall', new SharedStates.PassBallState(yukaPlayer,playerClass,scene));
        // add keeper specific states
        this.add('tendGoal', new TendGoalState(yukaPlayer,playerClass,scene));
        this.add('interceptBall', new InterceptBallState(yukaPlayer,playerClass,scene));
        this.add('goalKick', new GoalKickState(yukaPlayer,playerClass,scene));
        this.add('saveBall', new SaveBallState(yukaPlayer,playerClass,scene));
        this.add('clearBall', new ClearBallState(yukaPlayer,playerClass,scene));
        this.add('catchBall',new CatchBallState(yukaPlayer,playerClass,scene));

    }
    update(delta){
        super.update(delta);
    }
}  
class GlobalState extends YUKA.State{
    constructor(yukaPlayer,playerClass){
        super();
        this.yukaPlayer=yukaPlayer;
        this.playerClass=playerClass;
        this.player=playerClass.player;
    }

    execute(entity){
        const currentState = this.playerClass.stateMachine.currentStateName;
        if(currentState!='receiveBall'){
            if(currentState=='interceptBall'){
                this.yukaPlayer.maxSpeed=6;
            }
            else{
                this.yukaPlayer.maxSpeed=4;
            }
        }
        
    }

}
// keeper specific states
class TendGoalState extends YUKA.State{
    constructor(yukaPlayer,playerClass,scene){
        super();
        this.yukaPlayer=yukaPlayer;
        this.playerClass=playerClass;
        this.player=playerClass.player;
        this.scene=scene;
    }
    enter(entity){
        //turn on tend goal behavior
      // console.log(entity._renderComponent.name,'of',this.playerClass.team.teamName,' is now tending goal.');
       const TendPost=this.yukaPlayer.steering.behaviors[1];
       TendPost.active=true;
        TendPost.weight=1; 
    }

    execute(entity){

        const TendPost=this.yukaPlayer.steering.behaviors[1];
        const ResetPos=this.yukaPlayer.steering.behaviors[2];
       if(!ResetPos.active){
        if(this.playerClass.team==this.scene.Team1){
            TendPost.target=this.scene.tendPositionTeam1GK;
            }
        else if(this.playerClass.team==this.scene.Team2){
            TendPost.target=this.scene.tendPositionTeam2GK;
            }
        }
       


    }

    exit(entity){
    //    console.log(entity._renderComponent.name,'of',this.playerClass.team.teamName,' stops tending goal.');
    }
}

class InterceptBallState extends YUKA.State{
    constructor(yukaPlayer,playerClass,scene){
        super();
        this.yukaPlayer=yukaPlayer;
        this.playerClass=playerClass;
        this.player=playerClass.player;
        this.scene=scene;
        this.ball=this.scene.ball;
    }
    enter(entity){
      //  console.log(entity._renderComponent.name,'of',this.playerClass.team.teamName,' is now intercepting ball.');
        const TendPost=this.yukaPlayer.steering.behaviors[1];
        TendPost.active=true;
        TendPost.weight=1; 
    }

    execute(entity){
        const TendPost=this.yukaPlayer.steering.behaviors[1];
        const ResetPos=this.yukaPlayer.steering.behaviors[2];

       if(!ResetPos.active){
        if(this.playerClass.team==this.scene.Team1){
            const biasPoint=this.scene.CalculateWeightedMidPoint(this.ball.ball.position,this.scene.GKStartPointTeam1,0.98,this.scene.Team1.gkTendTempA,this.scene.Team1.gkTendTempB);
            TendPost.target={x:biasPoint.x,y:3,z:biasPoint.z};
            }
        else if(this.playerClass.team==this.scene.Team2){
            const biasPoint=this.scene.CalculateWeightedMidPoint(this.ball.ball.position,this.scene.GKStartPointTeam2,0.98,this.scene.Team2.gkTendTempA,this.scene.Team2.gkTendTempB);
            TendPost.target={x:biasPoint.x,y:3,z:biasPoint.z};
            }
        }
       // console.log('Distball:',this.playerClass.distBall);
        //TODO: check if ball is in the penalty box and who touched it last and within 3.6 units to the ball
        if(this.ball.possessorClass!=this.playerClass && this.ball.possessorTeamClass==this.playerClass.team){
            this.playerClass.stateMachine.changeTo('tendGoal')
        }
       else if(this.playerClass.distBall<4){
            const insideBox= this.playerClass.team.PenaltyBox.userData.Box.containsPoint(this.ball.ball.position);
          //  console.log('insideBox:',insideBox);
          //  console.log('insideBox:',this.playerClass.team.PenaltyBox.userData.Box);
            const lastTouchedTeam= this.playerClass.team.lastTouched ? this.playerClass.team : this.playerClass.team.opponent;
            const chasingOpponent= this.playerClass.team.opponent.ballClosestPlayer;

          //  console.log('lastTouchedTeam:',lastTouchedTeam.teamName);
          //  console.log('chasingOpponent:',chasingOpponent.playerName, 'team:', chasingOpponent.team.teamName);
               
                if (lastTouchedTeam) {
                    const lastTouchedIsOpponent = lastTouchedTeam === this.playerClass.team.opponent;
                    const distToBall = chasingOpponent.distBall;
                    const opponentIsThreatening = chasingOpponent && distToBall < 8;
            
                   // console.log('lastTouchedPlayer.distBall:', distToBall);
                   // console.log('opponentIsThreatening:', opponentIsThreatening);
            
                    if (insideBox) {
                        if (lastTouchedIsOpponent) {
                            // Opponent touched it inside box
                          //  console.log('Intercepting opponent ball in penalty box');
                            this.playerClass.stateMachine.changeTo('saveBall');
                        } else {
                            // Own teammate touched it inside box
                            if (opponentIsThreatening) {
                            //    console.log('Opponent is nearby in our box, clear the ball!');
                                this.playerClass.stateMachine.changeTo('clearBall');
                            }
                            else {
                            //    console.log('Teammate touched it, low pressure in our box, pass the ball');
                                this.playerClass.stateMachine.changeTo('clearBall');//passBall
                            }
                        }
                    } 
                    else {
                        // Outside the box
                        if (lastTouchedIsOpponent) {
                            if (opponentIsThreatening) {
                            //    console.log('Opponent near the ball outside the box, clear it quickly!');
                                this.playerClass.stateMachine.changeTo('clearBall');
                            } else {
                            //    console.log('Opponent touched it but is not close, outside box, pass the ball');
                                this.playerClass.stateMachine.changeTo('clearBall');//passBall
                            }
                        } else {
                            if (opponentIsThreatening) {
                            //    console.log('Teammate touched it but opponent is nearby outside box, clear it');
                                this.playerClass.stateMachine.changeTo('clearBall');
                            } else {
                            //    console.log('Teammate touched it outside box, no threat — pass the ball');
                                this.playerClass.stateMachine.changeTo('clearBall');//passBall
                            }
                        }
                    }
                } 
      // find better conditions to check if ball is loose or Gk is possessor          
     /*
                else if(lastTouchedPlayer==this.playerClass && insideBox){
                    console.log("GK is possessor and close enough");
                    this.playerClass.stateMachine.changeTo('saveBall');
                }

                else {
                    // No possessor — loose ball
                    if (insideBox) {
                        console.log('Loose ball in penalty box');
                        this.playerClass.stateMachine.changeTo('saveBall');
                    } else {
                        console.log('Loose ball outside penalty box');
                        this.playerClass.stateMachine.changeTo('clearBall');
                    }
                }
                */
            }
        
    }

    exit(entity){
  //      console.log(entity._renderComponent.name,'of',this.playerClass.team.teamName,' stops intercepting ball.');
    }
}


class GoalKickState extends YUKA.State{
    constructor(yukaPlayer,playerClass,scene){
        super();
        this.yukaPlayer=yukaPlayer;
        this.playerClass=playerClass;
        this.player=playerClass.player;
        this.scene=scene;
        this.ball=this.scene.ball;
        this.ball.ball.body.setDamping(0.25,0.25);    

        this.handMidpoint=new THREE.Vector3();
    }
    enter(entity){
      //  console.log(entity._renderComponent.name,'of',this.playerClass.team.teamName,' is now taking goal kick.');
        const TendPost=this.yukaPlayer.steering.behaviors[1];
        TendPost.weight=1;
        TendPost.target={x:this.scene.field.respawnBallLocation.x,y:3,z:this.scene.field.respawnBallLocation.z};
        const goalKickReceivers=Object.values(this.playerClass.team.teamList).filter(pl => pl.posName != 'goalkeeper'&& pl != this.playerClass);
        this. goalKickTarget=goalKickReceivers[Math.floor(Math.random()*goalKickReceivers.length)];
        this.yukaTargetPos= new YUKA.Vector3(
                    this.goalKickTarget.yukaPlayer.position.x ,
                     3,
                    this.goalKickTarget.yukaPlayer.position.z
                 ) 
        
       this. yukaDirection=this.yukaTargetPos.clone().sub(this.yukaPlayer.position).normalize();

       this.kick=false;
       this.animRun=false;
       this.prevAnimRun=false;
       this.anim='strike_forward';

       this.Yrand=Math.round(Math.random() * (25 - 0) + 0);
       this.XZrand=Math.round(Math.random() * (65 - 15) + 15);
        
    }

    execute(entity){
        this.animRun=this.player.anims.get(this.anim).isRunning();

        const distance=this.yukaPlayer.position.distanceTo(this.ball.yukaBall.position); 

        if(distance<4){
            this.yukaPlayer.velocity.set(0,0,0);
            
            if(!this.kick){
                this.kick=true;
                setTimeout(() => {
                    this.kick = true;
                    this.player.body.setVelocity(0, 0, 0);
                    this.player.anims.play(this.anim, 500, false);
                }, 1000);
            }
        }

        if (this.prevAnimRun==true && this.animRun==false) {
           this.ball.ball.body.setVelocity(0,0,0);
           this.ball.ball.body.setAngularVelocity(0,0,0);

           this.ball.possessorTeamClass=this.playerClass.team;
           this.ball.possessorTeam=this.ball.possessorTeamClass.teamName;
           this.ball.possessorClass=this.goalKickTarget;
           this.ball.possessor=this.ball.possessorClass.playerName; 

           this.ball.ball.body.applyImpulse({x:this.yukaDirection.x*this.XZrand,y:this.Yrand,z:this.yukaDirection.z*this.XZrand},{x:0,y:0,z:0});
  
           this.scene.ResumeThrowIn();   
           this.kick=true;  

}
        this.prevAnimRun=this.animRun;
    }

    exit(entity){
    //    console.log(entity._renderComponent.name,'of',this.playerClass.team.teamName,' stops taking goal kick.');
        this.ball.handBallActive=true;
        this.yukaPlayer.updateOrientation=true;
        setTimeout(()=>{this.scene.eventsAvailable=true;},500);
    }
}
// State for Making Savings and/or Catching the ball or picking up the ball 
class SaveBallState extends YUKA.State {
    constructor(yukaPlayer, playerClass, scene) {
        super();
        this.yukaPlayer = yukaPlayer;
        this.playerClass = playerClass;
        this.player = playerClass.player;
        this.scene = scene;
        this.ball = this.scene.ball;
        this.upVector = new THREE.Vector3(0, 1, 0);
        this.crossVector=new THREE.Vector3();
        this.balltoPlayer=new THREE.Vector3();
        this.handMidpoint = new THREE.Vector3();

    }

    enter(entity) {
        console.log(entity._renderComponent.name, 'of', this.playerClass.team.teamName, ' is now saving the ball.');
        
        const goalTarget=this.playerClass.team.opponent.goalineTargetName;
        this.goal=this.scene.scene.getObjectByName(goalTarget);


        // 30% chance to not attempt to save the ball
       if(this.playerClass.stateMachine.previousState===this.playerClass.stateMachine.get('interceptBall')||Math.random() <0.7){
            console.log(entity._renderComponent.name,'of',this.playerClass.team.teamName, 'decides to attempt to save the ball.');
            
        }

        else{
            console.log(entity._renderComponent.name,'of',this.playerClass.team.teamName, 'decides not to attempt to save the ball.');
            this.playerClass.stateMachine.changeTo('tendGoal');
        }
        
           
        this.kick=false;
        this.catchKick=false;
        this.catchCheck=false;
        this.isKicked=true;
        this.saveAnim=null;
        this.animRun=false;
        this.prevAnimRun=false;
        this.end=false;
        this.reactXDist=0;
        this.reactZDist=THREE.MathUtils.randInt(7,15);
        this.xBallDist= Math.abs(this.ball.ball.position.x-this.player.position.x);

      /*  if(this.xBallDist<15){
            this.transistionMS=125;
        }
        else if(this.xBallDist<20){
            this.transistionMS=250;
        }
        else{
            this.transistionMS=500;
        }*/

            this.transistionMS=500;


        if(this.xBallDist>=15){
            this.reactXDist=THREE.MathUtils.randInt(11,15)
        }
        else{
            this.reactXDist=THREE.MathUtils.randInt(8,12);
        }

     //   console.log("ball distance", this.xBallDist);
     //   console.log("react distance", this.reactZDist);
    //    this.player.body.setVelocity(0, 0, 0);
    //    this.player.body.setAngularVelocity(0, 0, 0);

    }

    execute(entity) {
        this.xBallDist= Math.abs(this.ball.ball.position.x-this.player.position.x);
        this.zBallDist= this.ball.ball.position.z-this.player.position.z;
    
    
        //console.log("ball distance during", this.xBallDist);
        // this.scene.corner1.position.x=P2;
        //  this.scene.corner1.position.y=1.5;

        //  this.scene.corner3.position.x=P3;
        //  this.scene.corner3.position.y=1.5;

        //  this.scene.corner2.position.z=reactZpos;
         // this.scene.corner2.position.x=this.player.position.x;
        //  this.scene.corner2.position.y=1.5;

         // this.scene.corner4.position.z=iReactZpos;
       //   this.scene.corner4.position.x=this.player.position.x;
     //     this.scene.corner4.position.y=1.5; 


        if(this.xBallDist<this.reactXDist && this.saveAnim==null ){
        const TendPost=this.yukaPlayer.steering.behaviors[1];
            TendPost.weight=0;
            this.yukaPlayer.updateOrientation=false;

        const speedX=this.ball.ball.body.ammo.getLinearVelocity().x();
        const speedZ=this.ball.ball.body.ammo.getLinearVelocity().z();
        this.balltoPlayer.set(speedX,0,speedZ).normalize();         

        this.crossVector.crossVectors(this.upVector,this.playerClass.playerTurn).normalize();

        const lateral =this.balltoPlayer.dot(this.crossVector).toFixed(2);


        if(lateral<-0.05){
            this.saveDirection ='right';
        }
        else if(lateral>=-0.05 && lateral<=0.05){
            this.saveDirection ='center';
        }
        else if(lateral>0.05){
            this.saveDirection ='left';
        }
        else{
        }
        this.saveHeight = this.ball.ball.position.y > this.playerClass.parts.chest.position.y ? 'high' : 'low';
        if (this.saveDirection === 'right' && this.saveHeight === 'low') {
            this.saveAnim = 'gk_body_block_right_ip';
        } else if (this.saveDirection === 'left' && this.saveHeight === 'low') {
            this.saveAnim = 'gk_body_block_left_ip';
        } else if (this.saveDirection === 'right' && this.saveHeight === 'high') {
            this.saveAnim = 'gk_save_right_ip';
        } else if (this.saveDirection === 'left' && this.saveHeight === 'high') {
            this.saveAnim = 'gk_save_left_ip';
        }
        else if (this.saveDirection === 'center' && this.saveHeight === 'high') {
            this.saveAnim = 'gk_medium_catch_ip';
        } 
        else if (this.saveDirection === 'center' && this.saveHeight === 'low' && (lateral>-0.03 && lateral<0.03) ) {
            this.saveAnim = 'gk_low_catch_ip';
        }
         else if (this.saveDirection === 'center' && this.saveHeight === 'low' && (lateral<=-0.03 || lateral>=0.03) ) {
            Math.random() <0.5 ? this.saveAnim = 'gk_body_block_right_ip' : this.saveAnim = 'gk_body_block_left_ip';
        }    
           console.log(this.saveDirection,this.saveHeight);
           console.log(lateral);
    }
    
     
       if(this.scene.director.userTeam==this.playerClass.team.opponent /*&& this.zBallDist> reactZpos && this.zBallDist<iReactZpos*/ && this.xBallDist<this.reactXDist){
        this._shooterUser();
       }
       else if(this.scene.director.userTeam!=this.playerClass.team.opponent /*&&this.zBallDist> reactZpos && this.zBallDist<iReactZpos*/ && this.xBallDist<this.reactXDist){
        this._shooterAI();
       }
       if(this.saveAnim){
        this.animRun=this.player.anims.get(this.saveAnim).isRunning();
    }
    
      if (this.prevAnimRun==true && this.animRun==false) {
         //   console.log("Animation finished!");
            this.player.body.setVelocity(0, 0, 0);
            this.player.body.setAngularVelocity(0, 0, 0);
            if(this.scene.eName!='GoalKick' || this.scene.eName!='CornerKick' || this.scene.eName!='ThrowIn' /*|| this.scene.eName!='FreeKick' || this.scene.eName!='PenaltyKick'*/){
                // if ball is still in play and near the GK || not near GK and not near a teammate  - intercept ball
                if(this.ball.yukaBall.neighbors.length==0 || this.playerClass.distBall<8){
                    this.playerClass.stateMachine.changeTo('interceptBall');
                }
                //if ball is still in play and not near the Gk- tend post
                else{
                this.playerClass.stateMachine.changeTo('tendGoal');
                }
            }
        }
        this.prevAnimRun = this.animRun;
    }

    exit(entity) {
   // console.log(entity._renderComponent.name, 'of', this.playerClass.team.teamName, ' stops saving the ball.');  
       
    }

    _catch(saveY){
        let leftHandXDistance, rightHandXDistance, leftHandYDistance, rightHandYDistance, leftHandZDistance, rightHandZDistance;
        if(this.catchCheck){
         leftHandXDistance = Math.abs(this.ball.ball.position.x - this.playerClass.parts.leftHand.position.x).toFixed(1);
         rightHandXDistance =Math.abs(this.ball.ball.position.x - this.playerClass.parts.rightHand.position.x).toFixed(1);
         leftHandYDistance = Math.abs(this.ball.ball.position.y - this.playerClass.parts.leftHand.position.y).toFixed(1);
         rightHandYDistance = Math.abs(this.ball.ball.position.y - this.playerClass.parts.rightHand.position.y).toFixed(1);
         leftHandZDistance = Math.abs(this.ball.ball.position.z - this.playerClass.parts.leftHand.position.z).toFixed(1);
         rightHandZDistance = Math.abs(this.ball.ball.position.z - this.playerClass.parts.rightHand.position.z).toFixed(1);

      /*   console.log('X Distance to left hand:', leftHandXDistance);
         console.log('Y Distance to left hand:', leftHandYDistance);
         console.log('Z Distance to left hand:', leftHandZDistance);
         console.log('X Distance to right hand:', rightHandXDistance);
        console.log('Y Distance to right hand:', rightHandYDistance);
        console.log('Z Distance to right hand:', rightHandZDistance);*/

        }
        //account for high and low saves
        if(this.saveHeight=='high'){
         //   console.log('high save');
            if ((leftHandYDistance < 1.2 && leftHandXDistance < 2.5 && leftHandZDistance < 1.7) || (rightHandYDistance < 1.2 && rightHandXDistance < 2.5 && rightHandZDistance < 1.7)) {
              //  console.log('Ball caught by goalkeeper!');
                this.catchCheck=false;
                if(this.playerClass.team==this.scene.director.userTeam){this.playerClass.ballCaught=true;}
                else{this.playerClass.ballCaught=false;}
                  // Stop the ball and attach it to the goalkeeper
            if(this.ball.ball.body.getCollisionFlags()!=2){
                this.ball.ball.body.setVelocity(0, 0, 0);
                this.ball.ball.body.setAngularVelocity(0, 0, 0);
                this.ball.ball.body.setCollisionFlags(2);
            }  
       
            this.handMidpoint.addVectors(this.playerClass.parts.leftHand.position,this.playerClass.parts.rightHand.position).multiplyScalar(0.5);
            this.ball.ball.position.set( this.handMidpoint.x, this.handMidpoint.y, this.handMidpoint.z);
          //  console.log('midpoint:',midpoint);
            this.ball.ball.body.needUpdate=true;
    
            this.playerClass.team.lastTouched=true;
            this.playerClass.team.opponent.lastTouched=false;
            this.ball.possessorTeamClass=this.playerClass.team;
            this.ball.possessorTeam=this.ball.possessorTeamClass.teamName;
            this.ball.possessorClass=this.playerClass;
            this.ball.possessor=this.playerClass.playerName;
    
            this.playerClass.stateMachine.changeTo('catchBall');
    
            }
        }
        else if(saveY=='low'){
        //    console.log('low save');
            if ((leftHandYDistance < 1.2 && leftHandXDistance < 1.2 && leftHandZDistance < 2) || (rightHandYDistance < 1.1 && rightHandXDistance < 1.2 && rightHandZDistance < 2)) {
              //  console.log('Ball caught by goalkeeper!');
                this.catchCheck=false;
                if(this.playerClass.team==this.scene.director.userTeam){
                   // console.log('player GK caught ball');
                    this.playerClass.ballCaught=true;}
                else{this.playerClass.ballCaught=false;}
                  // Stop the ball and attach it to the goalkeeper
            if(this.ball.ball.body.getCollisionFlags()!=2){
                this.ball.ball.body.setVelocity(0, 0, 0);
                this.ball.ball.body.setAngularVelocity(0, 0, 0);
                this.ball.ball.body.setCollisionFlags(2);
            }  
       
            this.handMidpoint.addVectors(this.playerClass.parts.leftHand.position,this.playerClass.parts.rightHand.position).multiplyScalar(0.5);
            this.ball.ball.position.set( this.handMidpoint.x, this.handMidpoint.y, this.handMidpoint.z);
          //  console.log('midpoint:',midpoint);
            this.ball.ball.body.needUpdate=true;
    
            this.playerClass.team.lastTouched=true;
            this.playerClass.team.opponent.lastTouched=false;
            this.ball.possessorTeamClass=this.playerClass.team;
            this.ball.possessorTeam=this.ball.possessorTeamClass.teamName;
            this.ball.possessorClass=this.playerClass;
            this.ball.possessor=this.playerClass.playerName;
    
            this.playerClass.stateMachine.changeTo('catchBall');
    
            }
        }
       

      
    }

    _dive(animation,direction,height){
        let diveDirection=0;
        if(!this.kick){
            this.player.anims.get(animation).reset();
            this.player.anims.play(animation,this.transistionMS,false);              

            if (direction === 'center') {
                diveDirection = 0; // No horizontal movement, just vertical dive or standing
            } 
            else {
                const isLeftSide = this.playerClass.StartX < 0;
            
                if (direction === 'right') {
                    diveDirection = isLeftSide ? 1 : -1;
                } else if (direction === 'left') {
                    diveDirection = isLeftSide ? -1 : 1;
                }
            } 
        const playerTurnX= this.playerClass.playerTurn.x < 0 ? -1 : 1;   
       // console.log(height,direction);

        const xSave=THREE.MathUtils.randInt(0,3);
        const ySave = height === 'high' ? THREE.MathUtils.randInt(3, 7) + THREE.MathUtils.randFloat(0,0.99) : THREE.MathUtils.randInt(0, 1) +THREE.MathUtils.randFloat(0,0.99);
        const zSave=THREE.MathUtils.randInt(3,9);
        //console.log('xSave:',xSave,'ySave:', ySave, 'zSave:', zSave);
        if(this.playerClass.stateMachine.previousState===this.playerClass.stateMachine.get('interceptBall') && this.playerClass.distBall>=5){
        //    console.log('Long to mid range intercept saving');
            this.playerClass.stateMachine.previousState=null;
            this.player.body.setVelocity(playerTurnX*xSave,ySave,diveDirection*zSave);
           /* console.log('Save velocities:', {
                x: playerTurnX * xSave,
                y: ySave,
                z: diveDirection * zSave
            });*/
        }
        else if(this.playerClass.stateMachine.previousState===this.playerClass.stateMachine.get('interceptBall') && this.playerClass.distBall<5){
        //    console.log('close range intercept saving');
            this.playerClass.stateMachine.previousState=null;
            this.player.body.setVelocity(playerTurnX*xSave,ySave,diveDirection*zSave*0.5);
          /*  console.log('Save velocities:', {
                x: playerTurnX * xSave,
                y: ySave,
                z: diveDirection * zSave * 0.5
            }); */
        }
        else{ 
        //console.log('Normal saving');
        this.player.body.setVelocity(playerTurnX*xSave,ySave,diveDirection*zSave);
       /* console.log('Save velocities:', {
            x: playerTurnX * xSave,
            y: ySave,
            z: diveDirection * zSave
        });*/

        }
        this.kick=true;   
    }
    }

    _shooterUser(){
        const TendPost = this.yukaPlayer.steering.behaviors[1];
        if(this.isKicked){
        //   console.log("User is shooting");
            if (TendPost.active) {
                TendPost.active = false;
            }
            if(this.playerClass.stateMachine.previousState===this.playerClass.stateMachine.get('interceptBall') && this.playerClass.distBall<3){
                this.catchKick=true;
                this.catchCheck=true;
                this.saveY=this.saveHeight;
            //    console.log(this.player.name, 'attempts to catch the ball!');
            }  
          else if((Math.random()<0.65)){
          //  console.log(this.player.name, 'attempts to save the ball!'); 
            }
            else{
                this.catchKick=true;
                this.catchCheck=true;
                this.saveY=this.saveHeight;
            //    console.log(this.player.name, 'attempts to catch the ball!');
            }
            if (this.saveAnim && this.saveDirection && this.saveHeight) {
                this._dive(this.saveAnim,this.saveDirection,this.saveHeight);
            }

      
           this.isKicked=false;
        }
        if(this.catchKick){
            this._catch(this.saveY);
        }

    }
    _shooterAI(){
        const TendPost = this.yukaPlayer.steering.behaviors[1];
        if(this.isKicked){
        //    console.log("AI is shooting");
            if (TendPost.active) {
                TendPost.active = false;
            }
            
           if(this.playerClass.stateMachine.previousState===this.playerClass.stateMachine.get('interceptBall') && this.playerClass.distBall<3){
                this.catchKick=true;
                this.catchCheck=true;
                this.saveY=this.saveHeight;
            //    console.log(this.player.name, 'attempts to catch the ball!');
            }  
          else if((Math.random()<0.65)){
           // console.log(this.player.name, 'attempts to save the ball!'); 
            }
            else{
                this.catchKick=true;
                this.catchCheck=true;
                this.saveY=this.saveHeight;
            //    console.log(this.player.name, 'attempts to catch the ball!');
            }
            if (this.saveAnim && this.saveDirection && this.saveHeight) {
                this._dive(this.saveAnim,this.saveDirection,this.saveHeight);
            }
           this.isKicked=false;
        }
        if(this.catchKick){
            this._catch(this.saveY);
        }
    }
}

class CatchBallState extends YUKA.State {
    constructor(yukaPlayer, playerClass, scene) {
        super();
        this.yukaPlayer = yukaPlayer;
        this.playerClass = playerClass;
        this.player = playerClass.player;
        this.scene = scene;
        this.ball = this.scene.ball;
        this.ball.ball.body.setDamping(0.25,0.25);    
        this.lookTarg=new YUKA.Vector3(0,3,0);
        this.handMidpoint=new THREE.Vector3();

    }

    enter(entity) {
     //   console.log(entity._renderComponent.name, 'of', this.playerClass.team.teamName, ' is now catching the ball.');
        this.catch=true;
        const TendPost = this.yukaPlayer.steering.behaviors[1];
        TendPost.weight=0;
        this.throwAnim=null;
        const goalKickReceivers=Object.values(this.playerClass.team.teamList).filter(pl => pl.posName != 'goalkeeper'&& pl != this.playerClass);
        this. goalKickTarget=goalKickReceivers[Math.floor(Math.random()*goalKickReceivers.length)];
        this.yukaTargetPos= new YUKA.Vector3(
                    this.goalKickTarget.yukaPlayer.position.x ,
                     3,
                    this.goalKickTarget.yukaPlayer.position.z
                 ) 
    this.distanceToTarget = this.yukaPlayer.position.distanceTo(this.yukaTargetPos);
       this. yukaDirection=this.yukaTargetPos.clone().sub(this.yukaPlayer.position).normalize();
        if(this.distanceToTarget<40){
            this.throwAnim='gk_pass_ip'
        }
        else{
            this.throwAnim='gk_overhand_throw_ip';
        }

        this.throw=false;
        this.animRun=false;
       this.prevAnimRun=false;
        this.yukaPlayer.updateOrientation=false;
        setTimeout(() => {
            this.catch=false;
        }, 6000)
    }

    execute(entity) {
        this.animRun=this.player.anims.get(this.throwAnim).isRunning();
        if(this.catch==true){
            this.yukaPlayer.lookAt(this.lookTarg);
            this.handMidpoint.addVectors(this.playerClass.parts.leftHand.position,this.playerClass.parts.rightHand.position).multiplyScalar(0.5);
            this.ball.ball.position.set( this.handMidpoint.x, this.handMidpoint.y, this.handMidpoint.z);
            this.ball.ball.body.needUpdate=true;
        }

      

        if(this.catch==false){
            this.catch=null;
            setTimeout(() => {
              if((Math.random()<0.55)){
                this.ball.ball.position.set(this.playerClass.parts.rightHand.position.x*0.99,this.playerClass.parts.rightHand.position.y*1.02,this.playerClass.parts.rightHand.position.z);
                this.ball.ball.body.needUpdate=true;
                this.player.anims.play(this.throwAnim, 500, false);
            }
               else{
                    this.playerClass.stateMachine.changeTo('clearBall');
                }
            }, 3000);
        }
        if(this.catch==null && this.throwAnim){
           this.ball.ball.position.set(this.playerClass.parts.rightHand.position.x*0.99,this.playerClass.parts.rightHand.position.y*1.02,this.playerClass.parts.rightHand.position.z);
            this.ball.ball.body.needUpdate=true;
            if(this.prevAnimRun==true && this.animRun==false){
                this.yukaPlayer.lookAt(this.yukaTargetPos);
                const rand= THREE.MathUtils.randInt(15,39) + THREE.MathUtils.randFloat(0, 0.99);
                let Yrand;
                if(this.throwAnim=='gk_pass_ip'){
                     Yrand= THREE.MathUtils.randInt(0,10) + THREE.MathUtils.randFloat(0, 0.99);

                }
                else if(this.throwAnim=='gk_overhand_throw_ip'){
                     Yrand= THREE.MathUtils.randInt(10,25) + THREE.MathUtils.randFloat(0, 0.99);

                }
                this.ball.ball.body.once.update(()=>{
                    this.ball.ball.body.setCollisionFlags(0);
                    this.ball.ball.body.setVelocity(0,0,0);
                    this.ball.ball.body.setAngularVelocity(0,0,0);
                    this.ball.ball.body.applyImpulse({x:this. yukaDirection.x * rand ,y:Yrand ,z:this. yukaDirection.z * rand },{x:0,y:0,z:0});
                })
                this.playerClass.stateMachine.changeTo('tendGoal');
            }
        }
        
        this.prevAnimRun = this.animRun;

    }

    exit(entity) {
     //   console.log(entity._renderComponent.name, 'of', this.playerClass.team.teamName, ' stops catching the ball.');
        this.playerClass.team.lastTouched=true;
        this.playerClass.team.opponent.lastTouched=false;
        this.ball.possessorTeamClass=this.playerClass.team;
        this.ball.possessorTeam=this.ball.possessorTeamClass.teamName;
     //   this.ball.possessorClass=null;
     //   this.ball.possessor=null;
    }
    
}  

class ClearBallState extends YUKA.State {
    constructor(yukaPlayer, playerClass, scene) {
        super();
        this.yukaPlayer = yukaPlayer;
        this.playerClass = playerClass;
        this.player = playerClass.player;
        this.scene = scene;
        this.ball = this.scene.ball;
        this.ball.ball.body.setDamping(0.25,0.25);    
        this.lookTarg=new YUKA.Vector3(0,3,0);

    }

    enter(entity) {
     //   console.log(entity._renderComponent.name, 'of', this.playerClass.team.teamName, ' is now clearing the ball.');
        //if previous state was catch ball decide to drop kick or place the ball on the ground and kick it
        this.prevAnimRun=false;
        this.animRun=false;
        this.rushKick=false;
        this.clearAnim=null;
        const goalKickReceivers=Object.values(this.playerClass.team.teamList).filter(pl => pl.posName != 'goalkeeper'&& pl != this.playerClass);
        this. goalKickTarget=goalKickReceivers[Math.floor(Math.random()*goalKickReceivers.length)];
        this.yukaTargetPos= new YUKA.Vector3(
                    this.goalKickTarget.yukaPlayer.position.x ,
                     3,
                    this.goalKickTarget.yukaPlayer.position.z
                 ) 
        
       this. yukaDirection=this.yukaTargetPos.clone().sub(this.yukaPlayer.position).normalize();
        if(this.playerClass.stateMachine.previousState===this.playerClass.stateMachine.get('catchBall')){
            this.clear=true;

            if(Math.random()<0.5){
                this.clearAnim='gk_drop_kick_ip';
               // console.log('dropkick');
            }
            else{
               if(Math.random()<0.5){ 
                this.rushKick=false;
                this.clearAnim='gk_placing_ball_slow_ip';
             //   console.log('placing ball slow');
               } 
                else{
                 this.rushKick=true;
                 this.clearAnim='gk_placing_ball_quick_ip';
              //      console.log('placing ball quick');
                }
            }
            
        }
        else /*if(this.playerClass.stateMachine.previousState===this.playerClass.stateMachine.get('interceptBall'))*/{
            //TODO: during the game
            this.clear=false;
            this.clearAnim='strike_forward';

        }

        if(this.clearAnim=='gk_drop_kick_ip'){
            setTimeout(() => {
                this.clear=false;
            }, 5000)
        }
        else if(this.clearAnim=='gk_placing_ball_slow_ip'){
            setTimeout(() => {
                this.clear=false;
            }, 7500)
        }
        else if(this.clearAnim=='gk_placing_ball_quick_ip'){
            setTimeout(() => {
                this.clear=false;
            }, 3000)
        }
      

    }

    execute(entity) {


        this.animRun=this.player.anims.get(this.clearAnim).isRunning();
        if(this.clear==true){
            this.yukaPlayer.lookAt(this.lookTarg);
            this.ball.ball.position.set(this.playerClass.parts.rightHand.position.x*0.99,this.playerClass.parts.rightHand.position.y*1.02,this.playerClass.parts.rightHand.position.z);
            this.ball.ball.body.needUpdate=true;
        }
        
        if(this.clear==false){
            this.clear=null;
            if(this.playerClass.stateMachine.previousState===this.playerClass.stateMachine.get('catchBall')){
                this.ball.ball.position.set(this.playerClass.parts.rightHand.position.x*0.99,this.playerClass.parts.rightHand.position.y*1.02,this.playerClass.parts.rightHand.position.z);
                this.ball.ball.body.needUpdate=true;
         }  
                this.player.anims.play(this.clearAnim, 500, false);
            }
        if(this.clear==null && this.clearAnim=='gk_drop_kick_ip'){
            this.ball.ball.position.set(this.playerClass.parts.leftHand.position.x*0.99,this.playerClass.parts.leftHand.position.y*1.02,this.playerClass.parts.leftHand.position.z);
            this.ball.ball.body.needUpdate=true;

            if(this.prevAnimRun==true && this.animRun==false){
                this.yukaPlayer.lookAt(this.yukaTargetPos);
                const rand= THREE.MathUtils.randInt(15,49) + THREE.MathUtils.randFloat(0, 0.99);
                const Yrand= THREE.MathUtils.randInt(0,25) + THREE.MathUtils.randFloat(0, 0.99);
                this.ball.ball.body.once.update(()=>{
                    this.ball.ball.body.setCollisionFlags(0);
                    this.ball.ball.body.setVelocity(0,0,0);
                    this.ball.ball.body.setAngularVelocity(0,0,0);
                    this.ball.ball.body.setDamping(0.25,0.25);
                    this.ball.ball.body.applyImpulse({x:this. yukaDirection.x * rand ,y:Yrand ,z:this. yukaDirection.z * rand },{x:0,y:0,z:0});
                })
                this.playerClass.stateMachine.changeTo('tendGoal');
            }
        }

        else if(this.clear==null && this.clearAnim=='gk_placing_ball_slow_ip'){
            this.ball.ball.position.set(this.playerClass.parts.rightHand.position.x*0.99,this.playerClass.parts.rightHand.position.y*1.02,this.playerClass.parts.rightHand.position.z);
            this.ball.ball.body.needUpdate=true;

            if(this.ball.ball.position.y<3){
                if(this.ball.ball.body.getCollisionFlags()!=0){
                    this.ball.ball.position.set(this.playerClass.parts.rightHand.position.x*1.03,0,this.playerClass.parts.rightHand.position.z);
                    this.ball.ball.body.needUpdate=true;
                    this.ball.ball.body.setVelocity(0, 0, 0);
                    this.ball.ball.body.setAngularVelocity(0, 0, 0);
                    this.ball.ball.body.setCollisionFlags(0);
                }  
            }
            if(this.prevAnimRun==true && this.animRun==false){
                this.yukaPlayer.lookAt(this.yukaTargetPos);
                const rand= THREE.MathUtils.randInt(15,59) + THREE.MathUtils.randFloat(0, 0.99);
                const Yrand= THREE.MathUtils.randInt(0,25) + THREE.MathUtils.randFloat(0, 0.99);
                this.ball.ball.body.setVelocity(0,0,0);
                this.ball.ball.body.setAngularVelocity(0,0,0);
                this.ball.ball.body.setDamping(0.25,0.25);
                this.ball.ball.body.applyImpulse({x:this. yukaDirection.x * rand ,y:Yrand ,z:this. yukaDirection.z * rand },{x:0,y:0,z:0});
                this.playerClass.stateMachine.changeTo('tendGoal');
            }
        }
        else if(this.clear==null && this.clearAnim=='gk_placing_ball_quick_ip'){
            this.ball.ball.position.set(this.playerClass.parts.rightHand.position.x*0.99,this.playerClass.parts.rightHand.position.y*1.02,this.playerClass.parts.rightHand.position.z);
            this.ball.ball.body.needUpdate=true;
            if(this.ball.ball.position.y<3){
                if(this.ball.ball.body.getCollisionFlags()!=0){
                    this.ball.ball.position.set(this.playerClass.parts.rightHand.position.x*1.03,0,this.playerClass.parts.rightHand.position.z);
                    this.ball.ball.body.needUpdate=true;
                    this.ball.ball.body.setVelocity(0, 0, 0);
                    this.ball.ball.body.setAngularVelocity(0, 0, 0);
                    this.ball.ball.body.setCollisionFlags(0);
                }  
            }
            if(this.prevAnimRun==true && this.animRun==false){
                this.yukaPlayer.lookAt(this.yukaTargetPos);
                const rand= THREE.MathUtils.randInt(15,49) + THREE.MathUtils.randFloat(0, 0.99);
                const Yrand= THREE.MathUtils.randInt(0,12) + THREE.MathUtils.randFloat(0, 0.99);
                this.ball.ball.body.setVelocity(0,0,0);
                this.ball.ball.body.setAngularVelocity(0,0,0);
                this.ball.ball.body.setDamping(0.25,0.25);
                this.ball.ball.body.applyImpulse({x:this. yukaDirection.x * rand ,y:Yrand ,z:this. yukaDirection.z * rand },{x:0,y:0,z:0});
                this.playerClass.stateMachine.changeTo('tendGoal');
            }
        }

        else if(this.clear==null && this.clearAnim=='strike_forward'){
            if(this.prevAnimRun==false && this.animRun==true){
             //   console.log('ball is passed as a clearance');
                this.yukaPlayer.lookAt(this.yukaTargetPos);
                const rand= THREE.MathUtils.randInt(15,49) + THREE.MathUtils.randFloat(0, 0.99);
                const Yrand= THREE.MathUtils.randInt(0,12) + THREE.MathUtils.randFloat(0, 0.99);
                this.ball.ball.body.setVelocity(0,0,0);
                this.ball.ball.body.setAngularVelocity(0,0,0);
                this.ball.ball.body.setDamping(0.25,0.25);
                this.ball.ball.body.applyImpulse({x:this. yukaDirection.x * rand ,y:Yrand ,z:this. yukaDirection.z * rand },{x:0,y:0,z:0});
                this.playerClass.stateMachine.changeTo('tendGoal');
            }
        }




        this.prevAnimRun=this.animRun;
       
    }

    exit(entity) {
  //      console.log(entity._renderComponent.name, 'of', this.playerClass.team.teamName, ' stops clearing the ball.');
    }
}
