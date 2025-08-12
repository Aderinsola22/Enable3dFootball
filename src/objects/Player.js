import {ExtendedObject3D ,THREE } from 'enable3d'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import {OutFieldStates} from '../statemachine/OutFieldStates.js';
import { Keyboard } from '@yandeu/keyboard';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import * as YUKA from 'yuka';


export class Player{

    constructor(model,playerName,posName,ball,team=null){
        this.model=model;
        this.player=null;
        this.posName=posName;
        this.playerName=playerName;
        this.animations=null;
        this.ball=ball;
        this.distBall=null;
        this.xDistBall=null;
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
        this.directVec=new THREE.Vector3();
        this.directBall= new THREE.Vector3();
        this.sharedPos = new THREE.Vector3();
        this.sharedBox = new THREE.Box3();
        this.sharedFootToBall = new THREE.Vector3();

        this.animations=['idle','jog_forward','jog_backward','soccer_sprint','header_ip',
        'soccer_pass','standing_up_ip','strike_forward','tackle_ip','tackle_react_ip','throw_in_ip','jumping_header_ip'];
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
      if(scene.director.userTeam==this.team){
         this.keyboard = new Keyboard();
      }
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
            this.parts.leftHand = scene.physics.add.sphere({x:0,y:-1500,z:0 ,radius:0.35,mass:0.5,collisionFlags:2,collisionGroup:2,collisionMask:4})
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
            this.parts.rightHand = scene.physics.add.sphere({x:0,y:-1500,z:0 ,radius:0.35,mass:0.5,collisionFlags:2,collisionGroup:2,collisionMask:4})
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
      this.post=scene.scene.getObjectByName(this.player.userData.postassignment);

   //  const geometry = new THREE.SphereGeometry(this.yukaObstacle.boundingRadius, 16, 16);
    //const material = new THREE.MeshBasicMaterial({
    //    wireframe: true
    //});
   //  this.sphere = new THREE.Mesh(geometry, material);
   // scene.scene.add(this.sphere)
    this.director=scene.director.directorObj;
   // console.log(`Player ${this.playerName} of team ${this.team.teamName} created with keyboard controls: ${this.keyboard}`);
    }

    _update(scene){
     if(this.keyboard && this.keyboard._isPaused==false && this.player.userData.isPlayerControlled){
      this.W= this.keyboard.key('KeyW').isDown; //forward
     this.A= this.keyboard.key('KeyA').isDown; //left
     this.S= this.keyboard.key('KeyS').isDown; //Back
     this.D= this.keyboard.key('KeyD').isDown; //right
     this.Sprint= this.keyboard.key('ShiftLeft').isDown; //sprint
    this.Jump= this.keyboard.key('Space').isDown; //jump
     this.pass= this.keyboard.key('KeyJ').isDown; //pass/stand tackle
     this.shoot= this.keyboard.key('KeyK').isDown; //shoot/clear/stand Tackle
     // H to cross/slide tackle 
    }
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
    //  this.player.body.setVelocity(0,0,0);
      this.player.body.setAngularVelocity(0,0,0);
        const x=Math.sin(thetaPlayer)*acc,
        y= this.player.body.velocity.y,
        z= Math.cos(thetaPlayer)*acc
        this.distBall=this.player.position.distanceTo(this.ball.position);
        this.xDistBall= Math.abs(this.ball.position.x-this.player.position.x);
        this.player.userData.distBall=this.distBall;
        this.player.userData.dotP=dotP;
        this.postTrack(scene);
              this.isPlayerControlled=this.player.userData.isPlayerControlled;

        if(this.player.userData.isPlayerControlled==true){/*  console.log('dot:',dotP);*/}
      //  this.sphere.position.copy(this.player.position);

      // optimize animation stuttering bug
     
     const arrow= this?.director?.children[2]?.material?.color;
     const arrowRed=arrow?.r;
     const arrowGreen=arrow?.g;
     const arrowBlue=arrow?.b;
     const inKickRange= (arrowRed==0 && arrowGreen==0 && arrowBlue==1) && (arrow != null || arrow != undefined) ? true : false;
     //const inVolleyRange;
     //const inHeadRange;

    if((this.player.children.includes(this.director) && this.player.userData.isPlayerControlled) && scene.fullTimeCalled!=1 && this.keyboard){
   //   console.log('inKickRange',inKickRange)
 

      this.keyboard.on.down('KeyW', keyCode => {
        if(this.Sprint){
          this.player.anims.play('soccer_sprint');
        }
        else{
          this.player.anims.play('jog_forward');
        }
  
        })

         this.keyboard.on.down('KeyS', keyCode => {
          this.player.anims.play('jog_backward');
        })
  
      this.keyboard.on.down('ShiftLeft', keyCode => {
          if(this.W){
            if(this.player.anims.current!=='soccer_sprint'){
              this.player.anims.play('soccer_sprint');
            }  
          }
          })

      this.keyboard.once.up('KeyK', keyCode => {
       // this.player.anims.get('thrown_in_ip').reset();
        // for low ball and mid balls
        if(this.stateMachine.previousState== this.stateMachine.get('reset')  && scene.eName=='ThrowIn'){
          this.player.anims.play('throw_in_ip',500,false);
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
            this.player.anims.get('strike_forward').crossFadeTo(this.player.anims.get('idle'),2,true);
  
          }
          
        }
      
        //for very high balls do a header later

       
          })

      this.keyboard.once.up('KeyJ', keyCode => {

            if(this.stateMachine.previousState== this.stateMachine.get('reset') && scene.eName=='ThrowIn'){
              this.player.anims.play('throw_in_ip',500,false);
            }
            else{
              // for low ball and mid balls
            this.player.anims.get('soccer_pass').reset();  
            this.player.anims.play('soccer_pass');

            if(this.Sprint && this.W){
              this.player.anims.get('soccer_pass').crossFadeTo(this.player.anims.get('soccer_sprint'),2,true);
            }
      
           else if(this.W){
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

                  if(this.player.anims.current!=='idle'){
                    this.player.anims.play('idle');
                  }
              
                  })  
                  
      this.keyboard.once.up('ShiftLeft', keyCode => {
            
                    if(this.W){
                      if(this.player.anims.current!=='jog_forward'){
                        this.player.anims.play('jog_forward');
                      }                    
                    }
                    else{
                      if(this.player.anims.current!=='idle'){
                        this.player.anims.play('idle');
                      }
                   }
}) 
            
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
                      this.player.body.setVelocity(x*1.34,y,z*1.34);
                    }
                if(this.Jump){
                 // this.player.body.setVelocity(0,0,1.5);
                 // this.ball.body.setVelocity(20,10,0);   
                  //this.ball.body.setAngularVelocity(0,10,0);
                }
              //TODO: when shoot or pass is being pressed but not at the same time fill the bar if press shoot then pass vie versa as bar fills instantly reset to 0 and when neither is pressed reset to 0
              
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
                     if(inKickRange){
                      this.finalKey=this.currKey
                    //  console.log('last pressed key',this.finalKey);
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
    }
 

  // for now implement normal shooting based on player direction then later updates implement proper torque
   
   if(this.finalKey==='shoot' && this.ball.position.y<=4 && inKickRange && !this.ball.userData.isKicked /*&& scene.ball.possessorClass===this*/ && !scene.field.eventHappened){ 
    //always reset forces to ensure previous force does not mulitply the new force
    this.finalKey=null;
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

  
  //  console.log('shotX',scene.ball.shotX);
  //  console.log('shotY',scene.ball.shotY);
  //  console.log('shotZ',scene.ball.shotZ);

    const opponentGk=this.team.opponent.teamList.GK;

    this.team.lastTouched=true;
    this.team.opponent.lastTouched=false;
    scene.ball.possessorClass=null;
    scene.ball.possessor=null;

    if(!opponentGk.stateMachine.in('saveBall')||opponentGk.stateMachine.previousState===opponentGk.stateMachine.get('saveBall')){
    opponentGk.stateMachine.changeTo('saveBall');
    }
    this.ball.userData.isKicked=true;

    this.ball.body.applyImpulse({x:scene.ball.shotX,y:scene.ball.shotY,z:scene.ball.shotZ},{x:0,y:0,z:0});

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


 if(this.finalKey==='pass' &&this.ball.position.y<=4 && inKickRange && !this.ball.userData.isKicked  /*&& scene.ball.possessorClass===this*/ && !scene.field.eventHappened){
  this.finalKey=null;
  this.ball.body.setVelocity(0,0,0);
  this.ball.body.setAngularVelocity(0,0,0);
   
  // remember to account for player direction 
  // use random range to adjust power

    // low pass with curve- use regular torque, set y=0 set x and z to extrapolate based on player direction

    // add torque maybe use set timeout

    //aerial pass/cross/longball with curve-  use force,torque and gravity and settimeout; set x and z to extrapolate based on player direction and set y to give height

    // straight pass/cross/longball without curve-  use force only x and z have same multiplier y gives height
    const passX=this.playerTurn.x*randPassMod;
    const passY=randYMod;
    const passZ=this.playerTurn.z*randPassMod;
  //  console.log('PassX',passX);
  //  console.log('PassY',passY);
  //  console.log('PassZ',passZ);
    this.ball.body.applyImpulse({x:passX,y:passY,z:passZ},{x:0,y:0,z:0});

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
    
   //  this._throttleColllision(scene);
     
    }

 
_throttleColllision(scene){
  const updateRate= 75;
  this.framecounter++;

  if(this.framecounter>=updateRate){

  const opponentNearby= this._getNearbyOpponents();
  this._checkKinematicCollision(scene, this.parts.leftArm, opponentNearby);
  this._checkKinematicCollision(scene, this.parts.rightArm, opponentNearby);
  this._checkKinematicCollision(scene, this.parts.leftHand, opponentNearby);
  this._checkKinematicCollision(scene, this.parts.rightHand, opponentNearby);
  this._checkKinematicCollision(scene, this.parts.leftLeg, opponentNearby);
  this._checkKinematicCollision(scene, this.parts.rightLeg, opponentNearby);
  this._checkKinematicCollision(scene, this.parts.leftFoot, opponentNearby);
  this._checkKinematicCollision(scene, this.parts.rightFoot, opponentNearby);
  this._checkKinematicCollision(scene, this.parts.chest, opponentNearby);
  this._checkKinematicCollision(scene, this.parts.head, opponentNearby);
  

    this.framecounter=0;
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
      const ResetPos= this.yukaPlayer.steering.behaviors[5];

      const yukaSpeed=this.yukaPlayer.getSpeed();
      this.yukaPlayer.position.copy(this.player.position);
      this.yukaObstacle.position.copy(this.player.position);
      
     // console.log(this.yukaPlayer.steering.behaviors);
 
     if(this.player.userData.isPlayerControlled==false && ResetPos.active!=true){
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
    else if(ResetPos.active==true){
      this.stateMachine.update(scene);
      this._throttleColllisionYuka(scene);
  }
    
    
    else if(this.player.userData.isPlayerControlled==true){
      const opponentGk=this.team.opponent.teamList.GK;
      const teamGk=this.team.teamList.GK; 
      const speed=this.player.body.ammo.getLinearVelocity().length().toFixed(2);

      if(scene.director.userTeam==this.team){
      this._checkUserPossession(scene);
      }

     if((opponentGk.stateMachine.in('clearBall') && opponentGk.stateMachine.get('clearBall').clearAnim != 'strike_forward') || opponentGk.stateMachine.in('catchBall') || (teamGk.stateMachine.in('clearBall')&& teamGk.stateMachine.get('clearBall').clearAnim != 'strike_forward') || teamGk.stateMachine.in('catchBall')) {
      if(this.distBall<=20){
        const dirBallPossessor= scene.ball.possessorClass.playerTurn.x < 0 ? -1 :1; 
        this.player.body.setVelocity(dirBallPossessor*10,0,0);
      }   
     }
     else{
        this.stateMachine.currentState=null;
        this.player.matrixAutoUpdate=true;
     }  
    }
  }
  

  }
 _hasArrived(resetPosition,scene){
  const distToReset= this.player.position.distanceTo(resetPosition.target);
  const xDistToReset = this.player.position.x - resetPosition.target.x;
  const zDistToReset = this.player.position.z - resetPosition.target.z;

  // 1.5 for half time,goal and goal kick, 2.0 for throw in, 2.5 for corner kick do later
  //console.log("Event Name:",scene.eName);

   if(scene.eName=='CornerKick'){
    if(distToReset<2.5){
      this.ResetDone= true;
    }
    if (distToReset>=2.5){
   //   console.log(this.playerName,this.team.teamName,distToReset);
      this.ResetDone=false;
    }
  }

  else{
    if(distToReset<1.5){
      this.ResetDone= true;
    }
    if (distToReset>=1.5){
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
 //   console.log(this.availableTeammatePass);
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
    return teammates.distBall<=65;
    
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
    return toTarget.dot(toOpponent) > 0.6 &&  distToOpponent< 8;
  }
  else{
    return false;
  }
}


  _decisionsPossessor(scene){
    if(this._decisionsPossessorShoot(scene)){return 'Shoot'}
    else if(this._decisionsPossessorDribble(scene)){ return 'Dribble'}
    else if(this._decisionsPossessorPass(scene)){ return 'Pass'}
    else{return 'Dribble'};
    
  }

  _checkUserPossession(scene){
    if(scene.ball.possessorClass!=this && scene.ball.possessorTeamClass==this.team){
      if(scene.ball?.possessorClass?.distBall > this.distBall && this.distBall<12){
              scene.ball.possessorClass = this;
              scene.ball.possessor = this.playerName;
              scene.ball.possessorTeamClass=this.team;
              scene.ball.possessorTeam=scene.ball.possessorTeamClass.teamName;
              console.log('User posession changed');
     }
    }
  }

  _distanceCheck(scene){

   const opponentGk=this.team.opponent.teamList.GK;
   const teamGk=this.team.teamList.GK; 
   const currentPossessor = scene.ball.possessorClass;
   const thisDistance = this.distBall;
   const possessorDistance = currentPossessor ? currentPossessor.distBall : Infinity;

  if((opponentGk.stateMachine.in('clearBall')) || opponentGk.stateMachine.in('catchBall') || (teamGk.stateMachine.in('clearBall')) || teamGk.stateMachine.in('catchBall')) {
    if(!this.stateMachine.in('goHome')){
      this.stateMachine.changeTo('goHome');
      }
  }
  else if(scene.ball.possessorClass != this && (scene.barrierActive)){
    if(!this.stateMachine.in('idle')){
      this.stateMachine.changeTo('idle');
      }
  }

  else if(this.stateMachine.previousState===this.stateMachine.get('shoot')){
      if(!this.stateMachine.in('chaseBall')){ 
        this.stateMachine.changeTo('chaseBall');
        this.stateMachine.previousState=null;
        }
    }

  else if(scene.ball.possessorClass==this && scene.ball.possessorTeamClass==this.team){
     if(this.distBall<=8){

      if(scene.director.userTeam!=this.team){  

   const action= this._decisionsPossessor(scene);
 //  console.log('Action:',action);
   
        if(action==='Dribble'){
        if(!this.stateMachine.in('dribble')){
        this.stateMachine.changeTo('dribble');
        }
      } 

     else if(action==='Pass'){
        if(!this.stateMachine.in('passBall')){
         this.stateMachine.changeTo('passBall');
       // const passReceiver= this.stateMachine.get('passBall').receiver;
       // console.log(this.playerName,this.team.teamName,'You are passing to:',passReceiver.playerName,passReceiver.team.teamName);
        }
      
      }

      else if(action==='Shoot'){
      if(this.distBall<3.5 && this.ball.position.y<=4 &&this.player.userData.dotP>=0.55){
        if(!this.stateMachine.in('shoot')){
         this.stateMachine.changeTo('shoot');
         if(!opponentGk.stateMachine.in('saveBall')||opponentGk.stateMachine.previousState===opponentGk.stateMachine.get('saveBall')){
          opponentGk.stateMachine.changeTo('saveBall');
          }
        }
      }
      }
    }

    } 
    else{
      //console.log(' You are still possessor but you musyt chase the ball');
      if(!this.stateMachine.in('chaseBall')){ 
       this.stateMachine.changeTo('chaseBall');
       }
    }

    
     }
  
  else if(scene.ball.possessorClass != this){

    if(scene.ball?.possessorClass?.stateMachine.get('passBall').receiver === this && !this.stateMachine.in('receiveBall')){
        this.stateMachine.changeTo('receiveBall'); 
    }

    else if (scene.ball?.possessorClass?.stateMachine.get('passBall').receiver === this && this.stateMachine.in('receiveBall')){
   if( this.team.ballClosestPlayer == this && scene.ball.possessorTeamClass== this.team && this.stateMachine.get('receiveBall').timeDiff>=3500){
    if(!this.stateMachine.in('chaseBall')){
      this.stateMachine.changeTo('chaseBall');
    //  console.log(this.playerName,this.team.teamName,'is receiving and close enough to chase the ball');
    }
  }
   else if(this.team.ballClosestPlayer != this && scene.ball.possessorTeamClass== this.team && this.stateMachine.get('receiveBall').timeDiff>=5000){
    if(!this.stateMachine.in('supportAttacker')){
      this.stateMachine.changeTo('supportAttacker');
    //  console.log(this.playerName,this.team.teamName,'is receiving but not close enough to chase the ball');
    }
  }
 }
  else if ( !this.stateMachine.in('receiveBall') &&
  (possessorDistance > thisDistance || currentPossessor == null) &&
  !currentPossessor?.stateMachine?.in('passBall') &&
  !currentPossessor?.stateMachine?.in('shoot') &&
  currentPossessor !== this &&
  scene.ball.possessorTeamClass === this.team) {
      
      scene.ball.possessorClass= this;
      scene.ball.possessor= this.playerName;
      scene.ball.possessorTeamClass=this.team;
      scene.ball.possessorTeam=scene.ball.possessorTeamClass.teamName; 
      
    //  console.log(this.playerName,this.team.teamName,'teammate is taking charge of the ball');   
      }
    
    else if (!this.stateMachine.in('receiveBall')) {


    if((!this.team.chasers.includes(this)|| !this.team.supportAttackers.includes(this)) && this.xDistBall>=55 && this.xDistBall <60){ 
      if(!this.stateMachine.in('idle')){
        this.stateMachine.changeTo('idle'); 
       }
    }

   else if(this.team.chasers.includes(this)){
    if(!this.stateMachine.in('chaseBall')){
   //   console.log(this.playerName,this.team.teamName,'You are chasing the ball');
      this.stateMachine.changeTo('chaseBall');
     }
    }
    
    else if(this.team.supportAttackers.includes(this)){
      

      if(!this.stateMachine.in('supportAttacker')){
        this.stateMachine.changeTo('supportAttacker');
       }
    }

    else if(!this.team.chasers.includes(this) && !this.stateMachine.in('receiveBall')){ 
      if(!this.stateMachine.in('supportDefence')){
     //   console.log(this.playerName,this.team.teamName,'You are not chasing and not receiving the ball and you are supporting defence');
        this.stateMachine.changeTo('supportDefence'); 
       }
    }

    else if(!this.stateMachine.in('receiveBall')&& !this.team.supportAttackers.includes(this) ){
       if (!this.stateMachine.in('supportAttacker')) {
      //    console.log(this.playerName,this.team.teamName,'You are supporting attack from defence');
              this.stateMachine.changeTo('supportAttacker');

          }
    } 
   
 
    else{
      if(!this.stateMachine.in('goHome')){ 
        this.stateMachine.changeTo('goHome');
       }
    }
  }

 }   
   else{
    if(!this.stateMachine.in('goHome')){ 
      this.stateMachine.changeTo('goHome');
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
  

}

