import {Scene3D, THREE } from 'enable3d'
import { MatchScene } from '../core/MatchScene';



export class Field{
    constructor(width,height,depth){
        this.width=width;
        this.height=height;
        this.depth=depth;
        this.field=null;
        this.fieldTexture=null;
        this.eventHappened=false;
    }
    _createField(scene,texture){
       this.fieldTexture=texture;
       this.field=scene.physics.add.ground({width:this.width,height:this.height,depth:this.depth},{basic:{map:this.fieldTexture}});
       this.field.body.setRestitution(1);
       this.field.body.ammo.setRollingFriction(0.1);
       this.field.name="Field";

    }
    _addBoundaries(scene){
      this.fieldBoundaries = new THREE.Group();
      this.fieldBoundaries.name = 'field-boundaries';
      let size= new THREE.Vector3();
   this.sideline1= scene.add.box({width:207.5,height:60,depth:0.05},{basic:{color:'yellow'}});
   this.sideline1.name='sideline-1';
   this.sideline1.position.set(0,30,58.7);
   this.sideline1.userData.Box= new THREE.Box3().setFromObject(this.sideline1); 
  
   this.sideline2= scene.add.box({width:207.5,height:60,depth:0.05},{basic:{color:'pink'}});
   this.sideline2.name='sideline-2';
   this.sideline2.position.set(0,30,-58.7);
   this.sideline2.userData.Box= new THREE.Box3().setFromObject(this.sideline2); 

   this.boundaryline1=scene.add.box({width:0.1,height:60,depth:114},{basic:{color:'brown'}});
   this.boundaryline1.name='boundary-1';
   this.boundaryline1.position.set(-104,30,0);
   this.boundaryline1.userData.Box= new THREE.Box3().setFromObject(this.boundaryline1); 

   this.boundaryline2=scene.add.box({width:0.1,height:60,depth:114},{basic:{color:'orange'}});
   this.boundaryline2.name='boundary-2';
   this.boundaryline2.position.set(104,30,0);
   this.boundaryline2.userData.Box= new THREE.Box3().setFromObject(this.boundaryline2); 
  
   this.sideline1.visible=false;
   this.sideline2.visible=false;
  
 this.boundaryline1.visible=false;
 this.boundaryline2.visible=false;

  this.fieldBoundaries.add(this.sideline1,this.sideline2,this.boundaryline1,this.boundaryline2);
  scene.add.existing(this.fieldBoundaries);
  scene.physics.add.existing(this.fieldBoundaries,{mass:0,collisionFlags:4})
 // console.log(this.fieldBoundaries);

 //  For the Goal Box Boundaries
   this.goalBox1=scene.add.box({width:34,height:14,depth:74,x:-86,y:8,z:0.3},{basic:{color:'green'}});
   this.goalBox1.name='goal-box-1';
   scene.physics.add.existing(this.goalBox1,{mass:0,collisionFlags:5});
  this.goalBox1.userData.Box= new THREE.Box3().setFromObject(this.goalBox1); 

 this.goalBox2=scene.add.box({width:34,height:14,depth:74,x:86,y:8,z:-0.3},{basic:{color:'purple'}});
   this.goalBox2.name='goal-box-2';
   scene.physics.add.existing(this.goalBox2,{mass:0,collisionFlags:5});
   this.goalBox2.userData.Box= new THREE.Box3().setFromObject(this.goalBox2); 
   
   this.goalBox1.visible=false;
   this.goalBox2.visible=false;

  // console.log(this.goalBox1);
 //  console.log(this.goalBox2);
 this.center=scene.add.box({width:40,height:9,depth:35,x:0,y:5,z:0.3},{basic:{color:'brown'}});
 this.center.name='center-circle';
 scene.physics.add.existing(this.center,{mass:0,collisionFlags:5});
this.center.userData.Box= new THREE.Box3().setFromObject(this.center); 

this.center.visible=false;

    }

  

    _addColliders(scene,boundary,ball){
      this.target=null;
      this.targetGKBoundary=null;
      this.ball=ball;
      let collPosition=new THREE.Vector3();
      let zPos=0;
      this.respawnBallLocation=new THREE.Vector3();
      this.scene=scene;

        scene.physics.add.collider(boundary,ball,event =>{
          if(scene.eventsAvailable==true){

          if(event=='start'){
           collPosition.copy(ball.position);
          zPos=ball.position.z;  
        //  console.log(this.ball.body.ammo.getLinearVelocity().length().toFixed(2));
        } 
           if (event === 'end') {
             // Identify the target object based on collision position
             boundary.traverse((obj) => {
                 if (obj.userData.Box && obj.userData.Box.distanceToPoint(collPosition) <= 1) {
                     this.target = obj;
                 }
             });
           // console.log(this.target.name);
             if (this.target) {
               //  console.log('target', this.target?.name, 'at', scene.GameTime);
         
                 // Handle sideline throw-ins
                 if(this.target.name==='sideline-1'||this.target.name=='sideline-2'){
                   if (this.target.name === 'sideline-1' || ball.position.z>58) {
                     this.respawnBallLocation = { x: ball.position.x, y: 0.9, z: 58 };
                     console.log('throw-in at', this.target.name, 'at', scene.GameTime);
                     this._accrueStoppageTime(scene, 'ThrowIn');
                 } else if (this.target.name === 'sideline-2' || ball.position.z<-58) {
                     this.respawnBallLocation = { x: ball.position.x, y: 0.9, z: -58 };
                     console.log('throw-in at', this.target.name, 'at', scene.GameTime);
                     this._accrueStoppageTime(scene, 'ThrowIn');
                 } 
               //  console.log("Current Ball Possessor Team Before Event ",scene.ball.possessorTeam);
                 
           //    console.log('Team 1 last touched:',scene.Team1.teamName ,scene.Team1.lastTouched);
          //     console.log('Team 2 last touched:', scene.Team2.teamName,scene.Team2.lastTouched);
           //    console.log('Team Possessor Class', scene.ball.possessorTeamClass);
         //      console.log('Team Possessor', scene.ball.possessorTeam);

               const lastTouchedTeam = scene.Team1.lastTouched ? scene.Team1 : scene.Team2;
               scene.ball.possessorTeamClass=lastTouchedTeam.opponent;
               scene.ball.possessorTeam=scene.ball.possessorTeamClass.teamName;

          //     console.log("Current Ball Possessor Team After Event ",scene.ball.possessorTeam);

                  scene.isClockRun=false;
                 }
                 
                 // Handle goal kick or corner kick
   
                 else if(this.target.name === 'boundary-2' || this.target.name === 'boundary-1'){
                   if (
                     (this.target.name === 'boundary-2' || this.target.name === 'boundary-1') &&
                     (zPos > 11 || zPos < -11 || ball.position.y > 9.5)
                 ) {
                     console.log('out of bounds at', this.target.name, 'at', scene.GameTime);
                // console.log("Current Ball Possessor Team Before Event ",scene.ball.possessorTeam);    
                     this._checkGoalCornerKick(scene,ball);
               //  console.log("Current Ball Possessor Team After Event ",scene.ball.possessorTeam);
                 } 
                  // Handle goals
                  else {
                   this.respawnBallLocation = { x: 0, y: 0.9, z: 0 };
                   console.log('goal at', this.target.name, 'at', scene.GameTime);
                 //  console.log("Current Ball Possessor Team Before Event ",scene.ball.possessorTeam);
                   // Update scores
                   if (this.target.name === 'boundary-1') {
                       if (this.target.name === scene.Team1.goalineTargetName) {
                           scene.Team1.goalScored++;
                           scene.ball.possessorTeamClass=scene.Team2;
                           scene.ball.possessorTeam=scene.ball.possessorTeamClass.teamName;
                           scene.ball.possessorClass=Object.values(scene.ball.possessorTeamClass.teamList).at(-1)
                           scene.ball.possessor=scene.ball.possessorClass.playerName;
                       } else if (this.target.name === scene.Team2.goalineTargetName) {
                           scene.Team2.goalScored++;
                           scene.ball.possessorTeamClass=scene.Team1;
                           scene.ball.possessorTeam=scene.ball.possessorTeamClass.teamName;
                           scene.ball.possessorClass=Object.values(scene.ball.possessorTeamClass.teamList).at(-1)
                           scene.ball.possessor=scene.ball.possessorClass.playerName;
                       }
                   } else if (this.target.name === 'boundary-2') {
                       if (this.target.name === scene.Team1.goalineTargetName) {
                        scene.Team1.goalScored++;
                        scene.ball.possessorTeamClass=scene.Team2;
                        scene.ball.possessorTeam=scene.ball.possessorTeamClass.teamName;
                        scene.ball.possessorClass=Object.values(scene.ball.possessorTeamClass.teamList).at(-1)
                        scene.ball.possessor=scene.ball.possessorClass.playerName;

                       } else if (this.target.name === scene.Team2.goalineTargetName) {
                           scene.Team2.goalScored++;
                           scene.ball.possessorTeamClass=scene.Team1;
                           scene.ball.possessorTeam=scene.ball.possessorTeamClass.teamName;
                           scene.ball.possessorClass=Object.values(scene.ball.possessorTeamClass.teamList).at(-1)
                           scene.ball.possessor=scene.ball.possessorClass.playerName;
                       }
                   }
                   scene._UpdateScores();
                   this._accrueStoppageTime(scene, 'Goal'); 
                 //  console.log("Current Ball Possessor Team After Event ",scene.ball.possessorTeam);          
                  }

                  scene.isClockRun=false;

                 }
                 
                
             }
             // Reset target and respawn ball
             this.target = null;
         }
        }

         })

      
    }

    _accrueStoppageTime(scene,eventtype){
      if(scene.stoppageTime<scene.maxStoppageTime && scene.stoppageTimeCalled==0){
        if(eventtype=='Goal'){
          scene.eventName=eventtype;
     //   console.log("Accrued Stoppage time in seconds before goal event",scene.stoppageTime);
          scene.eventCounts.goal++;
          if(scene.eventCounts.goal<=scene.eventThreshold.goal){
            scene.stoppageTime+=scene.eventDelays.goal;
          }
          else if(scene.eventCounts.goal>scene.eventThreshold.goal){
            scene.stoppageTime= scene.stoppageTime+(scene.eventDelays.goal * scene.eventReductionFactor);
          }
         console.log("Accrued Stoppage time in seconds after goal event",scene.stoppageTime);
       //   console.log("goal event count in half",scene.eventCounts.goal);
        }
      else if(eventtype=='ThrowIn'){
        scene.eventName=eventtype;
    //    console.log("Accrued Stoppage time in seconds before throwIn event",scene.stoppageTime);
        scene.eventCounts.throwIn++;
        if(scene.eventCounts.throwIn<=scene.eventThreshold.throwIn){
          scene.stoppageTime+=scene.eventDelays.throwIn;
        }
        else if(scene.eventCounts.throwIn>scene.eventThreshold.throwIn){
          scene.stoppageTime= scene.stoppageTime+(scene.eventDelays.throwIn * scene.eventReductionFactor);
        }
        console.log("Accrued Stoppage time in seconds after throwIn event",scene.stoppageTime);
      // console.log("throwIn event count in half",scene.eventCounts.throwIn);
        }
       else if(eventtype=='GoalKick'){
        scene.eventName=eventtype;
  //      console.log("Accrued Stoppage time in seconds before goalKick event",scene.stoppageTime);
        scene.eventCounts.goalKick++;
        if(scene.eventCounts.goalKick<=scene.eventThreshold.goalKick){
          scene.stoppageTime+=scene.eventDelays.goalKick;
        }
        else if(scene.eventCounts.goalKick>scene.eventThreshold.goalKick){
          scene.stoppageTime= scene.stoppageTime+(scene.eventDelays.goalKick * scene.eventReductionFactor);
        }
        ;
      console.log("Accrued Stoppage time in seconds after goalKick event",scene.stoppageTime);
      // console.log("goalKick event count in half",scene.eventCounts.goalKick);
        }
      else if(eventtype=='CornerKick'){
        scene.eventName=eventtype;
       // console.log("Accrued Stoppage time in seconds before cornerKick event",scene.stoppageTime);
        scene.eventCounts.cornerKick++;
        if(scene.eventCounts.cornerKick<=scene.eventThreshold.cornerKick){
          scene.stoppageTime+=scene.eventDelays.cornerKick;
        }
        else if(scene.eventCounts.cornerKick>scene.eventThreshold.cornerKick){
          scene.stoppageTime= scene.stoppageTime+(scene.eventDelays.cornerKick * scene.eventReductionFactor);
        }
       
        console.log("Accrued Stoppage time in seconds after cornerKick event",scene.stoppageTime);
      //  console.log("cornerKick event count in half",scene.eventCounts.cornerKick);
        }
        //TODO: add other event types later

      }
      else{
      //  console.log('No stoppage allowed to accrue');
     //   console.log("Accrued Stoppage time in seconds before event",scene.stoppageTime);
        console.log("Accrued Stoppage time in seconds after event",scene.stoppageTime);
      }
    }
   _checkGoalCornerKick(scene,ball){
  //    console.log('Team 1 last touched:',scene.Team1.teamName ,scene.Team1.lastTouched);
  //    console.log('Team 2 last touched:', scene.Team2.teamName,scene.Team2.lastTouched);
 //     console.log('Team Possessor Class', scene.ball.possessorTeamClass);
 //     console.log('Team Possessor', scene.ball.possessorTeam);
      const lastTouchedTeam = scene.Team1.lastTouched ? scene.Team1 : scene.Team2;
      const opGoal = lastTouchedTeam === scene.Team1 ? scene.Team2.goalineTargetName : scene.Team1.goalineTargetName;
 //     console.log('opGoal:', opGoal);
  //    console.log('Target name:', this.target.name);
      scene.ball.possessorTeamClass= lastTouchedTeam.opponent;
      scene.ball.possessorTeam=scene.ball.possessorTeamClass.teamName;
      const isCornerKick = this.target.name === opGoal;
      const isBoundary2 = this.target.name === 'boundary-2';
      const isBoundary1 = this.target.name === 'boundary-1';
  
      if (isCornerKick) {
          this._accrueStoppageTime(scene, 'CornerKick');
  
          if (isBoundary2) {
              this.respawnBallLocation = {
                  x: 102,
                  y: 0.9,
                  z: ball.position.z >= 0 ? 56.5 : -56.5
              };
          } else if (isBoundary1) {
              this.respawnBallLocation = {
                  x: -102,
                  y: 0.9,
                  z: ball.position.z >= 0 ? 56.5 : -56.5
              };
          }
         } 
      else {
          this._accrueStoppageTime(scene, 'GoalKick');
  
          if (isBoundary2) {
              this.respawnBallLocation = { x: 92, y: 0.9, z: 8 };
          }
          else if (isBoundary1) {
              this.respawnBallLocation = { x: -92, y: 0.9, z: -8 };
          }
      }
  
   /*  if(scene.Team1.lastTouched==true){
      if (this.target.name === scene.Team2.goalineTargetName) {
       // console.log('Corner Kick');
        this._accrueStoppageTime(scene,'CornerKick');
        if (this.target.name === 'boundary-2') {
          if(ball.position.z>=0){
            this.respawnBallLocation = { x:102,y:0.9,z:56.5};
          }
          else if(ball.position.z<0){
            this.respawnBallLocation = { x:102,y:0.9,z:-56.5};
          }
      } 
      else if (this.target.name === 'boundary-1') {
        if(ball.position.z>=0){
          this.respawnBallLocation = { x:-102,y:0.9,z:56.5};
        }
        else if(ball.position.z<0){
          this.respawnBallLocation = { x:-102,y:0.9,z:-56.5};
        }
      }

      }
      else{
     //   console.log('Goal Kick');
        this._accrueStoppageTime(scene,'GoalKick');

        if (this.target.name === 'boundary-2') {
          this.respawnBallLocation = { x: 92, y: 0.9, z: 8 };
      } 
      else if (this.target.name === 'boundary-1') {
          this.respawnBallLocation = { x: -92, y: 0.9, z: -8 };
      }
      }
    

     }
     else if(scene.Team2.lastTouched==true){
      if (this.target.name === scene.Team1.goalineTargetName) {
      //  console.log('Corner Kick');
        this._accrueStoppageTime(scene,'CornerKick');
        if (this.target.name === 'boundary-2') {
          if(ball.position.z>=0){
            this.respawnBallLocation = { x:102,y:0.9,z:56.5};
          }
          else if(ball.position.z<0){
            this.respawnBallLocation = { x:102,y:0.9,z:-56.5};
          }
      } 
      else if (this.target.name === 'boundary-1') {
        if(ball.position.z>=0){
          this.respawnBallLocation = { x:-102,y:0.9,z:56.5};
        }
        else if(ball.position.z<0){
          this.respawnBallLocation = { x:-102,y:0.9,z:-56.5};
        }
      }

      }
      else{
     //     console.log('Goal Kick');
          this._accrueStoppageTime(scene,'GoalKick');

        if (this.target.name === 'boundary-2') {
          this.respawnBallLocation = { x: 92, y: 0.9, z: 8 };
      } 
      else if (this.target.name === 'boundary-1') {
          this.respawnBallLocation = { x: -92, y: 0.9, z: -8 };
      }
      }
     }
    */
   }
    
    _respawnBall(ball,respawnBallLocation,scene){
      //console.log(scene); 
        ball.body.setCollisionFlags(2);
        ball.position.set(respawnBallLocation.x,respawnBallLocation.y,respawnBallLocation.z);
        ball.body.needUpdate=true;

       ball.body.once.update(()=>{
        ball.body.setCollisionFlags(0);
        })


    }

    _update(scene){
      if(this.eventHappened==true){
       // console.log("event started")
        setTimeout(this._respawnBall,1000,this.ball,this.respawnBallLocation,this.scene);
        setTimeout(()=>{
          this.eventHappened=false;
       //   console.log("event ended")
        this.ball.body.setVelocity(0,0,0);
       this.ball.body.setAngularVelocity(0,0,0);
        },1500);
        
      }
    /*  if(scene.eventsAvailable==false){
        console.log('All events are not active');
      }*/

      /*  if(scene.isClockRun==false){
          setTimeout(()=>{
            scene.isClockRun=true;
          },3500);
        }*/
    }

}
