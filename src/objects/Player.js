import {Scene3D,ExtendedObject3D ,THREE } from 'enable3d'
import { MatchScene } from '../core/MatchScene';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
//import Outfield from './Outfield.js';
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
        this.isPlayerControlled=false;
        this.yukaPlayer= new YUKA.Vehicle();
        this.yukaObstacle= new YUKA.GameEntity();
        this.statAttr={};
        this.team=team;

        if(this.posName !=='goalkeeper'){
            this.animations=['idle','jog_forward','jog_backward','soccer_sprint','header',
        'soccer_pass','standing_up','strike_forward','tackle','tackle_react','throw_in','jumping_header'];
        }
        else{
            this.animations=['idle','jog_forward','soccer_sprint','soccer_ pass','standing_up',
            'strike_forward','tackle_react','gk_body_block_left','gk_body_block_right','gk_drop_kick',
           'gk_idle_ball','gk_idle_no_ball','gk_low_catch','gk_medium_catch','gk_overhand_throw','gk_pass',
         'gk_placing_ball_quick','gk_placing_ball_slow','gk_save_left','gk_save_right','gk_sidestep_left','gk_sidestep_right'];
        }
        
    }
    SetPlayer(scene,target,goalassignment,shade,rot,size,offsetX,offsetY,offsetZ){

       target.scale.setScalar(size);
       target.position.y=-3.5;
       this.player= new ExtendedObject3D();
       const boundingBox= new THREE.Box3();
       const boundingSphere = new THREE.Sphere();
       this.player.add(target);
       this.player.userData.postassignment=goalassignment;
       this.player.userData.isPlayerControlled=this.isPlayerControlled;
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
        this.head=scene.physics.add.sphere({x:0,y:-1500,z:0 ,radius:0.4,mass:1,collisionFlags:2,collisionGroup:2,collisionMask:4})
        this.head.customParams = {c}
        this.head.userData.bodyPartName='Head'
        this.head.name='Body Part'
        this.head.userData.parent=this;
        this.head.visible=false;
        this.head.body.needUpdate = true
        }
       }

       if(c.isMesh){
        c.geometry.computeBoundingBox();
        boundingBox.expandByObject(c);
       }

       
       })

      const anim = new GLTFLoader();

 anim.loadAsync('./animations/Player_Actions/offensive_idle.gltf').then(anim=>{
   // this.player.add(anim);
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
      this.player.rotateY(rot); 
      scene.add.existing(this.player);
      this.yukaPlayer.setRenderComponent(this.player,this.yukaSync);
      scene.physics.add.existing(this.player,{/*shape:'capsule',radius:0.25,height:4.5*/shape:'cylinder',radius:0.3,height:7,margin:0.01,mass:5,collisionGroup:8,collisionMask:13});
      this.player.body.setFriction(0.8);
      this.player.body.setAngularFactor(0, 0, 0);
      this.player.body.setBounciness(0.25);
      this.player.userData.objtype='player';
      this.player.userData.role=this.posName;
      this.player.children[0].children[1].material.color=shade;
      this.player.children[0].children[2].material.color=shade;
      this.player.children[0].children[6].material.color=shade;
      this.playerClone=SkeletonUtils.clone(target);

      this.yukaPlayer.position.copy(this.player.position);
      this.yukaObstacle.position.copy(this.player.position);
     // this.player.matrixAutoUpdate=false;
     boundingBox.getBoundingSphere(boundingSphere);
    // console.log("Bounding Sphere Center:", boundingSphere);
    // console.log("Bounding Sphere Radius:", boundingSphere.radius);
     this.yukaPlayer.maxSpeed=3;
     //optimize bounding radius later
      this.yukaPlayer.boundingRadius=0.8//boundingSphere.radius;
      this.yukaPlayer.smoother=new YUKA.Smoother(45);
      this.yukaObstacle.boundingRadius=0.8//boundingSphere.radius;

      //this.player.visible=false;


    
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

     const randYMod=Math.round(Math.random() * (30 - 0) + 0);
     const randStraightMod=Math.round(Math.random() * (60 - 10) + 10);
     const randShortBallMod=Math.round(Math.random() * (30 - 10) + 10);
     const randLongBallMod=Math.round(Math.random() * (60 - 31) + 31);
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
      this.player.body.setAngularVelocityY(0);
      const x=Math.sin(thetaPlayer)*acc,
        y= this.player.body.velocity.y,
        z= Math.cos(thetaPlayer)*acc
        this.distBall=this.player.position.distanceTo(this.ball.position);
        this.player.userData.distBall=this.distBall;
        this.player.userData.dotP=dotP;
      //console.log('dot:',dotP);
      // optimiza animation stuttering bug

    const director=scene.scene.getObjectByName('Director');
    if(this.player.children[1]===director){

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
        
        //for very high balls do a header later

       
          })

          this.keyboard.once.down('KeyJ', keyCode => {

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
                      this.player.body.setVelocity(x*1.65,y,z*1.65);
                    }
                  
      }
    }
    if(this.player.children[1]!==director){
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
   

   if(this.shoot && this.ball.position.y<=4 && (this.distBall<=4.5 && this.distBall>=2.0) && (dotP>=0.50)){ 

    //always reset forces to ensure previous force does not mulitply the new force
    this.ball.body.setVelocity(0,0,0);
    this.ball.body.setAngularVelocity(0,0,0);

      // remember to account for player direction 
      // use random range to adjust power

    // low shot with curve- use regular torque, set y=0 set x and z to extrapolate based on player direction
    
   // this.ball.body.applyImpulse({x:this.playerTurn.x*randShotMod,y:0,z:this.playerTurn.z*randShotMod},{x:0,y:0,z:0});


    //aerial shots with curve - use force,torque and gravity and settimeout; set x and z to extrapolate based on player direction and set y to give height


    // straight shots without curve-  use force only x and z have same multiplier y gives height
    this.ball.body.applyImpulse({x:this.playerTurn.x*randShotMod,y:randYMod,z:this.playerTurn.z*randShotMod},{x:0,y:0,z:0});
    console.log("Y:",randYMod);
    console.log("X or Z",randShotMod);

    // experimental special shots- use force, torque, gravity, impulse and settimeout (WIP)


 
// testing random things
    
   /* this.ball.body.applyForce(15,0,10);
    this.ball.body.applyTorque(-200,0,0)
   //this.ball.body.applyTorqueImpulse(); 
   setTimeout(() => {
    this.ball.body.applyTorqueImpulse(-400,0,0);
    //this.ball.body.setGravity(0,-9.81,-12);
    //this.ball.body./*setVelocityapplyForce(17,-2,-9);
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


 if(this.pass &&this.ball.position.y<=4 && (this.distBall<=4.5 && this.distBall>=2.0) && (dotP>=0.50)){
  this.ball.body.setVelocity(0,0,0);
  this.ball.body.setAngularVelocity(0,0,0);
   
  // remember to account for player direction 
  // use random range to adjust power

    // low pass with curve- use regular torque, set y=0 set x and z to extrapolate based on player direction

    // add torque maybe use set timeout

    //aerial pass/cross/longball with curve-  use force,torque and gravity and settimeout; set x and z to extrapolate based on player direction and set y to give height

    // straight pass/cross/longball without curve-  use force only x and z have same multiplier y gives height
    this.ball.body.applyImpulse({x:this.playerTurn.x*randPassMod,y:0,z:this.playerTurn.z*randPassMod},{x:0,y:0,z:0});
    console.log("X or Z",randPassMod);
    // experimental special pass- use force, torque, gravity, impulse and settimeout (WIP)

    }

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
      this.leftLeg.body.setBounciness(0.05);
      this.leftLeg.body.needUpdate = true
      }
    if (this.rightLeg && this.rightLeg.body) {
      const child = this.rightLeg.customParams.c
      const pos = child.getWorldPosition(new THREE.Vector3())
      this.rightLeg.position.copy(pos)
      this.rightLeg.position.y=pos.y+0.3;
      this.rightLeg.rotation.copy(child.rotation)
      this.rightLeg.body.setBounciness(0.05);
      this.rightLeg.body.needUpdate = true
      }

      if (this.leftFoot && this.leftFoot.body) {
        const child = this.leftFoot.customParams.c
        const pos = child.getWorldPosition(new THREE.Vector3())
        this.leftFoot.position.copy(pos)
        this.leftFoot.position.y=pos.y+0.05
        this.leftFoot.rotation.copy(this.player.rotation);
        this.leftFoot.body.setBounciness(0.05);
        this.leftFoot.body.needUpdate = true
        }
      if (this.rightFoot && this.rightFoot.body) {
        const child = this.rightFoot.customParams.c
        const pos = child.getWorldPosition(new THREE.Vector3())
        this.rightFoot.position.copy(pos);
        this.rightFoot.position.y=pos.y+0.05;
        this.rightFoot.rotation.copy(this.player.rotation);
        this.rightFoot.body.setBounciness(0.05);
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
    this.entityManager.add(this.yukaObstacle);
}
yukaSync(entiity,renderComponent){
    renderComponent.matrix.copy(entiity.worldMatrix);
}


  _updateYuka(scene){
        
    if(this.yukaPlayer&&this.player&&this.yukaObstacle){

      //TODO:
      // seek with ball- seek and move the ball around
      //seek without ball- seek the ball when not within possession range
      // Pursuit- seek the ball by chasing the player with the ball till you get to seek range
      //Arrive for GK- move around box and look at the ball for good positioning
      //Obstacle avoidance- when in seeking range of ball go around the player to jostle for the ball or avoid those without the ball and when with the ball move the ball around to avoid other players

      const SeekWBall= this.yukaPlayer.steering.behaviors[0];
      const PursueBall=this.yukaPlayer.steering.behaviors[1]; 
      const AvoidPlayer=this.yukaPlayer.steering.behaviors[2]; 
      const ArriveBall=this.yukaPlayer.steering.behaviors[3];

      const yukaSpeed=this.yukaPlayer.getSpeed();
      this.yukaPlayer.position.copy(this.player.position);
      this.yukaObstacle.position.copy(this.player.position);
      AvoidPlayer.active=true;

   // console.log('yuka speed',yukaSpeed);

      

     if(this.player.userData.isPlayerControlled==false){
      //TODO:set animation based on speed
      if(scene.isyukaBehavior==true){
        this._distanceCheck(SeekWBall,PursueBall,ArriveBall);
        if((SeekWBall.active== true || PursueBall.active==true)&& this.distBall<35){
          this.player.body.setVelocity(this.yukaPlayer.velocity.x,this.player.body.velocity.y,this.yukaPlayer.velocity.z);
         }
      }

     
       //movement criteria for seek and pursuit behavior
     
       
      this.player.matrixAutoUpdate=false;   
     
    }
    else{
      SeekWBall.active=false;
      PursueBall.active=false;
      ArriveBall.active=false;
      this.player.matrixAutoUpdate=true;
    }
  }
  

  }

  _distanceCheck(SeekWBall,PursueBall,ArriveBall){
    if(this.distBall<=6){
      SeekWBall.active=true;
      PursueBall.active=false;
      ArriveBall.active=true;
      this.yukaPlayer.maxSpeed=3.5;

      if(this.player.anims.current=='idle'||this.player.anims.current=='soccer_sprint'){
        this.player.anims.play('jog_forward');
      }
    }

    //close control seek behavior
    if(this.distBall>6&&this.distBall<10){
      SeekWBall.active=true;
      PursueBall.active=false;
      this.yukaPlayer.maxSpeed=3.5;

      if(this.player.anims.current=='idle'||this.player.anims.current=='soccer_sprint'){
        this.player.anims.play('jog_forward');
      }
    }

    //Seek Behavior starts here
    if(this.distBall>=10&&this.distBall<15.0){
      SeekWBall.active=true;
      PursueBall.active=false;
      this.yukaPlayer.maxSpeed=4.5;

      if(this.player.anims.current=='idle'|| this.player.anims.current=='soccer_sprint'){
        this.player.anims.play('jog_forward');
      }
    }

    //Pursuit Behavior Starts here
    if(this.distBall>=15 && this.distBall<40){
      SeekWBall.active=false;
      PursueBall.active=true;
      this.yukaPlayer.maxSpeed=6;
      if(this.player.anims.current=='idle'|| this.player.anims.current=='jog_forward'){
        this.player.anims.play('soccer_sprint');
      }

     }
  }
  
}
