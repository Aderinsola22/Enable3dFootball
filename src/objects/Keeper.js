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
        this.framecounter=0;
        this.powerBar=document.querySelector('.power-bar-fill');
        this.powerBarFill=0;
        this.powerBarFillSpeed=0.75;
        this.powerBarMaxFill=100;
        this.currKey=null;
        this.finalKey=null;
        this.ballCaught=false;
        this.saveDirection='Center';
        this.directVec=new THREE.Vector3();
        this.directBall= new THREE.Vector3();
        this.sharedPos = new THREE.Vector3();
        this.sharedBox = new THREE.Box3();
        this.sharedFootToBall = new THREE.Vector3();
        this.handMidpoint=new THREE.Vector3();
        this.parts={
          leftArm:null,
          rightArm:null,
          leftHand:null,
          rightHand:null,
          leftLeg:null,
          rightLeg:null,
          leftFoot:null,
          rightFoot:null,
          chest:null,
          head:null
       };
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
              c.shape='convex';
              if(c.name==="mixamorig5LeftForeArm"){
                if(!this.parts.leftArm){
                  this.parts.leftArm = scene.physics.add.box({x:0,y:-1500,z:0 , width: 0.5, height: 1.5, depth: 0.35 ,mass:0.5,collisionFlags:2,collisionGroup:2,collisionMask:4})
                  this.parts.leftArm.customParams = {c}
                  this.parts.leftArm.userData.bodyPartName='Left Arm'
                  this.parts.leftArm.userData.parent=this;
                  this.parts.leftArm.name='Body Part'
                  this.parts.leftArm.visible=false;
                  this.parts.leftArm.body.needUpdate = true;
                }
              }
              
              if(c.name==="mixamorig5LeftHand"){
                if(!this.parts.leftHand){
                  this.parts.leftHand = scene.physics.add.box({x:0,y:-1500,z:0 , width: 1.15, height: 1.15, depth: 1.15,mass:0.5,collisionFlags:2,collisionGroup:2,collisionMask:4})
                  this.parts.leftHand.customParams = {c}
                  this.parts.leftHand.userData.bodyPartName='Left Hand'
                  this.parts.leftHand.userData.parent=this;
                  this.parts.leftHand.name='Body Part'
                  this.parts.leftHand.visible=false;
                  this.parts.leftHand.body.needUpdate = true
                }
              }
              
              if(c.name==="mixamorig5RightForeArm"){
                if(!this.parts.rightArm){
                  this.parts.rightArm = scene.physics.add.box({x:0,y:-1500,z:0 , width: 0.5, height: 1.5, depth: 0.35 ,mass:0.5,collisionFlags:2,collisionGroup:2,collisionMask:4})
                  this.parts.rightArm.customParams = {c}
                  this.parts.rightArm.userData.bodyPartName='Right Arm'
                  this.parts.rightArm.userData.parent=this;
                  this.parts.rightArm.name='Body Part'
                  this.parts.rightArm.visible=false;
                  this.parts.rightArm.body.needUpdate = true
                }
              }
              
              if(c.name==="mixamorig5RightHand"){
                if(!this.parts.rightHand){
                  this.parts.rightHand = scene.physics.add.box({x:0,y:-1500,z:0 ,width: 1.15, height: 1.15, depth: 1.15,mass:0.5,collisionFlags:2,collisionGroup:2,collisionMask:4})
                  this.parts.rightHand.customParams = {c}
                  this.parts.rightHand.userData.bodyPartName='Right Hand'
                  this.parts.rightHand.userData.parent=this;
                  this.parts.rightHand.name='Body Part'
                  this.parts.rightHand.visible=false;
                  this.parts.rightHand.body.needUpdate = true
                }
              }
              
              if(c.name==="mixamorig5LeftLeg"){
                if(!this.parts.leftLeg){
                  this.parts.leftLeg = scene.physics.add.box({x:0,y:-1500,z:0 ,width: 0.5, height: 1.5, depth: 0.35 ,mass:0.5,collisionFlags:2,collisionGroup:2,collisionMask:4})
                  this.parts.leftLeg.customParams = {c}
                  this.parts.leftLeg.userData.bodyPartName='Left Leg'     
                  this.parts.leftLeg.userData.parent=this;
                  this.parts.leftLeg.name='Body Part'
                  this.parts.leftLeg.visible=false;
                  this.parts.leftLeg.body.needUpdate = true
                }
              }
              
              if(c.name==="mixamorig5RightLeg"){
                if(!this.parts.rightLeg){
                  this.parts.rightLeg = scene.physics.add.box({x:0,y:-1500,z:0 , width: 0.5, height: 1.5, depth: 0.35 ,mass:0.5,collisionFlags:2,collisionGroup:2,collisionMask:4})
                  this.parts.rightLeg.customParams = {c}
                  this.parts.rightLeg.userData.bodyPartName='Right Leg'
                  this.parts.rightLeg.userData.parent=this;
                  this.parts.rightLeg.name='Body Part'
                  this.parts.rightLeg.visible=false;
                  this.parts.rightLeg.body.needUpdate = true
                }
              }
              
              if(c.name==="mixamorig5LeftFoot"){
                if(!this.parts.leftFoot){
                  this.parts.leftFoot = scene.physics.add.box({x:0,y:-1500,z:0 , width: 0.75, height: 0.5, depth: 1,mass:2,collisionFlags:2,collisionGroup:2,collisionMask:4})
                  this.parts.leftFoot.customParams = {c}
                  this.parts.leftFoot.userData.bodyPartName='Left Foot'
                  this.parts.leftFoot.userData.parent=this;
                  this.parts.leftFoot.name='Body Part'
                  this.parts.leftFoot.visible=false;
                  this.parts.leftFoot.body.needUpdate = true
                }
              }
              
              if(c.name==="mixamorig5RightFoot"){
                if(!this.parts.rightFoot){
                  this.parts.rightFoot = scene.physics.add.box({x:0,y:-1500,z:0 , width: 0.75, height: 0.5, depth: 1,mass:2,collisionFlags:2,collisionGroup:2,collisionMask:4})    
                  this.parts.rightFoot.customParams = {c}
                  this.parts.rightFoot.userData.bodyPartName='Right Foot'
                  this.parts.rightFoot.userData.parent=this;
                  this.parts.rightFoot.name='Body Part'
                  this.parts.rightFoot.visible=false;
                  this.parts.rightFoot.body.needUpdate = true
                }
              }
              
              if(c.name==="mixamorig5Spine"){
                if(!this.parts.chest){
                  this.parts.chest = scene.physics.add.box({x:0,y:-1500,z:0 ,width: 0.75, height: 2, depth: 1,mass:1,collisionFlags:2,collisionGroup:2,collisionMask:4})
                  this.parts.chest.customParams = {c}
                  this.parts.chest.userData.bodyPartName='Chest'
                  this.parts.chest.name='Body Part'
                  this.parts.chest.userData.parent=this;
                  this.parts.chest.visible=false;
                  this.parts.chest.body.needUpdate = true
                }
              }
              
              if(c.name==="mixamorig5Head"){
                if(!this.parts.head){
                  this.parts.head = scene.physics.add.sphere({x:0,y:-1500,z:0 ,radius:0.6,mass:1,collisionFlags:2,collisionGroup:2,collisionMask:4})
                  this.parts.head.customParams = {c}
                  this.parts.head.userData.bodyPartName='Head'
                  this.parts.head.name='Body Part'
                  this.parts.head.userData.parent=this;
                  this.parts.head.visible=false;
                  this.parts.head.body.needUpdate = true
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
        // this.anticipationMode=this.keyboard.key('ControlLeft').isDown;//toggle anticipation save mode  //do different code for this
          
          let randYMod= 0;
          // const randStraightMod=Math.round(Math.random() * (60 - 10) + 10);
          // const randShortBallMod=Math.round(Math.random() * (30 - 10) + 10);
          // const randLongBallMod=Math.round(Math.random() * (60 - 31) + 31);
           let randShotMod=0;
           let randPassMod=0;

            if(this.player&&this.player.body){
              let acc= 4;
              this.playerTurn=this.player.getWorldDirection(this.directVec);
              this.directBall.subVectors(this.ball.position,this.player.position).normalize();
              const dotP=this.playerTurn.dot(this.directBall);
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
                const arrow= this?.director?.children[2]?.material?.color;
                const arrowRed=arrow?.r;
                const arrowGreen=arrow?.g;
                const arrowBlue=arrow?.b;
                const inKickRange= (arrowRed==0 && arrowGreen==0 && arrowBlue==1) && (arrow != null || arrow != undefined) ? true : false;
                if(this.player.children[1]===this.director && scene.fullTimeCalled!=1){
            
                if(this.keyboard._isPaused === true){
                  this.keyboard._isPaused=false
                  this.keyboard.resume();
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
                 this.keyboard.once.up('KeyK', keyCode => {
                  //TODO: for low ball and mid balls
                  
                  //throw the ball
                if(this.ballCaught){
                  this.player.anims.get('strike_forward').reset();  
                  this.player.anims.play('strike_forward');

                  if(this.Sprint && this.W){
                  this.player.anims.get('strike_forward').crossFadeTo(this.player.anims.get('soccer_sprint'),2,true);
          
                }
          
               else if(this.W){
                  this.player.anims.get('strike_forward').crossFadeTo(this.player.anims.get('jog_forward'),2,true);
                }
                else{
                  this.player.anims.get('strike_forward').crossFadeTo(this.player.anims.get('gk_idle_no_ball'),2,true);
        
                }
                }
                else{
                    this.player.anims.get('strike_forward').reset();  
                    this.player.anims.play('strike_forward');

                    if(this.Sprint && this.W){
                    this.player.anims.get('strike_forward').crossFadeTo(this.player.anims.get('soccer_sprint'),2,true);
            
                  }
            
                 else if(this.W){
                    this.player.anims.get('strike_forward').crossFadeTo(this.player.anims.get('jog_forward'),2,true);
                  }
                  else{
                    this.player.anims.get('strike_forward').crossFadeTo(this.player.anims.get('gk_idle_no_ball'),2,true);
          
                  }
                 }
                  //TODO: for very high balls do a header later
          
                 
                    })
          
                    this.keyboard.once.up('KeyJ', keyCode => {
                  //TODO: for low ball and mid balls

                    //throw the ball
                    if(this.ballCaught){
                      this.player.anims.get('gk_overhand_throw_ip').reset();  
                      this.player.anims.play('gk_overhand_throw_ip');
  
                        if(this.Sprint && this.W){
                          this.player.anims.get('gk_overhand_throw_ip').crossFadeTo(this.player.anims.get('soccer_sprint'),2,true);
                        }
                  
                      else if(this.W){
                          this.player.anims.get('gk_overhand_throw_ip').crossFadeTo(this.player.anims.get('jog_forward'),2,true);
                  
                        }
                        else{
                          this.player.anims.get('gk_overhand_throw_ip').crossFadeTo(this.player.anims.get('gk_idle_no_ball'),2,true);
                  
                        }
                    }
                    else{  
                    this.player.anims.get('soccer_pass').reset();  
                    this.player.anims.play('soccer_pass');

                      if(this.Sprint && this.W){
                        this.player.anims.get('soccer_pass').crossFadeTo(this.player.anims.get('soccer_sprint'),2,true);
                      }
                
                    else if(this.W){
                        this.player.anims.get('soccer_pass').crossFadeTo(this.player.anims.get('jog_forward'),2,true);
                
                      }
                      else{
                        this.player.anims.get('soccer_pass').crossFadeTo(this.player.anims.get('gk_idle_no_ball'),2,true);
                
                      }
                    } 
                      //TODO: for very high balls do a header later
                    
                          }) 
                  //TODO: add anticipation code here

               /*   this.keyboard.once.down('Space',keyCode =>{

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
                   
                  })  */
          
          
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

               if(this.shoot && this.pass){
                                this.powerBarFill=0;
                                this.currKey=null;
                                this.powerBar.style.width=`${this.powerBarFill}%`;
                }
                
                else if(this.shoot || this.pass) {
                                const newKey = this.shoot ? 'shoot' : 'pass'; 
                                if(this.currKey !== newKey){
                                  this.powerBarFill=0;
                                  this.currKey = newKey;
                                }
                                if(this.powerBarFill< this.powerBarMaxFill){
                                    this.powerBarFill += this.powerBarFillSpeed;
                                    this.powerBar.style.width=`${this.powerBarFill}%`;
                                  }
                }   
                else if(!this.shoot && !this.pass){
                                    if(this.powerBarFill>9){
                                    //  console.log('power bar fill',this.powerBarFill);
                                     if(inKickRange || this.ballCaught){
                                      this.finalKey=this.currKey
                                    // console.log('last pressed key',this.finalKey);
                                    } 
                                    randShotMod=19+(this.powerBarFill/100)*(59-19);
                                    randPassMod=9+(this.powerBarFill/100)*(44-9);
                                    let randMin=THREE.MathUtils.randInt(0,7);
                                    if (this.powerBarFill < 60 ) {
                                       if(this.finalKey === 'shoot'){
                                        randYMod= THREE.MathUtils.randFloat(0, 0.99) + THREE.MathUtils.randInt(randMin,24*0.65);
                                        //rewrite with randshot formula if above does not work
                                       }
                                       else if(this.finalKey === 'pass'){
                                        randYMod= THREE.MathUtils.randFloat(0, 0.99) + THREE.MathUtils.randInt(0,4);
                                        //rewrite with randshot formula if above does not work
                                       }
                                    }
                
                                   else if (this.powerBarFill >= 60 ) {
                                      if(this.finalKey === 'shoot'){
                                        randYMod=THREE.MathUtils.randFloat(0, 0.99) + THREE.MathUtils.randInt(randMin,24)
                                        scene.ball.shotY=randYMod;
                                        
                                      }
                                      else if(this.finalKey === 'pass'){
                                        randYMod= THREE.MathUtils.randFloat(0, 0.99) + THREE.MathUtils.randInt(0,4);
                                      }
                                   }
                
                                    }
                                    this.powerBarFill=0;
                                    this.currKey=null;
                                    this.powerBar.style.width=`${this.powerBarFill}%`;
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

               else if(this.player.children[1]!==this.director || !this.player.userData.isPlayerControlled){
     if(this.keyboard._isPaused===false){
        this.keyboard._isPaused=true;
        this.keyboard.pause();
if(this.player.anims.current!=='gk_idle_no_ball'){
        this.player.anims.play('gk_idle_no_ball');
      }  
     }

      
    }


              //if player is in range and kicks the ball automatically assume he touched it
              // TODO: for shooting and Passing ensure keeper is not in the states where they are holding the ball

              if(this.finalKey==='shoot' && this.ball.position.y<=4 && inKickRange && !this.ball.userData.isKicked && !scene.field.eventHappened){ 
                this.finalKey=null;
                this.ball.body.setVelocity(0,0,0);
                this.ball.body.setAngularVelocity(0,0,0);
            
                
                scene.ball.shotX=this.playerTurn.x*randShotMod;
                scene.ball.shotY=randYMod;
                scene.ball.shotZ=this.playerTurn.z*randShotMod;
            
              
              //  console.log('shotX',scene.ball.shotX);
              //     console.log('shotY',scene.ball.shotY);
              //  console.log('shotZ',scene.ball.shotZ);
            
             //   const opponentGk=this.team.opponent.teamList.GK;
            
                this.team.lastTouched=true;
                this.team.opponent.lastTouched=false;
                scene.ball.possessorClass=null;
                scene.ball.possessor=null;
            
                /*if(!opponentGk.stateMachine.in('saveBall')||opponentGk.stateMachine.previousState===opponentGk.stateMachine.get('saveBall')){
                opponentGk.stateMachine.changeTo('saveBall');
                }*/
                this.ball.userData.isKicked=true;
                  this.ball.body.applyImpulse({x:scene.ball.shotX,y:scene.ball.shotY,z:scene.ball.shotZ},{x:0,y:0,z:0});
              

            
                setTimeout(()=>{
                this.ball.userData.isKicked=false;
              },1500);
            
              this.stateMachine.changeTo('tendGoal');

            
              }
            if(this.finalKey==='shoot' && this.ballCaught && this.distBall<2.6){
              this.finalKey=null;
              this.ballCaught=false;
              this.ball.userData.isKicked=true;
                if(this.ball.body.getCollisionFlags()!=0 && scene.eName !='GoalKick'){
                  this.ball.body.setCollisionFlags(0);
                  this.ball.body.setVelocity(0,0,0);
                  this.ball.body.setAngularVelocity(0,0,0);
                 this.ball.body.applyImpulse({x:this.playerTurn.x*randShotMod,y:randYMod,z:this.playerTurn.z*randShotMod},{x:0,y:0,z:0});

              }

              this.team.lastTouched=true;
              this.team.opponent.lastTouched=false;
              scene.ball.possessorTeamClass=this.team;
              scene.ball.possessorTeam=scene.ball.possessorTeamClass.teamName;
              scene.ball.possessorClass=this;
              scene.ball.possessor=scene.ball.possessorClass.playerName;

              setTimeout(()=>{
             this.ball.userData.isKicked=false;
             },1500);
             this.stateMachine.changeTo('tendGoal');
            }  

             if(this.finalKey==='pass' &&this.ball.position.y<=4 && inKickRange && !this.ball.userData.isKicked && !scene.field.eventHappened){
              this.finalKey=null;
              this.ball.body.setVelocity(0,0,0);
              this.ball.body.setAngularVelocity(0,0,0);
               
              
                const passX=this.playerTurn.x*randPassMod;
                const passY=randYMod;
                const passZ=this.playerTurn.z*randPassMod;
               // console.log('PassX',passX);
              //  console.log('PassY',passY);
               // console.log('PassZ',passZ);
                
                  this.ball.body.applyImpulse({x:passX,y:passY,z:passZ},{x:0,y:0,z:0});

            
              this.team.lastTouched=true;
              this.team.opponent.lastTouched=false;
              scene.ball.possessorTeamClass=this.team;
              scene.ball.possessorTeam=scene.ball.possessorTeamClass.teamName;
             
            
                this.ball.userData.isKicked=true;
                setTimeout(()=>{
                this.ball.userData.isKicked=false;
              },1500);
              this.stateMachine.changeTo('tendGoal');                        
                }
               if(this.finalKey==='pass' && this.ballCaught && this.distBall<2.6){
                this.finalKey=null;
                this.ballCaught=false;
                this.ball.userData.isKicked=true;

                if(this.ball.body.getCollisionFlags()!=0 && scene.eName !='GoalKick'){
                  this.ball.body.setCollisionFlags(0);
                  this.ball.body.setVelocity(0,0,0);
                  this.ball.body.setAngularVelocity(0,0,0);
                this.ball.body.applyImpulse({x:this.playerTurn.x*randPassMod,y:0,z:this.playerTurn.z*randPassMod},{x:0,y:0,z:0});
                }

                this.team.lastTouched=true;
                this.team.opponent.lastTouched=false;
                scene.ball.possessorTeamClass=this.team;
                scene.ball.possessorTeam=scene.ball.possessorTeamClass.teamName;
                scene.ball.possessorClass=this;
                scene.ball.possessor=scene.ball.possessorClass.playerName;

                setTimeout(()=>{
                this.ball.userData.isKicked=false;
                 },1500);
                 this.stateMachine.changeTo('tendGoal');
               }   
            }



           if (this.parts.leftArm && this.parts.leftArm.body) {
  const child = this.parts.leftArm.customParams.c;
  child.getWorldPosition(this.sharedPos);
  this.parts.leftArm.position.copy(this.sharedPos);
  this.parts.leftArm.rotation.copy(child.rotation);
  this.parts.leftArm.body.needUpdate = true;
  this.parts.leftArm.userData.Box = this.sharedBox.setFromObject(this.parts.leftArm);
}

if (this.parts.rightArm && this.parts.rightArm.body) {
  const child = this.parts.rightArm.customParams.c;
  child.getWorldPosition(this.sharedPos);
  this.parts.rightArm.position.copy(this.sharedPos);
  this.parts.rightArm.rotation.copy(child.rotation);
  this.parts.rightArm.body.needUpdate = true;
  this.parts.rightArm.userData.Box = this.sharedBox.setFromObject(this.parts.rightArm);
}

if (this.parts.leftHand && this.parts.leftHand.body) {
  const child = this.parts.leftHand.customParams.c;
  child.getWorldPosition(this.sharedPos);
  this.sharedPos.y -= 0.3;
  this.parts.leftHand.position.copy(this.sharedPos);
  this.parts.leftHand.rotation.copy(child.rotation);
  this.parts.leftHand.body.needUpdate = true;
  this.parts.leftHand.userData.Box = this.sharedBox.setFromObject(this.parts.leftHand);
}

if (this.parts.rightHand && this.parts.rightHand.body) {
  const child = this.parts.rightHand.customParams.c;
  child.getWorldPosition(this.sharedPos);
  this.sharedPos.y -= 0.3;
  this.parts.rightHand.position.copy(this.sharedPos);
  this.parts.rightHand.rotation.copy(child.rotation);
  this.parts.rightHand.body.needUpdate = true;
  this.parts.rightHand.userData.Box = this.sharedBox.setFromObject(this.parts.rightHand);
}

if (this.parts.leftLeg && this.parts.leftLeg.body) {
  const child = this.parts.leftLeg.customParams.c;
  child.getWorldPosition(this.sharedPos);
  this.sharedPos.y += 0.3;
  this.parts.leftLeg.position.copy(this.sharedPos);
  this.parts.leftLeg.rotation.copy(child.rotation);
  this.parts.leftLeg.body.needUpdate = true;
  this.parts.leftLeg.userData.Box = this.sharedBox.setFromObject(this.parts.leftLeg);
}

if (this.parts.rightLeg && this.parts.rightLeg.body) {
  const child = this.parts.rightLeg.customParams.c;
  child.getWorldPosition(this.sharedPos);
  this.sharedPos.y += 0.3;
  this.parts.rightLeg.position.copy(this.sharedPos);
  this.parts.rightLeg.rotation.copy(child.rotation);
  this.parts.rightLeg.body.needUpdate = true;
  this.parts.rightLeg.userData.Box = this.sharedBox.setFromObject(this.parts.rightLeg);
}

if (this.parts.leftFoot && this.parts.leftFoot.body) {
  const child = this.parts.leftFoot.customParams.c;
  child.getWorldPosition(this.sharedPos);
  this.sharedFootToBall.copy(this.ball.position).sub(this.parts.leftFoot.position);

  if (this.sharedFootToBall.length() < scene.ball.radius + 0.05) {
    this.sharedFootToBall.setLength(scene.ball.radius + 0.05);
    this.parts.leftFoot.position.copy(this.ball.position).sub(this.sharedFootToBall);
  } else {
    this.parts.leftFoot.position.copy(this.sharedPos);
  }

  this.parts.leftFoot.position.y = this.sharedPos.y + 0.05;
  this.parts.leftFoot.rotation.copy(this.player.rotation);
  this.parts.leftFoot.body.needUpdate = true;
  this.parts.leftFoot.userData.Box = this.sharedBox.setFromObject(this.parts.leftFoot);
}

if (this.parts.rightFoot && this.parts.rightFoot.body) {
  const child = this.parts.rightFoot.customParams.c;
  child.getWorldPosition(this.sharedPos);
  this.sharedFootToBall.copy(this.ball.position).sub(this.parts.rightFoot.position);

  if (this.sharedFootToBall.length() < scene.ball.radius + 0.05) {
    this.sharedFootToBall.setLength(scene.ball.radius + 0.05);
    this.parts.rightFoot.position.copy(this.ball.position).sub(this.sharedFootToBall);
  } else {
    this.parts.rightFoot.position.copy(this.sharedPos);
  }

  this.parts.rightFoot.position.y = this.sharedPos.y + 0.05;
  this.parts.rightFoot.rotation.copy(this.player.rotation);
  this.parts.rightFoot.body.needUpdate = true;
  this.parts.rightFoot.userData.Box = this.sharedBox.setFromObject(this.parts.rightFoot);
}

if (this.parts.chest && this.parts.chest.body) {
  const child = this.parts.chest.customParams.c;
  child.getWorldPosition(this.sharedPos);
  this.parts.chest.position.copy(this.sharedPos);
  this.parts.chest.rotation.copy(this.player.rotation);
  this.parts.chest.body.needUpdate = true;
  this.parts.chest.userData.Box = this.sharedBox.setFromObject(this.parts.chest);
}

if (this.parts.head && this.parts.head.body) {
  const child = this.parts.head.customParams.c;
  child.getWorldPosition(this.sharedPos);
  this.sharedPos.y += 0.3;
  this.parts.head.position.copy(this.sharedPos);
  this.parts.head.rotation.copy(this.player.rotation);
  this.parts.head.body.needUpdate = true;
  this.parts.head.userData.Box = this.sharedBox.setFromObject(this.parts.head);
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

           // console.log('player controlled',this.player.userData.isPlayerControlled);
            const TendPost=this.yukaPlayer.steering.behaviors[1];
            const ResetPos= this.yukaPlayer.steering.behaviors[2];

            const yukaSpeed=this.yukaPlayer.getSpeed();
            this.yukaPlayer.position.copy(this.player.position);
            this.yukaObstacle.position.copy(this.player.position);

          if(this.player.userData.isPlayerControlled==false && ResetPos.active!=true){
            
              this.stateMachine.update(scene);
              if(scene.isyukaBehavior==true){

                if(!this.stateMachine.in('saveBall') && !this.stateMachine.in('catchBall')&& !this.stateMachine.in('clearBall')){
                  this._speedToAnimations(yukaSpeed);
                }
               this._distanceCheck(scene);
                //use here for passing shootung descision making

               if(TendPost.weight==1 && (TendPost.target == scene.tendPositionTeam1GK || TendPost.target == scene.tendPositionTeam2GK ||this.stateMachine.in('interceptBall') )){
                this.yukaPlayer.updateOrientation=false;
                this.yukaPlayer.lookAt({x:this.ball.position.x,y:3,z:this.ball.position.z});
                this.player.body.setVelocity(this.yukaPlayer.velocity.x,this.player.body.velocity.y,this.yukaPlayer.velocity.z);
               }
               
               else{
                if(/*this.stateMachine.in('saveBall') ||*/ this.stateMachine.in('catchBall')||this.stateMachine.in('clearBall')){
                  this.yukaPlayer.updateOrientation=false;
                this.player.body.setVelocity(0,0,0);
                this.player.body.setAngularVelocity(0,0,0);
              }
              }
              }  
             else if(scene.isyukaBehavior==false){
              if(this.stateMachine.in('goalKick')){
                if(this.player.distBall>5){
                  this._speedToAnimations(yukaSpeed);
                }

               // this.yukaPlayer.updateOrientation=true;
                this.stateMachine.update(scene);
                this.player.body.setVelocity(this.yukaPlayer.velocity.x,this.player.body.velocity.y,this.yukaPlayer.velocity.z);
              }
              else{
                this.yukaPlayer.updateOrientation=false;
                this.player.body.setVelocity(0,0,0);
              }

              }      
              this.player.matrixAutoUpdate=false;     
            }
            else if(ResetPos.active==true){
              this.yukaPlayer.updateOrientation=true;
              this.stateMachine.update(scene);
              this._throttleColllisionYuka(scene);

            }
            else if(this.player.userData.isPlayerControlled==true){
              if(this.ballCaught){
                if(this.ball.body.getCollisionFlags()!=2){
                  this.ball.body.setVelocity(0, 0, 0);
                  this.ball.body.setAngularVelocity(0, 0, 0);
                  this.ball.body.setCollisionFlags(2);
                  this.player.lookAt({x:0,y:3,z:0});
              } 
             this.handMidpoint.addVectors(this.parts.leftHand.position,this.parts.rightHand.position).multiplyScalar(0.5);
            this.ball.position.set(this.handMidpoint.x,this.handMidpoint.y,this.handMidpoint.z);
            this.ball.body.needUpdate=true;
              }
             /* else if(!this.ballCaught && scene.eName !='GoalKick'){
                if(this.ball.body.getCollisionFlags()!=0){
                  this.ball.body.setCollisionFlags(0);
              }  
              }*/


              this.player.matrixAutoUpdate=true;
            }
          }
         }

         _hasArrived(resetPosition,scene){
          const distToReset= this.player.position.distanceTo(resetPosition.target);
          

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
    if( (scene.ball?.possessorClass?.distBall > this.distBall || scene.ball.possessorClass==null) && this.distBall<20 && !this.ballCaught && (this.stateMachine.in('tendGoal') || !this.stateMachine.in('saveBall'))){
              if(!this.stateMachine.in('interceptBall')){
              this.stateMachine.changeTo('interceptBall');
              }
               if (scene.ball?.possessorClass?.posName !='goalkeeper' && !scene.ball?.possessorClass?.stateMachine.in('supportAttacker')) {
               scene.ball?.possessorClass?.stateMachine.changeTo('supportAttacker');
               }
               else{
                if(!scene.ball?.possessorClass?.stateMachine.in('chaseBall') && scene.ball?.possessorClass?.posName !='goalkeeper'){ 
                scene.ball?.possessorClass?.stateMachine.changeTo('chaseBall');
                }
               }
     }

    else if(scene.offsideLineteam1.userData.owner==this.team && scene.ball.possessorClass!=this && !this.stateMachine.in('saveBall')){
      this.checkIntercept(scene);
    }
    else if(scene.offsideLineteam2.userData.owner==this.team && scene.ball.possessorClass!=this && !this.stateMachine.in('saveBall')){
      this.checkIntercept(scene);
    }
  }

  //opponent
  else if(scene.ball.possessorClass!=this && scene.ball.possessorTeamClass!=this.team){

    if( (scene.ball?.possessorClass?.distBall > this.distBall || scene.ball.possessorClass==null) && this.distBall<20 && !this.ballCaught && (this.stateMachine.in('tendGoal') || !this.stateMachine.in('saveBall'))){
              if(!this.stateMachine.in('interceptBall')){
              this.stateMachine.changeTo('interceptBall');
              }
              if (scene.ball?.possessorClass?.posName !='goalkeeper' && !scene.ball?.possessorClass?.stateMachine.in('chaseBall')) {
              scene.ball?.possessorClass?.stateMachine.changeTo('chaseBall');
              }   
     }

    else if(scene.offsideLineteam1.userData.owner==this.team &&  !this.stateMachine.in('saveBall')){
      this.checkIntercept(scene);
    }
    else if(scene.offsideLineteam2.userData.owner==this.team && !this.stateMachine.in('saveBall')){
     this.checkIntercept(scene);
    }
  }


  
      }

      checkIntercept(scene) {
   // console.log('check intercept ',this.team.teamName);

    const speed = scene.ball.speed;
    const possessor = scene.ball.possessorClass;
    const possessorTeam = scene.ball.possessorTeamClass;

    //if (possessorTeam == this.team) return; // nobody has the ball

    const Nearby = scene.ball.yukaBall.neighbors || [];

    const offsideLineX = this.team.OFSLposx;
    const ballX = this.ball.position.x;
    const opponentX = possessor?.player.position.x;

    const offsideLineToBall = Math.abs(ballX) - Math.abs(offsideLineX);
    const offsideLineToOpponent = Math.abs(opponentX) - Math.abs(offsideLineX);

   // console.log('offsideLineToBall', offsideLineToBall);
   // console.log('offsideLineToOpponent', offsideLineToOpponent);

    // teammates of GK (same team) near the opponent
    const teammatesNearOpponent = Nearby.filter(neighbor =>
        neighbor._renderComponent?.userData?.parent?.team === this.team
    );

    const slowBall = offsideLineToBall > 0 && speed < 20;
    const beyondOpponent = offsideLineToBall > 0 && offsideLineToOpponent > 0;
    const noTeammateNearby = teammatesNearOpponent.length < 1;

    if ((slowBall || beyondOpponent) && noTeammateNearby && this.distBall < 35) {

        if (this.stateMachine.in('tendGoal') || ! this.stateMachine.in('interceptBall') ) { 
         // console.log('GK is interepting');
            this.stateMachine.changeTo('interceptBall');
        }
    }
}

      
      postTrack(scene){
        if(this.post.name==this.player.userData.postassignment){
          this.distPost=this.player.position.distanceTo(this.post.position);
          this.player.userData.distPost=this.distPost;
        }
        
      }

       _getNearbyOpponents(){
          const Opponents= Object.values(this.team.opponent.teamList);
          const closeOpponents= Opponents.filter(pl=>this.yukaPlayer.neighbors.includes(pl.yukaPlayer)); 
      
         // console.log(this.playerName,this.team.teamName,'Close Opponents:',closeOpponents);
          return closeOpponents;
        }
        _getAllNearby(){
          const Opponents= Object.values(this.team.opponent.teamList);
          const Teammates= Object.values(this.team.teamList);
          const closeTeammates= Teammates.filter(pl=>this.yukaPlayer.neighbors.includes(pl.yukaPlayer));
          const closeOpponents= Opponents.filter(pl=>this.yukaPlayer.neighbors.includes(pl.yukaPlayer)); 
      
      
         // console.log(this.playerName,this.team.teamName,'Close Opponents:',closeOpponents);
          return [...closeTeammates,...closeOpponents];
        }
      
        _checkKinematicCollision(scene, bodypart, opponents) {
          if (bodypart && bodypart.body && opponents && opponents.length > 0) {
            let collidedOpponent = null;
        
            opponents.forEach(opponent => {
              const collidedPart = Object.values(opponent.parts).find(opponentPart => {
                return opponentPart.userData.Box && bodypart.userData.Box && 
                       bodypart.userData.Box.intersectsBox(opponentPart.userData.Box);
              });
        
              // If a collision is found
              if (collidedPart) {
                collidedOpponent = opponent;
              //  console.log('Collision Detected:',bodypart.userData.parent.team.teamName,bodypart.userData.parent.player.name,bodypart.userData.bodyPartName,opponent.team.teamName,opponent.player.name, collidedPart.userData.bodyPartName);
                return; // Exit after detecting the first collision
              }
            });
        
            // If no collision was detected
           /* if (!collidedOpponent) {
              console.log('No collision detected');
            }*/
          }
        }
      
        _checkKinematicCollisionYuka(scene, bodypart, obj) {
          if (bodypart && bodypart.body && obj && obj.length > 0) {
            let collidedOpponent = null;
            console.log('Nearby Opponents:',obj);
            obj.forEach(opponent => {
              const collidedPart = Object.values(opponent.parts).find(opponentPart => {
                return opponentPart.userData.Box && bodypart.userData.Box && 
                       bodypart.userData.Box.intersectsBox(opponentPart.userData.Box);
              });
        
              // If a collision is found
              if (collidedPart) {
                collidedOpponent = opponent;
               console.log('Collision Detected:',bodypart.userData.parent.team.teamName,bodypart.userData.parent.player.name,bodypart.userData.bodyPartName,opponent.team.teamName,opponent.player.name, collidedPart.userData.bodyPartName);
                const initialObject= bodypart.userData.parent.player;
                const collidedObject= opponent.player;
                  initialObject.body.setVelocity(
                  THREE.MathUtils.randInt(-4, 4), 
                  2, 
                  THREE.MathUtils.randInt(-4, 4)
                  );
                return; // Exit after detecting the first collision
              }
            });
        
            // If no collision was detected
           /* if (!collidedOpponent) {
              console.log('No collision detected');
            }*/
          }
        }
        _throttleColllisionYuka(scene){
  const updateRate= 70;
  this.framecounter++;

  if(this.framecounter>=updateRate){

  const objNearby= this._getAllNearby(scene);
  this._checkKinematicCollisionYuka(scene, this.parts.leftArm, objNearby);
  this._checkKinematicCollisionYuka(scene, this.parts.rightArm, objNearby);
  this._checkKinematicCollisionYuka(scene, this.parts.leftHand, objNearby);
  this._checkKinematicCollisionYuka(scene, this.parts.rightHand, objNearby);
  this._checkKinematicCollisionYuka(scene, this.parts.leftLeg, objNearby);
  this._checkKinematicCollisionYuka(scene, this.parts.rightLeg, objNearby);
  this._checkKinematicCollisionYuka(scene, this.parts.leftFoot, objNearby);
  this._checkKinematicCollisionYuka(scene, this.parts.rightFoot, objNearby);
  this._checkKinematicCollisionYuka(scene, this.parts.chest, objNearby);
  this._checkKinematicCollisionYuka(scene, this.parts.head, objNearby);
  

    this.framecounter=0;
  }
}  
}