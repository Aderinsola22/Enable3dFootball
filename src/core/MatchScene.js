import { ExtendedObject3D,Scene3D, THREE } from 'enable3d'
import { EntityManager, Time } from 'yuka';
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

    }
  
    async preload() {
        this.stats= new Stats();
        document.body.appendChild( this.stats.dom );
    }
  
    async create() {
        this.warpSpeed('-ground','-grid','-fog'/*,'-orbitControls'*/); 
      // await this.Init_Environment()
     // await this.InitMatch(3);
    // await  this.InitMatch(4);
  //  await  this.InitMatch(5);
  //  await  this.InitMatch(8);
  //  await   this.InitMatch(11);
 //  await this.Init_YukaEntities();
  //await this.physics.debug.enable();  

    // await this.InitTestPlayers();

    await this.Init_Environment()
      .then(() => this.InitMatch(8))
      .then(() => this.Init_YukaEntities())
      .then(()=> Promise.resolve(this.InitTimer()));
    }

    update() {
        this.stats.begin();
          this.InitUpdateAll();
         // this.UpdateTest();
        this.stats.end()

    }

   async Init_Environment(){
       this.camera.position.set(0,20,30);
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
        this.offsideLineteam1.name='Team-1';
       // this.offsideLineteam1.visible=false;
     
        this.offsideLineteam2= this.add.box({x:3,y:1,z:0,width:0.25,height:0.25,depth:135},{basic:{color:'white'}})
        this.offsideLineteam2.name='Team-2';
        //this.offsideLineteam2.visible=false;

       this.offsideteam1= new Offside(this,this.offsideLineteam2,this.Team1,'team-2-goal-post',this.ball);
       this.offsideteam2= new Offside(this,this.offsideLineteam1,this.Team2,'team-1-goal-post',this.ball);

       //Visualizer for Corner Flags
    //  this.corner1=this.add.box({x:18,y:19,z:18,width:0.5,height:0.5,depth:0.5},{basic:{color:'black'}});
    // this.corner2=this.add.box({x:-18,y:1,z:-18,width:1,height:1,depth:1},{basic:{color:'red'}})
   //  this.corner3=this.add.box({x:103,y:3,z:36.7,width:1,height:1,depth:1},{basic:{color:'blue'}})
     // this.corner4=this.add.box({x:69,y:3,z:-37.3,width:1,height:1,depth:1},{basic:{color:'yellow'}})

//     this.corner1.visible=false;
//     this.corner2.visible=false;
//     this.corner3.visible=false;

        }

  async  InitTimer(){
      console.log('timer starts in 20 seconds');
      setTimeout(() => { 
        console.log('Start Timer and Activate behaviors');
        this.director._switchToNearestPlayer();
       
        this._KickOFF();
      }, 20000);
    
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

      this.biasPointTeam1=this.CalculateWeightedMidPoint(this.ball.ball.position,this.GKStartPointTeam1);
      this.biasPointTeam2=this.CalculateWeightedMidPoint(this.ball.ball.position,this.GKStartPointTeam2);

      this.tendPositionTeam1GK= new YUKA.Vector3(this.biasPointTeam1.x,0,this.biasPointTeam1.z);
      this.tendPositionTeam2GK= new YUKA.Vector3(this.biasPointTeam2.x,0,this.biasPointTeam2.z);
      this.tendPostTeam1GK= new YUKA.ArriveBehavior(this.tendPositionTeam1GK,1,0.3);
      this.tendPostTeam2GK= new YUKA.ArriveBehavior(this.tendPositionTeam2GK,1,0.3);

      Obstacles=[this.ball.yukaBall];
      this.avoidBall= new YUKA.ObstacleAvoidanceBehavior(Obstacles);
      this.avoidBall.dBoxMinLength=2.5;
      this.avoidBall.weight=0;

      this.Team1._addKeeperSteeringBehaviors(this.avoidPlayers,'avoidPlayers');
      this.Team2._addKeeperSteeringBehaviors(this.avoidPlayers,'avoidPlayers');
      this.Team1._addKeeperSteeringBehaviors(this.tendPostTeam1GK,'tendPost');
      this.Team2._addKeeperSteeringBehaviors(this.tendPostTeam2GK,'tendPost');


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
    }
   
    InitTeam1(teamSize){

      this.Team1= new Team(teamSize,'Dragons','./character/player_out/player.gltf','./character/player_out/player.gltf','team-1-goal-post',new THREE.Color(0,0,1),1.571,3.5,this.ball.ball,this,-1,'boundary-2');
      this.director= new Director(this.Team1,this);
    }
    InitTeam2(teamSize){
      this.Team2= new Team(teamSize,'Swans','./character/player_out/player.gltf','./character/player_out/player.gltf','team-2-goal-post',new THREE.Color(1,0,0),-1.571,3.5,this.ball.ball,this,1,'boundary-1');
    //  this.director= new Director(this.Team2,this);
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
        this.timescale=9; // 9 is our default 5 minutes of real time per half
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
            console.log(this.testPlayer.player);
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
      this.ball.SetPossesion(this);
      this.ActivateBehaviors();
      this.StartTimer();
    }
    
    _HalfTimeSwitch(){
      console.log("Half time switch");
      this.halfTimeCompleted=false;
      this.DeactivateBehaviors();
      this.stoppageTime=0;
      this.eventCounts.goal= 0;         
      this.eventCounts.throwIn= 0;       
      this.eventCounts.goalKick= 0;      
      this.eventCounts.cornerKick= 0;   
      this.maxStoppageTime = 10 * 60;
      this.eventsAvailable=false;
      const bufferTeam={goalassignment:null,startRotation:null,xDirection:null,goalineTargetName:null};

      this.Team1._addGoalBox('goal-box-2');
      this.Team2._addGoalBox('goal-box-1');
      //Send Team 1 to Buffer
      bufferTeam.goalassignment = this.Team1.goalassignment;
      bufferTeam.startRotation=this.Team1.startRotation;
      bufferTeam.xDirection=this.Team1.xDirection;
      bufferTeam.goalineTargetName=this.Team1.goalineTargetName;

      //Send Team 2 to Team 1
      this.Team1.goalassignment = this.Team2.goalassignment;
      this.Team1.startRotation=this.Team2.startRotation;
      this.Team1.xDirection=this.Team2.xDirection;
      this.Team1.goalineTargetName=this.Team2.goalineTargetName;
      
      //Send Buffer to Team 2
      this.Team2.goalassignment = bufferTeam.goalassignment;
      this.Team2.startRotation=bufferTeam.startRotation;
      this.Team2.xDirection=bufferTeam.xDirection;
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
  UserCornerKick(){   
   
    const playerClass= this.director.userTeam.cornerTaker;
    

    if(playerClass.shoot || playerClass.pass){
    //  console.log('User Corrner Kick Here');
      this.ball.possessorTeamClass=playerClass.team;
      this.ball.possessorTeam=this.ball.possessorTeamClass.teamName;
      this.ball.possessorClass=null;
      this.ball.possessor=null; 
  
      this.ball.handBallActive=true;
      this.eventsAvailable=true;
      this.ResumeThrowIn();
      this.director._switchToNearestPlayer();
      this.ball.ball.userData.isKicked=true;
      setTimeout(()=>{
      this.ball.ball.userData.isKicked=false;
    },1500);
    }
  }

  UserGoalKick(){
    const playerClass= this.director.userTeam.goalKickTaker;
    if(playerClass.shoot || playerClass.pass){
    //  console.log('User Goal Kick Here');
      this.ball.possessorTeamClass=playerClass.team;
      this.ball.possessorTeam=this.ball.possessorTeamClass.teamName;
      this.ball.possessorClass=playerClass;
      this.ball.possessor=this.ball.possessorClass.playerName; 
  
      this.ball.handBallActive=true;
      this.eventsAvailable=true;
      this.ResumeThrowIn();
      this.director._switchToNearestPlayer();
      this.ball.ball.userData.isKicked=true;
      setTimeout(()=>{
      this.ball.ball.userData.isKicked=false;
    },1500);
    }
      
     
  }

  ResumeHalf(){
   this.field.respawnBallLocation = { x:0,y:0.9,z:0};
   this.field.eventHappened=true;
   this.eventsAvailable=true;
    this.halfTimeCompleted=true;
    
  }  

  Resume(){
    this.field.eventHappened=true;
    this.eventCompleted=true;
    this.eventsAvailable=true;
    this.offsideteam1.active=true;
    this.offsideteam2.active=true;
  }

  ResumeThrowIn(){
    this.eventCompleted=true;
    this.offsideteam1.active=true;
    this.offsideteam2.active=true;
    console.log("RESUME FROM ",this.eName,"at",this.GameTime);
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
      this.Resume();
    }
    
  }
  //ResetPenalty(){}
  //ResetFreekick(){}
  //ResetFoul(){}


  UpdateTimer() {
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
  
    
   if(!this.isClockRun && this.eventName!=null){
   //console.log(this.Team1.check,this.Team2.check);
     if(this.eName==undefined){
      this.bufferTime=this.gameElapsedMinutes;
     this.gameElapsedMinutes = this.bufferTime;
     this.gameElapsedTime = this.gameElapsedMinutes * 60;
      this.eName=this.eventName;
      this.ResetEvent(this.eName);
   }
      //TODO: Rework this for throw ins and corners for the User team
      if(this.eventCompleted){
        console.log("Event Done");
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
        this.Team1.teamList?.GK.stateMachine.changeTo('tendGoal');
        this.Team2.teamList?.GK.stateMachine.changeTo('tendGoal');

    }
    else if(this.Team1.check && this.Team2.check){
        if(this.Team1?.resetPos != null){
          this.Team1.RemoveBehavior(this.Team1.resetPos);
          this.Team1._ResetTransition();
        }
        if(this.Team2?.resetPos !=null){
          this.Team2.RemoveBehavior(this.Team2.resetPos);
          this.Team2._ResetTransition();
        }
      if(this.eName!='Goal'){
        this.director._switchToNearestPlayer();
        const team =this.ball.possessorTeamClass;
        if(this.ball.possessorTeamClass==this.director.userTeam.opponent){  
        if(this.eName=='ThrowIn'){
          if(!team.throwInTaker.stateMachine.in('throwIn')){ 
            team.throwInTaker.stateMachine.changeTo('throwIn');
          }
        }
        else if(this.eName=='GoalKick'){
          if(!team.goalKickTaker.stateMachine.in('goalKick')){
            this.ball.handBallActive=false;
            this.field.eventHappened=true;
            team.goalKickTaker.stateMachine.changeTo('goalKick'); 
          }
        }
        else if(this.eName=='CornerKick'){
          if(!team.cornerTaker.stateMachine.in('cornerKick')){ 
            this.ball.handBallActive=false;
            this.field.eventHappened=true;
            team.cornerTaker.stateMachine.changeTo('cornerKick');
          }
        }
      }
      else if(this.ball.possessorTeamClass==this.director.userTeam){
        if(this.eName=='ThrowIn'){
        this.director.currPlayer.body.setVelocity(0,0,0);
        if(this.ball.handBallActive){
          if(this.ball.ball.body.getCollisionFlags()!=2){
          this.ball.ball.body.setCollisionFlags(2);
        
          this.ball.handBallActive=false;
        }
      }
        this.UserThrowIn();
        }
        else if(this.eName=='GoalKick'){
          this.director._swtichToKeeper();
          if(this.ball.handBallActive){  
          this.field.eventHappened=true;
          this.ball.handBallActive=false;
          }
          this.UserGoalKick();
        }
        else if(this.eName=='CornerKick'){
          if(this.ball.handBallActive){
          this.field.eventHappened=true;
          this.ball.handBallActive=false;
          }
         this.UserCornerKick();
        }
      }
    }
    else if(this.eName=='Goal'){
       this.ResumeEvent(this.eName); 
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
    this.GameTime = `Game Time: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
    if (this.gameElapsedMinutes > 0 && this.gameElapsedMinutes <= 90 && this.isClockRun) {
    //  console.log(this.GameTime);
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

    }
    this.updateStoppageTime('HalfTime');
  //  console.log(this.Team1.check,this.Team2.check);
      if (this.Team1.check && this.Team2.check) {
        
        if(this.Team1?.resetPos != null){
          this.Team1.RemoveBehavior(this.Team1.resetPos);
          this.Team1._ResetTransition();
        }
        if(this.Team2?.resetPos !=null){
          this.Team2.RemoveBehavior(this.Team2.resetPos);
          this.Team2._ResetTransition();
        }
        this.ResumeEvent('HalfTime');
      
  
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

         //Set 2nd Half Possessor
      
      this.ball.possessorTeamClass= this.ball.IntialTeamClass.opponent;
      this.ball.possessorTeam= this.ball.possessorTeamClass.teamName

      const keys= Object.values(this.ball.possessorTeamClass.teamList)
      const possessor=keys[keys.length-1]

      this.ball.possessorClass=possessor;
      this.ball.possessor=possessor.playerName;

        this.clock.start();

      }
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
         this._UpdateScores();
        this._HalfTimeSwitch();
      }
      if(halfType=='FullTime'){
        this.DeactivateBehaviors();
        this.fullTimeCalled = 1;
        console.log("END OF FULL STOPPAGE TIME");
        this._UpdateScores();
      }
      //TODO:update later for extra time scenario
      this.stoppageTimeCalled = 0;
    }
    const stoppageMinutes = Math.floor(stoppageTimeMinutesLeft);
    const stoppageSeconds = Math.floor(stoppageTimeLeft % 60);
  
    if (stoppageTimeLeft > 0) {
     //console.log(`Stoppage Time: ${String(stoppageMinutes).padStart(2, '0')}:${String(stoppageSeconds).padStart(2, '0')}`);
    }
  }
  

    CalculateWeightedMidPoint(posA,posB){
const bias = 0.15;

const biasedMidpoint = new THREE.Vector3()
    .copy(posA).multiplyScalar(bias)
    .add(new THREE.Vector3().copy(posB).multiplyScalar(1 - bias));

 return biasedMidpoint;

    }

    UpdateCamera(){
      const camTargetPos= new THREE.Vector3(
        this.ball.ball.position.x,
        this.ball.ball.position.y + 45,
        this.ball.ball.position.z + 55
      );

      this.camera.position.lerp(camTargetPos,0.1);
      this.camera.lookAt(this.ball.ball.position);
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
      this.biasPointTeam1=this.CalculateWeightedMidPoint(this.ball.ball.position,this.GKStartPointTeam1);
      this.biasPointTeam2=this.CalculateWeightedMidPoint(this.ball.ball.position,this.GKStartPointTeam2);

//TODO: clamp the tend position x wawto be within the field boundaries
      this.biasPointTeam1.clamp(this.Team1.PenaltyBox.userData.Box.min,this.Team1.PenaltyBox.userData.Box.max);
      this.biasPointTeam2.clamp(this.Team2.PenaltyBox.userData.Box.min,this.Team2.PenaltyBox.userData.Box.max);

      this.tendPositionTeam1GK={x:this.biasPointTeam1.x,y:3,z:this.biasPointTeam1.z};
      this.tendPositionTeam2GK={x:this.biasPointTeam2.x,y:3,z:this.biasPointTeam2.z};

    //if(this.tendPostTeam1GK){
     //   this.tendPostTeam1GK.target=this.tendPositionTeam1GK;
     // }
    // if(this.tendPostTeam2GK){
    //    this.tendPostTeam2GK.target=this.tendPositionTeam2GK;
    //  }
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
      console.log(`${this.Team1.teamName} ${this.Team1.goalScored} : ${this.Team2.teamName} ${this.Team2.goalScored}`)
    }

    InitUpdateAll(){

      this.field._update(this);
      
      this.Team1._update();
      this.Team2._update();

      if(this.Team1 && this.Team2){
        this.director._update();
      }
      
    
      
   //   console.log(this.entityManager);

      this.ball._update();
      this.UpdateSeekBehavior();
     // this.UpdateArriveBehavior();
      this.UpdateTendBehavior();
      this.UpdateTimer();
    //  this.UpdateCamera();
      this._UpdateOffsideLine();

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
