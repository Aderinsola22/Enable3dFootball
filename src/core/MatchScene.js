import { ExtendedObject3D,Scene3D, THREE } from 'enable3d'
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
//import AssetsManager from './AssetsManager.js';
import {Ball} from '../objects/Ball.js'
import {Post} from '../objects/Post.js';
import {Field} from '../objects/Field.js';
import {Keeper} from '../objects/Keeper.js';
import {Flag} from '../objects/Flag.js';
import {Team} from '../objects/Team.js';
import {Player} from '../objects/Player.js';
import Stats from'stats.js';
import { Director } from '../objects/Director.js';
import { Offside } from '../objects/Offside.js';
import * as YUKA from 'yuka';
import * as dat from 'dat.gui';
import { ConditionalNode, i } from 'mathjs';


export class MatchScene extends Scene3D {
    constructor() {
      super('MatchScene')
    }
  
    async init() {
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth,window.innerHeight);
        
        window.addEventListener('resize',()=>{
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);

            //this.overlayRenderer.setSize(window.innerWidth,window.innerHeight);
        });
        console.warn = () => {};
        this.viteMode=import.meta.env.MODE;
        this.inProd=import.meta.env.PROD;
    
    }
  
    async preload() {
        this.stats= new Stats();
        document.body.appendChild( this.stats.dom );
    }
  
    async create() {
      let playerTotal; // 3-11
       if(this.inProd || this.viteMode=='production'){
        console.log("We are in Production mode");
        playerTotal=11;
        this.warpSpeed('-ground','-grid','-fog','-orbitControls'); 

       }
       else{
        console.log("We are in Development mode");
        playerTotal=11; //3,4,5,8,11
        this.warpSpeed('-ground','-grid','-fog','orbitControls'); 
       }
     
  //create Debug env where this is enabled  
  // create env for tests     
  // await this.InitTestPlayers();

    await this.Init_Environment()
      .then(() => this.InitMatch(playerTotal))
      .then(() => this.Init_YukaEntities())
      .then(() => this.ball.SetPossesion(this))
      .then(()=>this.Init_Barrier())
      .then(()=> Promise.resolve(this.InitTimer()));

    //  this.physics.debug.enable();   
  
    }

    update() {
        this.stats.begin();
          this.InitUpdateAll();
        this.stats.end()

    }
  
   LoadAsthetics(teamstyle,team){
    document.getElementById(teamstyle).textContent = team.abbreviation;
   } 
   async Init_Environment(){
       this.camera.position.set(0,30,75);
        const txtloader = new THREE.TextureLoader();
        const texture = txtloader.load('./textures/fussballfeld_03_c.jpg');
        this.field= new Field(230,135,1);
        this.field._createField(this,texture);
        this.field._addBoundaries(this);
        this.ball = new Ball(0.5,0,0,0,'yellow',this.entityManager);
        this.ball._createBall(this);
        this.camera.lookAt(this.ball.ball.position);
        this.field._addColliders(this,this.field.fieldBoundaries,this.ball.ball);
        this.post=new Post('./textures/football goal.obj','team-1-goal-post');
        this.post2=new Post('./textures/football goal.obj','team-2-goal-post');


        const mtlloader= new MTLLoader();
        mtlloader.load('./textures/football_goal.mtl',(mtl) => {
          mtl.preload();
          const loader = new OBJLoader();
          loader.setMaterials(mtl);

          this.postPromise=loader.loadAsync('./textures/football goal.obj').then(obj => {
            this.post._SetPost(this,obj,-108.5,-1.571,-Math.PI/7.2,0.043,-106,0.345,-11)
           })
           Promise.all([this.postPromise]).then(()=>{
            this.post2._SetPost(this,this.post.postclone,108.5,1.571,Math.PI/7.2,0.043,106,0.345,11)
           });

        });
        
        this.flag=new Flag('./character/Flag_Pole.fbx','corner-flag-1');
        const fbxloader= new FBXLoader();
        this.flagPromise=fbxloader.loadAsync(this.flag.model).then(fbx=>{
         this.flag.SetFlags(this,fbx,3.142,0.2,new THREE.Vector3(103,-1,58));
        });
     
        Promise.all([this.flagPromise]).then(()=>{
        this.flag2=new Flag(this.flag.model,'corner-flag-2');
        this.flag2.SetFlags(this,this.flag.flagclone,3.142,0.2,new THREE.Vector3(103,-1,-58));
        this.flag3=new Flag(this.flag.model,'corner-flag-3');
        this.flag3.SetFlags(this,this.flag2.flagclone,0,0.2,new THREE.Vector3(-103,-1,58));
        this.flag4=new Flag(this.flag.model,'corner-flag-4');
        this.flag4.SetFlags(this,this.flag3.flagclone,0,0.2,new THREE.Vector3(-103,-1,-58));

        })

        //visualizer for GK Tending
      //  this.tendBox=this.add.box({y:8,width:1,height:1,depth:1},{basic:{color:'blue'}})
      //  this.tendBox.visible=false;
      //  this.tendBox2=this.add.box({y:8,width:1,height:1,depth:1},{basic:{color:'red'}})
      //  this.tendBox2.visible=false;

        //visualizer for Offside
        this.offsideLineteam1= this.add.box({x:-3,y:1,z:0,width:0.25,height:0.25,depth:135},{basic:{color:'black'}})
       // this.offsideLineteam1.visible=false;
     
        this.offsideLineteam2= this.add.box({x:3,y:1,z:0,width:0.25,height:0.25,depth:135},{basic:{color:'white'}})
        //this.offsideLineteam2.visible=false;
        this._lookTarget = new THREE.Vector3();
        this._camTargetPos = new THREE.Vector3();
        this._sideOffset = new THREE.Vector3();

       

       //Visualizer for Corner Flags
   //   this.corner1=this.add.box({x:-34.5,y:3,z:0,width:0.5,height:0.5,depth:0.5},{basic:{color:'black'}});
   //  this.corner2=this.add.box({x:-69,y:1,z:0,width:1,height:1,depth:1},{basic:{color:'red'}})
   //  this.corner3=this.add.box({x:-103.5,y:1,z:0,width:1,height:1,depth:1},{basic:{color:'blue'}})
  //   this.corner4=this.add.box({x:69,y:3,z:0,width:1,height:1,depth:1},{basic:{color:'yellow'}})

//     this.corner1.visible=false;
//     this.corner2.visible=false;
//     this.corner3.visible=false;

        }

  async  InitTimer(){
      console.log('timer starts in 15 seconds');
  //this.leftEdge.visible=false;
//this.rightEdge.visible=false;
//this.centerEdge.visible=false;
      setTimeout(() => { 
        console.log('Start Timer and Activate behaviors');
        this.director._switchToNearestPlayer();
       
        this._KickOFF();
      }, 15000);
    
    }
  

   async Init_YukaEntities(){
      this.entityManager= new YUKA.EntityManager();
      this.yukaTime= new YUKA.Time();
      this.isyukaBehavior=false;
      this.ball._setAddManager(this.entityManager);
      this.Team1._setAddManager(this.entityManager);
      this.Team2._setAddManager(this.entityManager);

      this.seekPosition = new YUKA.Vector3(this.ball.yukaBall.x,3,this.ball.yukaBall.z);
      this.seekBall= new YUKA.SeekBehavior(this.seekPosition);
      this.seekBall.weight=0;

      this.pursueBall= new YUKA.PursuitBehavior(this.ball.yukaBallPursuit,3.5);
      this.pursueBall.weight=0;

     let Obstacles=[];
    const team1obs=  this.Team1._addObstacle(Obstacles);
      Obstacles=[];
    const team2obs=  this.Team2._addObstacle(Obstacles);
     this.yukaObstacles=[...team1obs,...team2obs];
     this.avoidPlayers= new YUKA.ObstacleAvoidanceBehavior(this.yukaObstacles);
     this.avoidPlayers.dBoxMinLength=2;

      this.arrivePosition= new YUKA.Vector3(0,3,0)
      this.arriveBall= new YUKA.ArriveBehavior(this.arrivePosition.clone(),0.1,0);
      this.arriveBall.weight=0;

      //steering behavior around the box for GK
       this.GKStartPointTeam1= new THREE.Vector3((this.Team1.xDirection*103), 3, 0);
      this.GKStartPointTeam2= new THREE.Vector3((this.Team2.xDirection*103), 3, 0);

      this.biasPointTeam1=this.CalculateWeightedMidPoint(this.ball.ball.position,this.GKStartPointTeam1,0.15,this.Team1.gkTendTempA,this.Team1.gkTendTempB);
      this.biasPointTeam2=this.CalculateWeightedMidPoint(this.ball.ball.position,this.GKStartPointTeam2,0.15,this.Team2.gkTendTempA,this.Team2.gkTendTempB);

      this.tendPositionTeam1GK= new YUKA.Vector3(this.biasPointTeam1.x,0,this.biasPointTeam1.z);
      this.tendPositionTeam2GK= new YUKA.Vector3(this.biasPointTeam2.x,0,this.biasPointTeam2.z);
      this.tendPostTeam1GK= new YUKA.ArriveBehavior(this.tendPositionTeam1GK,1,0.3);
      this.tendPostTeam2GK= new YUKA.ArriveBehavior(this.tendPositionTeam2GK,1,0.3);

      Obstacles=[this.ball.yukaBall];
      this.avoidBall= new YUKA.ObstacleAvoidanceBehavior(Obstacles);
      this.avoidBall.dBoxMinLength=5;
      this.avoidBall.weight=0;

      this.resetBehavior= new YUKA.ArriveBehavior(this.arrivePosition.clone(),0.1,0);
      this.resetBehavior.weight=1;

      /*const offset= new YUKA.Vector3(0,0,0);
      const dummy= new YUKA.Vehicle();
      this.offsetP= new YUKA.OffsetPursuitBehavior(dummy,offset);
      this.offsetP.weight=0;*/

      this.separation = new YUKA.SeparationBehavior()
      this.separation.weight=0;

      this.alignment= new YUKA.AlignmentBehavior();
      this.alignment.weight=0;

      this.cohesion= new YUKA.CohesionBehavior();
      this.cohesion.weight=0;


      this.Team1._addKeeperSteeringBehaviors(this.avoidPlayers,'avoidPlayers');
      this.Team2._addKeeperSteeringBehaviors(this.avoidPlayers,'avoidPlayers');
      this.Team1._addKeeperSteeringBehaviors(this.tendPostTeam1GK,'tendPost');
      this.Team2._addKeeperSteeringBehaviors(this.tendPostTeam2GK,'tendPost');
      this.Team1._addKeeperSteeringBehaviors(this.resetBehavior,'reset');
      this.Team2._addKeeperSteeringBehaviors(this.resetBehavior,'reset');


      this.Team1._addPlayerSteeringBehaviors(this.seekBall,'seek');
      this.Team2._addPlayerSteeringBehaviors(this.seekBall,'seek');
      this.Team1._addPlayerSteeringBehaviors(this.pursueBall,'pursue');
      this.Team2._addPlayerSteeringBehaviors(this.pursueBall,'pursue');
      this.Team1._addPlayerSteeringBehaviors(this.avoidPlayers,'avoidPlayers');
      this.Team2._addPlayerSteeringBehaviors(this.avoidPlayers,'avoidPlayers');
      this.Team1._addPlayerSteeringBehaviors(this.arriveBall,'arrive');
      this.Team2._addPlayerSteeringBehaviors(this.arriveBall,'arrive');
      this.Team1._addPlayerSteeringBehaviors(this.avoidBall,'avoidBall');
      this.Team2._addPlayerSteeringBehaviors(this.avoidBall,'avoidBall');
      this.Team1._addPlayerSteeringBehaviors(this.resetBehavior,'reset');
      this.Team2._addPlayerSteeringBehaviors(this.resetBehavior,'reset');
      this.Team1._addPlayerSteeringBehaviors(this.separation,'separation');
      this.Team2._addPlayerSteeringBehaviors(this.separation,'separation');
      this.Team1._addPlayerSteeringBehaviors(this.alignment,'alignment');
      this.Team2._addPlayerSteeringBehaviors(this.alignment,'alignment');
      this.Team1._addPlayerSteeringBehaviors(this.cohesion,'cohesion');
      this.Team2._addPlayerSteeringBehaviors(this.cohesion,'cohesion');
      
    //  this.Team1._addPlayerSteeringBehaviors(this.offsetP,'offset'); 
    //  this.Team2._addPlayerSteeringBehaviors(this.offsetP,'offset');
     
    }
    
  async Init_Barrier(){
   const dir= this.ball.possessorTeamClass.opponent.xDirection;
 this.leftEdge=this.add.box({x:dir*2,y:4,z:-37,width:3.5,height:6,depth:40.5},{basic:{color:'brown'}});
 this.leftEdge.name = 'left-edge';
 this.rightEdge = this.add.box({ x: dir*2, y: 4, z: 37, width: 3.5, height: 6, depth: 40.5 }, { basic: { color: 'brown' } });
 this.rightEdge.name = 'right-edge';
 this.centerEdge = this.add.cylinder({ x:dir*3, y: 4, z: 0,radiusTop:17,radiusBottom:17,height:6,openEnded:true,thetaLength:dir*3.142}, { basic: { color: 'brown' } });
 this.centerEdge.name = 'center-edge';

 this.physics.add.existing(this.centerEdge,{shape:'concave',mass:0,collisionFlags:2})
 this.physics.add.existing(this.leftEdge,{mass:0,collisionFlags:2});
 this.physics.add.existing(this.rightEdge,{mass:0,collisionFlags:2});
  }

  reInit_Barrier(){
  //  console.log("readding physics...");
    const dir= this.ball.possessorTeamClass.opponent.xDirection;
 this.scene.remove(this.centerEdge)
 this.leftEdge.position.x=dir==1 ? 2: -2;
 this.rightEdge.position.x=this.leftEdge.position.x;

 this.centerEdge = this.add.cylinder({ x:dir*3, y: 4, z: 0,radiusTop:17,radiusBottom:17,height:6,openEnded:true,thetaLength:dir*3.142}, { basic: { color: 'brown' } });
 this.physics.add.existing(this.centerEdge,{shape:'concave',mass:0,collisionFlags:2})
 this.physics.add.existing(this.leftEdge,{mass:0,collisionFlags:2});
 this.physics.add.existing(this.rightEdge,{mass:0,collisionFlags:2});
 
  } 
  
  remove_Barrier(){
 //   console.log("removing...");
 this.physics.destroy(this.centerEdge);
 this.physics.destroy(this.leftEdge);
 this.physics.destroy(this.rightEdge);

  }

    ActivateBehaviors(){
      this.isyukaBehavior=true;
    }
    DeactivateBehaviors(){
        this.isyukaBehavior=false;
      }
   

    async InitMatch(teamSize){
        this.InitTeam1(teamSize);
        this.InitTeam2(teamSize);

        this.Team1._addOpponent(this.Team2);
        this.Team2._addOpponent(this.Team1);
        this.Team1._addGoalBox('goal-box-1');
        this.Team2._addGoalBox('goal-box-2');
       // console.log(this.Team1);
        //console.log(this.Team2);
        this.offsideLineteam1.name='Team-1';
        this.offsideLineteam2.name='Team-2';
        this.offsideLineteam1.userData.owner=this.Team1;
        this.offsideLineteam2.userData.owner=this.Team2;
        this.offsideteam1= new Offside(this,this.offsideLineteam2,this.Team1,'team-2-goal-post',this.ball);
       this.offsideteam2= new Offside(this,this.offsideLineteam1,this.Team2,'team-1-goal-post',this.ball);
    }
   
    InitTeam1(teamSize){

      this.Team1= new Team(teamSize,'Dragons','./character/player_out/player.gltf','./character/player_out/player.gltf','team-1-goal-post',new THREE.Color(0,0,1),1.571,3.5,this.ball.ball,this,-1,'boundary-2',' DRG ');
      this.director= new Director(this.Team1,this);
      this.LoadAsthetics('team-1',this.Team1);

    }
    InitTeam2(teamSize){
      this.Team2= new Team(teamSize,'Swans','./character/player_out/player.gltf','./character/player_out/player.gltf','team-2-goal-post',new THREE.Color(1,0,0),-1.571,3.5,this.ball.ball,this,1,'boundary-1',' SWN ');
    //  this.director= new Director(this.Team2,this);
    this.LoadAsthetics('team-2',this.Team2);

    }

    StartTimer(){
        this.clock= new THREE.Clock();
        this.stoppageClock= new THREE.Clock();
        this.interval = 3; 
        this.interCount=0;
        this.elapsedTime=0;
        this.elapsedMinutes=0;
        this.gameElapsedTime=0;      
        this.gameElapsedMinutes=0;
        this.timescale=11.25; // 9 is our default 5 minutes of real time per half
       //rm= real minutes for a full 90 minutes game
       // timescale=90 (1rm); 45 (2rm); 22.5 (4rm); 11.25 (8rm); 9 (10rm); 7.5 (12rm); 5.6 (16rm); 4.5 (20rm); 3 (30rm); 1.5 (60rm); 1 (90rm)
        this.isClockRun=true;
        this.restartTime=0;
        this.bufferTime=0;
        this.halfTimeCompleted=null;
        this.halfTimeCalled=0;
        this.fullTimeCalled=0;
        this.stoppageTimeCalled=0;
        this.stoppageTime=0;
        this.maxStoppageTime=5 * 60;
        this.eventsAvailable=true;
        this.eventName=null;
        this.eventCompleted=false;

        this.eventDelays ={
          goal: 30,         // 30 seconds for a goal celebration
          throwIn: 15,       // 5 seconds for a throw-in
          goalKick: 25,      // 6 seconds for a goal kick
          cornerKick: 25    // 10 seconds for a corner kick
          //foul: 10, //
          //freekick:10 //
          //injury: undefined // TODO: add injury time later
        };

        this.eventCounts = {
          goal: 0,         
          throwIn: 0,       
          goalKick: 0,      
          cornerKick: 0    
          //foul: 0, //
          //freekick:0 //
          //injury: undefined //TODO: add injury time later

        
        }
        this.eventThreshold ={
          goal: 4,         
          throwIn: 6,       
          goalKick: 4,      
          cornerKick: 4 
        };

        this.eventReductionFactor= 0.7;

       this.clock.start();
       // max allowed stoppage time for 1st half is 5 minutes 2nd half is 10 minutes
       
    }

    
    InitTestPlayers(){
        this.testPlayer= new Player('./character/player_out/player.gltf','Adetola Oladaiye','defender',this.ball.ball);
     //   this.testPlayer2= new Keeper('./character/player_out/player.gltf','Aderinsola Oladaiye',this.ball.ball);

        //clone instead then work on movement controls
        const gltfloader= new GLTFLoader();
        gltfloader.load(this.testPlayer.model,(gltf)=>{
          const target= gltf.scene.children[0];
            this.testPlayer.SetPlayer(this,target,'team-1-goal-post',new THREE.Color(0,0,1),1.571,3.5,5,6,0)
          //  console.log(this.testPlayer.player);
        })
        setTimeout(()=>{
          this.ball._test(this.testPlayer);
        },10000);
    /*   gltfloader.load(this.testPlayer2.model,(gltf) =>{
          const target= gltf.scene.children[0];
          this.testPlayer2.SetPlayer(this,target,'team-2-goal-post',new THREE.Color(1,0,0),1.571,3.5,-5,3,0)
        }) */

    }
    _KickOFF(){
      this.eventName='KickOFF';
      this.barrierActive=true;
      this.ActivateBehaviors();
    }
    
    _HalfTimeSwitch(){
      console.log("Half time switch");
      this.halfTimeCompleted=false;
      this.director.currPlayer.userData.isPlayerControlled=false;
      this.DeactivateBehaviors();
      this.stoppageTime=0;
      this.eventCounts.goal= 0;         
      this.eventCounts.throwIn= 0;       
      this.eventCounts.goalKick= 0;      
      this.eventCounts.cornerKick= 0;   
      this.maxStoppageTime = 10 * 60;
      this.eventsAvailable=false;
      const bufferTeam={goalassignment:null,startRotation:null,xDirection:null,goalineTargetName:null,attackDirection:null};

      this.Team1._addGoalBox('goal-box-2');
      this.Team2._addGoalBox('goal-box-1');
      //Send Team 1 to Buffer
      bufferTeam.goalassignment = this.Team1.goalassignment;
      bufferTeam.startRotation=this.Team1.startRotation;
      bufferTeam.xDirection=this.Team1.xDirection;
      bufferTeam.attackDirection=this.Team1.attackDirection;
      bufferTeam.goalineTargetName=this.Team1.goalineTargetName;

      //Send Team 2 to Team 1
      this.Team1.goalassignment = this.Team2.goalassignment;
      this.Team1.startRotation=this.Team2.startRotation;
      this.Team1.xDirection=this.Team2.xDirection;
      this.Team1.attackDirection=this.Team2.xDirection;
      this.Team1.goalineTargetName=this.Team2.goalineTargetName;
      
      //Send Buffer to Team 2
      this.Team2.goalassignment = bufferTeam.goalassignment;
      this.Team2.startRotation=bufferTeam.startRotation;
      this.Team2.xDirection=bufferTeam.xDirection;
      this.Team2.attackDirection=bufferTeam.attackDirection;
      this.Team2.goalineTargetName=bufferTeam.goalineTargetName;

      

      //Update Offside Lines
       this.offsideLineteam1.name='Team-2';
       this.offsideLineteam2.name='Team-1';
      
        //TODO: swap opponentPostName for 2nd half
      this.offsideteam1.opponentPostName='team-1-goal-post';
      this.offsideteam2.opponentPostName='team-2-goal-post';
      //Process the Info to the players of each team
      this.Team1._transferInfoToPlayers();
      this.Team2._transferInfoToPlayers();


      // change goal tend steering behavior
      this.GKStartPointTeam1.set(this.Team1.xDirection*103, 3, 0);
      this.GKStartPointTeam2.set(this.Team2.xDirection*103, 3, 0);


      //Reset Player Positions using yuka steering behaviors
      this.Reset('HalfTime');
      this.Team1.lastTouched=false;
      this.Team2.lastTouched=false;
      this.barrierActive=true;
    }

  Reset(eventType){
   
    this.Team1.ResetPlayers(eventType);
    this.Team2.ResetPlayers(eventType);
    }

  
  UserThrowIn(){
    const playerClass= this.director.userTeam.throwInTaker;
    this.ball._throwin(playerClass);

    const animRun=playerClass.player.anims.get(playerClass.player.anims.current).isRunning();
    if(!animRun){
      const rand=Math.round(Math.random() * (25 - 10) + 10);
     // console.log('rand',rand);
      this.ball.ball.body.once.update(()=>{
       this.ball.ball.body.setCollisionFlags(0);
       this.ball.ball.body.setVelocity(0,0,0);
       this.ball.ball.body.setAngularVelocity(0,0,0);
       this.ball.ball.body.applyImpulse({x:playerClass.playerTurn.x*rand,y:5,z:playerClass.playerTurn.z*rand},{x:0,y:0,z:0});
   })

    this.ball.possessorTeamClass=playerClass.team;
    this.ball.possessorTeam=this.ball.possessorTeamClass.teamName;
    this.ball.possessorClass=null;
    this.ball.possessor=null; 

   setTimeout(()=>{    
     this.ball.handBallActive=true;
     this.eventsAvailable=true;
     this.director._switchToNearestPlayer();
   },1000);  
   this.ResumeThrowIn();    
  } 

  }
  
  UserKick(){
    const playerClass= this.director.userTeam.goalKickTaker;
    if(this.ball.ball.userData.isKicked && !this.eventsAvailable && !this.field.eventHappened){  
      this.ball.handBallActive=true;
      this.eventsAvailable=true;
      this.ResumeThrowIn();
      this.director._switchToNearestPlayer();
    }
    else{
      if(this.ball.ball.position.x != this.field.respawnBallLocation.x){
        this.field.eventHappened=true;
      }
    }  
     
  }

  ResumeHalf(){
    this.barrierActive=false;
   this.eventsAvailable=true;
    this.halfTimeCompleted=true;
    this.offsideteam1.active=true;
    this.offsideteam2.active=true; 
    
  }  

  Resume(){
    this.barrierActive=false;
    this.field.eventHappened=true;
    this.eventCompleted=true;
    this.eventsAvailable=true;
    this.offsideteam1.active=true;
    this.offsideteam2.active=true;
  }

  ResumeGoal(){
    this.barrierActive=false;
    this.eventCompleted=true;
    this.eventsAvailable=true;
    this.offsideteam1.active=true;
    this.offsideteam2.active=true;
  }

  ResumeThrowIn(){
    this.barrierActive=false;
    this.eventCompleted=true;
    this.offsideteam1.active=true;
    this.offsideteam2.active=true;
    if(this.eventCompleted){
    console.log("RESUME FROM ",this.eName,"at",this.GameTime);
    }
  }


  ResetEvent(eventType){
    this.offsideteam1.active=false;
    this.offsideteam2.active=false;
     if(eventType=='Goal'){
    this.ResetGoal();
    }
   else if(eventType=='ThrowIn'){
   this.ResetThrowIn();
    }
    else if(eventType=='GoalKick'){
      this.ResetGoalKick();
    }
    else if(eventType=='CornerKick'){
       this.ResetCornerKick();
    }
  }

  ResetGoal(){
    //before
    this.director.currPlayer.userData.isPlayerControlled=false;
    this.DeactivateBehaviors();
    this.eventsAvailable=false;
    //actual reset
    this.Reset('Goal');
  }
  ResetThrowIn(){
    //before
    this.director.currPlayer.userData.isPlayerControlled=false;
    this.DeactivateBehaviors();
    this.eventsAvailable=false;
      //actual reset
    this.Reset('ThrowIn');
  }
  ResetGoalKick(){
    //before
    this.director.currPlayer.userData.isPlayerControlled=false;
    this.DeactivateBehaviors();
    this.eventsAvailable=false;
    //actual reset
    this.Reset('GoalKick');
  }
  ResetCornerKick(){
    //before
    this.director.currPlayer.userData.isPlayerControlled=false;
    this.DeactivateBehaviors();
    this.eventsAvailable=false;
    //actual reset
    this.Reset('CornerKick');
  }

  ResumeEvent(eventType){
    if(eventType=='HalfTime'){
      console.log("RESUME HALF at",this.GameTime);
      this.ResumeHalf();
    }

    else if(eventType!=='HalfTime'){
      console.log("RESUME FROM ",this.eName,"at",this.GameTime);
      if(this.eName=='Goal'){
        this.ResumeGoal();
      }
      else{
      this.Resume();
      }
    }
    
  }
  //ResetPenalty(){}
  //ResetFreekick(){}
  //ResetFoul(){}

 UpdateTimer() {

  let lastDomUpdateTime = 0;
  const timerElement = document.querySelector(".time-count");
  const stoppageElement=document.querySelector(".stoppage-count");
  const currentPlayerElement=document.querySelector(".player-name");
  const updateInterval = 500; 

    const totalTime = this.clock.getElapsedTime();
    this.elapsedTime = totalTime;
  
    // Handle interval-based actions
    if (this.elapsedTime >= this.interval) {
      if (this.gameElapsedMinutes < 90 && this.isClockRun) {
        this.director._switchToNearestPlayer();
      }
      this.elapsedTime = 0;
      this.interCount++;
      this.clock.start();
    }
  
    const allTime = (this.interCount * this.interval) + this.elapsedTime;
    this.elapsedMinutes = allTime / 60;
  
    // Calculate game elapsed time and minutes
    if (this.isClockRun) {
  //    this.timescale=45;
      this.gameElapsedTime = (allTime - this.restartTime) * this.timescale;
      this.gameElapsedMinutes = this.bufferTime+this.gameElapsedTime / 60;
    }

    if(this.stoppageTimeCalled==0){
      const stoppageMinutes = Math.floor(this.stoppageTime / 60);
      const stoppageSeconds = Math.floor(this.stoppageTime % 60);
      this.StopTime= `${String(stoppageMinutes).padStart(2, '0')}:${String(stoppageSeconds).padStart(2, '0')}`;
    }
  
    
   if(!this.isClockRun && this.eventName!=null){
  // console.log(this.Team1.check,this.Team2.check);
    
     if(this.eName==undefined){
      this.bufferTime=this.gameElapsedMinutes;
     this.gameElapsedMinutes = this.bufferTime;
     this.gameElapsedTime = this.gameElapsedMinutes * 60;
      this.eName=this.eventName;
      this.ResetEvent(this.eName);
      if(this.eName=='Goal'){this.barrierActive=true}
      else{this.teamEvent=this.ball.possessorTeamClass;}
      this.Team1.resetTransition=true;
      this.Team2.resetTransition=true;

     // console.log("team Possession",this.ball.possessorTeamClass.teamName);
   }
      //TODO: Rework this for throw ins and corners for the User team
      if(this.eventCompleted){
       // console.log("Event Done");
        this.Team1.check=false;
        this.Team2.check=false;
        this.eventCompleted=false;
        this.isClockRun=true;
        this.eventName=null;
        
        this.eName=undefined;
        this.restartTime = this.interCount * this.interval;
        this.director._switchToNearestPlayer(); 
        this.ActivateBehaviors();
        this.clock.start();
        this.Team1._Transition();
        this.Team2._Transition();
        this.Team1.teamList?.GK.stateMachine.changeTo('tendGoal');
        this.Team2.teamList?.GK.stateMachine.changeTo('tendGoal');

    }
    else if(this.Team1.check && this.Team2.check){
       if(this.Team1.resetTransition && this.Team2.resetTransition){
          this.Team1._ResetTransition();        
          this.Team2._ResetTransition();
       } 
      if(this.eName!='Goal'){
        this.director._switchToNearestPlayer();
        //const team =this.ball.possessorTeamClass;
        if(this.teamEvent==this.director.userTeam.opponent){  
        if(this.eName=='ThrowIn'){
          if(!this.teamEvent.throwInTaker.stateMachine.in('throwIn')){ 
            this.teamEvent.throwInTaker.stateMachine.changeTo('throwIn');
          }
        }
        else if(this.eName=='GoalKick'){
          if(!this.teamEvent.goalKickTaker.stateMachine.in('goalKick')){
            this.ball.handBallActive=false;
            this.field.eventHappened=true;
            this.teamEvent.goalKickTaker.stateMachine.changeTo('goalKick'); 
          }
       //   console.log('Goal Kick');
        }
        else if(this.eName=='CornerKick'){
          if(!this.teamEvent.cornerTaker.stateMachine.in('cornerKick')){ 
            this.ball.handBallActive=false;
            this.field.eventHappened=true;
            this.teamEvent.cornerTaker.stateMachine.changeTo('cornerKick');
          }
        }
      }
      else if(this.teamEvent==this.director.userTeam){
        if(this.eName=='ThrowIn'){

        this.director.currPlayer.body.setVelocity(0,0,0);
        if(this.ball.handBallActive){
          if(this.ball.ball.body.getCollisionFlags()!=2){
          this.ball.ball.body.setCollisionFlags(2);
        }
        this.ball.handBallActive=false;
      }
        this.UserThrowIn();

        }
        else if(this.eName=='GoalKick'){
          if(this.ball.handBallActive){ 
            this.director._switchToNearestPlayer(); 
          this.ball.handBallActive=false;
          this.field.eventHappened=true;
          }
          this.UserKick();
        }
        else if(this.eName=='CornerKick'){
          if(this.ball.handBallActive){
            this.ball.handBallActive=false;
          this.field.eventHappened=true;
          }
         this.UserKick();
        }
      }
    }
    else if(this.eName=='Goal'){
      this.director._switchToNearestPlayer(); 
      if(this.barrierActive && this.barrierActive!=null){
        this.Team1.lastTouched=false;
        this.Team2.lastTouched=false;
        this.field.eventHappened=true;
        this.ActivateBehaviors();
        this.reInit_Barrier();
        this.barrierActive=null
      }
     
      if(this.Team1.lastTouched||this.Team2.lastTouched){
        this.remove_Barrier();
        this.ResumeEvent(this.eName); 
      }
     
    }

      }
   
   } 

    // Handle half-time logic
    if (this.gameElapsedMinutes >= 45 && this.halfTimeCalled === 0) {
      this.handleHalfTime();
    }
  
    // Handle full-time logic
    if (this.gameElapsedMinutes >= 90 && this.fullTimeCalled === 0) {
      this.handleFullTime();
    }
  
    // Update game time string
    const minutes = Math.floor(this.gameElapsedMinutes);
    const seconds = Math.floor(this.gameElapsedTime % 60);
    this.GameTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
    if (this.gameElapsedMinutes > 0 && this.gameElapsedMinutes <= 90 && this.isClockRun) {
    //  console.log('Game Time:',this.GameTime);
    }
    //     console.log('Game Time:', this.StopTime);

    const now = performance.now();
    if (now - lastDomUpdateTime > updateInterval && this.GameTime!='NaN:NaN') {
        lastDomUpdateTime = now;
        timerElement.textContent = this.GameTime;
        if(this.director.currPlayer!=undefined){
          currentPlayerElement.textContent=this.director.currPlayer.name;
        }
        if(this.StopTime==undefined){
          stoppageElement.textContent="00:00"
        }
        else{
          stoppageElement.textContent=this.StopTime;
        }
    }
  }
 
  
  handleHalfTime() {
    if (this.isClockRun) {
      console.log("HALF TIME PAUSE TIMER");
      this.bufferTime=45;
      this.gameElapsedMinutes = 45;
      this.gameElapsedTime = this.gameElapsedMinutes * 60;
      this.isClockRun = false;
      console.log("Start Stoppage Time");
      this.stoppageTimeCalled = 1;
      this.stoppageClock.start();
      this.Team1.resetTransition=true;
      this.Team2.resetTransition=true;
    }
    this.updateStoppageTime('HalfTime');
  //  console.log(this.Team1.check,this.Team2.check);
      if (this.Team1.check && this.Team2.check) {
          //Set 2nd Half Possessor
        if(this.Team1.resetTransition && this.Team2.resetTransition){
          this.Team1._ResetTransition();        
          this.Team2._ResetTransition();
       } 
        this.director._switchToNearestPlayer(); 
        if(this.barrierActive){

      this.ball.possessorTeamClass= this.ball.IntialTeamClass.opponent;
      this.ball.possessorTeam= this.ball.possessorTeamClass.teamName
      const keys= Object.values(this.ball.possessorTeamClass.teamList)
      const possessor=keys.at(-1);
      this.ball.possessorClass=possessor;
      this.ball.possessor=possessor.playerName;

      console.log('Initial Possessor Team',this.ball.possessorTeam);

          this.Team1.lastTouched=false;
          this.Team2.lastTouched=false;
          this.field.respawnBallLocation = { x:0,y:0.9,z:0};
          this.field.eventHappened=true;
          this.ActivateBehaviors();
          this.reInit_Barrier();
          this.barrierActive=null;
        }
        if(this.Team1.lastTouched||this.Team2.lastTouched){
          this.remove_Barrier();
          this.ResumeEvent('HalfTime');
        }
    }
    if (this.halfTimeCompleted) {
      this.Team1.check=false;
      this.Team2.check=false;
      console.log("HALF TIME DONE 2ND HALF BEGINS");
      this.halfTimeCompleted=false;
      this.halfTimeCalled = 1;
      this.isClockRun = true;
      this.restartTime = this.interCount * this.interval;
      this.ActivateBehaviors();
      this.director._switchToNearestPlayer();

     
      this.clock.start();

    }
  }
  
  handleFullTime() {
    if (this.isClockRun) {
      console.log("FULL TIME");
      this.isClockRun = false;
      console.log("Start Stoppage Time");
      this.stoppageTimeCalled = 1;
      this.stoppageClock.start();
    }
    this.updateStoppageTime('FullTime');

  }
  
  updateStoppageTime(halfType) {
    this.stoppageElapsed = this.stoppageClock.getElapsedTime();
    const stoppageTimeLeft = this.stoppageTime - (this.stoppageElapsed * this.timescale);
    const stoppageTimeMinutesLeft = stoppageTimeLeft / 60;

    if (stoppageTimeLeft <= 0 && this.stoppageTimeCalled === 1) {
      this.stoppageClock.stop();
      
      if(halfType=='HalfTime'){
        console.log("END OF HALF STOPPAGE TIME");
        this._HalfTimeSwitch();
      }
      if(halfType=='FullTime'){
        this.fullTimeCalled = 1;
        this.DeactivateBehaviors();
        this.director.currPlayer.userData.parent.keyboard._isPaused=true;
        this.eventsAvailable=false;
        this.ball.handBallActive=false;
        this.offsideteam1.active=false;
        this.offsideteam2.active=false;


        console.log("END OF FULL STOPPAGE TIME");
      }
      //TODO:update later for extra time scenario
      this.stoppageTimeCalled = 0;
    }
    const stoppageMinutes = Math.floor(stoppageTimeMinutesLeft);
    const stoppageSeconds = Math.floor(stoppageTimeLeft % 60);
  
    if (stoppageTimeLeft > 0) {
      this.StopTime= `${String(stoppageMinutes).padStart(2, '0')}:${String(stoppageSeconds).padStart(2, '0')}`
   //  console.log('Stoppage Time:',this.StopTime);
    }
  }
  

    CalculateWeightedMidPoint(posA,posB,bias,tempA,tempB) {
    // Calculate the weighted midpoint between two positions based on a bias value
    // bias = 0.5 gives equal weight to both positions
    // bias < 0.5 gives more weight to posA
    // bias > 0.5 gives more weight to posB 


    tempA.copy(posA).multiplyScalar(bias);

    tempB.copy(posB).multiplyScalar(1 - bias);

     return tempA.add(tempB);

    }

   UpdateCamera() {
  const ballPos = this.ball.ball.position;
  const velocity = this.ball.ball.body.ammo.getLinearVelocity();
  const ballTeam = this.ball.possessorTeamClass;
  const teamDirection = ballTeam.attackDirection;
  const relX = ballPos.x * teamDirection;

  let offsetY = 45;
  let fov = 50;
  let offsetZ = 55;

  const lookTarget = this._lookTarget;
  const camTargetPos = this._camTargetPos;
  const sideOffset = this._sideOffset;

  sideOffset.set(0, 0, 15 * Math.sign(ballPos.z || 1));

  if (relX >= -34.5 && relX <= 34.5 && this.eName == null) {
    offsetY = 65;
    offsetZ = 75;
  } else if ((relX > 34.5 && relX <= 102.5 || relX < -34.5 && relX >= -102.5) && this.eName == null) {
    offsetY = 55;
    offsetZ = 75;
  }

  let camHeight = ballPos.y > 0 ? ballPos.y + offsetY : offsetY;

  if (this.eName == null) {
    if (ballPos.x > 69.5 || ballPos.x < -69.5) {
      const goalX = ballPos.x > 0 ? (69.5 + 102.5) / 2 : -(69.5 + 102.5) / 2;
      camTargetPos.set(goalX, camHeight, offsetZ).add(sideOffset);
      this.camera.position.lerp(camTargetPos, 0.08);
      lookTarget.set(ballPos.x, 0, ballPos.z);
    } else {
      camTargetPos.set(
        ballPos.x - (10 * teamDirection),
        camHeight,
        ballPos.z + (1.1 * offsetZ)
      ).add(sideOffset);
      this.camera.position.lerp(camTargetPos, 0.08);
      lookTarget.copy(ballPos);
    }
  } else {
    if (this.eName !== 'Goal') {
      this.goalStartTime = null;
    }

    if (this.eName === 'Goal') {
      if (!this.goalStartTime) {
        this.goalStartTime = performance.now();
      }

      const elapsedTime = (performance.now() - this.goalStartTime) / 1000;

      if (elapsedTime >= 5) {
        offsetY = 65;
        offsetZ = 75;
        camTargetPos.set(
          this.field.respawnBallLocation.x,
          camHeight,
          offsetZ
        ).add(sideOffset);
        this.camera.position.lerp(camTargetPos, 0.08);
        lookTarget.set(0, 0, 0);
      } else {
        camTargetPos.copy(this.camera.position); // maintain current
        lookTarget.copy(ballPos);
      }
    }

    else if (this.eName === 'ThrowIn') {
      camHeight = this.field.respawnBallLocation.z > 0 ? camHeight : camHeight + 10;
      offsetZ = this.field.respawnBallLocation.z > 0 ? offsetZ : offsetZ - 10;
      camTargetPos.set(
        this.field.respawnBallLocation.x,
        camHeight,
        2 * offsetZ
      ).add(sideOffset);
      this.camera.position.lerp(camTargetPos, 0.08);
      lookTarget.set(
        this.field.respawnBallLocation.x,
        0,
        this.field.respawnBallLocation.z
      );
    }

    else if (this.eName === 'CornerKick') {
      const goalX = ballPos.x > 0
        ? (69.5 + this.field.respawnBallLocation.x) / 2
        : (-69.5 + this.field.respawnBallLocation.x) / 2;
      camHeight += 30;
      camTargetPos.set(goalX, camHeight, 2 * offsetZ).add(sideOffset);
      this.camera.position.lerp(camTargetPos, 0.08);
      lookTarget.set(goalX, 0, 0);
    }

    else if (this.eName === 'GoalKick') {
      const goalX = ballPos.x > 0 ? 102.5 / 2 : -102.5 / 2;
      camTargetPos.set(goalX, camHeight, 1.5 * offsetZ).add(sideOffset);
      this.camera.position.lerp(camTargetPos, 0.08);
      lookTarget.set(goalX, 0, this.field.respawnBallLocation.z);
    }
  }

  this.camera.lookAt(lookTarget);
  this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, fov, 0.05);
}

    UpdateSeekBehavior(){
      this.seekPosition={x:this.ball.yukaBall.position.x,y:3,z:this.ball.yukaBall.position.z}

      if(this.seekBall){
        this.seekBall.target=this.seekPosition;
      }
     
    }

    UpdateArriveBehavior(){
      this.arrivePosition={x:this.ball.yukaBall.position.x,y:3,z:this.ball.yukaBall.position.z}

      if(this.arriveBall){
        this.arriveBall.target=this.arrivePosition;
      }
   
    }
    UpdateTendBehavior(){
      this.biasPointTeam1=this.CalculateWeightedMidPoint(this.ball.ball.position,this.GKStartPointTeam1,0.15,this.Team1.gkTendTempA,this.Team1.gkTendTempB);
      this.biasPointTeam2=this.CalculateWeightedMidPoint(this.ball.ball.position,this.GKStartPointTeam2,0.15,this.Team2.gkTendTempA,this.Team2.gkTendTempB);

      this.biasPointTeam1.clamp(this.Team1.PenaltyBox.userData.Box.min,this.Team1.PenaltyBox.userData.Box.max);
      this.biasPointTeam2.clamp(this.Team2.PenaltyBox.userData.Box.min,this.Team2.PenaltyBox.userData.Box.max);

      this.tendPositionTeam1GK={x:this.biasPointTeam1.x,y:3,z:this.biasPointTeam1.z};
      this.tendPositionTeam2GK={x:this.biasPointTeam2.x,y:3,z:this.biasPointTeam2.z};
    }
    _UpdateOffsideLine(){

      if(this.gameElapsedMinutes<45){
        if(this.Team1.OFSLposx<0){
          this.offsideLineteam1.position.copy({x:this.Team1.OFSLposx,y:1,z:0});
        //  console.log('OffsideLineTeam1',this.offsideLineteam1.position)
        }
        if(this.Team2.OFSLposx>0){
          this.offsideLineteam2.position.copy({x:this.Team2.OFSLposx,y:1,z:0});
        //  console.log('OffsideLineTeam2',this.offsideLineteam2.position)
        }
      }
      if(this.gameElapsedMinutes>45){
        if(this.Team1.OFSLposx>0){
          this.offsideLineteam1.position.copy({x:this.Team1.OFSLposx,y:1,z:0});
        //  console.log('OffsideLineTeam1',this.offsideLineteam1.position)
        }
        if(this.Team2.OFSLposx<0){
          this.offsideLineteam2.position.copy({x:this.Team2.OFSLposx,y:1,z:0});
        //  console.log('OffsideLineTeam2',this.offsideLineteam2.position)
        }
      }

      
      
      
    }
    _UpdateScores(){
    //  console.log(`${this.Team1.teamName} ${this.Team1.goalScored} : ${this.Team2.teamName} ${this.Team2.goalScored}`)
      document.getElementById('team-1-goal').textContent = this.Team1.goalScored;
      document.getElementById('team-2-goal').textContent = this.Team2.goalScored;
    }

    _UpdateKeyboard(){
      //O for options/settings
      //p to pause
    }

    InitUpdateAll(){
   //   console.log("update");


      this.field._update(this);
      
      this.Team1._update();
      this.Team2._update();

      if(this.Team1 && this.Team2){
        this.director._update();
      }
      
    if((this.Team1.lastTouched || this.Team2.lastTouched)&&this.eventName=='KickOFF'){
      this.remove_Barrier();
      this.eventName=null;
       this.barrierActive=false;
      this.StartTimer();
    }

    if(this.leftEdge || this.rightEdge || this.centerEdge){
     this.leftEdge.visible=false;
     this.rightEdge.visible=false;
     this.centerEdge.visible=false;
    }
      
   //   console.log(this.entityManager);

      this.ball._update();
      this.UpdateSeekBehavior();
     // this.UpdateArriveBehavior();
      this.UpdateTendBehavior();
      if(this.eventName !='KickOFF'){
        this.UpdateTimer();
      }
      this._UpdateOffsideLine();
     // this._UpdateKeyboard();
      if(this.inProd || this.viteMode=='production'){
           this.UpdateCamera();

      }
      else{
        this.UpdateCamera();
      }



      if(this.offsideteam1){
        this.offsideteam1._update();
      }
      if(this.offsideteam2){
        this.offsideteam2._update();
      }
      const delta= this.yukaTime.update().getDelta();
      this.entityManager.update(delta);
   //   this.tendBox.position.copy(this.tendPositionTeam1GK);
   //   this.tendBox2.position.copy(this.tendPositionTeam2GK);
    
   //   console.log(this.tendBox.position);

    }

    UpdateTest(){
      this.testPlayer._update(this);

      if( this.ball.ball.body.getCollisionFlags()==2){
        const midX = (this.testPlayer.leftHand.position.x + this.testPlayer.rightHand.position.x) / 2;
        const midY = (this.testPlayer.leftHand.position.y + this.testPlayer.rightHand.position.y) / 2;
        const midZ = (this.testPlayer.leftHand.position.z + this.testPlayer.rightHand.position.z) / 2;

        this.ball.ball.position.set(midX,midY,midZ);
        this.ball.ball.body.needUpdate=true;
    }
        //    this.testPlayer2._update(this);

    }
  }
