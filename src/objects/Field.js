import {Scene3D, THREE } from 'enable3d'
import { MatchScene } from '../core/MatchScene';



export class Field{
    constructor(width,height,depth){
        this.width=width;
        this.height=height;
        this.depth=depth;
        this.field=null;
        this.fieldTexture=null;
    }
    _createField(scene,texture){
       this.fieldTexture=texture;
       this.field=scene.physics.add.ground({width:this.width,height:this.height,depth:this.depth},{basic:{map:this.fieldTexture}});
       this.field.body.setRestitution(1);
       this.field.body.ammo.setRollingFriction(0.1);
       this.field.name="Field";
    }
    _addBoundaries(scene){
   this.sideline1= scene.add.box({width:207.5,height:60,depth:0.6},{basic:{color:'yellow'}});
   this.sideline1.name='sideline-1';
   this.sideline1.position.set(0,30,58);
   scene.physics.add.existing(this.sideline1,{mass:0,collisionFlags:4});

   this.sideline2= scene.add.box({width:207.5,height:60,depth:0.6},{basic:{color:'pink'}});
   this.sideline2.name='sideline-2';
   this.sideline2.position.set(0,30,-58);
   scene.physics.add.existing(this.sideline2,{mass:0,collisionFlags:4});

   this.boundaryline1=scene.add.box({width:0.1,height:60,depth:114},{basic:{color:'brown'}});
   this.boundaryline1.name='boundary-1';
   this.boundaryline1.position.set(103.7,30,0);
   scene.physics.add.existing(this.boundaryline1,{mass:0,collisionFlags:4});

   this.boundaryline2=scene.add.box({width:0.1,height:60,depth:114},{basic:{color:'orange'}});
   this.boundaryline2.name='boundary-2';
   this.boundaryline2.position.set(-103.7,30,0);
   scene.physics.add.existing(this.boundaryline2,{mass:0,collisionFlags:4});
   

   this.goalLine1=scene.add.box({width:21,height:7.5,depth:0.1,x:103.6,y:4.5,z:0.3},{basic:{color:'green'}});
   this.goalLine1.name='goal-line-1';
   this.goalLine1.rotateY(1.571);
   scene.physics.add.existing(this.goalLine1,{mass:0,collisionFlags:4});

   this.goalLine2=scene.add.box({width:21,height:7.5,depth:0.1,x:-103.6,y:4.5,z:-0.3},{basic:{color:'red'}});
   this.goalLine2.name='goal-line-2';
   this.goalLine2.rotateY(1.571);
   scene.physics.add.existing(this.goalLine2,{mass:0,collisionFlags:4});

   this.goalLine1.visible=false;
   this.goalLine2.visible=false;
  
   this.sideline1.visible=false;
   this.sideline2.visible=false;
  
   this.boundaryline1.visible=false;
   this.boundaryline2.visible=false;

    }
    _addColliders(scene,boundary,ball){
        scene.physics.add.collider(boundary,ball,event =>{
          let respawnBallLocation=new THREE.Vector3();
            if(boundary.name==='goal-line-1'||boundary.name==='goal-line-2'){
              if(event==='end'&&((ball.position.x>103.7)||ball.position.x<-103.7)){
                boundary.material.color.set(0x00ff00);
                console.log('goal at',boundary.name)};
                respawnBallLocation={x:0,y:4,z:0}
                if(boundary.name==='goal-line-1'){
                  console.log(`Place Ball at (${respawnBallLocation.x},${respawnBallLocation.y},${respawnBallLocation.z})`)
                  this._respawnBall(ball,respawnBallLocation);
                 }
                 if(boundary.name==='goal-line-2'){
                  console.log(`Place Ball at (${respawnBallLocation.x.toFixed(0)},${respawnBallLocation.y.toFixed(0)},${respawnBallLocation.z.toFixed(0)})`)
                  this._respawnBall(ball,respawnBallLocation);
                 }
            }
            else if(boundary.name==='sideline-1'||boundary.name==='sideline-2'){
              if(event==='end'&&(ball.position.z>58||ball.position.z<-58)){
                boundary.material.color.set(0x00ff00);
                console.log('throw-in at',boundary.name);
                 if(ball.position.z>58){
                  respawnBallLocation=new THREE.Vector3(ball.position.x,4,58)
                  console.log(`Place Ball at (${respawnBallLocation.x},${respawnBallLocation.y},${respawnBallLocation.z})`)
                 }
                 if(ball.position.z<-58){
                  respawnBallLocation=new THREE.Vector3(ball.position.x,4,-58)
                  console.log(`Place Ball at (${respawnBallLocation.x.toFixed(0)},${respawnBallLocation.y.toFixed(0)},${respawnBallLocation.z.toFixed(0)})`)
                 }
                 this._respawnBall(ball,respawnBallLocation);
              }
            }
        
          else if(boundary.name==='boundary-1'||boundary.name==='boundary-2'){
              if(event==='end'&& (ball.position.z >11 || ball.position.z<-11||ball.position.y>9.5)){
                boundary.material.color.set(0x00ff00);
                console.log('out of bounds at',boundary.name);

                 if(boundary.name==='boundary-2'){
                  respawnBallLocation=new THREE.Vector3(-92,4,8)
                  console.log(`Place Ball at (${respawnBallLocation.x},${respawnBallLocation.y},${respawnBallLocation.z})`)
                  this._respawnBall(ball,respawnBallLocation);
                 }
                 if(boundary.name==='boundary-1'){
                  respawnBallLocation=new THREE.Vector3(92,4,-8)
                  console.log(`Place Ball at (${respawnBallLocation.x.toFixed(0)},${respawnBallLocation.y.toFixed(0)},${respawnBallLocation.z.toFixed(0)})`)
                  this._respawnBall(ball,respawnBallLocation);
                 }
              }
            }
          
          })
    }


    _respawnBall(ball,respawnBallLocation){
        ball.body.setCollisionFlags(2);
        ball.position.set(respawnBallLocation.x,respawnBallLocation.y,respawnBallLocation.z);
        ball.body.needUpdate=true;

        ball.body.once.update(()=>{
        ball.body.setCollisionFlags(0);
        ball.body.setVelocity(0,0,0);
        ball.body.setAngularVelocity(0,0,0);
        })

        
        console.log(`ball respawned at:(${respawnBallLocation.x.toFixed(0)},${respawnBallLocation.y.toFixed(0)},${respawnBallLocation.z.toFixed(0)})`);
    }
}
