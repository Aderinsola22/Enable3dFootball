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
import * as YUKA from 'yuka';


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
    }
  
    async preload() {
        this.stats= new Stats();
        document.body.appendChild( this.stats.dom );
    }
  
    async create() {
        this.warpSpeed('-ground','-grid','-fog'/*,'-orbitControls'*/); 
       await this.Init_Environment();
       //await this.InitMatch(3);

     //await  this.InitMatch(4);
      //await  this.InitMatch(5);
      //await  this.InitMatch(8);
      await   this.InitMatch(11);
      

     //await this.InitTestPlayers()
      await this.Init_YukaEntities();

   //  await  this.physics.debug.enable();  

    console.log('timer starts in 10 seconds');
     setTimeout(() => { 
      console.log('Start Timer and Activate behaviors');
      this.ActivateBehaviors();
      this.StartTimer();
    }, 10000);

    }

    update() {
        this.stats.begin();
        this.InitUpdateAll()
        this.stats.end()

    }

    Init_Environment(){
       this.camera.position.set(0,20,30);
        const txtloader = new THREE.TextureLoader();
        const texture = txtloader.load('./textures/fussballfeld_03_c.jpg');
        this.field= new Field(230,135,1);
        this.field._createField(this,texture);
        this.field._addBoundaries(this);
        this.ball = new Ball(0.5,0,0,0,'yellow',this.entityManager);
        this.ball._createBall(this);
        this.camera.lookAt(this.ball.ball.position);
        this.field._addColliders(this,this.field.goalLine1,this.ball.ball);
        this.field._addColliders(this,this.field.goalLine2,this.ball.ball);
        this.field._addColliders(this,this.field.sideline1,this.ball.ball);
        this.field._addColliders(this,this.field.sideline2,this.ball.ball);
        this.field._addColliders(this,this.field.boundaryline1,this.ball.ball);
        this.field._addColliders(this,this.field.boundaryline2,this.ball.ball);
        this.post=new Post('./textures/football goal.obj','team-1-goal-post');
        this.post2=new Post('./textures/football goal.obj','team-2-goal-post');


        const mtlloader= new MTLLoader();
        mtlloader.load('./textures/football_goal.mtl',(mtl) => {
          mtl.preload();
          const loader = new OBJLoader();
          loader.setMaterials(mtl);

          this.postPromise=loader.loadAsync('./textures/football goal.obj').then(obj => {
            this.post._SetPost(this,obj,108.5,1.571,Math.PI/7.2,0.043,106,0.345,11)
           })
           Promise.all([this.postPromise]).then(()=>{
            this.post2._SetPost(this,this.post.postclone,-108.5,-1.571,-Math.PI/7.2,0.043,-106,0.345,-11)
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
        this.tendBox=this.add.box({y:8,width:1,height:1,depth:1},{basic:{color:'purple'}})
        this.tendBox.visible=false;
        this.tendBox2=this.add.box({y:8,width:1,height:1,depth:1},{basic:{color:'brown'}})
        this.tendBox2.visible=false;
        }
   

    Init_YukaEntities(){
      this.entityManager= new YUKA.EntityManager();
      this.yukaTime= new YUKA.Time();
      this.isyukaBehavior=false;
      this.isGkYukaBehavior=false;
      this.ball._setAddManager(this.entityManager);
      this.Team1._setAddManager(this.entityManager);
      this.Team2._setAddManager(this.entityManager);

      this.seekPosition = new YUKA.Vector3(this.ball.yukaBall.x,4,this.ball.yukaBall.z);
      this.seekBall= new YUKA.SeekBehavior(this.seekPosition);
      this.seekBall.active=false;

      this.pursuePosition = new YUKA.Vector3(this.ball.yukaBall.x,4,this.ball.yukaBall.z);
      this.pursueBall= new YUKA.PursuitBehavior(this.ball.yukaBallPursuit,2.5);
      this.pursueBall.active=false;

     let Obstacles=[];
    const team1obs=  this.Team1._addObstacle(Obstacles);
      Obstacles=[];
    const team2obs=  this.Team2._addObstacle(Obstacles);
     this.yukaObstacles=[...team1obs,...team2obs];
     this.avoidPlayers= new YUKA.ObstacleAvoidanceBehavior(this.yukaObstacles);

      this.arrivePosition= new YUKA.Vector3(this.ball.yukaBall.x,4,this.ball.yukaBall.z)
      this.arriveBall= new YUKA.ArriveBehavior(this.arrivePosition,3,3);
      this.arriveBall.active=false;

      //steering behavior around the box for GK
       this.GKStartPointTeam1= new THREE.Vector3((this.Team1.xDirection*103), 4, 0);
      this.GKStartPointTeam2= new THREE.Vector3((this.Team2.xDirection*103), 4, 0);

      this.biasPointTeam1=this.CalculateWeightedMidPoint(this.ball.ball.position,this.GKStartPointTeam1);
      this.biasPointTeam2=this.CalculateWeightedMidPoint(this.ball.ball.position,this.GKStartPointTeam2);

      this.tendPositionTeam1GK= new YUKA.Vector3(this.biasPointTeam1);
      this.tendPositionTeam2GK= new YUKA.Vector3(this.biasPointTeam2);
      this.tendPostTeam1GK= new YUKA.ArriveBehavior(this.tendPositionTeam1GK,3,0.3);
      this.tendPostTeam2GK= new YUKA.ArriveBehavior(this.tendPositionTeam2GK,3,0.3);

      this.Team1._addKeeperSteeringBehaviors(this.seekBall);
      this.Team2._addKeeperSteeringBehaviors(this.seekBall);
      this.Team1._addKeeperSteeringBehaviors(this.pursueBall);
      this.Team2._addKeeperSteeringBehaviors(this.pursueBall);
      this.Team1._addKeeperSteeringBehaviors(this.avoidPlayers);
      this.Team2._addKeeperSteeringBehaviors(this.avoidPlayers);
      this.Team1._addKeeperSteeringBehaviors(this.arriveBall);
      this.Team2._addKeeperSteeringBehaviors(this.arriveBall);
      this.Team1._addKeeperSteeringBehaviors(this.tendPostTeam1GK);
      this.Team2._addKeeperSteeringBehaviors(this.tendPostTeam2GK);


      this.Team1._addPlayerSteeringBehaviors(this.seekBall);
      this.Team2._addPlayerSteeringBehaviors(this.seekBall);
      this.Team1._addPlayerSteeringBehaviors(this.pursueBall);
      this.Team2._addPlayerSteeringBehaviors(this.pursueBall);
      this.Team1._addPlayerSteeringBehaviors(this.avoidPlayers);
      this.Team2._addPlayerSteeringBehaviors(this.avoidPlayers);
      this.Team1._addPlayerSteeringBehaviors(this.arriveBall);
      this.Team2._addPlayerSteeringBehaviors(this.arriveBall);

     
    }
    ActivateBehaviors(){
      this.isyukaBehavior=true;
      this.isGkYukaBehavior=true;
    }
   

    InitMatch(teamSize){
        this.InitTeam1(teamSize);
        this.InitTeam2(teamSize);
    }
   
    InitTeam1(teamSize){
      this.Team1= new Team(teamSize,'Dragons','./character/player_out/player.gltf','./character/player_out/player.gltf','team-1-goal-post',new THREE.Color(0,0,1),1.571,3.5,this.ball.ball,this,-1);
      this.director= new Director(this.Team1,new THREE.Color(0,0,1),this);
      
    //  console.log(this.Team1);
    }
    InitTeam2(teamSize){
      this.Team2= new Team(teamSize,'Swans','./character/player_out/player.gltf','./character/player_out/player.gltf','team-2-goal-post',new THREE.Color(1,0,0),-1.571,3.5,this.ball.ball,this,1);
    // console.log(this.Team2);
    }

    StartTimer(){
        this.clock= new THREE.Clock();
        this.interval = 10; 
        this.interCount=0;
        this.elapsedTime=0;
        this.elapsedMinutes=0;
        this.gameElapsedTime=0;
        this.gameElapsedMinutes=0;
        this.timescale=90;
        this.isClockRun=true;
        this.restartTime=0;
        this.halfTimeCalled=0;
        this.fullTimeCalled=0;
       // TODO Implement : this.stoppageTime=0;
    }

    InitTestPlayers(){
        this.testPlayer= new Player('./character/player_out/player.gltf','Adetola Oladaiye','defender',this.ball.ball);
        this.testPlayer2= new Keeper('./character/player_out/player.gltf','Aderinsola Oladaiye',this.ball.ball);

        //clone instead then work on movement controls
        const gltfloader= new GLTFLoader();
        gltfloader.load(this.testPlayer.model,(gltf)=>{
          const target= gltf.scene.children[0];
            this.testPlayer.SetPlayer(this,target,'team-1-goal-post',new THREE.Color(0,0,1),1.571,3.5,5,6,0)
            console.log(this.testPlayer.player);
        })

       gltfloader.load(this.testPlayer2.model,(gltf) =>{
          const target= gltf.scene.children[0];
          this.testPlayer2.SetPlayer(this,target,'team-2-goal-post',new THREE.Color(1,0,0),1.571,3.5,-5,3,0)
        }) 

    }

    UpdateTimer(){
      const totalTime= this.clock.getElapsedTime();
      this.elapsedTime=totalTime;
      if(this.elapsedTime>=this.interval){
          this.director._switchToNearestPlayer();
          this.elapsedTime=0;
          this.interCount++;
          this.clock.start();
      }


//FOR NOW DISABLE THE CONSOLE.LOGS

    //  console.log("elapsed intervals",this.interCount);
    //  console.log('Clock time',this.elapsedTime);  
      const allTime=(this.interCount*this.interval)+this.elapsedTime;
    //    console.log('Total Real time in seconds',allTime);
      this.elapsedMinutes= allTime/60;
     //   console.log("Total Real Minutes",this.elapsedMinutes);  
        if(this.isClockRun==true){
      
        this.gameElapsedTime=(allTime-this.restartTime)*this.timescale;
     //   console.log('Match Time in seconds', this.gameElapsedTime);

        this.gameElapsedMinutes= this.gameElapsedTime/60;
   //    console.log("Total Match Minutes", this.gameElapsedMinutes);

        }


    //TODO: Account for stoppage time at half and full time   

      if(this.gameElapsedMinutes>=45 && this.halfTimeCalled==0){
        this.isClockRun=false;
    //    console.log("HALF TIME ADD STOPPAGE TIME LATER")
        this.gameElapsedMinutes=45;
        this.gameElapsedTime=this.gameElapsedMinutes*60;
    //    console.log("Total Match Minutes",this.gameElapsedMinutes);
    //    console.log(`TIMER STOPPED for ${this.interval} seconds`)

        setTimeout(() => { 
    //      console.log('Timer Restarted');
          this.halfTimeCalled=1;
          this.isClockRun=true;
          this.restartTime=this.interval;
        }, (this.interval*1000));
        
        

      }
     if(this.gameElapsedMinutes>=90 && this.fullTimeCalled==0){
        this.isClockRun=false;
        this.fullTimeCalled=1;
   //     console.log("FULL TIME ADD STOPPAGE TIME LATER MATCH ENDED")
    //   console.log("Total Match Minutes",this.gameElapsedMinutes);
      }
      
      //fix any bugs later and add stoppage time
      const minutes= Math.floor(this.gameElapsedMinutes);
      const seconds= Math.floor(this.gameElapsedTime % 60);
   //   console.log(`Game Time: ${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`)

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

    UpdatePursuitBehavior(){

  /*   if(this.pursueBall.active==true){
    //    console.log('Pursuit ON')
      }
      else{
    //    console.log('Pursuit OFF')

      }*/
      
    }

    UpdateSeekBehavior(){
      this.seekPosition={x:this.ball.yukaBall.position.x,y:4,z:this.ball.yukaBall.position.z}

      if(this.seekBall){
        this.seekBall.target=this.seekPosition;
      }
  /*    if(this.seekBall.active==true){
     //   console.log('Seek ON')
      }
      if(this.seekBall.active==false){
     //   console.log('Seek OFF')

      }*/
    }

    UpdateArriveBehavior(){
      this.arrivePosition={x:this.ball.yukaBall.position.x,y:4,z:this.ball.yukaBall.position.z}

      if(this.arriveBall){
        this.arriveBall.target=this.arrivePosition;
      }
   /*   if(this.arriveBall.active==true){
     //   console.log('Arrive ON')
      }
      if(this.arriveBall.active==false){
    //    console.log('Arrive OFF')

      }*/
    }
    UpdateTendBehavior(){
      this.biasPointTeam1=this.CalculateWeightedMidPoint(this.ball.ball.position,this.GKStartPointTeam1);
      this.biasPointTeam2=this.CalculateWeightedMidPoint(this.ball.ball.position,this.GKStartPointTeam2);

      this.tendPositionTeam1GK= this.biasPointTeam1;
      this.tendPositionTeam2GK= this.biasPointTeam2;
      
    if(this.tendPostTeam1GK){
        this.tendPostTeam1GK.target=this.tendPositionTeam1GK;
     /*   if(this.tendPostTeam1GK.active==true){
         //    console.log('Team 1 Tend ON')
           }
           else{
        //    console.log('Team 1 Tend OFF')
           } */
          
      }
     if(this.tendPostTeam2GK){
        this.tendPostTeam2GK.target=this.tendPositionTeam2GK;
  /*      if(this.tendPostTeam2GK.active==true){
        //  console.log('Team 2 Tend ON')
        }
        else{
       //   console.log('Team 2 Tend OFF')
           } */
        
      }
    }


    InitUpdateAll(){
      this.Team1._update();
      this.Team2._update();

      if(this.Team1 && this.Team2){
        this.director._update();
      }
      
      const delta= this.yukaTime.update().getDelta();
      this.entityManager.update(delta);
      


      this.ball._update();
      this.UpdateSeekBehavior();
      this.UpdatePursuitBehavior();
      this.UpdateArriveBehavior();
      this.UpdateTendBehavior();
      this.UpdateTimer();
      this.UpdateCamera();

      this.tendBox.position.copy(this.tendPositionTeam1GK);
      this.tendBox2.position.copy(this.tendPositionTeam2GK);
   //   console.log(this.tendBox.position);
    //    this.testPlayer._update(this);
    //    this.testPlayer2._update(this);


      

    }
  }
