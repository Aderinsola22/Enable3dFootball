import {Scene3D,ExtendedObject3D ,THREE } from 'enable3d'
import { MatchScene } from '../core/MatchScene';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { KeeperStates } from '../statemachine/KeeperStates.js';
import {Team} from './Team.js';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js';
import { Keyboard } from '@yandeu/keyboard';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as YUKA from 'yuka';


export class Keeper{
    constructor(model,playerName,ball,team=null){
        this.model=model;
        this.player=null;
        this.posName='goalkeeper';
        this.playerName=playerName;
        this.keyboard = new Keyboard();
        this.keyboard.pause();
        this.animations=['jog_forward','soccer_sprint','soccer_pass','standing_up_ip',
        'strike_forward','tackle_react_ip','gk_body_block_left_ip','gk_body_block_right_ip','gk_drop_kick_ip',
       'gk_idle_ball','gk_idle_no_ball','gk_low_catch_ip','gk_medium_catch_ip','gk_overhand_throw_ip','gk_pass_ip',
     'gk_placing_ball_quick_ip','gk_placing_ball_slow_ip','gk_save_left_ip','gk_save_right_ip','gk_sidestep_left_ip','gk_sidestep_right_ip'];
        this.ball=ball;
        this.isanticipated=false;
        this.distBall=null;
        this.distPost=null;
        this.isPlayerControlled=false;
        this.yukaPlayer= new YUKA.Vehicle();
        this.yukaObstacle= new YUKA.GameEntity();
        this.statAttr={};
        this.team=team;
        this.saveDirection='Center';
        }

        SetPlayer(scene,target,goalassignment,shade,rot,size,offsetX,offsetY,offsetZ){
            target.scale.setScalar(size);
            target.position.y=-2.5;
            this.player= new ExtendedObject3D();
            const boundingBox= new THREE.Box3();
            const boundingSphere = new THREE.Sphere();
            this.player.add(target);
            this.player.userData.postassignment=goalassignment;
            this.player.name=this.playerName;
            this.player.userData.parent=this;
            this.player.traverse(c=>{
              c.shape='convex';
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
     
      anim.loadAsync('./animations/Player_Actions/gk_idle_no_ball.gltf').then(anim=>{
        scene.animationMixers.add(this.player.anims.mixer)
        this.player.anims.add('gk_idle_no_ball',anim.animations[0]);
        this.player.anims.play('gk_idle_no_ball');
      })
     
      this.animations.forEach(key=>{
         if(key==='idle')return
         anim.loadAsync(`./animations/Player_Actions/${key}.gltf`).then(anim=>{
          this.player.anims.add(key,anim.animations[0]);
         })
       })
      
           this.player.position.set(offsetX,offsetY,offsetZ);
           this.StartX = offsetX;
           this.StartZ=offsetZ;
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

           this.yukaPlayer.position.copy(this.player.position);
          this.yukaObstacle.position.copy(this.player.position);
          // this.player.matrixAutoUpdate=false;
          boundingBox.getBoundingSphere(boundingSphere);
         // console.log("Bounding Sphere Center:", boundingSphere);
         // console.log("Bounding Sphere Radius:", boundingSphere.radius);
          //TODO:optimize bounding radius later
          // this.yukaPlayer.boundingRadius=2//boundingSphere.radius;
           this.yukaPlayer.smoother=new YUKA.Smoother(60);
           this.yukaObstacle.boundingRadius= 2//this.yukaPlayer.boundingRadius  //boundingSphere.radius;
           this.yukaPlayer.name=this.playerName;
           this.yukaObstacle.name=this.playerName;
          this.yukaObstacle.smoother=new YUKA.Smoother(60);
           this.stateMachine=new KeeperStates(this.yukaPlayer,this,scene);
           this.stateMachine.changeTo('tendGoal');
          this.post=scene.scene.getObjectByName(this.player.userData.postassignment);
           //this.player.visible=false;
          // console.log(this.stateMachine);  

     
         }   
         _update(scene){

          //controls for manual mode
          this.W= this.keyboard.key('KeyW').isDown; //forward
          this.A= this.keyboard.key('KeyA').isDown; //left
          this.S= this.keyboard.key('KeyS').isDown; //Back
          this.D= this.keyboard.key('KeyD').isDown; //right
          this.Sprint= this.keyboard.key('ShiftLeft').isDown; //sprint
          this.Jump= this.keyboard.key('Space').isDown; //jump to save
          this.pass= this.keyboard.key('KeyJ').isDown; //pass/stand tackle
          this.shoot= this.keyboard.key('KeyK').isDown; //shoot/slide tackle
          this.changePlayer=this.keyboard.key('KeyL').isDown;//change player
          this.anticipationMode=this.keyboard.key('ControlLeft').isDown;//toggle anticipation save mode  //do different code for this
          
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
              
            /*  const cross =new THREE.Vector3().crossVectors(this.playerTurn,directBall);
            // console.log("Cross",cross.y);
              const diveDirection= new THREE.Vector3();
                if(dotP>0){
                  if(cross.y>0){diveDirection.crossVectors(this.player.up,this.playerTurn).normalize(); this.saveDirection='Left'; }
                  else if(cross.y<0) {diveDirection.crossVectors(this.playerTurn,this.player.up).normalize(); this.saveDirection='Right';}
                  else{this.saveDirection='Center'}
                 // console.log("Dive Direction",diveDirection);
                }   */

              const x=Math.sin(thetaPlayer)*acc,
                y= this.player.body.velocity.y,
                z= Math.cos(thetaPlayer)*acc
                this.distBall=this.player.position.distanceTo(this.ball.position);
                this.player.userData.distBall=this.distBall;
                this.postTrack(scene);

                this.player.userData.dotP=dotP;

                this.director=scene.scene.getObjectByName('Director');
                if(this.player.children[1]===this.director){
            
                if(this.keyboard._isPaused === true){
            
                  setTimeout(() => { 
                    this.keyboard._isPaused=false
                    this.keyboard.resume();
                  }, 500);
                }
                  if(this.keyboard._isPaused === false){
                //implement animations here
                //TODO: redo entire code section with aniticipation mode in mind 
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
                 //TODO: skip for now and fix animation blending for shooting and passing and goalkeeper saving
                 this.keyboard.once.down('KeyK', keyCode => {
          
                  //TODO: for low ball and mid balls
                  this.player.anims.play('strike_forward');
            
                  if(this.Sprint && this.W){
                    this.player.anims.get('strike_forward').crossFadeTo(this.player.anims.get('soccer_sprint'),2,true);
            
                  }
            
                  if(this.W){
                    this.player.anims.get('strike_forward').crossFadeTo(this.player.anims.get('jog_forward'),2,true);
                  }
                  else{
                    this.player.anims.get('strike_forward').crossFadeTo(this.player.anims.get('gk_idle_no_ball'),2,true);
          
                  }
                  
                  //TODO: for very high balls do a header later
          
                 
                    })
          
                    this.keyboard.once.down('KeyJ', keyCode => {
          
                      //TODO: for low ball and mid balls
                      this.player.anims.play('soccer_pass');
                      if(this.Sprint && this.W){
                        this.player.anims.get('soccer_pass').crossFadeTo(this.player.anims.get('soccer_sprint'),2,true);
                      }
                
                      if(this.W){
                        this.player.anims.get('soccer_pass').crossFadeTo(this.player.anims.get('jog_forward'),2,true);
                
                      }
                      else{
                        this.player.anims.get('soccer_pass').crossFadeTo(this.player.anims.get('gk_idle_no_ball'),2,true);
                
                      }
          
                      //TODO: for very high balls do a header later
                    
                          }) 
                  //TODO: add anticipation code here

                  this.keyboard.once.down('Space',keyCode =>{

                    if(this.saveDirection=='Left'){
                      this.player.anims.play('gk_save_left_ip');
                    this.player.anims.get('gk_save_left_ip').crossFadeTo(this.player.anims.get('gk_idle_no_ball'),5,true);
                    }
                   else if(this.saveDirection=='Right'){
                      this.player.anims.play('gk_save_right_ip');
                      this.player.anims.get('gk_save_right_ip').crossFadeTo(this.player.anims.get('gk_idle_no_ball'),5,true);
                    }
                    else{
                      //TODO: add central saving later
                    }
                   
                  })  
          
          
                          this.keyboard.on.up('KeyW', keyCode => {
                            this.player.anims.play('gk_idle_no_ball');
                            })  
                            
                            this.keyboard.once.up('ShiftLeft', keyCode => {
                      
                              if(this.W){
                                this.player.anims.play('jog_forward');
                              }
                              else{
                                this.player.anims.play('gk_idle_no_ball');
                              }
                              }) 
                

                  //implement controls here
                  if(this.W){
                    this.player.body.setVelocity(x,y,z);
                  }
                  
                if(this.A){
                  this.player.body.setAngularVelocityY(acc*1); 
                  
                }

                if(this.S){
                  this.player.body.setVelocity(-x,y,-z);
                }

                if(this.D){
                  this.player.body.setAngularVelocityY(acc*-1);
                }
                
                if(this.Sprint && this.W){
                    this.player.body.setVelocity(x*1.35,y,z*1.35);
                  }

                /*  if(this.Jump && this.player.position.y<5 && (this.saveDirection=='Left' || this.saveDirection=='Right')){
                    //mid-high shot 
                  //  this.player.body.setVelocity(7*diveDirection.x,7,7*diveDirection.z);

                    //TODO: low shot


                    
                   }*/
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
              }   
              this.keyboard.once.down('KeyL', keyCode => {
     
                if(this.keyboard._isPaused===false){
                  setTimeout(() => { 
                  this.keyboard.pause();
                  this.player.anims.play('gk_idle_no_ball');
                  }, 1000);
        
                }
                else{
                  setTimeout(() => { 
                  this.keyboard.resume()
                }, 500);
                }
          
            })
              //if player is in range and kicks the ball automatically assume he touched it
              // TODO: for shooting and Passing ensure keeper is not in the states where they are holding the ball
            if(this.shoot && this.ball.position.y<=4 && (this.distBall<=4.5 && this.distBall>=2.0) && (dotP>=0.40)){ 

                this.ball.body.setVelocity(0,0,0);
                this.ball.body.setAngularVelocity(0,0,0);

                this.ball.body.applyImpulse({x:this.playerTurn.x*randShotMod,y:randYMod,z:this.playerTurn.z*randShotMod},{x:0,y:0,z:0});

                this.team.lastTouched=true;
                this.team.opponent.lastTouched=false;
                scene.ball.possessorTeamClass=this.team;
                scene.ball.possessorTeam=scene.ball.possessorTeamClass.teamName;
                scene.ball.possessorClass=this;
                scene.ball.possessor=scene.ball.possessorClass.playerName;

                this.ball.userData.isKicked=true;
                setTimeout(()=>{
               this.ball.userData.isKicked=false;
               },1500);
            //   console.log('Possessor:',scene.ball.possessor);
            //   console.log('PossessorTeam:',scene.ball.possessorTeam);  
              }

              if(this.pass &&this.ball.position.y<=4 && (this.distBall<=4.5 && this.distBall>=2.0) && (dotP>=0.40)){
                this.ball.body.setVelocity(0,0,0);
                this.ball.body.setAngularVelocity(0,0,0);
                     
                this.ball.body.applyImpulse({x:this.playerTurn.x*randPassMod,y:0,z:this.playerTurn.z*randPassMod},{x:0,y:0,z:0});

                this.team.lastTouched=true;
                this.team.opponent.lastTouched=false;
                scene.ball.possessorTeamClass=this.team;
                scene.ball.possessorTeam=scene.ball.possessorTeamClass.teamName;
                scene.ball.possessorClass=this;
                scene.ball.possessor=scene.ball.possessorClass.playerName;

                this.ball.userData.isKicked=true;
                setTimeout(()=>{
                this.ball.userData.isKicked=false;
                 },1500);
               //  console.log('Possessor:',scene.ball.possessor);
                // console.log('PossessorTeam:',scene.ball.possessorTeam);  
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
                this.rightFoot.body.needUpdate = true
                }
        
             if (this.chest && this.chest.body) {
                  const child = this.chest.customParams.c
                  const pos = child.getWorldPosition(new THREE.Vector3())
                  this.chest.position.copy(pos)
                  this.chest.rotation.copy(this.player.rotation)
                  this.chest.body.needUpdate = true
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
      }
      yukaSync(entiity,renderComponent){
          renderComponent.matrix.copy(entiity.worldMatrix);
      }
         _updateYuka(scene){
          if(this.yukaPlayer&&this.player && this.yukaObstacle){


            const TendPost=this.yukaPlayer.steering.behaviors[1];
            const ResetPos= this.yukaPlayer.steering?.behaviors[2];

            const yukaSpeed=this.yukaPlayer.getSpeed();
            this.yukaPlayer.position.copy(this.player.position);
            this.yukaObstacle.position.copy(this.player.position);

          if(this.player.userData.isPlayerControlled==false && ResetPos?.active!=true){
            
              this.stateMachine.update(scene);
              if(scene.isyukaBehavior==true){


                if(!this.stateMachine.in('saveBall')){
                  this._speedToAnimations(yukaSpeed);
                }
              // this._distanceCheck(scene);
                //use here for passing shootung descision making

               if(TendPost.weight==1 && (TendPost.target == scene.tendPositionTeam1GK || TendPost.target == scene.tendPositionTeam2GK )){
                this.yukaPlayer.updateOrientation=false;
                this.yukaPlayer.lookAt({x:this.ball.position.x,y:3,z:this.ball.position.z});
               }
               if(TendPost.weight==1){
                this.player.body.setVelocity(this.yukaPlayer.velocity.x,this.player.body.velocity.y,this.yukaPlayer.velocity.z);
               }

               else{
                if(!this.stateMachine.in('saveBall')){
                this.yukaPlayer.rotation.set(0,0,0,1);
                this.player.body.setVelocity(0,0,0);
              }
              }
              }  
             else if(scene.isyukaBehavior==false){
              if(this.stateMachine.in('goalKick')){
                if(this.player.distBall>7){
                  this._speedToAnimations(yukaSpeed);
                }

               // this.yukaPlayer.updateOrientation=true;
                this.stateMachine.update(scene);
                this.player.body.setVelocity(this.yukaPlayer.velocity.x,this.player.body.velocity.y,this.yukaPlayer.velocity.z);
              }
              else{
                this.yukaPlayer.updateOrientation=false;
                this.yukaPlayer.rotation.set(0,0,0,1);
                this.player.body.setVelocity(0,0,0);
              }

              }      
              this.player.matrixAutoUpdate=false;     
            }
            else if(ResetPos?.active==true){
              this.yukaPlayer.updateOrientation=true;
              this.stateMachine.update(scene);
            }
            else{
              this.player.matrixAutoUpdate=true;
            }
          }
         }

         _hasArrived(resetPosition,scene){
          const distToReset= this.player.position.distanceTo(resetPosition?.target);
          

          if(distToReset<=2.5){
            this.ResetDone= true;
        
          }
          if (distToReset>2.5){
            this.ResetDone=false;
          }
         } 
        _speedToAnimations(speed){
          if(speed<0.5){
            if(this.player.anims.current!=='gk_idle_no_ball'){
              this.player.anims.play('gk_idle_no_ball');
            }
          }
           if(speed>=0.5 && speed<4){
            if(this.player.anims.current!=='jog_forward'){
              this.player.anims.play('jog_forward');
            }
          }
          if(speed>=4){
            if(this.player.anims.current!=='soccer_sprint'){
              this.player.anims.play('soccer_sprint');
            }
          }
        }                                                            
        

      _distanceCheck(scene){
   //console.log(this.team.teamName,this.player.name,this.distBall);
  
   //keeper possesor
   if(scene.ball.possessorClass==this && scene.ball.possessorTeamClass==this.team){
   
  }
  //keeper not possessor
  else if(scene.ball.possessorClass!=this && scene.ball.possessorTeamClass==this.team){
   
  }

  //opponent
  else if(scene.ball.possessorClass!=this && scene.ball.possessorTeamClass!=this.team){
  
  }


      /*  const velocity= this.ball.body.velocity;
        const speed= Math.sqrt((velocity.x**2)+(velocity.z**2))
      //  console.log("Ball veloity",velocity);
       // console.log("Ball Speed",speed);            
        let offsideLineToBall,opponentX,offsideLineToOpponentPossessor
        if(scene.ball.possessorTeamClass !=this.team){
         offsideLineToBall= Math.abs(this.ball.position.x)-Math.abs(this.team.OFSLposx);
         opponentX=scene.ball.possessorClass.player.position.x;
         offsideLineToOpponentPossessor=Math.abs(opponentX)-Math.abs(this.team.OFSLposx);

       // console.log('OffsideLine X',this.team.OFSLposx)
       // console.log(this.team.teamName,"Ball Offside",offsideLineToBall);
       // console.log(this.team.teamName,'Opponent Offside',offsideLineToOpponentPossessor);

       if(offsideLineToBall>0 && offsideLineToOpponentPossessor>0 ){
        //determine if teammate can reach the attacker  (distBall for teammate is less than 10)

        //determine if the ball is too fast and/or too far for the attacker (distBall for opponent possessor >15 )
        // all or some are true GK intercept  else remain in tendState
      
      }  
     else if(offsideLineToBall >0){
        if(this.distBall< 50 && this.distBall>20){
        if(!this.stateMachine.in('interceptBall')){ 
          this.stateMachine.changeTo('interceptBall');
         }
        }
      }

      else{
        if(!this.stateMachine.in('tendGoal')){ 
          this.stateMachine.changeTo('tendGoal');
         }
      }
      
        }
        else{
          if(!this.stateMachine.in('tendGoal')){ 
            this.stateMachine.changeTo('tendGoal');
           }
        }
        */
      }

      
      postTrack(scene){
        if(this.post.name==this.player.userData.postassignment){
          this.distPost=this.player.position.distanceTo(this.post.position);
          this.player.userData.distPost=this.distPost;
        }
        
      }


}