import {Scene3D,ExtendedObject3D ,THREE } from 'enable3d'
import { MatchScene } from '../core/MatchScene';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import {OutFieldStates} from '../statemachine/OutFieldStates.js';
import {Team} from './Team.js';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js';
import { Keyboard } from '@yandeu/keyboard';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import * as YUKA from 'yuka';


export class Player{

    constructor(model,playerName,posName,ball,team=null){
        this.model=model;
        this.player=null;
        this.posName=posName;
        this.playerName=playerName;
        this.keyboard = new Keyboard();
        this.animations=null;
        this.ball=ball;
        this.distBall=null;
        this.distPost=null;
        this.isPlayerControlled=false;
        this.yukaPlayer= new YUKA.Vehicle();
        this.yukaObstacle= new YUKA.GameEntity();
        this.statAttr={};
        this.team=team;
        this.animations=['idle','jog_forward','jog_backward','soccer_sprint','header_ip',
        'soccer_pass','standing_up_ip','strike_forward','tackle_ip','tackle_react_ip','throw_in_ip','jumping_header_ip'];
        
    }
    SetPlayer(scene,target,goalassignment,shade,rot,size,offsetX,offsetY,offsetZ){

       target.scale.setScalar(size);
       target.position.y=-2.5;
       this.player= new ExtendedObject3D();
       const boundingBox= new THREE.Box3();
       const boundingSphere = new THREE.Sphere();
       this.player.add(target);
       this.player.userData.postassignment=goalassignment;
       this.player.userData.isPlayerControlled=this.isPlayerControlled;
       this.player.name=this.playerName;
       this.player.userData.parent=this;
       this.player.traverse(c=>{
         c.shape='convex'

       if(c.name==="mixamorig5LeftForeArm"){
         if(!this.leftArm){
          this.leftArm=scene.physics.add.box({x:0,y:-1500,z:0 , width: 0.5, height: 1.5, depth: 0.35 ,mass:0.5,collisionFlags:2,collisionGroup:2,collisionMask:4})
          this.leftArm.customParams = {c}
          this.leftArm.userData.bodyPartName='Left Arm'
          this.leftArm.userData.parent=this;
          this.leftArm.name='Body Part'
          this.leftArm.visible=false;
          this.leftArm.body.needUpdate = true
         }
       }

       if(c.name==="mixamorig5LeftHand"){
        if(!this.leftHand){
         this.leftHand=scene.physics.add.sphere({x:0,y:-1500,z:0 ,radius:0.35,mass:0.5,collisionFlags:2,collisionGroup:2,collisionMask:4})
         this.leftHand.customParams = {c}
         this.leftHand.userData.bodyPartName='Left Hand'
         this.leftHand.userData.parent=this;
        this.leftHand.name='Body Part'
         this.leftHand.visible=false;
         this.leftHand.body.needUpdate = true
        }
      }

       if(c.name==="mixamorig5RightForeArm"){
        if(!this.rightArm){
          this.rightArm=scene.physics.add.box({x:0,y:-1500,z:0 , width: 0.5, height: 1.5, depth: 0.35 ,mass:0.5,collisionFlags:2,collisionGroup:2,collisionMask:4})
          this.rightArm.customParams = {c}
          this.rightArm.userData.bodyPartName='Right Arm'
          this.rightArm.userData.parent=this;
          this.rightArm.name='Body Part' 
          this.rightArm.visible=false;
          this.rightArm.body.needUpdate = true
        }
       }

       if(c.name==="mixamorig5RightHand"){
        if(!this.rightHand){
          this.rightHand=scene.physics.add.sphere({x:0,y:-1500,z:0 ,radius:0.35,mass:0.5,collisionFlags:2,collisionGroup:2,collisionMask:4})
          this.rightHand.customParams = {c}
          this.rightHand.userData.bodyPartName='Right Hand'
          this.rightHand.userData.parent=this;
        this.rightHand.name='Body Part'
          this.rightHand.visible=false;
          this.rightHand.body.needUpdate = true
        }
       }

       if(c.name==="mixamorig5LeftLeg"){
        if(!this.leftLeg){
          this.leftLeg=scene.physics.add.box({x:0,y:-1500,z:0 ,width: 0.5, height: 1.5, depth: 0.35 ,mass:0.5,collisionFlags:2,collisionGroup:2,collisionMask:4})
        this.leftLeg.customParams = {c}
        this.leftLeg.userData.bodyPartName='Left Leg'     
        this.leftLeg.userData.parent=this;
        this.leftLeg.name='Body Part'
        this.leftLeg.visible=false;
        this.leftLeg.body.needUpdate = true
        }
       }

      if(c.name==="mixamorig5RightLeg"){
        if(!this.rightLeg){
          this.rightLeg=scene.physics.add.box({x:0,y:-1500,z:0 , width: 0.5, height: 1.5, depth: 0.35 ,mass:0.5,collisionFlags:2,collisionGroup:2,collisionMask:4})
        this.rightLeg.customParams = {c}
         this.rightLeg.userData.bodyPartName='Right Leg'
         this.rightLeg.userData.parent=this;
        this.rightLeg.name='Body Part'
        this.rightLeg.visible=false;
        this.rightLeg.body.needUpdate = true
        }
       }

       if(c.name==="mixamorig5LeftFoot"){
        if(!this.leftFoot){
          this.leftFoot=scene.physics.add.box({x:0,y:-1500,z:0 , width: 0.75, height: 0.5, depth: 1,mass:2,collisionFlags:2,collisionGroup:2,collisionMask:4})
        this.leftFoot.customParams = {c}
         this.leftFoot.userData.bodyPartName='Left Foot'
         this.leftFoot.userData.parent=this;
        this.leftFoot.name='Body Part'
        this.leftFoot.visible=false;
        this.leftFoot.body.needUpdate = true
        }
       }

       if(c.name==="mixamorig5RightFoot"){
        if(!this.rightFoot){
        this.rightFoot=scene.physics.add.box({x:0,y:-1500,z:0 , width: 0.75, height: 0.5, depth: 1,mass:2,collisionFlags:2,collisionGroup:2,collisionMask:4})    
        this.rightFoot.customParams = {c}
        this.rightFoot.userData.bodyPartName='Right Foot'
        this.rightFoot.userData.parent=this;
        this.rightFoot.name='Body Part'
        this.rightFoot.visible=false;
        this.rightFoot.body.needUpdate = true
        }
       }
       if(c.name==="mixamorig5Spine"){
        if(!this.chest){
        this.chest=scene.physics.add.box({x:0,y:-1500,z:0 ,width: 0.75, height: 2, depth: 1,mass:1,collisionFlags:2,collisionGroup:2,collisionMask:4})
        this.chest.customParams = {c}
        this.chest.userData.bodyPartName='Chest'
        this.chest.name='Body Part'
        this.chest.userData.parent=this;
        this.chest.visible=false;
        this.chest.body.needUpdate = true
        }
       }
       if(c.name==="mixamorig5Head"){
        if(!this.head){
        this.head=scene.physics.add.sphere({x:0,y:-1500,z:0 ,radius:0.6,mass:1,collisionFlags:2,collisionGroup:2,collisionMask:4})
        this.head.customParams = {c}
        this.head.userData.bodyPartName='Head'
        this.head.name='Body Part'
        this.head.userData.parent=this;
        this.head.visible=false;
        this.head.body.needUpdate = true
        }
       }

       
       })

      const anim = new GLTFLoader();

 anim.loadAsync('./animations/Player_Actions/offensive_idle.gltf').then(anim=>{
   scene.animationMixers.add(this.player.anims.mixer)
   this.player.anims.add('idle',anim.animations[0]);
   this.player.anims.play('idle');
 })

 this.animations.forEach(key=>{
    if(key==='idle')return
    anim.loadAsync(`./animations/Player_Actions/${key}.gltf`).then(anim=>{
     this.player.anims.add(key,anim.animations[0]);
    })
  })
      this.player.position.set(offsetX,offsetY,offsetZ);
      this.StartX = offsetX;
      this.StartZ=offsetZ
      this.player.rotateY(rot); 
      scene.add.existing(this.player);
      this.yukaPlayer.setRenderComponent(this.player,this.yukaSync);
      scene.physics.add.existing(this.player,{/*shape:'capsule',radius:0.25,height:4.5*/shape:'cylinder',radius:0.3,height:5,margin:0.2,mass:5,collisionGroup:8,collisionMask:13});
      this.player.body.setFriction(0.8);
      this.player.body.setAngularFactor(0, 0, 0);
      this.player.body.setBounciness(0.25);
      this.player.userData.objtype='player';
      this.player.userData.role=this.posName;
      this.player.children[0].children[1].material.color=shade;
      this.player.children[0].children[2].material.color=shade;
      this.player.children[0].children[6].material.color=shade;
      this.playerClone=SkeletonUtils.clone(target);
      boundingBox.setFromObject(this.player);
      this.yukaPlayer.position.copy(this.player.position);
     boundingBox.getBoundingSphere(boundingSphere);
     //console.log('Bounding Box ',boundingBox);
     //console.log("Bounding Sphere Center:", boundingSphere);
    //console.log("Bounding Sphere Radius:", boundingSphere.radius);
      //this.yukaPlayer.boundingRadius=3//boundingSphere.radius;
      this.yukaPlayer.smoother=new YUKA.Smoother(60);
      this.yukaPlayer.name=this.playerName;

      this.yukaPlayer.neighborhoodRadius=10;
      this.yukaPlayer.updateNeighborhood=true;

      this.yukaObstacle.boundingRadius=2.5;//this.yukaPlayer.boundingRadius;
      this.yukaObstacle.name=this.playerName; 
      this.yukaObstacle.smoother=new YUKA.Smoother(60);
      this.stateMachine=new OutFieldStates(this.yukaPlayer,this,scene);
      this.stateMachine.changeTo('idle');
      this.initialState=true;
      this.post=scene.scene.getObjectByName(this.player.userData.postassignment);
   //  console.log(this.yukaPlayer);  

    
    }

    _update(scene){
     this.W= this.keyboard.key('KeyW').isDown; //forward
     this.A= this.keyboard.key('KeyA').isDown; //left
     //this.S= this.keyboard.key('KeyS').isDown; //Back
     this.D= this.keyboard.key('KeyD').isDown; //right
     this.Sprint= this.keyboard.key('ShiftLeft').isDown; //sprint
    this.Jump= this.keyboard.key('Space').isDown; //jump
     this.pass= this.keyboard.key('KeyJ').isDown; //pass/stand tackle
     this.shoot= this.keyboard.key('KeyK').isDown; //shoot/slide tackle
     this.changePlayer=this.keyboard.key('KeyL').isDown;//change player

     const randYMod=Math.round(Math.random() * (25 - 0) + 0);
    // const randStraightMod=Math.round(Math.random() * (60 - 10) + 10);
    // const randShortBallMod=Math.round(Math.random() * (30 - 10) + 10);
    // const randLongBallMod=Math.round(Math.random() * (60 - 31) + 31);
     const randShotMod=Math.round(Math.random() * (60 - 30) + 30);
     const randPassMod=Math.round(Math.random() * (40 - 10) + 10);
     


     if(this.player&&this.player.body){
      let acc= 4;
      const directVec=new THREE.Vector3();
      this.playerTurn=this.player.getWorldDirection(directVec);
      const directBall= new THREE.Vector3();
      directBall.subVectors(this.ball.position,this.player.position).normalize();
      const dotP=this.playerTurn.dot(directBall);
      const thetaPlayer = Math.atan2(this.playerTurn.x, this.playerTurn.z)
    //  this.player.body.setVelocity(0,0,0);
      this.player.body.setAngularVelocity(0,0,0);
        const x=Math.sin(thetaPlayer)*acc,
        y= this.player.body.velocity.y,
        z= Math.cos(thetaPlayer)*acc
        this.distBall=this.player.position.distanceTo(this.ball.position);
        this.player.userData.distBall=this.distBall;
        this.player.userData.dotP=dotP;
        this.postTrack(scene);
        if(this.player.userData.isPlayerControlled==true){
        //  console.log('dot:',dotP);
        }
      // optimiza animation stuttering bug
     this.director=scene.scene.getObjectByName('Director');
    if(this.player.children[1]===this.director){

    if(this.keyboard._isPaused === true){

      setTimeout(() => { 
        this.keyboard._isPaused=false
        this.keyboard.resume();
      }, 500);
    }
      if(this.keyboard._isPaused === false){
      this.keyboard.on.down('KeyW', keyCode => {
        if(this.Sprint){
          this.player.anims.play('soccer_sprint');
        }
        else{
          this.player.anims.play('jog_forward');
        }
    
    
        })
  
        this.keyboard.on.down('ShiftLeft', keyCode => {
          if(this.W){
            this.player.anims.play('soccer_sprint');
          }
          })
       //skip for now and fix animation blending for shooting and passing
       this.keyboard.once.down('KeyK', keyCode => {

        // for low ball and mid balls
        if(this.stateMachine.previousState== this.stateMachine.get('reset')  && scene.eName=='ThrowIn'){
          this.player.anims.play('throw_in_ip',500,false);
        }
        else{

          this.player.anims.play('strike_forward');
  
          if(this.Sprint && this.W){
            this.player.anims.get('strike_forward').crossFadeTo(this.player.anims.get('soccer_sprint'),2,true);
    
          }
    
          if(this.W){
            this.player.anims.get('strike_forward').crossFadeTo(this.player.anims.get('jog_forward'),2,true);
          }
          else{
            this.player.anims.get('strike_forward').crossFadeTo(this.player.anims.get('idle'),2,true);
  
          }
          
        }

        

      
        //for very high balls do a header later

       
          })

          this.keyboard.once.down('KeyJ', keyCode => {

            if(this.stateMachine.previousState== this.stateMachine.get('reset') && scene.eName=='ThrowIn'){
              this.player.anims.play('throw_in_ip',500,false);
            }
            else{
              // for low ball and mid balls
            this.player.anims.play('soccer_pass');
            if(this.Sprint && this.W){
              this.player.anims.get('soccer_pass').crossFadeTo(this.player.anims.get('soccer_sprint'),2,true);
            }
      
            if(this.W){
              this.player.anims.get('soccer_pass').crossFadeTo(this.player.anims.get('jog_forward'),2,true);
      
            }
            else{
              this.player.anims.get('soccer_pass').crossFadeTo(this.player.anims.get('idle'),2,true);
      
            }
          }
            //for very high balls do a header later
           
          
                })   
       

                this.keyboard.on.up('KeyW', keyCode => {
                  this.player.anims.play('idle');
                  })  
                  
                  this.keyboard.once.up('ShiftLeft', keyCode => {
            
                    if(this.W){
                      this.player.anims.play('jog_forward');
                    }
                    else{
                      this.player.anims.play('idle');
                    }
                    }) 
            
                    if(this.W){
                      this.player.body.setVelocity(x,y,z);
                    }
                    
                  if(this.A){
                    this.player.body.setAngularVelocityY(acc*1); 
                    
                  }
                  if(this.D){
                    this.player.body.setAngularVelocityY(acc*-1);
                  }
            
                  if(this.Sprint && this.W){
                      this.player.body.setVelocity(x*1.34,y,z*1.34);
                    }
         /*        if(this.Jump){
              //      this.team.lastTouched=false;
 //this.team.opponent.lastTouched=true;
 //scene.ball.possessorTeamClass=this.team.opponent;
 //scene.ball.possessorTeam=scene.ball.possessorTeamClass.teamName;
 //scene.ball.possessorClass=this.team.opponent.teamList?.PL2;
 //scene.ball.possessor=scene.ball.possessorClass.playerName;
 this.ball.body.setVelocity(60,25,-6);
                  } */
                  
      }
    }
    if(this.player.children[1]!==this.director){
     if(this.keyboard._isPaused===false){
      setTimeout(() => { 
        this.keyboard._isPaused=true;
        this.keyboard.pause();
        this.player.anims.play('idle');
        }, 1000);
     }

      
    }
     //turn off player control and switch on yuka controls and vice versa using character switcher key
    this.keyboard.once.down('KeyL', keyCode => {
     
        if(this.keyboard._isPaused===false){
          setTimeout(() => { 
          this.keyboard._isPaused=true;
          this.keyboard.pause();
          this.player.anims.play('idle');
          }, 1000);

        }
        else{
          setTimeout(() => { 
          this.keyboard._isPaused=false;
          this.keyboard.resume();
        }, 1000);
        }
  
    })

  // for now implement normal shooting based on player direction then later updates implement proper torque
   

   if(this.shoot && this.ball.position.y<=4 && (this.distBall<=4.5 && this.distBall>=2.0) && (dotP>=0.40)){ 
    //always reset forces to ensure previous force does not mulitply the new force
    this.ball.body.setVelocity(0,0,0);
    this.ball.body.setAngularVelocity(0,0,0);

      // remember to account for player direction 
      // use random range to adjust power

    // low shot with curve- use regular torque, set y=0 set x and z to extrapolate based on player direction
    
  //  this.ball.body.applyImpulse({x:this.playerTurn.x*randShotMod,y:0,z:this.playerTurn.z*randShotMod},{x:0,y:0,z:0});


    //aerial shots with curve - use force,torque and gravity and settimeout; set x and z to extrapolate based on player direction and set y to give height


    // straight shots without curve-  use force only x and z have same multiplier y gives height
    
    scene.ball.shotX=this.playerTurn.x*randShotMod;
    scene.ball.shotY=randYMod;
    scene.ball.shotZ=this.playerTurn.z*randShotMod;
    const opponentGk=this.team.opponent.teamList.GK;

    this.team.lastTouched=true;
    this.team.opponent.lastTouched=false;
    scene.ball.possessorClass=null;
    scene.ball.possessor=null;

    opponentGk.stateMachine.changeTo('saveBall')

    this.ball.body.applyImpulse({x:scene.ball.shotX,y:scene.ball.shotY,z:scene.ball.shotZ},{x:0,y:0,z:0});
  //  console.log(this.team.opponent.teamList.GK.saveDirection);

  //  console.log("Y:",randYMod);
 //   console.log("X or Z",randShotMod);



    this.ball.userData.isKicked=true;
    setTimeout(()=>{
    this.ball.userData.isKicked=false;
  },1500);

    // experimental special shots- use force, torque, gravity, impulse and settimeout (WIP)


 
// testing random things
 /*   
   // this.ball.body.applyForce(15,0,10);
    //this.ball.body.applyTorque(-200,0,0)
   //this.ball.body.applyTorqueImpulse(); 
   //this.ball.body.applyImpulse({x:0,y:20,z:0},{x:0,y:0,z:0});

   setTimeout(() => {
   // this.ball.body.applyTorqueImpulse(-400,0,0);
    //this.ball.body.setGravity(0,-9.81,-12);
    //this.ball.body./*setVelocityapplyForce(17,-2,-9);
   // this.ball.body.applyImpulse({x:2,y:0,z:0},{x:0,y:0,z:0});

  }, 1000);

  setTimeout(() => {
    this.ball.body.applyTorqueImpulse(800,0,0);
    //this.ball.body.setGravity(0,-9.81,0);
  }, 2000);

  setTimeout(() => {
    this.ball.body.applyTorqueImpulse(-1600,0,0);
    //this.ball.body.setGravity(0,-9.81,0);
  }, 3000);

  setTimeout(() => {
    this.ball.body.applyTorqueImpulse(3200,0,0);
    //this.ball.body.setGravity(0,-9.81,0);
  }, 4000);

  setTimeout(() => {
    this.ball.body.applyTorqueImpulse(-6400,0,0);
    //this.ball.body.setGravity(0,-9.81,0);
  }, 5000);
  */

  }


 if(this.pass &&this.ball.position.y<=4 && (this.distBall<=4.5 && this.distBall>=2.0) && (dotP>=0.40)){
  this.ball.body.setVelocity(0,0,0);
  this.ball.body.setAngularVelocity(0,0,0);
   
  // remember to account for player direction 
  // use random range to adjust power

    // low pass with curve- use regular torque, set y=0 set x and z to extrapolate based on player direction

    // add torque maybe use set timeout

    //aerial pass/cross/longball with curve-  use force,torque and gravity and settimeout; set x and z to extrapolate based on player direction and set y to give height

    // straight pass/cross/longball without curve-  use force only x and z have same multiplier y gives height
    this.ball.body.applyImpulse({x:this.playerTurn.x*randPassMod,y:0,z:this.playerTurn.z*randPassMod},{x:0,y:0,z:0});
  //  console.log("X or Z",randPassMod);

  this.team.lastTouched=true;
  this.team.opponent.lastTouched=false;
  scene.ball.possessorTeamClass=this.team;
  scene.ball.possessorTeam=scene.ball.possessorTeamClass.teamName;
 

    this.ball.userData.isKicked=true;
    setTimeout(()=>{
    this.ball.userData.isKicked=false;
  },1500);
  setTimeout(()=>{
    scene.director._switchToNearestPlayer();
  },4500);



    // experimental special pass- use force, torque, gravity, impulse and settimeout (WIP)

    }
//TODO:Heading code calculations
   /* if(this.Jump){
      this.ball.body.setVelocity(0,0,0);
  this.ball.body.setAngularVelocity(0,0,0);
      this.ball.body.applyImpulse({x:0,y:12,z:0},{x:0,y:0,z:0});
    }*/

    }  
    
    if (this.leftArm && this.leftArm.body) {
      const child = this.leftArm.customParams.c
      const pos = child.getWorldPosition(new THREE.Vector3());
      this.leftArm.position.copy(pos)
      this.leftArm.rotation.copy(child.rotation)
      this.leftArm.body.needUpdate = true
      }

    if (this.rightArm && this.rightArm.body) {
      const child = this.rightArm.customParams.c
      const pos = child.getWorldPosition(new THREE.Vector3())
      this.rightArm.position.copy(pos)
      this.rightArm.rotation.copy(child.rotation)
      this.rightArm.body.needUpdate = true
      }
    if (this.leftHand && this.leftHand.body) {
      const child = this.leftHand.customParams.c
      const pos = child.getWorldPosition(new THREE.Vector3());
      pos.y=pos.y-0.3;
      this.leftHand.position.copy(pos)
      this.leftHand.rotation.copy(child.rotation)
      this.leftHand.body.needUpdate = true
      }

    if (this.rightHand && this.rightHand.body) {
      const child = this.rightHand.customParams.c
      const pos = child.getWorldPosition(new THREE.Vector3())
      pos.y=pos.y-0.3;
      this.rightHand.position.copy(pos)
      this.rightHand.rotation.copy(child.rotation)
      this.rightHand.body.needUpdate = true
      }
    if (this.leftLeg && this.leftLeg.body) {
      const child = this.leftLeg.customParams.c
      const pos = child.getWorldPosition(new THREE.Vector3())
      this.leftLeg.position.copy(pos)
      this.leftLeg.position.y=pos.y+0.3;
      this.leftLeg.rotation.copy(child.rotation)
      this.leftLeg.body.needUpdate = true
      }
    if (this.rightLeg && this.rightLeg.body) {
      const child = this.rightLeg.customParams.c
      const pos = child.getWorldPosition(new THREE.Vector3())
      this.rightLeg.position.copy(pos)
      this.rightLeg.position.y=pos.y+0.3;
      this.rightLeg.rotation.copy(child.rotation)
      this.rightLeg.body.needUpdate = true
      }

      if (this.leftFoot && this.leftFoot.body) {
        const child = this.leftFoot.customParams.c
        const pos = child.getWorldPosition(new THREE.Vector3())
        this.leftFoot.position.copy(pos)
        this.leftFoot.position.y=pos.y+0.05
        this.leftFoot.rotation.copy(this.player.rotation);
        this.leftFoot.body.needUpdate = true
        }
      if (this.rightFoot && this.rightFoot.body) {
        const child = this.rightFoot.customParams.c
        const pos = child.getWorldPosition(new THREE.Vector3())
        this.rightFoot.position.copy(pos);
        this.rightFoot.position.y=pos.y+0.05;
        this.rightFoot.rotation.copy(this.player.rotation);
        this.rightFoot.body.needUpdate = true;
        }
     if (this.chest && this.chest.body) {
          const child = this.chest.customParams.c
          const pos = child.getWorldPosition(new THREE.Vector3())
          this.chest.position.copy(pos)
          this.chest.rotation.copy(this.player.rotation)
          this.chest.body.needUpdate = true;
          } 
    if (this.head && this.head.body) {
      const child = this.head.customParams.c
      const pos = child.getWorldPosition(new THREE.Vector3())
      this.head.position.copy(pos);
      this.head.position.y=pos.y+0.3;
      this.head.rotation.copy(this.player.rotation)
      this.head.body.needUpdate = true
      }
      
     this._updateYuka(scene);
    }

    

_setAddManager(yukaEntityManager){
    this.entityManager=yukaEntityManager;
    this.entityManager.add(this.yukaPlayer);
  //  this.entityManager.add(this.yukaObstacle);
}
yukaSync(entiity,renderComponent){
    renderComponent.matrix.copy(entiity.worldMatrix);
}


  _updateYuka(scene){
        
    if(this.yukaPlayer&&this.player&& this.yukaObstacle){

    

      const SeekWBall= this.yukaPlayer.steering.behaviors[0];
      const PursueBall=this.yukaPlayer.steering.behaviors[1]; 
      const ArriveBall=this.yukaPlayer.steering.behaviors[3];
      const ResetPos= this.yukaPlayer.steering?.behaviors[5];

      const yukaSpeed=this.yukaPlayer.getSpeed();
      this.yukaPlayer.position.copy(this.player.position);
      this.yukaObstacle.position.copy(this.player.position);
 
 
     if(this.player.userData.isPlayerControlled==false && ResetPos?.active!=true){
      this.stateMachine.update(scene);

      if(scene.isyukaBehavior==true){
        this._speedToAnimations(yukaSpeed);
        this._distanceCheck(scene);
        //use here for passing shooting descision making
        if(SeekWBall.weight==1 || PursueBall.weight==1 || ArriveBall.weight==1){
          this.player.body.setVelocity(this.yukaPlayer.velocity.x,this.player.body.velocity.y,this.yukaPlayer.velocity.z);
        }
        else{
          this.yukaPlayer.rotation.set(0,0,0,1);
          this.player.body.setVelocity(0,0,0);
        }
        this.player.matrixAutoUpdate=false;   
      }
    else if(scene.isyukaBehavior==false){

      if(!this.stateMachine.in('throwIn') && !this.stateMachine.in('cornerKick') ){
        if(this.player.anims.current!=='idle'){
          this.player.anims.play('idle');
        }
        this.yukaPlayer.rotation.set(0,0,0,1);
        this.player.body.setVelocity(0,0,0);
      }
      }  
      this.player.matrixAutoUpdate=false;   
     
    }
    else if(ResetPos?.active==true){
      this.stateMachine.update(scene);
  }
    
    
    else{
        this.stateMachine.currentState=null;
        this.player.matrixAutoUpdate=true;
   //     console.log(this.player.body.ammo.getLinearVelocity().length());
    }
  }
  

  }
 _hasArrived(resetPosition,scene){
  const distToReset= this.player.position.distanceTo(resetPosition?.target);
  // 1.5 for half time,goal and goal kick, 2.0 for throw in, 2.5 for corner kick do later
  //console.log("Event Name:",scene.eName);

   if(scene.eName=='CornerKick'){
    if(distToReset<=2.5){
      this.ResetDone= true;
    }
    if (distToReset>2.5){
   //   console.log(this.playerName,this.team.teamName,distToReset);
      this.ResetDone=false;
    }
  }

  else{
    if(distToReset<=1.5){
      this.ResetDone= true;
    }
    if (distToReset>1.5){
      this.ResetDone=false;
    }
  }

 
 }

  _speedToAnimations(speed){
    if(speed<=0.5){
      if(this.player.anims.current!=='idle'){
        this.player.anims.play('idle');
      }
    }
     if(speed>0.5 && speed<=4.5){
      if(this.player.anims.current!=='jog_forward'){
        this.player.anims.play('jog_forward');
      }
    }
    if(speed>4.5){
      if(this.player.anims.current!=='soccer_sprint'){
        this.player.anims.play('soccer_sprint');
      }
    }


  }

  _decisionsPossessorShoot(scene){
    return (this._canShoot(scene) && this._inShotRange(scene));
  }

  _decisionsPossessorPass(scene){
   this.availableTeammatePass= Object.values(this.team.teamList).filter(pl=>
    pl!=scene.ball.possessorClass && this._canPass(pl,scene)
  )
//    console.log(this.availableTeammatePass);
//  console.log('Can Pass to:',this.availableTeammatePass.player.name,this.availableTeammatePass.team.teamName);

  if(this.availableTeammatePass.length<1){
    return false;
  }

  else {
  const Opponents= Object.values(this.team.opponent.teamList);
 const passTarget= this.availableTeammatePass.find(pl => !Opponents.some(op=> this._isPassBlocked(op,pl,scene)));
 return passTarget != undefined;
  }

  }

  _decisionsPossessorDribble(scene){
return (this._canDribble(scene) && !this._isDefenderClose(scene));
  }

//use this to determine if they can pursue or support

  _decisionsOpponent(scene){

  }
  _decisionsTeammate(scene){

  }

  _inShotRange(scene){
    const goalTarget=this.team.goalineTargetName;
    let goal;

    if(!goal){
      goal=scene.scene.getObjectByName(goalTarget);
    }
  const distToGoal= this.ball.position.distanceTo(goal.position);
  //console.log('Distance to Goal:',distToGoal);
  if(distToGoal<65){
    return true;
  }
  else{
    return false;
  }
 
  }

  _canShoot(scene){
    const goalTarget=this.team.goalineTargetName;
    let goal;

    if(!goal){
      goal=scene.scene.getObjectByName(goalTarget);
    }
    const zTarget=(Math.random() * 24 - 12);
    const goalPos= new THREE.Vector3(goal.position.x,0,zTarget);

    return ! Object.values(this.team.opponent.teamList).some((pl)=>{
    if (pl.posName === "goalkeeper") return false;  
   else{ return  this._isShotBlocked(pl,goalPos,scene);}
    })

  }

  _isShotBlocked(opponent,goal,scene){
    const toTarget=goal.sub(this.ball.position).normalize();
    const toOpponent =opponent.player.position.clone().sub(this.ball.position).normalize();
    const distToOpponent=opponent.player.position.distanceTo(this.ball.position);
 //   console.log('Dot:',opponent.player.name,opponent.team.teamName,toTarget.dot(toOpponent));
  //  console.log('Distance to Opponent:',opponent.player.name,opponent.team.teamName,opponent.player.position.distanceTo(this.player.position));
    return toTarget.dot(toOpponent) > 0.65 && distToOpponent<20;
  }

  _canPass(teammates,scene){
    return teammates.distBall<45;
    
  }

  _isPassBlocked(opponent,teammate ,scene){
    const toTeammate=teammate.player.position.clone().sub(this.ball.position).normalize();
    const toOpponent =opponent.player.position.clone().sub(this.ball.position).normalize();
    const distToOpponent=opponent.player.position.distanceTo(this.ball.position);
  //  console.log('Dot:',opponent.player.name,opponent.team.teamName,toTeammate.dot(toOpponent));
    return toTeammate.dot(toOpponent) > 0.46 && distToOpponent<15;
  }  

  _canDribble(scene){
        //use yuka neighborhood to check for nearby opponents
    const Opponents= Object.values(this.team.opponent.teamList);
    const nearbyOpponents= Opponents.filter(pl=>pl.distBall<15);
   // console.log(this.dribbleTarget);
    
   if(nearbyOpponents.length<1){ return true;}

   else{
    return ! nearbyOpponents.some((pl)=>{
    return this._isDribblingBlocked(pl,scene);
    })
   }

  }

  _isDefenderClose(scene){
    //use yuka neighborhood to check for nearby opponents
    const Opponents= Object.values(scene.ball.possessorClass.team.opponent.teamList);
    const closeOpponents= Opponents.filter(pl=>scene.ball.possessorClass.yukaPlayer.neighbors.includes(pl.yukaPlayer)); 
   // console.log('Close Opponents:',closeOpponents);
    return closeOpponents.length>=1;
  }

  _isDribblingBlocked(opponent,scene){
    if(this?.dribbleTarget){
    const dribbleTarg= new THREE.Vector3(this.dribbleTarget.x,0,this.dribbleTarget.z);
    const toTarget=dribbleTarg.clone().sub(this.ball.position).normalize();
    const toOpponent =opponent.player.position.clone().sub(this.ball.position).normalize();
    const distToOpponent=opponent.player.position.distanceTo(this.ball.position);
   // console.log('Dot:',opponent.player.name,opponent.team.teamName,toTarget.dot(toOpponent));
    return toTarget.dot(toOpponent) > 0.6 &&  distToOpponent< 15;
  }
  else{
    return false;
  }
}


  _decisionsPossessor(scene){
    if(this._decisionsPossessorShoot(scene)){ 
      const opponentGk=this.team.opponent.teamList.GK;
       if(!opponentGk.stateMachine.in('saveBall')){
        opponentGk.stateMachine.changeTo('saveBall')
       }
       return 'Shoot'
      }
    else if(this._decisionsPossessorDribble(scene)){ return 'Dribble'}
    else if(this._decisionsPossessorPass(scene)){ return 'Pass'}
    else{return 'Dribble'};
    
  }

  _distanceCheck(scene){
  if(scene.ball.possessorClass==this && scene.ball.possessorTeamClass==this.team){


    if(this.distBall<=8){

      if(scene.director.userTeam!=this.team){  

   const action= this._decisionsPossessor(scene);
  // console.log('Action:',action);

        if(action==='Dribble'){
        if(!this.stateMachine.in('dribble')){
        this.stateMachine.changeTo('dribble');
        }
      } 

     else if(action==='Pass'){
        if(!this.stateMachine.in('passBall')){
          this.stateMachine.changeTo('passBall');
        } 
      }
    
      else if(action==='Shoot'){
        if(!this.stateMachine.in('shoot')){
          this.stateMachine.changeTo('shoot');
        }
      }
    }

    } 
    else if(this.distBall<=50){
      if(!this.stateMachine.in('chaseBall')){ 
       this.stateMachine.changeTo('chaseBall');
       }
    }

    
     }
     
    // Make Pursurers and supporters to be a max of 2  1 if it is User Team not Player Controlled 
   //opponent

 else if(scene.ball.possessorClass!=this && scene.ball.possessorTeamClass!=this.team){
    if(this.distBall<50){
    if(!this.stateMachine.in('chaseBall')){ 
    this.stateMachine.changeTo('chaseBall');
     }
    }

    else if(this.distBall>=50 && this.distBall <55){ 
      if(!this.stateMachine.in('idle')){
        this.stateMachine.changeTo('idle'); 
       }
    }
    
    else{
      if(!this.stateMachine.in('goHome')){ 
        this.stateMachine.changeTo('goHome');
       }
    }
    }    
  //teammate

 else if(scene.ball.possessorClass!=this && scene.ball.possessorTeamClass==this.team){
  /*if(!this.player.userData.isPlayerControlled){
    const action= this._decisionsTeammate(scene); 
    console.log('Action:',action);
  }*/
     if(!this.stateMachine.in('receiveBall') && (scene.ball?.possessorClass?.distBall>this.distBall)){
      scene.ball.possessorClass=this;
      scene.ball.possessor=this.playerName;
     }
   
   else if(this.distBall<50 && !this.stateMachine.in('receiveBall')){
      if(!this.stateMachine.in('supportAttacker')){ 
        this.stateMachine.changeTo('supportAttacker');
       }
    }
   else if(this.posName != 'defender' &&  !this.stateMachine.in('receiveBall')){
      if(!this.stateMachine.in('supportAttacker')){ 
       this.stateMachine.changeTo('supportAttacker');
       }
    }


    else if(this.distBall>=50 && this.distBall <55 &&  !this.stateMachine.in('receiveBall')){ 
      if(!this.stateMachine.in('idle')){
        this.stateMachine.changeTo('idle'); 
       }
    }
    
    else if(this.distBall>=55){
      if(!this.stateMachine.in('goHome')){ 
        this.stateMachine.changeTo('goHome');
       }
    }
  }


  }
 
  postTrack(scene){
    if(this.post.name==this.player.userData.postassignment){
      this.distPost=this.player.position.distanceTo(this.post.position);
      this.player.userData.distPost=this.distPost;
    }
    
  }
  
}
