import {Scene3D,ExtendedObject3D ,THREE } from 'enable3d'
import { MatchScene } from '../core/MatchScene';
import { Keyboard } from '@yandeu/keyboard';
import * as YUKA from 'yuka';
import * as SharedStates from './SharedStates.js';
import {Keeper} from '../objects/Keeper.js';
import _ from 'lodash-es';




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
        //TODO: Set player speed with and without possession of the ball and if they are in close proximity to the ball
            this.yukaPlayer.maxSpeed=4;
          //  console.log(this.yukaPlayer.steering.behaviors);
        
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
     //  console.log(entity._renderComponent.name,'of',this.playerClass.team.teamName,' is now tending goal.');
       const TendPost=this.yukaPlayer.steering.behaviors[1];
       TendPost.active=true;
        TendPost.weight=1; 
    }

    execute(entity){

        const TendPost=this.yukaPlayer.steering.behaviors[1];
        const ResetPos=this.yukaPlayer.steering.behaviors[2];
        //console.log(TendPost);
        if(!ResetPos){
        if(this.playerClass.team==this.scene.Team1){
            TendPost.target=this.scene.tendPositionTeam1GK;
            }
        else if(this.playerClass.team==this.scene.Team2){
            TendPost.target=this.scene.tendPositionTeam2GK;
            }
        }
       


    }

    exit(entity){
     //   console.log(entity._renderComponent.name,'of',this.playerClass.team.teamName,' stops tending goal.');
    }
}
class InterceptBallState extends YUKA.State{
    constructor(yukaPlayer,playerClass,scene){
        super();
        this.yukaPlayer=yukaPlayer;
        this.playerClass=playerClass;
        this.player=playerClass.player;
        this.scene=scene;
    }
    enter(entity){
    //    console.log(entity._renderComponent.name,'of',this.playerClass.team.teamName,' is now intercepting ball.');
    }

    execute(entity){
    //    console.log(entity._renderComponent.name,'of',this.playerClass.team.teamName,' is intercepting ball...');
    }

    exit(entity){
     //   console.log(entity._renderComponent.name,'of',this.playerClass.team.teamName,' stops intercepting ball.');
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

        if(distance<5){
            this.yukaPlayer.velocity.set(0,0,0);
            
            if(!this.kick){
                this.kick=true;
                setTimeout(() => {
                    this.kick = true;
                    this.player.body.setVelocity(0, 0, 0);
                    this.player.anims.play(this.anim, 500, false);
                }, 2500);
            }
        }

        if (this.prevAnimRun==false && this.animRun==true) {
         //   console.log("Animation started!");
        }

        else if (this.prevAnimRun==true && this.animRun==false) {
         //  console.log("Animation finished!");
           this.ball.ball.body.setVelocity(0,0,0);
           this.ball.ball.body.setAngularVelocity(0,0,0);
        //   console.log("Goal Kick Executed");

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
    }

    enter(entity) {
     //   console.log(entity._renderComponent.name, 'of', this.playerClass.team.teamName, ' is now saving the ball.');
        
        const goalTarget=this.playerClass.team.opponent.goalineTargetName;
        this.goal=this.scene.scene.getObjectByName(goalTarget);


        // 40% chance to not attempt to save the ball
        if (Math.random() > 0.7) {
        //    console.log(entity._renderComponent.name, 'decides not to attempt to save the ball.');
            this.playerClass.stateMachine.changeTo('tendGoal');
        }
        else{
          //  console.log(entity._renderComponent.name, 'decides to attempt to save the ball.');
            const TendPost=this.yukaPlayer.steering.behaviors[1];
            TendPost.weight=0;
            this.yukaPlayer.updateOrientation=false;
           
        }
        this.kick=false;
        this.isKicked=true;
        this.saveAnim=null;
        this.animRun=false;
        this.prevAnimRun=false;

        this.player.body.setVelocity(0, 0, 0);
        this.player.body.setAngularVelocity(0, 0, 0);

    }

    execute(entity) {
        this.xBallDist= Math.abs(this.ball.ball.position.x-this.player.position.x);

        if(this.scene.ball.possessorTeamClass == this.playerClass.team){

            if(this.scene.eName!='GoalKick'){
            this.playerClass.stateMachine.changeTo('tendGoal');
            }
        }

         const balltoPlayer=new THREE.Vector3(this.ball.shotX,0,this.ball.shotZ).normalize();         
         const crossVector=new THREE.Vector3();
         crossVector.crossVectors(new THREE.Vector3(0,1,0),this.playerClass.playerTurn).normalize();

         const lateral =balltoPlayer.dot(crossVector);


         if(lateral<0){
            this.saveDirection ='right';
        }
        else{
            this.saveDirection ='left';
        }
        //between -0.2 to 0.2 "Center" 
        this.saveHeight = this.ball.ball.position.y > this.playerClass.chest.position.y ? 'high' : 'low';
        if (this.saveDirection === 'right' && this.saveHeight === 'low') {
            this.saveAnim = 'gk_body_block_right_ip';
        } else if (this.saveDirection === 'left' && this.saveHeight === 'low') {
            this.saveAnim = 'gk_body_block_left_ip';
        } else if (this.saveDirection === 'right' && this.saveHeight === 'high') {
            this.saveAnim = 'gk_save_right_ip';
        } else if (this.saveDirection === 'left' && this.saveHeight === 'high') {
            this.saveAnim = 'gk_save_left_ip';
        }
    
      //  console.log(this.saveDirection,lateral);
       if(this.scene.director.userTeam==this.playerClass.team.opponent){
        this._shooterUser();
       }
       else{
        this._shooterAI();
       }
    
        this.animRun=this.player.anims.get(this?.saveAnim).isRunning();

        if (this.prevAnimRun==false && this.animRun==true) {
        //    console.log("Animation started!");
        }
    
        else if (this.prevAnimRun==true && this.animRun==false) {
        //    console.log("Animation finished!");
            this.player.body.setVelocity(0, 0, 0);
            this.player.body.setAngularVelocity(0, 0, 0);
            if(this.scene.eName!='GoalKick'){
                // if ball is still in play and near the GK || not near GK and not near a teammate  - intercept
                //if ball is still in play and not near the Gk- tend post
                this.playerClass.stateMachine.changeTo('tendGoal');
            }
        }
    
        this.prevAnimRun = this.animRun;
    }

    exit(entity) {
    //    console.log(entity._renderComponent.name, 'of', this.playerClass.team.teamName, ' stops saving the ball.');  
       
    }

   /* _catch(){
        
        console.log(this.player.name, 'attempts to catch the ball!');

        // Stop the ball and attach it to the goalkeeper
        if(this.ball.body.getCollisionFlags()!=2){
            this.ball.body.setCollisionFlags(2);
        }  
        this.ball.body.setVelocity(0, 0, 0);
        this.ball.body.setAngularVelocity(0, 0, 0);
        this.ball.position.set(this.playerClass.leftHand.position.x,this.playerClass.leftHand.position.y,this.playerClass.leftHand.position.z);
        this.ball.body.needUpdate=true;


        // Play a catching animation (if available)
        if (this.player.anims.current != 'gk_medium_catch_ip') {
            this.player.anims.play('gk_medium_catch_ip', 500, false);
        }
        
    }*/

    _dive(animation,direction,height){
        let diveDirection;
        if(!this.kick){
          this.player.anims.get(animation).timescale=1.0;  
        if(this.player.anims.current!==animation){
            this.player.anims.play(animation,250,false);              
        }

        if(this.playerClass.StartX<0){
            diveDirection= (direction=='right'? 1:-1 );
        }
        else{
           diveDirection =(direction=='right'? -1:1 )
        }
    //    console.log(height,direction);

        const ySave = height === 'high' ? THREE.MathUtils.randInt(2, 5) : THREE.MathUtils.randFloat(0, 2).toFixed(2);
        const zSave=THREE.MathUtils.randInt(2,10);
      //  console.log('ySave:', ySave, 'zSave:', zSave);
        this.player.body.setVelocity(0,ySave,diveDirection*zSave);
        this.kick=true;   
    }
    }

    _shooterUser(){
        const TendPost = this.yukaPlayer.steering.behaviors[1];
        if(this.xBallDist<20&&this.isKicked){
          //  console.log("User is shooting");
            if (TendPost.active) {
                TendPost.active = false;
            }
            
           /* if((Math.random()<0.55)){
                this._catch();
            }*/
          //  else{
            if (this.saveAnim && this.saveDirection && this.saveHeight) {
                this._dive(this.saveAnim,this.saveDirection,this.saveHeight);
            }
           // }

      
           this.isKicked=false;
        }
    }
    _shooterAI(){
        const TendPost = this.yukaPlayer.steering.behaviors[1];
        if(this.xBallDist<20&&this.ball.ball.userData.isKicked){
         //   console.log("AI is shooting");
            if (TendPost.active) {
                TendPost.active = false;
            }
            
           /* if((Math.random()<0.55)){
                this._catch();
            }*/
          //  else{
            if (this.saveAnim && this.saveDirection && this.saveHeight) {
                this._dive(this.saveAnim,this.saveDirection,this.saveHeight);
            }
           // }

           this.isKicked=false;
        }
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
    }

    enter(entity) {
    //    console.log(entity._renderComponent.name, 'of', this.playerClass.team.teamName, ' is now clearing the ball.');
    }

    execute(entity) {
       
    }

    exit(entity) {
    //    console.log(entity._renderComponent.name, 'of', this.playerClass.team.teamName, ' stops clearing the ball.');
    }
}
